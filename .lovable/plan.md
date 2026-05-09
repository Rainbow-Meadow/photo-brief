## Two-variant new mark, sitewide

The uploaded mark (cream line-art + amber wedge on transparent) is already deployed as the dark-bg variant. We'll generate a navy-recolored version of that exact same artwork for light backgrounds, swap it in everywhere small renders happen, and delete every legacy logo file.

### What gets built

**1. New light-bg variant** (auto-recolor cream → navy `#1B2A4A`, keep amber wedge)
- `public/brand/mark.svg`
- `public/brand/mark-color.png` (1024×1024)
- `public/brand/mark-color.webp`, `mark-color-sm.webp` (256px)

**2. Favicons + app icons** regenerated from the new navy mark on cream `#FAF7F2`
- `public/favicon.ico`, `public/favicon.png`, `public/favicon-16x16.png`
- `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- `public/brand/favicon.ico`, `public/brand/icon-192.png`, `public/brand/icon-512.png`, `public/brand/apple-touch-icon.png`

**3. Dark-bg variant** — already correct, no changes
- `public/brand/mark-on-dark.svg`, `public/brand/mark-on-dark.png`

**4. Delete legacy / superseded files** (zero code references confirmed)
- `public/photobrief-logo.png`
- `public/photobrief-mark.png`
- `public/brand/full-logo.svg` (old wordmark lockup — `BrandMark` builds the wordmark from text, never references this file)
- `public/og-image.png`, `public/og-betalist.png` (old OG share images — confirmed no code reference)

### Technical approach

```text
1. Load /public/brand/mark-on-dark.png (the new artwork)
2. Pillow recolor: where alpha>0 AND (R,G,B) is near cream/white,
   replace with navy #1B2A4A; preserve amber pixels
3. Save mark-color.png/webp/sm.webp + mark.svg wrapper
4. Trim → render padded squares for all favicon/app-icon sizes on cream
5. Bundle multi-size favicon.ico (16/32/48)
6. Delete the four legacy files via rm
7. QA: open the regenerated raster previews, then load /, footer (dark),
   nav (light), and a public request page to confirm both variants render
```

### Out of scope

- No code edits in `BrandMark.tsx` or callsites — paths stay the same.
- No changes to `index.html` / `site.webmanifest` (they already point at the regenerated paths).
- No changes to email assets, Remotion theme, or the wordmark text rendering — only the small mark/icon raster set.

### Validation

After regeneration, visually QA `mark-color.png`, `icon-512.png`, and `favicon.png` in the file viewer, then check the running preview at `/` (light nav, dark footer) and `/r/...` (PublicRequestLayout) to confirm both variants render correctly.
