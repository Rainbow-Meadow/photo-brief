-- Re-add Paddle linkage columns to subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text,
  ADD COLUMN IF NOT EXISTS paddle_customer_id text,
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS price_id text,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'sandbox';

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_paddle_subscription_id_key
  ON public.subscriptions(paddle_subscription_id)
  WHERE paddle_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_workspace_env_idx
  ON public.subscriptions(workspace_id, environment, created_at DESC);

-- Exit interviews
CREATE TABLE IF NOT EXISTS public.exit_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  would_return text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exit_interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can insert exit interviews"
  ON public.exit_interviews FOR INSERT TO authenticated
  WITH CHECK (public.is_workspace_member(workspace_id) AND user_id = auth.uid());

CREATE POLICY "Workspace members can read their exit interviews"
  ON public.exit_interviews FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Service role manages exit interviews"
  ON public.exit_interviews FOR ALL TO service_role USING (true) WITH CHECK (true);