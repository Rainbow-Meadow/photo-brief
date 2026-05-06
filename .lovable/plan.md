
# Legacy Code Cleanup — Full Scrub

## Pass 1: Legacy redirects and stale routes

### Delete files
- **`src/pages/Waitlist.tsx`** — redirect-only page (`Navigate to /`). Route exists solely for legacy `/waitlist` URLs.

### Edit files
- **`src/App.tsx`** — remove `/waitlist` route and `WaitlistPage` import.
- **`public/_redirects`** — remove these 3 legacy redirect lines:
  - `/betalist / 301`
  - `/beta-portfolio / 301`
  - `/founding-partner-beta / 301`
  (The `/waitlist / 301` line stays since it's the Cloudflare Pages fallback for external links that may still hit Pages directly.)
- **`workers/router/src/index.ts`** — remove `"/waitlist"` from `MARKETING_PATHS` set (it no longer needs prerendering; the SPA handles it, and Cloudflare Pages `_redirects` covers the static-origin case).
- **`src/pages/Landing.tsx`** — rename `betalist_*` analytics event names to `application_*` (e.g. `betalist_page_view` → `landing_page_view`, `betalist_application_submitted` → `application_submitted`). These are the last "betalist" strings in the codebase.
- **`index.html`** — remove the two `<link rel="stylesheet">` tags for `/hero-refinements.css` and `/marketing-theme.css` — **these files do not exist** and generate 404s on every page load.

---

## Pass 2: Unused files, components, hooks, and utilities

### Delete files (confirmed zero imports outside themselves)
- **`src/hooks/useFoundingPro.ts`** — not imported anywhere.
- **`src/features/capture/components/PhotoPromptCard.tsx`** — not imported anywhere.
- **`src/features/guides/components/GuidePreviewDialog.tsx`** — not imported anywhere.
- **`src/features/requests/components/RequestBuilderModeTabs.tsx`** — not imported anywhere.
- **`src/features/requests/components/RequestDraftPreview.tsx`** — not imported anywhere.
- **`src/test/example.test.ts`** — placeholder test (`expect(true).toBe(true)`), no value.

### Edit files
- **`src/services/guidesService.ts`** — remove the deprecated `list()` and `getById()` stubs (confirmed no callers).
- **`src/components/layout/BrandMark.tsx`** — remove `@deprecated` props `markOnly` and `invert` from the interface (confirmed zero usage outside the file).

---

## Pass 3: Unreferenced assets, styles, and config

### Delete assets (confirmed zero references in src/index.html/manifest)
- **`public/photobrief-brand-mark.svg`**
- **`public/photobrief-logo-horizontal.svg`**
- **`public/photobrief-logo.svg`**
- **`public/photobrief-mark-dark.svg`**
- **`public/photobrief-mark-light.svg`**
- **`public/photobrief-mark.svg`**
- **`public/og-image.jpg`** — only `.png` is referenced in `index.html` and SEO meta tags.
- **`public/favicon-32x32.png`** — byte-identical duplicate of `public/favicon.png` (same MD5). `index.html` references `/favicon.png` for 32x32.
- **`public/help/website-intake-setup.svg`** — not referenced in any source file.
- **`public/marketing/website-intake-flow.svg`** — not referenced in any source file.

### Delete assets in `public/brand/` (not referenced by src, index.html, or manifest)
- `public/brand/favicon-16.png`
- `public/brand/favicon-32.png`
- `public/brand/favicon-color.png`
- `public/brand/horizontal-color.png`
- `public/brand/horizontal-dark.png`
- `public/brand/horizontal-light.png`
- `public/brand/mark-color.webp` (only `.png` is used by BrandMark)
- `public/brand/mark-dark.png`
- `public/brand/mark-micro.svg`
- `public/brand/stacked-color.png`

**Keep**: `public/brand/mark-color.png` (used by BrandMark), `public/brand/apple-touch-icon.png`, `public/brand/favicon.ico`, `public/brand/icon-192.png`, `public/brand/icon-512.png`.

### Delete stale docs
- **`docs/betalist-submission.md`** — BetaList submission checklist for a listing that shipped; `/betalist` route is gone.

---

## Pass 4: Duplicate or superseded logic

No duplicate implementations found. The `guidesService` deprecated stubs (Pass 2) are the only superseded code.

---

## Pass 5: Final sweep and build verification

- Run typecheck, lint, and build after all deletions.
- Fix any breakage from removed imports/exports.
- Verify all routes still resolve correctly.

---

## Needs Review (not safe to auto-delete)

| Item | Reason |
|------|--------|
| 25+ unused shadcn/ui components (carousel, calendar, chart, command, drawer, form, etc.) | Standard shadcn scaffold. Removing them saves bundle size but they may be needed soon. Recommend keeping for now — tree-shaking excludes them from production bundles. |
| `public/_redirects` `/waitlist / 301` line | External BetaList/directory links may still point to `/waitlist`. Keep the Cloudflare Pages redirect as a safety net. |
| `src/services/notificationService.ts` TODO comments for Phase 10 | These are forward-looking placeholders for SMS/push, not dead code. |

---

## Summary of behavior-affecting changes

- **Analytics event names**: `betalist_*` events renamed to `application_*` / `landing_*`. If any analytics dashboards filter on the old names, those filters need updating.
- **Two phantom CSS 404s eliminated**: `hero-refinements.css` and `marketing-theme.css` links removed from `index.html` (these files never existed, so no visual change).
- Everything else is pure dead-code removal with no user-visible effect.
