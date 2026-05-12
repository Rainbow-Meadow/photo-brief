-- Direct Smart Intake photo attachments
CREATE TABLE public.intake_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  intake_session_id uuid NOT NULL REFERENCES public.intake_sessions(id) ON DELETE CASCADE,
  intake_brief_id uuid NOT NULL REFERENCES public.intake_briefs(id) ON DELETE CASCADE,
  intake_source_id uuid REFERENCES public.intake_sources(id) ON DELETE SET NULL,
  storage_provider text NOT NULL DEFAULT 'r2',
  storage_key text NOT NULL,
  original_filename text,
  mime_type text NOT NULL,
  size_bytes integer,
  checksum_sha256 text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  finalized_at timestamptz
);

CREATE INDEX idx_intake_attachments_brief ON public.intake_attachments(intake_brief_id, created_at DESC);
CREATE INDEX idx_intake_attachments_workspace ON public.intake_attachments(workspace_id, created_at DESC);
CREATE INDEX idx_intake_attachments_session ON public.intake_attachments(intake_session_id);

ALTER TABLE public.intake_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can read intake attachments"
  ON public.intake_attachments
  FOR SELECT
  USING (public.is_workspace_member(workspace_id));

-- Inserts/updates only via service role (edge functions); no public/auth policies.
