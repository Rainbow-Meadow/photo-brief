
## Goal

Make `/betalist` the primary founding beta application page. All CTAs that currently point to `/waitlist` will point to `/betalist` instead. The `/waitlist` route will redirect to `/betalist` for backward compatibility.

## Changes

### 1. Update `src/config/access.ts`
- Change `signupCtaTarget()` to return `"/betalist"` instead of `"/waitlist"`
- Change `planCtaTarget()` to return `/betalist?interest=...` instead of `/waitlist?interest=...`

### 2. Update `src/components/marketing/FoundingCustomerBanner.tsx`
- Change NavLink target from `/waitlist?interest=founding-partner` to `/betalist?interest=founding-partner`

### 3. Update `src/pages/BetaInvite.tsx`
- Change fallback redirect from `/waitlist` to `/betalist`

### 4. Update `src/pages/Auth.tsx` and `src/pages/Signup.tsx`
- Any `/waitlist` references redirect to `/betalist` instead

### 5. Update `src/pages/Waitlist.tsx` to redirect
- Replace the full waitlist page with a simple redirect to `/betalist` (preserving query params)

### 6. Update `src/App.tsx`
- Keep `/waitlist` route but point it to a redirect component
- Ensure `/betalist` route stays outside `MarketingLayout` (it already is)

### 7. Update `public/_redirects`
- Change the `/waitlist` line to redirect to `/betalist` for Cloudflare Pages
