
CREATE TABLE public.admin_migration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  sql_hash text NOT NULL,
  executed_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','error')),
  error_msg text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_migration_log_hash ON public.admin_migration_log (sql_hash);

ALTER TABLE public.admin_migration_log ENABLE ROW LEVEL SECURITY;

-- Platform admins can read the log
CREATE POLICY "Platform admins can view migration logs"
  ON public.admin_migration_log
  FOR SELECT
  TO authenticated
  USING (public.is_platform_admin());

-- No insert/update/delete policies for authenticated users;
-- only the service role (used by the edge function) can write.
