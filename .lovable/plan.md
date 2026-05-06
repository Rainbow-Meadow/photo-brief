## Problem

The `/betalist` page was deleted during cleanup, but **8 files** still contain hardcoded links to `/betalist`. These are all dead links that will 404 (the `_redirects` fallback only works on Cloudflare, not in the SPA).

## Broken links found

| File | What points to `/betalist` |
|------|---------------------------|
| `src/config/access.ts` | `signupCtaTarget()` returns `/betalist`; `planCtaTarget()` returns `/betalist?interest=...` |
| `src/components/pricing/PricingCardGrid.tsx` | Hardcoded `/betalist?interest=${plan.id}` |
| `src/components/marketing/FoundingCustomerBanner.tsx` | Hardcoded `/betalist?interest=founding-partner` |
| `src/pages/Signup.tsx` | `<Navigate to="/betalist">` and `<NavLink to="/betalist">` |
| `src/pages/Auth.tsx` | `<Navigate to="/betalist">` and `<NavLink to="/betalist">` |
| `src/pages/BetaInvite.tsx` | `<Navigate to="/betalist">` fallback |

## Fix

Replace all `/betalist` references with `/founding-partner-beta` (the canonical beta application page defined in `routes.marketing.foundingBeta`).

### Changes

1. **`src/config/access.ts`** -- Update `signupCtaTarget()` and `planCtaTarget()` to return `/founding-partner-beta` (with query params preserved).

2. **`src/components/pricing/PricingCardGrid.tsx`** -- Update the hardcoded `/betalist?interest=...` to `/founding-partner-beta?interest=...`.

3. **`src/components/marketing/FoundingCustomerBanner.tsx`** -- Update link target to `/founding-partner-beta?interest=founding-partner`.

4. **`src/pages/Signup.tsx`** -- Update Navigate and NavLink targets to `/founding-partner-beta`.

5. **`src/pages/Auth.tsx`** -- Update Navigate and NavLink targets to `/founding-partner-beta`.

6. **`src/pages/BetaInvite.tsx`** -- Update Navigate fallback to `/founding-partner-beta`.

No route, layout, or auth guard changes. Just correcting dead link targets.
