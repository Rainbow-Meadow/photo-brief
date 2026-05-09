## Deploy uploaded SVG as the small-render brand mark

The uploaded `Untitled_design_4.svg` is a 1500×1500 wrapper that embeds a high-res PNG via base64. We'll extract that embedded raster (clean source pixels, no SVG bloat) and use it everywhere the small mark renders — the in-app `BrandMark`, the PNG fallback, and all favicon/app-icon sizes.

### What gets replaced

**1. Light-tone mark (used by `BrandMark` everywhere small)**
- `public/brand/mark.svg` → new SVG that references the extracted PNG (or inlines it once at high res)
- `public/brand/mark-color.png` → regenerated 1024×1024 from the new source
- `public/brand/mark-color.webp` and `mark-color-sm.webp` → re-encoded from the new source

No code changes needed in `BrandMark.tsx` — it already loads `/brand/mark.svg` + `/brand/mark-color.png` for `tone="light" | "auto" | "color"`.

**2. Favicons + app icons** (regenerated from the new mark, square padded on cream `#FAF7F2` where appropriate)
- `public/favicon.ico` (multi-size 16/32/48)
- `public/favicon.png` (32×32)
- `public/favicon-16x16.png`
- `public/icon-192.png`, `public/icon-512.png`
- `public/apple-touch-icon.png` (180×180)
- `public/brand/icon-192.png`, `public/brand/icon-512.png`, `public/brand/apple-touch-icon.png`, `public/brand/favicon.ico`

`index.html` and `public/site.webmanifest` already point at all these paths — no edits needed.

**3. Out of scope** (explicitly NOT touched)
- `public/brand/mark-on-dark.svg` / `mark-on-dark.png` — the existing dark-bg variant stays as-is
- `public/brand/full-logo.svg` — separate full lockup, not the small mark
- `public/photobrief-logo.png`, `public/photobrief-mark.png` — legacy, will leave alone unless you say otherwise
- Email assets, Remotion theme, OG images — separate surfaces

### Technical approach

```text
1. Copy user-uploads://Untitled_design_4.svg → /tmp/source.svg
2. Python: parse SVG, extract base64 PNG payload from <image xlink:href="data:image/png;base64,...">
3. Save as /tmp/mark-source.png (full resolution, transparent if alpha present)
4. Use Pillow to:
   - Trim transparent border, recenter on 1024×1024 transparent canvas → mark-color.png
   - Re-encode as WebP → mark-color.webp + 256px mark-color-sm.webp
   - Render padded square versions for favicons (16/32/48/180/192/512) on cream background
5. Wrap the 1024 PNG in a minimal SVG shell → mark.svg (keeps existing <picture> SVG-first behavior crisp on hi-DPI)
6. Build favicon.ico bundling 16/32/48
7. QA: open the regenerated files visually and verify no clipping, correct transparency, amber + line art crisp at 16px
```

### Files touched

Replaced (overwritten):
- `public/brand/mark.svg`
- `public/brand/mark-color.png`
- `public/brand/mark-color.webp`
- `public/brand/mark-color-sm.webp`
- `public/favicon.ico`, `public/favicon.png`, `public/favicon-16x16.png`
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- `public/brand/favicon.ico`, `public/brand/icon-192.png`, `public/brand/icon-512.png`, `public/brand/apple-touch-icon.png`

No source-code edits. No `index.html` / manifest / `BrandMark.tsx` changes.

### Validation
Visually inspect each regenerated raster at native size, then load `/`, `/pricing`, and a public request page in the preview to confirm the new mark renders in nav, footer, `PoweredByBadge`, and the browser tab favicon.
