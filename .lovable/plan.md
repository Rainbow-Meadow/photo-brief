# New `/demo` Flow

Replace the current conversational demo with a flow that proves the product by running the real intake pipeline against the visitor's own URL.

## User experience

```text
1. Paste URL  →  "Scanning your site…" (10–40s, live status)
2. See proposed routes + photo policies (the actual scan output)
3. Interact with the live /i/:token public intake (their own brief)
4. CTA: "Start 14-day trial and keep this setup"
5. After signup → new workspace seeded with the exact blueprint
```

## Step 1 — Public scrape endpoint

The current `website-intelligence` function requires auth + an existing workspace. We need a public sibling.

**New edge function:** `demo-scan` (public, `verify_jwt = false`)

- Input: `{ url, turnstileToken }`
- Reuses the existing scraper, classifier, and blueprint planner from `website-intelligence` (extract those into `_shared/intelligence/` so both functions call the same code — no duplication).
- Writes the scan + blueprint into the existing `DEMO_WORKSPACE_ID` (same hidden workspace used today by `demo-discovery`), tagged with a per-visitor `demo_session_id`.
- Creates a one-off `intake_sources` row + public token so the visitor immediately gets a working `/i/:token` URL.
- Rate-limited by IP (Turnstile + a simple `demo_scans` table with `created_at` + `ip_hash`).
- Returns: `{ demoSessionId, intakeToken, blueprintSummary, routes[] }`.

Hardening: re-use `isUnsafeHost`, max-pages cap, request timeout, content-type allowlist already in `website-intelligence`.

## Step 2 — Preview the proposed setup

New section on `/demo` shows what was found:
- Business name + summary the AI inferred
- Each route: label, description, photo policy chip
- One-line install recommendation
- Primary CTA: "Try it as a customer →" (opens `/i/:token` in an iframe **and** a "open in new tab" link)

## Step 3 — Live intake interaction

Embed the real `/i/:token` page (same component that ships to customers) inside a phone-frame on the demo page. No mock — it's the actual flow against their actual scan.

## Step 4 — Conversion CTA

After the visitor submits (or skips) the intake, show:
- "This is your setup. Claim it." → `/auth?mode=signup&demo=<demoSessionId>`
- The signup page reads `?demo=...`, stores it in `sessionStorage` before the auth round-trip.

## Step 5 — Import on signup

**New edge function:** `claim-demo-blueprint` (auth required)

- Input: `{ demoSessionId }`
- Verifies the session belongs to the demo workspace, is < 24h old, hasn't been claimed.
- Copies the blueprint, routing rules, service catalog items, and intake source row from `DEMO_WORKSPACE_ID` into the user's new workspace (rewriting workspace_id + regenerating ids/tokens).
- Marks the demo session `claimed_at = now()` so it can't be re-imported.
- Returns the new workspace's intake source token.

Wire-up: after `ensure-workspace` completes in the post-signup bootstrap, if `sessionStorage.demoSessionId` exists, call `claim-demo-blueprint`, then redirect to `/intake` with a "Imported from your demo" toast.

## Schema changes

```sql
-- new table
create table public.demo_sessions (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  ip_hash text not null,
  blueprint_id uuid references intake_blueprints(id) on delete set null,
  intake_source_id uuid references intake_sources(id) on delete set null,
  scan_job_id uuid references website_scan_jobs(id) on delete set null,
  claimed_by_user_id uuid,
  claimed_workspace_id uuid,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
-- RLS: deny all from anon/auth; service-role only (edge functions handle access)
create index on public.demo_sessions (ip_hash, created_at desc);
```

`demo-cleanup` extended to drop expired/unclaimed `demo_sessions` plus their blueprint/source rows.

## Files

**New**
- `supabase/functions/demo-scan/index.ts`
- `supabase/functions/claim-demo-blueprint/index.ts`
- `supabase/functions/_shared/intelligence/` (extracted scraper + planner)
- migration for `demo_sessions` + cleanup updates

**Rewritten**
- `src/pages/Demo.tsx` — three states: `url-entry`, `scanning` (with progress copy), `preview-and-try` (routes summary + embedded `/i/:token` + CTA)

**Edited**
- `src/pages/Auth.tsx` — read `?demo=` and stash in sessionStorage
- post-signup bootstrap (wherever `ensure-workspace` is called) — call `claim-demo-blueprint` when stash present
- `supabase/functions/demo-cleanup/index.ts` — also purge `demo_sessions`

**Deleted**
- `supabase/functions/demo-discovery/index.ts` (old conversational demo)

## Questions before I build

1. **Rate limiting** — 1 scan per IP per hour is my default. OK, or more generous?
2. **Embed vs redirect** for step 3 — embed `/i/:token` in a phone-frame on the demo page (my plan), or hand them a link and let them open it in a new tab?
3. **What happens if scrape fails / site blocks us?** Fall back to the current conversational `demo-discovery` flow as plan B, or just show "we couldn't read that site — start your trial and we'll help you set it up"?
