
-- ============================================================
-- PhotoBrief Intelligence: jobs + artifacts
-- ============================================================

CREATE TABLE public.intelligence_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  job_type     text NOT NULL,
  status       text NOT NULL DEFAULT 'queued',
  input        jsonb NOT NULL DEFAULT '{}'::jsonb,
  output       jsonb,
  confidence   numeric,
  warnings     jsonb NOT NULL DEFAULT '[]'::jsonb,
  error        text,
  started_at   timestamptz,
  completed_at timestamptz,
  created_by   uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intelligence_jobs_ws_status ON public.intelligence_jobs (workspace_id, status, created_at DESC);
CREATE INDEX idx_intelligence_jobs_ws_type   ON public.intelligence_jobs (workspace_id, job_type, completed_at DESC);

CREATE TABLE public.intelligence_artifacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid NOT NULL REFERENCES public.business_workspaces(id) ON DELETE CASCADE,
  job_id          uuid NOT NULL REFERENCES public.intelligence_jobs(id) ON DELETE CASCADE,
  artifact_type   text NOT NULL,
  source_url      text,
  storage_key     text,
  content_excerpt text,
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intelligence_artifacts_job   ON public.intelligence_artifacts (job_id);
CREATE INDEX idx_intelligence_artifacts_ws    ON public.intelligence_artifacts (workspace_id, artifact_type, created_at DESC);

-- updated_at trigger
CREATE TRIGGER trg_intelligence_jobs_updated_at
BEFORE UPDATE ON public.intelligence_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Validation triggers (NOT check constraints, per project rules)
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_intelligence_job()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.job_type NOT IN (
    'scan_website',
    'analyze_forms',
    'propose_routes',
    'propose_photo_policies',
    'generate_blueprint',
    'score_intake_brief',
    'suggest_next_action',
    'verify_install',
    'monitor_install',
    'generate_workspace_digest',
    'learn_from_outcome'
  ) THEN
    RAISE EXCEPTION 'INVALID_JOB_TYPE: %', NEW.job_type USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.status NOT IN ('queued','running','succeeded','failed','cancelled') THEN
    RAISE EXCEPTION 'INVALID_JOB_STATUS: %', NEW.status USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.confidence IS NOT NULL AND (NEW.confidence < 0 OR NEW.confidence > 1) THEN
    RAISE EXCEPTION 'INVALID_CONFIDENCE: must be between 0 and 1' USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.started_at IS NOT NULL AND NEW.completed_at IS NOT NULL
     AND NEW.completed_at < NEW.started_at THEN
    RAISE EXCEPTION 'INVALID_TIMESTAMPS: completed_at < started_at' USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_intelligence_job
BEFORE INSERT OR UPDATE ON public.intelligence_jobs
FOR EACH ROW EXECUTE FUNCTION public.validate_intelligence_job();

CREATE OR REPLACE FUNCTION public.validate_intelligence_artifact()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.artifact_type NOT IN (
    'page_html',
    'screenshot',
    'form_snapshot',
    'scraped_text',
    'scoring_trace',
    'install_probe'
  ) THEN
    RAISE EXCEPTION 'INVALID_ARTIFACT_TYPE: %', NEW.artifact_type USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_intelligence_artifact
BEFORE INSERT OR UPDATE ON public.intelligence_artifacts
FOR EACH ROW EXECUTE FUNCTION public.validate_intelligence_artifact();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.intelligence_jobs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_artifacts ENABLE ROW LEVEL SECURITY;

-- Read: workspace members
CREATE POLICY "intel_jobs_select_members"
  ON public.intelligence_jobs FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "intel_artifacts_select_members"
  ON public.intelligence_artifacts FOR SELECT
  TO authenticated
  USING (public.is_workspace_member(workspace_id));

-- No INSERT/UPDATE/DELETE policies for authenticated users.
-- All writes go through SECURITY DEFINER fns or service role.

-- ============================================================
-- Enqueue helper (SECURITY DEFINER) — only path for app to create jobs
-- ============================================================

CREATE OR REPLACE FUNCTION public.enqueue_intelligence_job(
  _workspace_id uuid,
  _job_type     text,
  _input        jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF NOT public.is_workspace_member(_workspace_id) THEN
    RAISE EXCEPTION 'NOT_WORKSPACE_MEMBER' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.intelligence_jobs (workspace_id, job_type, input, created_by)
  VALUES (_workspace_id, _job_type, COALESCE(_input, '{}'::jsonb), auth.uid())
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_intelligence_job(uuid, text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.enqueue_intelligence_job(uuid, text, jsonb) TO authenticated;
