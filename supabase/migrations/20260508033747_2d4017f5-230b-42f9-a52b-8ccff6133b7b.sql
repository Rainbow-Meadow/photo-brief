-- Website Intelligence schema compatibility migration.
-- The canonical Website Intelligence schema is created by:
-- 20260507203000_website_intelligence_schema.sql
--
-- This file was generated later by Lovable with overlapping DDL. Keep it
-- intentionally no-op/idempotent so older run-migration logs do not fail when
-- all migration files are replayed.

DO $$
BEGIN
  RAISE NOTICE 'Website Intelligence schema already managed by 20260507203000_website_intelligence_schema.sql; skipping duplicate migration.';
END $$;
