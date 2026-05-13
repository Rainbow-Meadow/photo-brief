
-- ============================================================
-- Pricing tier rebuild: collapse 5 tiers → 2 tiers + 14-day trial
-- ============================================================

-- 1. Drop functions that depend on the old plan_tier enum so we can swap it.
DROP FUNCTION IF EXISTS public.plan_credit_allowance(plan_tier) CASCADE;
DROP FUNCTION IF EXISTS public.plan_request_cap(plan_tier) CASCADE;
DROP FUNCTION IF EXISTS public.plan_user_cap(plan_tier) CASCADE;
DROP FUNCTION IF EXISTS public.plan_from_price_id(text) CASCADE;
DROP FUNCTION IF EXISTS public.current_plan_credits(uuid) CASCADE;

-- 2. Create new enum.
CREATE TYPE public.plan_tier_v2 AS ENUM ('intake', 'intake_team');

-- 3. Migrate columns to new enum with mapping.
--    free/starter/pro → intake;  team/business → intake_team
ALTER TABLE public.business_workspaces
  ALTER COLUMN plan_tier DROP DEFAULT,
  ALTER COLUMN plan_tier TYPE public.plan_tier_v2
    USING (CASE plan_tier::text
      WHEN 'team'     THEN 'intake_team'
      WHEN 'business' THEN 'intake_team'
      ELSE 'intake'
    END)::public.plan_tier_v2,
  ALTER COLUMN plan_tier SET DEFAULT 'intake'::public.plan_tier_v2;

ALTER TABLE public.subscriptions
  ALTER COLUMN plan_tier DROP DEFAULT,
  ALTER COLUMN plan_tier TYPE public.plan_tier_v2
    USING (CASE plan_tier::text
      WHEN 'team'     THEN 'intake_team'
      WHEN 'business' THEN 'intake_team'
      ELSE 'intake'
    END)::public.plan_tier_v2;

ALTER TABLE public.request_credit_packs
  ALTER COLUMN plan_at_purchase TYPE public.plan_tier_v2
    USING (CASE plan_at_purchase::text
      WHEN 'team'     THEN 'intake_team'
      WHEN 'business' THEN 'intake_team'
      ELSE 'intake'
    END)::public.plan_tier_v2;

ALTER TABLE public.integration_providers
  ALTER COLUMN minimum_plan DROP DEFAULT,
  ALTER COLUMN minimum_plan TYPE public.plan_tier_v2
    USING (CASE minimum_plan::text
      WHEN 'pro'      THEN 'intake_team'   -- integrations were Pro+ → now Team-only
      WHEN 'team'     THEN 'intake_team'
      WHEN 'business' THEN 'intake_team'
      ELSE 'intake'
    END)::public.plan_tier_v2;

-- 4. Drop old enum and rename new one to take its place.
DROP TYPE public.plan_tier;
ALTER TYPE public.plan_tier_v2 RENAME TO plan_tier;

-- 5. Add trial columns to business_workspaces.
ALTER TABLE public.business_workspaces
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS trial_plan public.plan_tier;

-- 6. Recreate plan helper functions with new tiers.
CREATE OR REPLACE FUNCTION public.plan_credit_allowance(_plan public.plan_tier)
  RETURNS numeric LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE _plan
    WHEN 'intake'      THEN 500
    WHEN 'intake_team' THEN 100000   -- effectively unlimited
    ELSE 500
  END;
$$;

CREATE OR REPLACE FUNCTION public.plan_request_cap(_plan public.plan_tier)
  RETURNS integer LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$
  SELECT CASE _plan
    WHEN 'intake'      THEN 500
    WHEN 'intake_team' THEN NULL          -- unlimited
  END;
$$;

CREATE OR REPLACE FUNCTION public.plan_user_cap(_plan public.plan_tier)
  RETURNS integer LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$
  SELECT CASE _plan
    WHEN 'intake'      THEN 1
    WHEN 'intake_team' THEN 10
  END;
$$;

CREATE OR REPLACE FUNCTION public.plan_from_price_id(_price_id text)
  RETURNS TABLE(plan public.plan_tier, billing_interval text)
  LANGUAGE sql IMMUTABLE SET search_path TO 'public'
AS $$
  SELECT
    CASE
      WHEN _price_id LIKE 'intake_team_%' THEN 'intake_team'::public.plan_tier
      WHEN _price_id LIKE 'intake_%'      THEN 'intake'::public.plan_tier
      ELSE 'intake'::public.plan_tier
    END AS plan,
    CASE
      WHEN _price_id LIKE '%_annual'  THEN 'annual'
      WHEN _price_id LIKE '%_monthly' THEN 'monthly'
      ELSE 'monthly'
    END AS billing_interval;
$$;

CREATE OR REPLACE FUNCTION public.current_plan_credits(_workspace_id uuid)
  RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT public.plan_credit_allowance(COALESCE(w.plan_tier, 'intake'::public.plan_tier))
  FROM public.business_workspaces w
  WHERE w.id = _workspace_id;
$$;

-- 7. Update plan-gating triggers for new tiers.
CREATE OR REPLACE FUNCTION public.enforce_internal_notes_plan()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE ws_plan public.plan_tier;
BEGIN
  SELECT plan_tier INTO ws_plan FROM public.business_workspaces WHERE id = NEW.workspace_id;
  IF ws_plan <> 'intake_team' THEN
    RAISE EXCEPTION 'PLAN_FEATURE_LOCKED: internal_notes requires Smart Intake Team (current: %)', ws_plan
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

-- Templates and custom guides are now available on both tiers; gate becomes a no-op pass-through
-- (kept for forward compatibility / future plans).
CREATE OR REPLACE FUNCTION public.enforce_message_templates_plan()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_custom_guides_plan()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  RETURN NEW;
END;
$$;

-- 8. Data retention: intake=12mo, intake_team=24mo.
CREATE OR REPLACE FUNCTION public.run_data_retention()
  RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE w RECORD; cutoff timestamptz;
BEGIN
  FOR w IN SELECT id, plan_tier FROM public.business_workspaces LOOP
    cutoff := CASE w.plan_tier
      WHEN 'intake'      THEN now() - interval '12 months'
      WHEN 'intake_team' THEN now() - interval '24 months'
      ELSE NULL
    END;
    IF cutoff IS NOT NULL THEN
      DELETE FROM public.submissions
      WHERE workspace_id = w.id AND created_at < cutoff;
    END IF;
  END LOOP;
END;
$$;

-- 9. New signups get a 14-day Smart Intake trial.
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  ws_id UUID;
  display_name TEXT;
BEGIN
  display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.business_workspaces (name, owner_id, plan_tier, trial_ends_at, trial_plan)
  VALUES (
    COALESCE(display_name, 'My workspace') || '''s workspace',
    NEW.id,
    'intake'::public.plan_tier,
    now() + interval '14 days',
    'intake'::public.plan_tier
  )
  RETURNING id INTO ws_id;

  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (ws_id, NEW.id, 'owner', 'active');

  INSERT INTO public.brand_profiles (workspace_id, intro_message, completion_message)
  VALUES (
    ws_id,
    'Hi! Help us help you — a few quick photos.',
    'Thanks! We''ve got everything we need.'
  );

  INSERT INTO public.subscriptions (workspace_id, plan_tier, status)
  VALUES (ws_id, 'intake'::public.plan_tier, 'trialing');

  INSERT INTO public.profiles (id, email, name, default_workspace_id)
  VALUES (NEW.id, NEW.email, display_name, ws_id);

  PERFORM public._notify_event(jsonb_build_object('event', 'user_signup', 'user_id', NEW.id));

  RETURN NEW;
END;
$$;

-- 10. Existing workspaces are paying / live — no trial for them.
UPDATE public.business_workspaces
SET trial_ends_at = NULL, trial_plan = NULL
WHERE trial_ends_at IS NULL;
