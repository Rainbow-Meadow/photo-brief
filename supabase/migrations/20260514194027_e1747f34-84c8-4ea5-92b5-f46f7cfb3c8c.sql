
CREATE POLICY "Platform admins can read all exit interviews"
ON public.exit_interviews
FOR SELECT
TO authenticated
USING (public.is_platform_admin());
