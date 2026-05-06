
## Goal

Make `/betalist` the single canonical entry point for the beta program. Remove `/beta-portfolio` (and its `/founding-partner-beta` alias). Re-route every "join the beta" / "founding partner" CTA to `/betalist`. Keep `/signup`, `/welcome`, and `/beta-invite/:token` since they serve post-acceptance steps in the funnel.

## Changes

### 1. Remove BetaPortfolio page and routes

- Delete `src/pages/BetaPortfolio.tsx`
- Remove both routes from `src/App.tsx`: `/beta-portfolio` and `/founding-partner-beta`
- Remove the eager import of `BetaPortfolioPage`

### 2. Update navigation and CTAs

- **MarketingLayout.tsx** — Remove the "Founding Beta" nav link (`/founding-partner-beta`) from both desktop nav items array and mobile footer link.
- **Landing.tsx** — Change "Read beta details" link from `/founding-partner-beta` to `/betalist`.
- **Pricing.tsx** — Change "View beta program" link from `/founding-partner-beta` to `/betalist`.
- **BetaList.tsx** — Change "Learn more about the beta" link from `/founding-partner-beta` to remove it or make it an anchor to the info section on the same page (it's already on `/betalist`).
- **FoundingCustomerBanner.tsx** — Already points to `/betalist?interest=founding-partner`. No change needed.
- **FinalCtaCard.tsx** — Already uses `signupCtaTarget()` which returns `/betalist`. No change needed.
- **TestimonialsRow.tsx** — Already uses `signupCtaTarget()`. No change needed.

### 3. Update Cloudflare Pages redirects

- In `public/_redirects`, remove or redirect `/beta-portfolio` and `/founding-partner-beta` to `/betalist` (301).

### 4. Update SEO / discovery files

- Remove `/beta-portfolio` from `public/sitemap.xml` if present.
- Update `public/llms.txt` / `public/llms-full.txt` if they reference beta-portfolio.

### 5. Cleanup

- Confirm no other files import or reference `BetaPortfolio` or the removed routes.
- No edge functions reference these routes, so no backend changes needed.
