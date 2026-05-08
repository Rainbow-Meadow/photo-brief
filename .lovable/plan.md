
## Goal

Create an admin-protected edge function `run-migration` that accepts SQL and executes it against the database using the service role key (already available as `SUPABASE_SERVICE_ROLE_KEY` in the edge function environment). This lets you apply migrations from your repo without needing direct Supabase CLI credentials.

## What gets built

### 1. Edge function: `supabase/functions/run-migration/index.ts`

- **Auth**: Requires a valid JWT from a platform admin (same pattern as `admin-ai-rerun`)
- **Input**: `{ sql: string, name?: string }` — the migration SQL and an optional label
- **Execution**: Uses the service role Supabase client to call `rpc` or direct postgres via `SUPABASE_DB_URL`
- **Safety guardrails**:
  - Platform admin only (checked against `platform_admins` table)
  - Max SQL size limit (e.g. 500KB)
  - Logs each execution with timestamp, admin user ID, migration name, and success/failure to a `migration_log` table
- **Output**: `{ ok: true, name, rows_affected }` or `{ ok: false, error }`

Since `SUPABASE_DB_URL` is already configured as a secret, the function will use a direct Postgres connection (via `deno-postgres`) for full DDL support (CREATE TABLE, ALTER, etc.) — the Supabase JS client's `rpc` can't run arbitrary DDL.

### 2. Migration log table

A new `admin_migration_log` table to track what was applied:

```
admin_migration_log
  id          uuid PK
  name        text
  sql_hash    text        -- SHA-256 of the SQL to detect re-runs
  executed_by uuid        -- refs auth.users
  status      text        -- 'success' | 'error'
  error_msg   text
  created_at  timestamptz
```

RLS: only platform admins can read; inserts via service role only.

### 3. Local runner script

A small Node.js script (`scripts/run-migration.mjs`) that:
1. Reads a `.sql` file from `supabase/migrations/`
2. Authenticates as your admin account to get a JWT
3. POSTs the SQL to the `run-migration` edge function
4. Prints the result

Usage: `node scripts/run-migration.mjs supabase/migrations/20260508_my_change.sql`

The script reads credentials from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) or prompts for them.

### 4. GitHub Actions workflow update

Update `.github/workflows/deploy-supabase.yml` to use the edge function instead of `supabase db push`:
- Authenticate as admin via the Supabase auth API
- Loop through unapplied migrations (checking `admin_migration_log` by `sql_hash`)
- POST each to the edge function
- Secrets needed: `ADMIN_EMAIL` and `ADMIN_PASSWORD` (your platform admin account)

### 5. Config

Add `[functions.run-migration]` with `verify_jwt = true` to `supabase/config.toml`.

## Technical details

- The edge function uses `deno-postgres` (`https://deno.land/x/postgres/mod.ts`) for direct DB access, which supports full DDL statements
- SQL is hashed (SHA-256) before execution; if the same hash exists in `admin_migration_log` with status `success`, the function returns a "already applied" response (idempotent)
- The function runs each migration in a single transaction with automatic rollback on error
