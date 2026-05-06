
-- ============================================================
-- 1. Revoke EXECUTE from anon on internal/trigger functions
-- ============================================================
REVOKE EXECUTE ON FUNCTION public._notify_event(jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public._trigger_process_email_queue() FROM anon;
REVOKE EXECUTE ON FUNCTION public.credit_request_on_first_rejection() FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_custom_guides_plan() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_internal_notes_plan() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_message_templates_plan() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_request_limit() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_seat_cap() FROM anon;
REVOKE EXECUTE ON FUNCTION public.finalize_first_pass_on_review() FROM anon;
REVOKE EXECUTE ON FUNCTION public.flag_stale_requests() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.invalidate_founding_pro_cache() FROM anon;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_founding_partner_accepted() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_request_message() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_request_opened() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_on_submission_received() FROM anon;
REVOKE EXECUTE ON FUNCTION public.notify_submission_received_email() FROM anon;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.run_data_retention() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_pass_status() FROM anon;

-- Also revoke from anon on functions that only authenticated users should use
REVOKE EXECUTE ON FUNCTION public.can_manage_workspace_integrations(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_period_usage(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_topup_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_platform_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_workspace_role(uuid, member_role) FROM anon;

-- ============================================================
-- 2. Revoke EXECUTE from authenticated on trigger/internal-only functions
-- ============================================================
REVOKE EXECUTE ON FUNCTION public._notify_event(jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public._trigger_process_email_queue() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_request_on_first_rejection() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_custom_guides_plan() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_internal_notes_plan() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_message_templates_plan() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_request_limit() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_seat_cap() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.finalize_first_pass_on_review() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.flag_stale_requests() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.invalidate_founding_pro_cache() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_founding_partner_accepted() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_request_message() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_request_opened() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_on_submission_received() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_submission_received_email() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.run_data_retention() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_pass_status() FROM authenticated;

-- ============================================================
-- 3. Fix missing search_path on email queue helper functions
-- ============================================================
CREATE OR REPLACE FUNCTION public.delete_email(queue_name text, message_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name text, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$function$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(source_queue text, dlq_name text, message_id bigint, payload jsonb)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name text, batch_size integer, vt integer)
 RETURNS TABLE(msg_id bigint, read_ct integer, message jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$function$;

-- ============================================================
-- 4. Restrict storage bucket SELECT policies to prevent listing
-- ============================================================

-- brand-assets: replace broad public SELECT with authenticated-only
DROP POLICY IF EXISTS "Brand assets are publicly readable" ON storage.objects;
CREATE POLICY "Brand assets are readable by authenticated users"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'brand-assets');

-- email-assets: replace broad public SELECT with authenticated-only
DROP POLICY IF EXISTS "Public read access for email assets" ON storage.objects;
CREATE POLICY "Email assets are readable by authenticated users"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'email-assets');

-- marketing-assets: replace broad public SELECT with authenticated-only
DROP POLICY IF EXISTS "Public read access on marketing-assets" ON storage.objects;
CREATE POLICY "Marketing assets are readable by authenticated users"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'marketing-assets');

-- submission-media: the broad anon+authenticated policy is for listing; 
-- replace with just the workspace-scoped read (already exists)
DROP POLICY IF EXISTS "submission-media public read" ON storage.objects;
