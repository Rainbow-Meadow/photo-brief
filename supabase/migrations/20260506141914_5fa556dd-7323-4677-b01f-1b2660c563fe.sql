
-- Revoke PUBLIC execute from ALL security definer functions in public schema
DO $$
DECLARE fn RECORD;
BEGIN
  FOR fn IN
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC', fn.proname, fn.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon', fn.proname, fn.args);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM authenticated', fn.proname, fn.args);
  END LOOP;
END;
$$;

-- Re-grant to anon + authenticated for functions that need public access
GRANT EXECUTE ON FUNCTION public.founding_pro_remaining() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_id_for_token() TO anon, authenticated;

-- Re-grant to authenticated only for functions called by logged-in users
GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_workspace_role(uuid, member_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_platform_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_workspace_integrations(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_period_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_topup_balance(uuid) TO authenticated;
