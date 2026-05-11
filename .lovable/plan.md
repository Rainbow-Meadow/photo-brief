## Goal
GA4 Realtime currently shows no hits on photobrief.ai. Keep the existing lazy gtag loader and fallback measurement ID `G-GJCZPQ3WJ9`, but harden the loader so a `page_view` reliably reaches GA on every real visit, and verify with the browser tool.

## Findings from `src/lib/analytics.ts`

1. **Listener-removal bug.** `removeListeners()` calls `removeEventListener(eventName, loadGoogleTag)`, but the function actually registered is `loadAndCleanup`. Result: interaction listeners are never detached. Harmless but a real bug.
2. **Idle fallback is 5s.** `requestIdleCallback(loadAndCleanup, { timeout: 5000 })` means a quick bounce visitor (closes tab in <5s with no interaction) never loads gtag.js, so Realtime under-counts. We can keep the perf-friendly lazy approach but lower the safety net to ~1500 ms.
3. **`page_view` is queued before script load — that part is fine.** `initAnalytics()` pushes `js`, `config`, and `page_view` into `dataLayer`; gtag.js drains the queue when it loads, so no events are lost as long as the script eventually loads.
4. **Order of operations in `trackPageView`.** It calls `initAnalytics()` (which only registers loaders) then immediately pushes `page_view`. Without an interaction or idle tick the script is never fetched. Tightening the timeout (item 2) covers this.
5. **No hardcoded snippet in `index.html`** — intentional and consistent with "keep lazy".
6. **Sanitizer + `send_page_view: false` config** — both correct, no change needed.

## Verification (read-only, before editing)

Use the browser tool to load `https://photobrief.ai` and `https://photo-brief.lovable.app` and inspect:
- network for `googletagmanager.com/gtag/js?id=G-GJCZPQ3WJ9`
- network for `google-analytics.com/g/collect?...&en=page_view&...`
- console for any GA-related errors
- confirm `window.dataLayer` is populated and `window.__photobriefGa4Initialized === true`

If `/g/collect` fires after the patch but Realtime is still empty, the measurement ID likely points to a property the user no longer owns — surface that explicitly so the user can confirm/replace the ID.

## Changes

### `src/lib/analytics.ts`
- Fix `removeListeners` to reference `loadAndCleanup` (the function actually registered) so listeners detach correctly after first load.
- Lower idle/timeout fallback from `5000` to `1500` ms; keep `requestIdleCallback` with `setTimeout` fallback.
- Add a short comment block explaining the loader contract for future maintainers.
- No change to: measurement ID source, fallback ID, `sanitizePath`, event names, conversion helpers, `RouteTracker` integration.

### Nothing else
- `index.html` — unchanged (no eager snippet; user chose lazy).
- `RouteTracker.tsx` — unchanged.
- `App.tsx` — unchanged.
- `scripts/prerender.mjs` — unchanged (still blocks gtag during prerender, correct).
- Env / docs — `docs/analytics-ga4.md` already documents the env var and fallback.

## Post-change verification
After edits, reload `https://photo-brief.lovable.app` in the browser tool, wait ~2 s, and confirm that:
- `gtag/js?id=G-GJCZPQ3WJ9` request returns 200
- a `g/collect` hit with `en=page_view` and a sanitized `dl=` (no UUID/token) is sent
- no console errors

Report the outcome plus a one-line note on what to check on the GA side: in **GA4 Admin → Data Streams**, confirm the web stream measurement ID matches `G-GJCZPQ3WJ9` and Enhanced Measurement is on. If the ID is wrong, set `VITE_GA4_MEASUREMENT_ID` in Lovable project settings (no code change required).
