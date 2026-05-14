-- 1. Update credit-balance helpers to drop dependency on request_credit_packs
CREATE OR REPLACE FUNCTION public.current_topup_credits(_workspace_id uuid)
 RETURNS TABLE(remaining numeric, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select 0::numeric as remaining, null::timestamptz as expires_at;
$function$;

CREATE OR REPLACE FUNCTION public.current_topup_balance(_workspace_id uuid)
 RETURNS TABLE(remaining integer, expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select 0::integer as remaining, null::timestamptz as expires_at;
$function$;

CREATE OR REPLACE FUNCTION public.current_credit_balance(_workspace_id uuid)
 RETURNS TABLE(included numeric, used numeric, topup_remaining numeric, remaining numeric, period_start timestamp with time zone, topup_expires_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select
    coalesce(public.current_plan_credits(_workspace_id), 0) as included,
    public.current_credit_usage(_workspace_id) as used,
    0::numeric as topup_remaining,
    greatest(
      0,
      coalesce(public.current_plan_credits(_workspace_id), 0)
      - public.current_credit_usage(_workspace_id)
    ) as remaining,
    public.current_period_start_for_workspace(_workspace_id) as period_start,
    null::timestamptz as topup_expires_at;
$function$;

-- 2. Simplify enforce_request_limit so it no longer consumes top-up packs.
CREATE OR REPLACE FUNCTION public.enforce_request_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  ws_plan plan_tier;
  used    int;
  cap     int;
BEGIN
  SELECT plan_tier INTO ws_plan
  FROM public.business_workspaces
  WHERE id = NEW.workspace_id;

  IF ws_plan IS NULL THEN
    RETURN NEW;
  END IF;

  cap  := public.plan_request_cap(ws_plan);
  used := public.current_period_usage(NEW.workspace_id, 'request_created');

  IF cap IS NOT NULL AND used >= cap THEN
    RAISE EXCEPTION 'PLAN_LIMIT_REACHED: monthly request cap of % reached on the % plan', cap, ws_plan
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.usage_events (workspace_id, event_type, related_id, metadata)
  VALUES (NEW.workspace_id, 'request_created', NEW.id, jsonb_build_object('guide_id', NEW.guide_id));

  RETURN NEW;
END;
$function$;

-- 3. Drop the top-up pack table.
DROP TABLE IF EXISTS public.request_credit_packs CASCADE;

-- 4. Strip Stripe-specific columns from subscriptions.
DROP INDEX IF EXISTS public.subscriptions_stripe_subscription_lookup_idx;
DROP INDEX IF EXISTS public.idx_subscriptions_workspace_env;
DROP INDEX IF EXISTS public.subscriptions_workspace_environment_created_idx;

ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id,
  DROP COLUMN IF EXISTS price_id,
  DROP COLUMN IF EXISTS environment;