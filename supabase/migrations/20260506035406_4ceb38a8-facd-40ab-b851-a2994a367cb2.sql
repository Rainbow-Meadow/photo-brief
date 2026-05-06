
CREATE OR REPLACE FUNCTION public.notify_founding_partner_accepted()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $func$
BEGIN
  IF NEW.is_founding_pro = true
     AND (OLD.is_founding_pro IS DISTINCT FROM true) THEN
    PERFORM public._notify_event(
      jsonb_build_object('event', 'founding_partner_accepted', 'workspace_id', NEW.workspace_id)
    );
  END IF;
  RETURN NEW;
END;
$func$;

CREATE TRIGGER trg_founding_partner_welcome
  AFTER UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_founding_partner_accepted();
