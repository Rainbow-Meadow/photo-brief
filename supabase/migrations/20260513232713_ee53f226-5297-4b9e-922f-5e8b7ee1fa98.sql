-- Expand allowed job types to include PR4 handlers
CREATE OR REPLACE FUNCTION public.intelligence_jobs_validate()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  allowed_types text[] := ARRAY[
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
  ];
  allowed_status text[] := ARRAY['queued','running','succeeded','failed','cancelled'];
BEGIN
  IF NEW.job_type IS NULL OR NOT (NEW.job_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'invalid job_type: %', NEW.job_type;
  END IF;
  IF NEW.status IS NULL OR NOT (NEW.status = ANY(allowed_status)) THEN
    RAISE EXCEPTION 'invalid status: %', NEW.status;
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'succeeded' AND NEW.status <> 'succeeded' THEN
      RAISE EXCEPTION 'cannot transition out of succeeded';
    END IF;
    IF OLD.status = 'cancelled' AND NEW.status <> 'cancelled' THEN
      RAISE EXCEPTION 'cannot transition out of cancelled';
    END IF;
  END IF;
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL
     AND NEW.completed_at < NEW.started_at THEN
    RAISE EXCEPTION 'completed_at must be >= started_at';
  END IF;
  RETURN NEW;
END;
$$;

-- Auto-enqueue score_intake_brief whenever a brief is created.
CREATE OR REPLACE FUNCTION public.intake_briefs_enqueue_scoring()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.enqueue_intelligence_job(
    NEW.workspace_id,
    'score_intake_brief',
    jsonb_build_object('brief_id', NEW.id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block intake submission if the queue write fails. Operator can
  -- manually re-score from the UI.
  RAISE WARNING 'enqueue score_intake_brief failed for brief %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_intake_briefs_enqueue_scoring ON public.intake_briefs;
CREATE TRIGGER trg_intake_briefs_enqueue_scoring
AFTER INSERT ON public.intake_briefs
FOR EACH ROW
EXECUTE FUNCTION public.intake_briefs_enqueue_scoring();