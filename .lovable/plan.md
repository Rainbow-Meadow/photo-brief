## Goal
Replace the brandmark (camera/lens icon) across the app with the uploaded SVG, keeping the existing wordmark ("Photo" navy + "Brief" amber + ".ai") untouched. Regenerate every brand asset variant from the new mark.

## Source asset
`user-uploads://Untitled_design.svg` — 1500×1500 SVG that wraps a high-res embedded PNG (with luminance mask). Treated as a raster source.

## Files that ship the brandmark today
Direct asset files under `public/brand/`:
- `mark.svg` — primary mark used by `BrandMark` (SVG path)
- `mark-color.png`, `mark-color.webp`, `mark-color-sm.webp` — raster fallbacks
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `favicon.ico` — PWA / favicon
- `full-logo.svg` — combined lockup (mark + wordmark)

Other locations:
- `public/site.webmanifest` — references icons (no change to JSON)
- Email templates: `mark-color.png` is uploaded to Supabase storage bucket `email-assets` and referenced from `supabase/functions/_shared/transactional-email-templates/brand-styles.ts`
- `remotion/` scenes (`SceneLogo.tsx`, `SceneClosing.tsx`, `SpotlightPrimitives.tsx`) — load the same `/brand/mark.svg`/png

## Plan

### 1. Extract a clean master from the upload
- Copy `user-uploads://Untitled_design.svg` to `/tmp/`.
- Use `node`/`sharp` (or ImageMagick via nix) to:
  - Rasterize the SVG at 2048×2048 with transparent background → `/tmp/mark-master.png`.
  - Auto-trim transparent padding so the mark fills the canvas with a small, consistent safe-area margin (≈6%).

### 2. Regenerate every variant from the master
Write outputs into `public/brand/`:
- `mark-color.png` — 1024×1024 PNG (transparent)
- `mark-color.webp` — 1024×1024 WebP (transparent, q≈90)
- `mark-color-sm.webp` — 256×256 WebP
- `icon-512.png` — 512×512 PNG on cream `#FAF7F2` background (PWA "any")
- `icon-192.png` — 192×192 PNG on cream background
- `apple-touch-icon.png` — 180×180 PNG on cream background
- `favicon.ico` — multi-size (16, 32, 48) ICO from the same master
- `mark.svg` — replace existing path-based SVG with a thin SVG wrapper that embeds the trimmed master as a base64 PNG (`<image>` inside a 1024 viewBox). This keeps `BrandMark`'s `<picture>` `<source srcSet="/brand/mark.svg">` working with crisp rendering at every size.
- `full-logo.svg` — rebuild horizontal lockup: new mark on the left + existing two-tone wordmark ("Photo" navy `#1B2A4A` + "Brief" amber `#F2A33A` + ".ai" navy 55%) on the right, matching the proportions used by `BrandMark variant="horizontal"` (mark size = 1.0, wordmark size = 0.72).

### 3. Wordmark — no changes
`BrandMark.tsx` `Wordmark` and `Tagline` subcomponents stay byte-for-byte identical. Only the `MarkImage` source files on disk change. No code edit needed in `BrandMark.tsx`, `PoweredByBadge.tsx`, `ConnectorLogo.tsx`, or `Landing.tsx`.

### 4. Email mark
- Re-upload the new `public/brand/mark-color.png` to Supabase storage bucket `email-assets` at path `mark-color.png` (overwrites). The public URL in `brand-styles.ts` (`LOGO_URL`) stays the same, so no code change.

### 5. Remotion scenes
- They reference the same `/brand/mark.svg` / `mark-color.png` paths, so no code change. Mention in `docs/layout-system.md` that the brandmark was swapped.

### 6. QA pass
- Open the regenerated PNGs/WebPs/ICO and visually inspect each (transparent vs cream background, no clipping, centered).
- Confirm `BrandMark` renders correctly in `horizontal`, `stacked`, `wordmark`, and `mark` variants by checking the Landing page in the preview.
- Confirm favicon updates (cache-bust may need a hard reload).

## Out of scope
- No changes to color tokens, wordmark typography, taglines, or layout primitives.
- No changes to `site.webmanifest`, routes, auth, DB, or services.
- No changes to the `BrandMark` component API.

## Open question
Should the PWA/favicon backgrounds stay cream `#FAF7F2` (current `theme_color` is amber, `background_color` is cream) or switch to transparent / navy? Default plan = cream, matching `site.webmanifest` `background_color`. Let me know if you want a different treatment.