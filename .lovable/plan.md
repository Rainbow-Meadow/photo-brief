# Live E2E Test Plan: PhotoBrief Intake Flow (Cedar & Sons scenario)

## Objective
Run a real, evidence-backed end-to-end test of "Send a link. Get a complete brief." against the live preview. Use the **Cedar & Sons leaning-oak tree-care** scenario already used in the hero/interactive demo so test data stays consistent across the product.

## Test data (Cedar & Sons)
- Business: existing seed workspace (per `mem://seed-users`) — do **not** create a new business
- Request title: `Cedar & Sons — Leaning Oak Estimate (E2E <ISO timestamp>)`
- Recipient name: `Cedar & Sons Test Homeowner`
- Recipient email: safe `+e2e` alias on the seed user's domain
- Photos: reuse the four tree-care fixtures already in repo
  - `src/assets/tree-care/leaning-oak-wide.jpg`
  - `src/assets/tree-care/oak-trunk-closeup.jpg`
  - `src/assets/tree-care/house-elevation.jpg`
  - `src/assets/tree-care/driveway-access.jpg`
- Intake answers mirror the InteractiveHeroBriefAssembly script (lean direction, target species, access notes)

## Phase 1 — Recon (read-only)
1. Read `mem://seed-users` for the login + workspace to use.
2. Map live routes from `src/App.tsx` (request create, request detail, `/r/:token`, submission review).
3. Confirm services + edge functions involved (`requestsService`, `submissionsService`, `r2MediaService`, AI photo check, AI summary).
4. List DB tables to verify: `photo_brief_requests`, `submissions`, `captured_media`, `ai_check_results`, `submission_reviews`, `usage_events`, `credit_ledger`, plus `submission-media` storage.

## Phase 2 — Live execution

### A. Business-side setup
- Sign in as the seed user via `browser--navigate_to_sandbox`.
- Create the Cedar & Sons request above; capture request ID, `/r/:token`, timestamps.
- `supabase--read_query` confirms row in `photo_brief_requests` and a `request_created` event in `usage_events`.

### B. Recipient flow (unauthenticated session)
- Open `/r/:token` with no auth.
- Walk the stepper using the four tree-care fixtures (copied to `/tmp` first so the file input can read them).
- Provide Cedar & Sons answers.
- Trigger AI photo check; capture verdicts.
- Negative cases: submit missing required photo, missing required answer → expect blocked.
- Submit. Capture submission ID + `submitted_at`.
- Reopen completed link → expect read-only/confirmation state.
- Hit a tampered token → expect graceful invalid screen.

### C. Business review
- Back as seed user, open the request + submission.
- Verify media renders, AI notes / readiness score / plain-English summary present (or report missing), status moved `sent → opened → submitted → reviewed`.
- Screenshot each verification step.

### D. Backend verification (`supabase--read_query`)
For the captured IDs, dump and report rows from each table listed above plus storage objects in `submission-media`. Check for orphans, duplicates, and any service-role leakage in network responses.

### E. Credits sanity
- Snapshot `current_credit_balance(workspace_id)` before/after.
- Confirm: each submitted photo = 1 credit (`ai_photo_check`), first-pass follow-ups = 0 (`first_pass_followup_photo`), no double-charge on resubmission.

### F. Responsive
- Run the recipient flow once at 390x844 viewport to match real mobile usage.

## Phase 3 — Reporting
Deliver the full report the user requested:
1. Executive summary + direct yes/no on the core promise.
2. Environment block (URL, timestamps, IDs, branch).
3. Step-by-step results table (Step / Expected / Actual / Pass-Fail / Evidence).
4. Bug list (severity, repro, suspected cause, suggested fix, files involved).
5. Data integrity findings from SQL.
6. Prioritized recommended fixes.
7. Code changes section — only if a blocker is found and the fix is small and obvious. Scoped, no secrets, lint/typecheck/build run.

Artifacts (screenshots, SQL output) saved under `/mnt/documents/e2e-photobrief/` and surfaced via `presentation-artifact` tags.

## Hard stops (will halt and report)
- Seed login fails / 2FA blocks.
- Browser tool unavailable.
- Recipient route returns the prior "VITE_SUPABASE_URL missing" error in preview.
- AI gateway / edge functions return 5xx not fixable in-window.

## Known limitations
- Browser automation can't drive native camera capture; uploads use the file-input fallback. Any step that strictly requires camera will be flagged and skipped, not faked.
