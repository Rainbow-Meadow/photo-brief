# PhotoBrief Intelligence Architecture

Status: **PR 1 — foundations.** This doc, plus two new tables (`intelligence_jobs`, `intelligence_artifacts`). No worker code is touched. No runtime path changes. No deletes.

The goal: collapse the seven-worker agent fleet into one job-driven system called **PhotoBrief Intelligence** so a small team can ship a reliable paid Smart Intake product without maintaining a microservice per capability.

---

## 1. Current system summary

| Component | Role today | Lines | Notes |
|---|---|---:|---|
| `workers/router` | Edge traffic, host/bot routing | ~424 | Stays. Pure infra. |
| `workers/orchestrator-agent` | Conductor: workspace context, event bus, dispatch RPC, nightly digest | ~465 | Replaced by job engine. |
| `workers/assistant-agent` | Per-workspace state, daily digest, health, upgrade nudges | ~695 | Folds into Brief + Workspace Intelligence. |
| `workers/capture-agent` | Live recipient session, nudges, redo prompts | ~479 | Demoted to runtime session buffer (no decisions). |
| `workers/site-installer-agent` | Detect platform, install, daily verification + 6 platform installers | ~666 + installers | Folds into Install Intelligence. |
| `workers/beta-onboarding-agent` | Beta qualification, founding-partner nurture | ~378 | Paused. Deprecation candidate after 30 days idle. |
| `workers/mcp-agent` | External MCP / x402 surface | ~542 | Paused as a future distribution channel. Not core product. |
| `supabase/functions/website-intelligence` | Website scan + analysis (HTTP-driven) | — | Folds into `scan_website` + `analyze_forms` jobs. |
| `supabase/functions/website-intake` | Deterministic public intake webhook | — | **Unchanged.** Stays deterministic. |
| Tables: `intake_sessions`, `intake_briefs`, `intake_routing_rules`, `intake_blueprints`, `website_scan_jobs`, `website_pages`, `website_forms`, `service_catalog_items` | Domain data | — | Stay. Become "owned by Intelligence, written only by jobs." |

---

## 2. What is over-engineered

Specific, with evidence:

- **Conductor + event bus + dispatch RPC + per-agent KV brand cache** for a product where one workspace = one operator = one website. We are paying microservice cost for single-tenant work.
- **Per-agent Durable Objects** holding state that already lives in Postgres. Two sources of truth, two failure modes, two debugging paths.
- **`brandedPrompt` LLM wrappers on agents that never talk to a customer.** Branding the prompt is irrelevant when the output is a row in our DB.
- **Separate workers for jobs that are really "run a pipeline once and write a row."** A scan, a route proposal, an install probe — these are jobs, not services.
- **Cross-worker queues + RPC for handoffs** that could be sequential function calls inside one runner.
- **Nightly standup digest** running as a worker with its own state when it could be a scheduled job reading Postgres.

The product needs to win on intake quality, not architecture cleverness.

---

## 3. PhotoBrief Intelligence — the new core

One system. Five capability blocks. Every task is a row in `intelligence_jobs`.

### 3.1 Website Intelligence
Scan the operator's website, detect services, detect forms, collect evidence, flag manual review warnings.
- Replaces: `supabase/functions/website-intelligence`, parts of `site-installer-agent` (detection), `assistant-agent` (workspace inference).
- Job types: `scan_website`, `analyze_forms`.
- Evidence written to `intelligence_artifacts` (`page_html`, `screenshot`, `form_snapshot`, `scraped_text`).

### 3.2 Route Intelligence
Propose Smart Intake routes, suggest questions, suggest `photo_policy`, explain reasoning with evidence.
- Replaces: parts of `assistant-agent`, ad-hoc setup logic in `/intake` services.
- Job types: `propose_routes`, `propose_photo_policies`, `generate_blueprint`.
- Output is a proposal a human approves before it touches `intake_routing_rules` / `intake_blueprints`.

### 3.3 Brief Intelligence
Score submitted intake briefs, identify missing info, recommend next action, summarize for the operator.
- Replaces: `assistant-agent` brief logic.
- Job types: `score_intake_brief`, `suggest_next_action`.
- Trigger: `intake_briefs` insert (via DB trigger enqueueing job, future PR).

### 3.4 Install Intelligence
Verify Smart Intake is installed, monitor install health, produce manual fix instructions.
- Replaces: `site-installer-agent` and its 6 platform installers (carrd, shopify, webflow, wix, wordpress, zapier — kept as library code, not workers).
- Job types: `verify_install`, `monitor_install`.
- Daily monitor runs via `pg_cron` enqueueing `monitor_install` per workspace.

### 3.5 Learning Loop
Learn from route edits, brief outcomes, photo requests, skipped photos, operator feedback.
- New capability — no current owner.
- Job types: `learn_from_outcome`, `generate_workspace_digest`.
- Reads `intake_briefs`, edit history, submission outcomes; writes back signals to `intelligence_artifacts` (`scoring_trace`).

---

## 4. What stays deterministic (no LLM, no agent)

These paths must remain byte-identical pre/post collapse. They are protected by snapshot tests in every PR.

- **`/i/:token`** — public Smart Intake runtime. Reads published config. No LLM in path.
- **`/r/:token`** — public guided photo capture runtime. Unchanged.
- **`supabase/functions/website-intake`** — deterministic public webhook.
- **R2 / media upload services**.
- **Supabase RLS + plan gates (DB triggers)**.
- **`workers/router`** — edge traffic only.

If a future PR puts an LLM call in any of these paths, it is wrong.

---

## 5. What stays as infrastructure

- Cloudflare router + R2 + KV (only where actually needed; brand cache KV goes away with the Conductor).
- Supabase: DB, Auth, Storage, Edge Functions.
- Lovable AI Gateway: every LLM call routes through here. No raw provider keys.
- Stripe: billing.

---

## 6. New system diagram

```text
                      ┌────────────────────────┐
                      │   Operator UI (React)  │
                      │   /intake setup hub    │
                      └─────────┬──────────────┘
                                │ enqueue_intelligence_job(...)
                                ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    Postgres (Supabase)                      │
   │                                                             │
   │   intelligence_jobs   intelligence_artifacts                │
   │   intake_briefs       intake_routing_rules                  │
   │   intake_blueprints   website_scan_jobs / pages / forms     │
   │   service_catalog_items                                     │
   └─────────┬─────────────────────────────────────────▲─────────┘
             │ pg_cron poll (queued)                   │ writes
             ▼                                         │
   ┌─────────────────────────┐                         │
   │  PhotoBrief Intelligence│   ── LLM via ──►  Lovable AI Gateway
   │  Runner                 │                         │
   │  (Supabase edge fn)     │                         │
   │                         │                         │
   │  scan_website           │  ── HTTP/scrape ──►  Public web
   │  analyze_forms          │                         │
   │  propose_routes         │                         │
   │  propose_photo_policies │  ── R2 PUT ────────►  Cloudflare R2
   │  generate_blueprint     │                         │
   │  score_intake_brief     │                         │
   │  suggest_next_action    │                         │
   │  verify_install         │                         │
   │  monitor_install        │                         │
   │  generate_workspace_digest                        │
   │  learn_from_outcome     │                         │
   └─────────────────────────┘                         │
                                                       │
   ┌──────────────────────────────────────────────┐    │
   │  DETERMINISTIC RUNTIME (no LLM in path)      │────┘
   │  /i/:token  /r/:token  website-intake fn     │
   │  router  R2 upload  RLS + plan gates         │
   └──────────────────────────────────────────────┘
```

**Recommended runner host (decided in PR 2):** Supabase edge function + `pg_cron`. Lives next to data, fewer moving parts, fits the "no LLM in customer path" rule because the runner is offline relative to recipient traffic. Cloudflare Workers stay for edge traffic only.

---

## 7. Canonical job model

Every intelligence task is one row in `intelligence_jobs`. Inputs, outputs, confidence, warnings are columns — not bespoke endpoints.

### `intelligence_jobs`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | pk |
| `workspace_id` | uuid | FK `business_workspaces` |
| `job_type` | text | validated against canonical set (trigger) |
| `status` | text | `queued`/`running`/`succeeded`/`failed`/`cancelled` |
| `input` | jsonb | job-specific |
| `output` | jsonb | nullable until success |
| `confidence` | numeric | 0–1, nullable for deterministic jobs |
| `warnings` | jsonb | array of `{code, message, evidence?}` |
| `error` | text | nullable |
| `started_at` / `completed_at` | timestamptz | trigger enforces order |
| `created_by` | uuid | nullable for system jobs |
| `created_at` / `updated_at` | timestamptz | |

RLS: workspace members read. Writes only via `enqueue_intelligence_job(workspace_id, job_type, input)` SECURITY DEFINER fn (membership-checked) or service role.

### `intelligence_artifacts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | pk |
| `workspace_id` | uuid | FK |
| `job_id` | uuid | FK, ON DELETE CASCADE |
| `artifact_type` | text | `page_html`/`screenshot`/`form_snapshot`/`scraped_text`/`scoring_trace`/`install_probe` |
| `source_url` | text | nullable |
| `storage_key` | text | R2 key for large blobs |
| `content_excerpt` | text | ≤ 2 KB ops preview |
| `metadata` | jsonb | |
| `created_at` | timestamptz | |

RLS: workspace members read. Service role writes.

---

## 8. Canonical job types

| Job type | Trigger | Input | Output | Replaces | Has LLM? |
|---|---|---|---|---|---|
| `scan_website` | operator action / setup | `{root_url}` | `{pages_found, hostname, screenshots}` | `website-intelligence` fn | no |
| `analyze_forms` | after `scan_website` | `{scan_job_id}` | `{forms[], fields[], warnings[]}` | `website-intelligence` fn | no |
| `propose_routes` | after `analyze_forms` | `{scan_job_id, services?}` | `{routes[]}` proposal | `assistant-agent` setup logic | yes |
| `propose_photo_policies` | after `propose_routes` | `{routes[]}` | `{policies: route_id → state}` | new | yes |
| `generate_blueprint` | operator approves routes | `{approved_routes[]}` | `{blueprint}` written to `intake_blueprints` on approval | new (consolidates) | yes |
| `score_intake_brief` | `intake_briefs` insert | `{brief_id}` | `{score, missing[], summary}` | `assistant-agent` brief logic | yes |
| `suggest_next_action` | after scoring | `{brief_id}` | `{action, rationale}` | `assistant-agent` | yes |
| `verify_install` | operator action / install hook | `{site_url, expected_token}` | `{installed, evidence, fix_steps?}` | `site-installer-agent` | no |
| `monitor_install` | `pg_cron` daily | `{workspace_id}` | `{healthy, drift?}` | `site-installer-agent` monitor | no |
| `generate_workspace_digest` | `pg_cron` nightly | `{workspace_id}` | `{digest_md}` | `orchestrator-agent` standup + `assistant-agent` digest | yes |
| `learn_from_outcome` | review/edit/skip events | `{event_type, ref_id}` | `{signals[]}` | new | partial |

Deterministic jobs (no LLM) write `confidence = NULL`. LLM-assisted jobs must set a confidence and may emit `warnings`.

---

## 9. Legacy adapter status

| Worker / fn | Status after PR 1 | Removal trigger |
|---|---|---|
| `router` | **Keep**. Edge infra. | n/a |
| `orchestrator-agent` | **Legacy.** Replaced by job engine starting PR 4. | After PR 6 stable for 14 days. |
| `assistant-agent` | **Legacy.** Folds into Brief + Workspace Intelligence (PR 4). | After PR 4 stable for 14 days. |
| `capture-agent` | **Demoted** to runtime session buffer. No decisions. (PR 6) | Never deleted; scope shrinks. |
| `site-installer-agent` | **Legacy.** Folds into Install Intelligence (PR 5). Platform installer libs kept as code. | After PR 5 stable for 14 days. |
| `beta-onboarding-agent` | **Paused.** Confirm no new traffic. | After 30 days zero traffic. |
| `mcp-agent` | **Paused.** Future distribution channel, not core. | Indefinite hold. |
| `website-intelligence` edge fn | **Legacy.** Delegates to `scan_website` + `analyze_forms` behind a flag (PR 2). | After PR 3 stable for 14 days. |
| `website-intake` edge fn | **Keep, unchanged.** Deterministic runtime. | Never. |

"Legacy" = still deployed, still callable, but the new path is the source of truth behind a flag.

---

## 10. Migration sequence by PR

| PR | Scope | Behavior change |
|---|---|---|
| **1 (this)** | Doc + `intelligence_jobs` + `intelligence_artifacts` + `enqueue_intelligence_job` fn. | None. |
| 2 | Intelligence runner skeleton (Supabase edge fn + `pg_cron`). Implement `scan_website`. `website-intelligence` fn delegates behind flag `intelligence.scan_website`. | Flag-off no-op. |
| 3 | Implement `analyze_forms`, `propose_routes`, `propose_photo_policies`, `generate_blueprint`. `/intake` setup hub reads from new tables behind flag `intelligence.routes`. | Flag-off no-op. |
| 4 | Implement `score_intake_brief`, `suggest_next_action`, `generate_workspace_digest`. DB trigger enqueues scoring on `intake_briefs` insert. `assistant-agent` stops being called. | Operator sees AI-scored briefs (was assistant-agent). |
| 5 | Implement `verify_install`, `monitor_install`. `site-installer-agent` stops being called. Platform installer libs imported into runner. | Install verification served by Intelligence. |
| 6 | Implement `learn_from_outcome`. Demote `capture-agent` to session buffer. | Capture decisions become deterministic config. |
| 7 | Delete dormant workers (`orchestrator`, `assistant`, `site-installer`, `beta-onboarding`) after 30 days idle. | Dead code removed. |

Each PR ships its own flag, its own contract test, and its own rollback (flip the flag).

---

## 11. Risks

- **Silent regression in `/i/:token` or `/r/:token`.** Mitigation: snapshot tests asserting payload bytes are identical pre/post each PR. CI gate.
- **`pg_cron` runner falls behind.** Mitigation: per-job-type SLO + alert on `queued` rows older than 5× expected duration.
- **LLM cost spike.** Mitigation: Lovable AI Gateway only, per-workspace daily token budget logged via `usage_events`, kill-switch flag per job type.
- **Lost capability during collapse.** Mitigation: legacy worker stays deployed and callable for 14 days after replacement ships; flag flip rolls back instantly.
- **Permission leakage in `enqueue_intelligence_job`.** Mitigation: SECURITY DEFINER + explicit `is_workspace_member` check. RLS denies all direct INSERT.
- **Beta program signups still routed through `beta-onboarding-agent`.** Confirm before PR 7. If confirmed paused, mark deprecation-eligible.

---

## 12. Testing strategy

- **Contract tests** per job type: input schema, output schema, status transitions. Fixture-driven.
- **Golden-file tests** for the deterministic portion of each job (`scan_website`, `analyze_forms`, `verify_install`, `monitor_install`).
- **Snapshot tests** asserting `/i/:token` and `/r/:token` JSON payloads are byte-identical between pre- and post-PR runs. Wired into CI.
- **Smoke job per type** in CI: enqueue + assert success within budget.
- **RLS tests**: non-member cannot read jobs/artifacts; non-member cannot enqueue.
- **Confidence + warnings discipline**: lint test asserts every LLM-assisted job sets `confidence` on success.

---

## 13. Domain tables — ownership after collapse

These existing tables stay. Their write contract changes:

| Table | Owned by (writes) | Read by |
|---|---|---|
| `intake_sessions` | `website-intake` edge fn (deterministic) | UI, jobs |
| `intake_briefs` | `website-intake` edge fn | UI, `score_intake_brief` job |
| `intake_routing_rules` | `generate_blueprint` job (after operator approval) | `/i/:token` runtime |
| `intake_blueprints` | `generate_blueprint` job (after operator approval) | `/i/:token` runtime |
| `website_scan_jobs`, `website_pages`, `website_forms` | `scan_website` + `analyze_forms` jobs | UI, downstream jobs |
| `service_catalog_items` | `propose_routes` job (after operator approval) | UI, `propose_routes` |

Operator approval is the gate between an Intelligence proposal and any write to a runtime-facing table. The runtime never reads job output directly.

---

## 14. Open items for PR 2

1. Confirm runner host: **Supabase edge function + `pg_cron`** (recommended) vs single `photobrief-intelligence` Cloudflare Worker. Default to Supabase unless overridden.
2. Confirm `beta-onboarding-agent` is paused (no new signups routed to it). Required before marking it deprecation-eligible in PR 7.
3. First job type to implement: `scan_website`. Wire `website-intelligence` edge fn delegate behind `intelligence.scan_website` flag. Default flag off.
