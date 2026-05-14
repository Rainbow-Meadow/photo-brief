-- Drop unique on workspace_id so we can keep history (cancel + re-subscribe)
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_workspace_id_key;

-- Map product external_id to plan tier
CREATE OR REPLACE FUNCTION public.product_to_plan_tier(p_product_id text)
RETURNS public.plan_tier
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_product_id = 'intake_team' THEN 'intake_team'::public.plan_tier
    ELSE 'intake'::public.plan_tier
  END
$$;

-- Sync workspace plan from subscription changes
CREATE OR REPLACE FUNCTION public.sync_workspace_plan_from_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_plan public.plan_tier;
BEGIN
  IF NEW.environment IS DISTINCT FROM 'live' AND NEW.environment IS DISTINCT FROM 'sandbox' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IN ('active', 'trialing', 'past_due')
     AND (NEW.current_period_end IS NULL OR NEW.current_period_end > now())
     AND NEW.product_id IS NOT NULL THEN
    target_plan := public.product_to_plan_tier(NEW.product_id);
    UPDATE public.business_workspaces
       SET plan_tier = target_plan,
           trial_ends_at = NULL,
           updated_at = now()
     WHERE id = NEW.workspace_id;
  ELSIF NEW.status = 'canceled' AND (NEW.current_period_end IS NULL OR NEW.current_period_end <= now()) THEN
    UPDATE public.business_workspaces
       SET plan_tier = 'intake'::public.plan_tier,
           updated_at = now()
     WHERE id = NEW.workspace_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_workspace_plan ON public.subscriptions;
CREATE TRIGGER sync_workspace_plan
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.sync_workspace_plan_from_subscription();