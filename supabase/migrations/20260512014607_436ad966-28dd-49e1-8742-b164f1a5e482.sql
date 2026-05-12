
-- Fix 1: token-scoped read of workspace name for recipient page
CREATE POLICY "ws read by token"
  ON public.business_workspaces
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.photo_brief_requests r
      WHERE r.id = public.request_id_for_token()
        AND r.workspace_id = business_workspaces.id
    )
  );

-- Fix 2: prevent sending a request without a guide
CREATE OR REPLACE FUNCTION public.enforce_request_has_guide_when_sent()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM 'draft'::request_status
     AND NEW.guide_id IS NULL THEN
    RAISE EXCEPTION 'REQUEST_MISSING_GUIDE: a guide must be attached before sending this request'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_request_has_guide_when_sent ON public.photo_brief_requests;
CREATE TRIGGER trg_request_has_guide_when_sent
  BEFORE INSERT OR UPDATE ON public.photo_brief_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_request_has_guide_when_sent();
