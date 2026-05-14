-- 1. Drop the over-permissive RLS policy that allowed any workspace admin
--    to INSERT/UPDATE/DELETE subscription rows from the client. Combined
--    with the sync_workspace_plan_from_subscription trigger this was a
--    privilege-escalation path. All legitimate writes use service-role.
DROP POLICY IF EXISTS "subs write by admin" ON public.subscriptions;

-- Keep the existing read policy ("subs read by members"). Add an explicit
-- service-role write policy for clarity (service_role bypasses RLS anyway,
-- but the explicit policy documents intent).
DROP POLICY IF EXISTS "subs service writes" ON public.subscriptions;
CREATE POLICY "subs service writes"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Helpful index for "current paid subscription" lookups.
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_paddle
  ON public.subscriptions (workspace_id, environment, created_at DESC)
  WHERE paddle_subscription_id IS NOT NULL;
