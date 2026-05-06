CREATE OR REPLACE FUNCTION public._notify_event(_payload jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'vault' AS $$
DECLARE service_key text;
BEGIN
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  IF service_key IS NULL THEN RAISE WARNING 'notify-event: service role key missing from vault'; RETURN; END IF;
  PERFORM net.http_post(
    url := 'https://mvlcefiygkzzewcdzsmj.supabase.co/functions/v1/notify-event',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || service_key),
    body := _payload, timeout_milliseconds := 5000);
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'notify-event dispatch failed: %', SQLERRM;
END; $$;

CREATE OR REPLACE FUNCTION public._trigger_process_email_queue()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'vault' AS $$
DECLARE service_key text;
BEGIN
  SELECT decrypted_secret INTO service_key FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key' LIMIT 1;
  IF service_key IS NULL THEN RAISE WARNING 'process-email-queue trigger: service role key missing'; RETURN NEW; END IF;
  PERFORM net.http_post(
    url := 'https://mvlcefiygkzzewcdzsmj.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || service_key),
    body := '{}'::jsonb, timeout_milliseconds := 5000);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'process-email-queue trigger dispatch failed: %', SQLERRM; RETURN NEW;
END; $$;