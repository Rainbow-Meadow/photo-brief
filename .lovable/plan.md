# PR 1 — PhotoBrief Intelligence: foundations

Scope is intentionally small. No worker is deleted. No runtime path changes. The deliverable is one architecture doc plus two new tables that future PRs will fill in.

## What ships in this PR

### 1. New doc: `docs/photobrief-intelligence-architecture.md`

Single source of truth for the collapse. Sections:

1. **Current system summary** — table of the 7 workers + 2 edge functions, what each owns today, lines of code, last-touched.
2. **What is over-engineered** — named, with evidence:
   - Conductor + event bus + dispatch RPC + KV brand cache for a product that has one operator per workspace.
   - Per-agent DOs holding state that already lives in Postgres.
   - LLM wrappers (`brandedPrompt`) on agents that don't talk to customers.
   - Separate workers for jobs that are really just "run this pipeline once and write a row."
3. **What gets collapsed into PhotoBrief Intelligence** — the five capability blocks the user listed (Website / Route / Brief / Install / Learning), each mapped to the old worker(s) it replaces.
4. **What stays deterministic (no LLM, no agent)** — `/i/:token`, `/r/:token`, `website-intake` edge function, R2 uploads, RLS, plan gates, router.
5. **What stays as infrastructure** — Cloudflare router, R2, Supabase, Lovable AI Gateway, Stripe.
6. **New system diagram** — ASCII. Operator UI and edge functions enqueue jobs into `intelligence_jobs`; one Intelligence runner (Supabase edge function or single CF worker, decided in PR 2) processes them; runtime paths read configuration only.
7. **Canonical job model** — every intelligence task is a row in `intelligence_jobs`. Inputs, outputs, confidence, warnings are columns, not bespoke endpoints. Artifacts (scraped HTML, screenshots, form snapshots) go in `intelligence_artifacts` + R2.
8. **Canonical job types** — the 11 the user listed: `scan_website`, `analyze_forms`, `propose_routes`, `propose_photo_policies`, `generate_blueprint`, `score_intake_brief`, `suggest_next_action`, `verify_install`, `monitor_install`, `generate_workspace_digest`, `learn_from_outcome`. Each gets: trigger, input shape, output shape, which old worker it replaces, deterministic vs LLM-assisted.
9. **Legacy adapter status** — table marking each existing worker:
   - `orchestrator-agent` → legacy, replaced by job engine
   - `assistant-agent` → folds into `score_intake_brief` + `generate_workspace_digest`
   - `capture-agent` → demoted to runtime session buffer; no decisions
   - `site-installer-agent` → folds into `verify_install` + `monitor_install`
   - `beta-onboarding-agent` → paused, candidate for removal once no traffic for 30 days
   - `mcp-agent` → paused, kept as future distribution channel
   - `website-intelligence` edge fn → folds into `scan_website` + `analyze_forms`
   - `website-intake` edge fn → unchanged, stays deterministic
   - `router` → unchanged
10. **Migration sequence by PR** — one table:
    - PR 1 (this) — doc + tables, no behavior change.
    - PR 2 — Intelligence runner skeleton + first job type (`scan_website`); `website-intelligence` edge fn delegates to it behind a flag.
    - PR 3 — `analyze_forms`, `propose_routes`, `propose_photo_policies`; `/intake` setup hub reads from new tables behind a flag.
    - PR 4 — `score_intake_brief`, `suggest_next_action`, `generate_workspace_digest`; assistant-agent stops being called.
    - PR 5 — `verify_install`, `monitor_install`; site-installer-agent stops being called.
    - PR 6 — `learn_from_outcome` + capture-agent demoted to session buffer.
    - PR 7 — delete dormant workers (orchestrator, assistant, site-installer, beta-onboarding) after 30 days idle.
11. **Risks** — flag-gated rollout per job type; old workers stay deployed and callable until their replacement job type has run cleanly in production for 14 days; explicit rollback (flip the flag) for each PR.
12. **Testing strategy** — contract tests on job input/output shapes; golden-file tests for each job type's deterministic portion; snapshot tests proving `/i/:token` and `/r/:token` payloads are byte-identical before/after each PR; smoke job per type in CI.

### 2. New tables (proposed, awaiting your approval)

`intelligence_jobs`:
- `id uuid pk`
- `workspace_id uuid not null` (RLS scoped)
- `job_type text not null` (enum-checked via trigger, not CHECK, per project rules)
- `status text not null default 'queued'` (`queued | running | succeeded | failed | cancelled`)
- `input jsonb not null default '{}'`
- `output jsonb`
- `confidence numeric` (0–1, nullable for deterministic jobs)
- `warnings jsonb not null default '[]'`
- `error text`
- `started_at timestamptz`
- `completed_at timestamptz`
- `created_by uuid` (auth user, nullable for system jobs)
- `created_at`, `updated_at` (trigger)
- Indexes: `(workspace_id, status, created_at desc)`, `(workspace_id, job_type, completed_at desc)`
- RLS: workspace members read; insert via SECURITY DEFINER fn `enqueue_intelligence_job`; only service role updates `status/output/error`.

`intelligence_artifacts`:
- `id uuid pk`
- `workspace_id uuid not null`
- `job_id uuid not null references intelligence_jobs(id) on delete cascade`
- `artifact_type text not null` (`page_html | screenshot | form_snapshot | scraped_text | scoring_trace | install_probe`)
- `source_url text`
- `storage_key text` (R2 key, nullable when content fits inline)
- `content_excerpt text` (≤ 2KB preview for ops)
- `metadata jsonb not null default '{}'`
- `created_at`
- Indexes: `(job_id)`, `(workspace_id, artifact_type, created_at desc)`
- RLS: workspace members read; service role write.

Validation triggers (not CHECK constraints) enforce:
- `job_type` in canonical set
- `status` in canonical set
- `confidence` between 0 and 1 when present
- `completed_at >= started_at` when both present

## What this PR does NOT touch

- No worker code edits.
- No edge function edits.
- No changes to `/i/:token`, `/r/:token`, `/intake`.
- No deletes. Old workers stay deployed.
- No new runtime dependencies.

## Open questions before I write the doc

1. Runner host for PR 2: **Supabase edge function** (simpler, lives next to data, fits "no LLM in customer path" since runner is offline) or **single CF worker `photobrief-intelligence`** (keeps queue/cron primitives we already use)? My recommendation: Supabase edge function + `pg_cron` trigger — fewer moving parts for a small team.
2. Should `intake_blueprints`, `intake_routing_rules`, `website_scan_jobs`, `website_pages`, `website_forms`, `service_catalog_items` be documented as "owned by Intelligence, written only by jobs" in this doc? I'll do that unless you'd rather scope the doc tighter.
3. Beta-onboarding: confirm it's paused (no new signups going through it) so I can mark it deprecation-eligible, not just legacy.

I'll answer 1 with my recommendation in the doc unless you override; 2 I'll include; 3 I need from you before writing the deprecation column.
