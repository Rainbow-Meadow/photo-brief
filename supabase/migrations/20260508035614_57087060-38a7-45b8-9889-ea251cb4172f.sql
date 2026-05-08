CREATE TABLE IF NOT EXISTS public.admin_migration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  sql_hash text NOT NULL,
  executed_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','error')),
  error_msg text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_migration_log_hash ON public.admin_migration_log (sql_hash);

ALTER TABLE public.admin_migration_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'admin_migration_log'
      AND policyname = 'Platform admins can view migration logs'
  ) THEN
    CREATE POLICY "Platform admins can view migration logs"
      ON public.admin_migration_log
      FOR SELECT
      TO authenticated
      USING (public.is_platform_admin());
  END IF;
END $$;

-- No insert/update/delete policies for authenticated users;
-- only the service role used by the migration edge function can write.
