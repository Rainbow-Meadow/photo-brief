
# Pre-Launch Cleanup: Remove Unused Code

## What gets removed

### 1. Dead page: `src/pages/Waitlist.tsx`
The Waitlist page redirects to `/betalist`, which itself redirects to `/`. It's a double-redirect that serves no purpose. The Cloudflare router worker and `_redirects` already handle `/waitlist` -> `/?utm_source=betalist` at the edge — so this React page is never reached by real traffic.

- Delete `src/pages/Waitlist.tsx`
- Remove the `WaitlistPage` import and `<Route path={routes.marketing.waitlist} ...>` from `AppRoutes.tsx`
- Remove `waitlist: "/waitlist"` from `navigation.ts`

### 2. Unused edge function: `waitlist-submit`
No frontend code invokes `waitlist-submit`. The BetaPortfolio/welcome pages use `beta-welcome-submit` instead.

- Delete `supabase/functions/waitlist-submit/` directory
- Remove the deployed function via the delete tool

### 3. Unused edge functions: `cloudflare-dns`, `generate-voiceover`
Neither is referenced anywhere in the frontend codebase.

- Delete `supabase/functions/cloudflare-dns/` and `supabase/functions/generate-voiceover/`
- Remove the deployed functions via the delete tool

### 4. Legacy redirect route constants
`betaPortfolioLegacy` and `betaListLegacy` in `navigation.ts` and their corresponding `<Route>` entries in `AppRoutes.tsx` duplicate redirects already handled at the Cloudflare edge and in `_redirects`. They add bundle weight with no benefit.

- Remove `betaPortfolioLegacy` and `betaListLegacy` from `navigation.ts`
- Remove their two `<Route>` entries from `AppRoutes.tsx`

### 5. Stale CI/diagnostics artifacts
`.ci-diagnostics/` and `tmp/ci-report.md` are leftover audit files, not part of the product.

- Delete `.ci-diagnostics/` directory
- Delete `tmp/ci-report.md`

### 6. Stale `.lovable/plan.md`
Contains outdated plan notes from the beta welcome page implementation.

- Delete `.lovable/plan.md`

## What stays (and why)

- **`public/_redirects`** — consumed by the Cloudflare Pages origin; the `/waitlist` and `/betalist` 301 rules there still serve SEO/backlink purposes for anyone who bookmarked those URLs.
- **`workers/router/src/index.ts`** — the `/waitlist` path is not in `MARKETING_PATHS` so it already falls through to Lovable. No change needed.
- **`waitlist_entries` DB table** — historical data; no reason to drop it.
- **`beta-welcome-submit` edge function** — actively used by `/welcome`.
- **All other edge functions** — referenced by frontend or called by other functions.

## Files changed

| Action | Path |
|--------|------|
| Delete | `src/pages/Waitlist.tsx` |
| Delete | `supabase/functions/waitlist-submit/` |
| Delete | `supabase/functions/cloudflare-dns/` |
| Delete | `supabase/functions/generate-voiceover/` |
| Delete | `.ci-diagnostics/` (entire directory) |
| Delete | `tmp/ci-report.md` |
| Delete | `.lovable/plan.md` |
| Edit | `src/routes/AppRoutes.tsx` — remove 4 lines (WaitlistPage import, 3 legacy redirect routes) |
| Edit | `src/routes/navigation.ts` — remove 3 keys (waitlist, betaListLegacy, betaPortfolioLegacy) |
