## Root cause

The blank screen on **photobrief.ai** and **photo-brief.lovable.app** is the same crash. Console (real browser):

```
Uncaught Error: supabaseUrl is required.
   at new SupabaseClient (...)
   at createClient (...)
   at /assets/index-iIBWJHvB.js
```

`src/integrations/supabase/client.ts` calls `createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)` at module top-level. When `import.meta.env.VITE_SUPABASE_URL` is empty at build time, the call throws synchronously while React is still mounting — nothing renders, ErrorBoundary never mounts, blank page.

Verified:
- The bundle served from photobrief.ai (`index-iIBWJHvB.js`) contains the literal string `supabaseUrl is required` and does **not** contain the project ref `mvlcefiygkzzewcdzsmj` → env vars were not inlined into this Lovable build.
- The Vite live preview iframe works because the sandbox `.env` is populated and read at dev-server start.
- photo-brief.lovable.app 302‑redirects `/` to photobrief.ai, so the same broken bundle is loaded there too — that's why "both" surfaces fail.

`.env` in the sandbox today contains all three `VITE_SUPABASE_*` values, so the next published build will be healthy. The Lovable production bundle currently in front of users was published from a state where those values were not injected.

## What to change in code (defensive hardening)

The proximate fix is to re-publish, but the codebase should also stop turning a missing env var into a white screen. Two small, surgical changes:

### 1. `src/integrations/supabase/client.ts` — fail loud, not blank

Wrap the `createClient` call so that if the env vars are missing we:
- log a single, clear error to the console (`[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing at build time — re-publish the project`)
- export a stub client whose methods reject with a descriptive error

This keeps React mounting, lets the existing `ErrorBoundary` paint a real fallback UI instead of a blank page, and gives any future regression an obvious diagnosis instead of a silent crash.

### 2. `src/integrations/supabase/tokenClient.ts` — same guard

Same defensive guard pattern for the recipient token client (it's lazy, so the impact is smaller, but the contract should match).

No other files change. We are not editing the Supabase types file, the auto-managed client signature, the env file, the router worker, or the Cloudflare Pages workflow.

## What you need to do (one click, outside code)

After the above patch lands, re-publish the project from the Lovable Publish menu. That triggers a fresh Lovable build with the current `.env` baked in, replacing `index-iIBWJHvB.js` with a bundle that contains the real Supabase URL. The landing page will render again on both photo-brief.lovable.app and photobrief.ai (which proxies to it for human visitors).

```text
Live preview iframe       OK today (Vite dev reads .env at runtime)
Lovable published build   needs re-publish (env not in current bundle)
photobrief.ai (apex)      router proxies humans → Lovable, so it inherits the fix
```

## Verification after publish

1. Hard reload photobrief.ai and photo-brief.lovable.app.
2. Confirm the landing hero renders.
3. DevTools console should be clean (no "supabaseUrl is required").
4. Network tab: a request to `mvlcefiygkzzewcdzsmj.supabase.co/rest/v1/beta_program_config` returns 200 (this is the seat-tracker call we already see succeeding from the preview).

## Out of scope

- Cloudflare Pages workflow (`.github/workflows/deploy-cloudflare.yml`) already validates `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` exist before building, so the Pages-built bundle (`index-BXflG6OL.js`) is fine — bots already get a working prerendered page. No change needed there.
- Router worker `LOVABLE_HOST` is correct (`photo-brief.lovable.app`).
- Service-layer `withRetry` hardening from the prior pass stays as is.
