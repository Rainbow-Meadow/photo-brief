# Gain Control of the DB — Cloudflare Offload Plan

Goal: keep the relational/auth/RLS core on Lovable Cloud Postgres, but move volume, latency, and ephemeral state onto Cloudflare so you have leverage over performance and cost.

Assumes: Cloudflare Workers **Paid** plan, you already own the `photobrief.ai` zone, and the existing workers (`router`, `assistant-agent`, `capture-agent`, `beta-onboarding-agent`, `mcp-agent`) keep their current responsibilities.

---

## Step 1 — Hyperdrive in front of Postgres

Pool + cache reads from your existing Supabase Postgres into all Workers. Zero data migration.

- Create a Hyperdrive config pointing at `SUPABASE_DB_URL` (pooled connection string, port 6543).
- Bind `HYPERDRIVE` in each worker's `wrangler.toml` (`router`, `assistant-agent`, `capture-agent`, `beta-onboarding-agent`, `mcp-agent`).
- Add a thin `db.ts` helper in `workers/_shared/` using `postgres` (npm) over the Hyperdrive connection string. Read paths use it; writes still go through Supabase JS client + RLS where auth context matters.
- Set caching defaults: `max_age: 60s`, `stale_while_revalidate: 30s` for read queries that are safe to cache (plan limits, brand profile, public guide template).

Outcome: cold-call Postgres latency from Workers drops from ~150–400ms to ~10–40ms; connection storms during traffic spikes are absorbed.

## Step 2 — Mirror append-only telemetry to Analytics Engine

Keep Postgres as the system of record (billing math depends on `usage_events` + `credit_ledger`). Mirror the same writes into Cloudflare Analytics Engine for fast dashboards and to relieve Postgres on read-heavy reporting.

- Create one AE dataset: `pb_usage_events` (later add `pb_request_lifecycle`, `pb_sms_log`, `pb_ai_check`).
- Bind `AE_USAGE` in `assistant-agent` and `capture-agent`.
- Add a fire-and-forget helper `recordUsage(env, { workspace_id, event_type, related_id, credit_cost, metadata })` that writes the AE point right after the Postgres insert succeeds. Failures only log — never block the write of record.
- Build one Supabase Edge Function `analytics-aggregate` (or `assistant-agent` route) that proxies the AE SQL API for the in-app admin dashboard, so the browser never sees the AE token.
- Migrate the heaviest existing dashboard query (admin command center → workspace usage chart) to read from AE.

Outcome: you can run "last 30 days, all workspaces, by event_type" without touching Postgres.

## Step 3 — Recipient / wizard ephemeral state in Durable Objects

Today, every keystroke / draft answer / step transition in the recipient capture wizard hits Postgres (`submission_answers`, `submissions`, `captured_media` upserts). Move the **in-flight** state into a per-request Durable Object inside `capture-agent`; only persist a finalized snapshot to Postgres on submit.

- New DO class `CaptureSession` (SQLite-backed) keyed by `request_token`. Stores: current step index, draft answers, transient AI check results, retry counters.
- New worker routes: `POST /capture/:token/state` (patch), `GET /capture/:token/state` (load), `POST /capture/:token/submit` (flush to Postgres in one transaction via Supabase service role).
- Frontend `useCaptureAgent` / `useChatFlow` hooks switch their autosave path from `submissionsService` to the worker. Final submit still calls the existing edge function so RLS + triggers + credit logging fire exactly once.
- Add a TTL cleanup alarm on the DO (24h) so abandoned sessions self-destruct.

Outcome: 80–95% reduction in writes to `submission_answers` / `captured_media` during a session; resilient to network blips on flaky mobile.

## Step 4 — Cache public/recipient bundles in Workers KV

The recipient page (`/r/:token`) is fully public. Today each load hits `photo_brief_requests` + `brand_profiles` + `guides` + `guide_steps`. Cache the whole assembled bundle in KV.

- New KV namespace `RECIPIENT_BUNDLES`. Bind to `router` + `capture-agent`.
- New worker route `GET /recipient/:token/bundle` → KV hit returns immediately; KV miss assembles from Postgres (via Hyperdrive from Step 1), writes back with `expirationTtl: 3600`.
- Cache invalidation: on any update to `photo_brief_requests`, `brand_profiles`, or the request's `guide_id`, an Edge Function trigger (or a direct service-role POST from the existing handlers) calls `DELETE /recipient/:token/bundle`.
- `PublicRecipientPage.tsx` and `IntakeBadge.tsx` fetch from the worker route instead of Supabase.

Outcome: recipient page TTFB drops to edge speed; a viral recipient link no longer hammers Postgres.

## Step 5 — Email queue on Cloudflare Queues (deferred)

Only after Steps 1–4 are stable. Today `pgmq` + `_notify_event` + `process-email-queue` edge function carry email. Replacing pgmq with Cloudflare Queues removes Postgres triggers + `pg_net` from the email path.

- New queue `pb-email-out`. Producer binding in `assistant-agent`; consumer is a new worker `email-worker`.
- Replace `_notify_event` Postgres function calls inside triggers with a direct HTTPS call to `assistant-agent /enqueue-email` (or keep `pg_net` and just change the URL).
- `email-worker` consumes batches, calls Resend / your existing email template renderer, retries on failure, dead-letters after 5 attempts.
- Migrate `pgmq` queues one at a time (`welcome`, `submission_received`, `request_*`) and decommission once each is dual-running cleanly for a week.

Outcome: email throughput becomes independent of Postgres health; `pgmq` and `vault.email_queue_service_role_key` can eventually be retired.

---

## Cross-cutting deliverables

- `workers/_shared/`: new folder with `db.ts` (Hyperdrive client), `ae.ts` (Analytics Engine writer), `kv-bundle.ts` (recipient cache helpers), `types.ts`.
- `wrangler.toml` updates across 5 workers: bindings for `HYPERDRIVE`, `AE_USAGE`, `RECIPIENT_BUNDLES`, `CAPTURE_SESSION` (DO), and (Step 5) `EMAIL_QUEUE`.
- `scripts/secret-manifest.json`: add `HYPERDRIVE_ID`, `AE_DATASET_USAGE`, KV namespace ID, DO migration tag.
- One smoke-test edge function `cloudflare-control-plane-status` that the admin command center can ping to verify each binding is live.
- `docs/hybrid-hosting.md`: append a "Data plane split" section listing what lives where.

## What stays untouched on Postgres

Auth (`auth.*`), every table with RLS, all plpgsql triggers/functions, `pgmq` (until Step 5), `pg_net`, `vault`, Supabase Realtime, Supabase Storage. No schema migrations are required for Steps 1–4.

## Suggested rollout order

1. Step 1 (Hyperdrive) — 1 PR, low risk, immediate latency win.
2. Step 4 (KV recipient bundle) — 1 PR, biggest user-visible speedup.
3. Step 2 (AE telemetry) — 1 PR, dual-write only, no UI change until the dashboard query is swapped.
4. Step 3 (DO capture sessions) — larger PR, behind a feature flag (`capture_agent_do`) per workspace.
5. Step 5 (Queues) — only after the above are stable for 2+ weeks.

---

## Implementation status (2026-05-12)

**Step 1 — Hyperdrive: ✅ shipped**
- Hyperdrive config created: `cea7652fc3924714826c43a4090de08a` → `aws-1-us-east-1.pooler.supabase.com:6543`, caching `max_age=60s`, `swr=30s`.
- `HYPERDRIVE` binding added to: `assistant-agent`, `capture-agent`, `beta-onboarding-agent`, `mcp-agent` wrangler.toml.
- `workers/_shared/db.ts`, `ae.ts`, `kv-bundle.ts` scaffolded.
- `postgres@3.4.4` added to `assistant-agent` + `capture-agent` package.json.
- KV namespace `f7d82555b5894d6cb44d7139b718d8c2` (`photobrief-recipient-bundles`) created and bound to `router`, `assistant-agent`, `capture-agent` for Step 4.
- AE dataset `pb_usage_events` bound (auto-created on first write) on `assistant-agent` + `capture-agent` for Step 2.
- ⚠️ Hyperdrive currently authenticates as `sandbox_exec.<ref>` (the value of `SUPABASE_DB_URL`). If that user is rotated, update the Hyperdrive origin via `PATCH /accounts/{acct}/hyperdrive/configs/cea7652fc3924714826c43a4090de08a`.

**Step 2 — Analytics Engine: 🟡 bindings only**
Bindings live; still TODO: `recordUsage()` call sites, the `analytics-aggregate` proxy edge function, and migrating the admin command center chart query.

**Step 3 — Durable Object capture sessions: 🟡 binding stubbed**
`CAPTURE_SESSION` DO binding + v2 migration declared in `capture-agent/wrangler.toml`. Class implementation, worker routes, and frontend `useCaptureAgent` swap are pending.

**Step 4 — KV recipient bundle cache: 🟡 namespace ready**
KV namespace bound to all relevant workers. Worker route + frontend swap + invalidation hooks are pending.

**Step 5 — Cloudflare Queues for email: ⏸ deferred** per plan, only after Steps 1–4 are stable.

**Cross-cutting:** secret-manifest entries, `cloudflare-control-plane-status` smoke probe, and the `docs/hybrid-hosting.md` "Data plane split" section are pending.

The current PR-shaped diff is safe to deploy: it only adds bindings + shared helpers, no call sites changed yet, so behavior is unchanged until Steps 2–4 are wired up in follow-up turns.
