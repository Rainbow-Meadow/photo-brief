# Backend Health Check

A read-mostly audit pass across every backend system, with a small set of targeted fixes for issues already surfaced. No schema changes unless an issue is found.

## What we already know (pre-flight findings)

- **Cloud status**: healthy.
- **pg_cron**: 2 active jobs (`process-email-queue` every 5s, `photobrief-flag-stale-requests` hourly). URL was just corrected last turn.
- **pgmq**: all 4 queues empty (auth/transactional + DLQs).
- **email_send_log**: 10 rows stuck in `pending` from May 6 (when the cron URL was wrong). The queue messages themselves expired and were dropped, but the log rows were never transitioned. Cosmetic but misleading.
- **Linter**: 16 WARN, 0 ERROR. All public tables have RLS enabled. Warnings are mostly known-safe (SECURITY DEFINER helpers, public storage buckets, search_path).
- **Secrets**: 15 present; no obvious gaps for the 47 deployed edge functions.

## Audit checklist

### 1. Edge functions wiring
- Spot-check each of the 47 functions for: presence of `Deno.serve`, CORS handler, JWT verification (where required), and matching `supabase/config.toml` entry.
- Run `scripts/check-supabase-functions.mjs` (already in the repo) to catch missing entrypoints, broken local imports, and undeclared functions.
- Smoke-test the high-traffic public functions with `curl` against the deployed URL:
  - `verify-turnstile`, `live-preview-submission`, `waitlist-submit`, `integration-webhook`, `process-email-queue`, `notify-event`, `payments-webhook`, `handle-email-unsubscribe`.
- For each, confirm 2xx on a valid request and 4xx (not 5xx) on an empty/invalid request.

### 2. Scheduled jobs
- Confirm `process-email-queue` cron still points at the correct project URL after the fix.
- Confirm `photobrief-flag-stale-requests` is firing (sample `usage_events` / `photo_brief_requests` for status transitions in the last 24h).
- Check the GitHub Actions `process-email-queue` workflow — it duplicates the pg_cron job. Decide whether to keep it as a backup or retire it (it's currently silently competing with cron every 5 minutes).

### 3. Email pipeline
- Mark the 10 stale `pending` rows in `email_send_log` as `dlq` with a clear `error_message` ("queue URL misconfigured 2026-05-06; messages expired"). Append-only insert per the email schema rules — not an UPDATE.
- Send one test transactional email end-to-end (e.g., `waitlist-confirmation` to a test address) and verify it transitions `pending` → `sent` within one cron tick.
- Verify the vault secret `email_queue_service_role_key` is current (we just refreshed it).
- Check `auth-email-hook` is the queue-based version (imports `enqueue_email`, not `@lovable.dev/email-js`).

### 4. Database integrity
- Re-run the linter and review each WARN to decide keep/fix:
  - `Function Search Path Mutable` (×2) — pin `set search_path = public` on the two offending functions.
  - `Extension in Public` — usually `pgmq` or `citext`; document as accepted if so.
  - `Public Bucket Allows Listing` (×3) — review `brand-assets`, `submission-media`, `marketing-assets`, `email-assets` policies; tighten if any unintentionally allow `LIST`.
  - `SECURITY DEFINER` executable warnings — confirm each helper (`has_workspace_role`, `is_workspace_member`, `is_platform_admin`, `workspace_has_credits`, `current_credit_balance`, etc.) is intentionally callable.
- Confirm all 50+ public tables still have RLS enabled (currently: yes).
- Spot-check the most sensitive tables' policies: `business_workspaces`, `workspace_members`, `submissions`, `request_credit_packs`, `subscriptions`, `platform_admins`, `usage_events`, `credit_ledger`.

### 5. Cloudflare Workers
- Verify each worker (`router`, `assistant-agent`, `capture-agent`, `beta-onboarding-agent`, `mcp-agent`) has a current `wrangler.toml` and required bindings/secrets.
- Hit the worker health endpoints if they expose one; otherwise confirm last successful deploy via `.github/workflows/deploy-cloudflare.yml`.

### 6. R2 / storage
- Confirm R2 secrets resolve (account id, bucket, keys present).
- List a single test object from `submission-media` via the worker to confirm signed-URL flow still works.

### 7. Connectors & third-party
- Confirm the connector-managed secrets (ElevenLabs, Firecrawl, Google Drive/Mail/Sheets) still work by hitting one no-op endpoint each (e.g., `website-intelligence` for Firecrawl).
- Stripe: confirm `payments-webhook` is reachable and `customer-portal` returns a valid session for a test workspace.

### 8. Observability
- Pull last 24h of `function_edge_logs` for non-2xx responses on every function and triage anything not already explained.
- Pull last 24h of `auth_logs` for non-info levels (already saw the GoTrue deprecation warnings — those are upstream, no action).

## Deliverable

A single summary written back to chat with:
- ✅ items that are healthy (one line each)
- ⚠️ items that need attention, with exact next-step fixes
- 🛠️ a tight follow-up edit list for anything actionable (estimated ≤5 items based on the pre-flight)

## Out of scope

- Refactoring working code.
- Touching `supabase/config.toml` project-level settings, `auth.*` schemas, or any RLS policy that's already correct.
- Performance tuning (separate request).
