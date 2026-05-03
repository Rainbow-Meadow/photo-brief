# PhotoBrief global image asset audit

Date: 2026-05-03
Branch: `feature/global-image-asset-pass-2026`

## Summary

PhotoBrief had a solid visual foundation, but the image system lagged behind the new product model. The repo still had low-resolution raster logo lockups, missing help screenshots, an older Open Graph image, and no dedicated visual asset for Website Intake even though Website Intake is now the core story.

This pass moves the product toward a cleaner, scalable asset system:

- vector-first brand assets
- shippable help screenshots instead of missing placeholders
- visual Website Intake flow artwork
- updated Open Graph artwork
- public/marketing and in-app walkthrough surfaces aligned to the new product model

## Existing asset inventory

### Brand assets

| File | Size | Status | Action |
|---|---:|---|---|
| `src/assets/brand/photobrief-horizontal.png` | 378×126 | Low-resolution raster lockup | Superseded by SVG |
| `src/assets/brand/photobrief-horizontal.webp` | 378×126 | Small raster derivative | Superseded by SVG |
| `src/assets/brand/photobrief-wordmark.png` | 628×209 | Raster wordmark | Superseded by SVG |
| `src/assets/brand/photobrief-wordmark.webp` | 628×209 | Raster wordmark derivative | Superseded by SVG |
| `src/assets/brand/photobrief-stacked.png` | 447×558 | Raster stacked lockup | Superseded by SVG |
| `src/assets/brand/photobrief-primary.png` | 500×500 | Raster mark | Superseded by SVG |
| `src/assets/brand/photobrief-mark-dark.png` | 500×500 | Raster mark | Superseded by SVG |
| `src/assets/brand/photobrief-mark-light.png` | 500×500 | Raster mark | Superseded by SVG |
| `src/assets/brand/photobrief-mark-cartoon.png` | 500×500 | Unused/legacy-looking mark | Leave for now; do not use in product surfaces |

### Public icons / social images

| File | Size | Status | Action |
|---|---:|---|---|
| `public/favicon.png` | 500×500 | Fine but raster-heavy | Keep for favicon fallback |
| `public/favicon.ico` | n/a | Existing browser fallback | Keep |
| `public/apple-touch-icon.png` | 180×180 | Fine | Keep |
| `public/icon-192.png` | 192×192 | Fine | Keep |
| `public/icon-512.png` | 512×512 | Fine | Keep |
| `public/photobrief-logo.png` | 500×500 | Raster logo | Added SVG counterpart |
| `public/og-image.jpg` | 1200×630 | Older positioning | Superseded in app metadata by SVG OG asset |
| `public/og-image.png` | 1024×1024 | Wrong social aspect for default OG | Leave but do not use as default |

### Marketing imagery

| File | Size | Status | Action |
|---|---:|---|---|
| `src/assets/junk-removal/*.jpg` | 1024×1024 | Useful example photos | Keep; still valuable in hero/product mockups |
| `public/marketing/photobrief-demo.mp4` | video | Existing demo | Keep |
| `public/marketing/website-intake-flow.svg` | vector | New | Added and inserted into landing + Website Intake setup |

### Help/tutorial assets

Before this pass, the help content referenced `/help/*.png` screenshots that did not exist in `public/help`. The fallback placeholder prevented crashes, but it made the walkthrough feel unfinished.

Added vector walkthrough assets:

| File | Purpose |
|---|---|
| `public/help/requests-new-template.svg` | Create request / AI setup walkthrough |
| `public/help/recipient-capture.svg` | Mobile capture step |
| `public/help/recipient-feedback.svg` | Simple AI feedback step |
| `public/help/recipient-review.svg` | Review and send step |
| `public/help/website-intake-setup.svg` | Website Intake setup walkthrough |

### Empty states

| File | Size | Status | Action |
|---|---:|---|---|
| `src/assets/empty-states/no-guides.png` | 512×512 | Acceptable but generic | Keep for now |
| `src/assets/empty-states/no-keys.png` | 512×512 | Acceptable but generic | Keep for now |
| `src/assets/empty-states/no-requests.png` | 512×512 | Acceptable but generic | Keep for now |
| `src/assets/empty-states/no-team.png` | 512×512 | Acceptable but generic | Keep for now |

Recommendation for later: replace these with one consistent vector illustration family once the dashboard surfaces stabilize.

### Submission demo photos

| File | Size | Status | Action |
|---|---:|---|---|
| `src/assets/submission/*.jpg` | 384×384 | Small demo photos | Keep for now; generate larger set later if these are used in marketing-scale cards |
| `src/assets/leak-photo.jpg` | 896×672 | Demo photo | Keep |

### Remotion/video assets

| File | Size | Status | Action |
|---|---:|---|---|
| `remotion/public/brand/photobrief-horizontal.png` | 378×126 | Low-resolution raster | Added SVG counterpart and updated scenes to use SVG |
| `remotion/public/photos/*.jpg` | 1024×1024 | Good for video/demo | Keep |

## New assets generated

### Brand SVGs

- `src/assets/brand/photobrief-mark.svg`
- `src/assets/brand/photobrief-mark-light.svg`
- `src/assets/brand/photobrief-primary.svg`
- `src/assets/brand/photobrief-wordmark.svg`
- `src/assets/brand/photobrief-wordmark-light.svg`
- `src/assets/brand/photobrief-horizontal.svg`
- `src/assets/brand/photobrief-horizontal-light.svg`
- `src/assets/brand/photobrief-stacked.svg`
- `src/assets/brand/photobrief-stacked-light.svg`
- `remotion/public/brand/photobrief-horizontal.svg`
- `public/photobrief-logo.svg`

### Help/tutorial SVGs

- `public/help/requests-new-template.svg`
- `public/help/recipient-capture.svg`
- `public/help/recipient-feedback.svg`
- `public/help/recipient-review.svg`
- `public/help/website-intake-setup.svg`

### Marketing / SEO SVGs

- `public/marketing/website-intake-flow.svg`
- `public/og-image.svg`

## Insertions / wiring changes

### BrandMark

`src/components/layout/BrandMark.tsx` now imports SVG logo assets instead of low-resolution raster lockups. It also supports light lockups for dark-mode/hero contexts instead of reusing the dark lockup everywhere.

### Help guide

Help content now points to real SVG walkthrough images instead of missing `/help/*.png` files.

### Landing page

The Website Intake section now includes `public/marketing/website-intake-flow.svg`, visually explaining:

website lead → template routing → mobile capture → job-ready brief

### Website Intake setup

The authenticated Website Intake page now includes the same flow visual in its hero area so setup feels more concrete and less abstract.

### SEO/social

`SEOHead` now defaults to `/og-image.svg`, which matches the current relaunch positioning.

### Remotion

Remotion logo references now use the SVG horizontal lockup instead of the 378×126 raster image.

## Still worth doing later

1. Replace legacy raster empty states with a full PhotoBrief vector illustration set.
2. Generate larger, more diverse industry demo photo sets beyond junk removal.
3. Create screenshot exports from the real app after Lovable/Supabase previews are stable.
4. Add a formal brand kit page with downloadable SVG/PNG lockups.
5. Consider regenerating raster `og-image.jpg` from the SVG for maximum social crawler compatibility.

## Notes

This pass intentionally prefers SVG assets because they scale cleanly, keep the repo lighter, and fit the polished 2026 visual direction better than low-resolution PNG screenshots.
