-- Demo flow: per-visit ephemeral workspaces that can be claimed on signup.

ALTER TABLE public.business_workspaces
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_business_workspaces_is_demo
  ON public.business_workspaces (is_demo)
  WHERE is_demo = true;

CREATE TABLE IF NOT EXISTS public.demo_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  ip_hash text NOT NULL,
  workspace_id uuid REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  intake_source_id uuid REFERENCES public.intake_sources(id) ON DELETE SET NULL,
  intake_public_token text,
  blueprint_id uuid REFERENCES public.intake_blueprints(id) ON DELETE SET NULL,
  scan_job_id uuid REFERENCES public.website_scan_jobs(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'scanning',
  summary text,
  routes_preview jsonb NOT NULL DEFAULT '[]'::jsonb,
  error text,
  claimed_by_user_id uuid,
  claimed_workspace_id uuid,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT demo_sessions_status_check CHECK (status IN ('scanning','ready','failed','claimed','expired'))
);

CREATE INDEX IF NOT EXISTS idx_demo_sessions_ip_recent
  ON public.demo_sessions (ip_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_token
  ON public.demo_sessions (intake_public_token);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_expires
  ON public.demo_sessions (expires_at)
  WHERE claimed_at IS NULL;

ALTER TABLE public.demo_sessions ENABLE ROW LEVEL SECURITY;

-- No client/anon access. All reads/writes happen via service-role edge functions.
CREATE POLICY "demo_sessions_platform_admin_all"
  ON public.demo_sessions
  FOR ALL
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());