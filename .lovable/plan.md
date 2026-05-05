
# Deploy New Logo/Icon Across the Site

The uploaded image (purple camera-envelope 3D icon) will replace every existing logo, favicon, icon, and OG image asset throughout the project.

## What will be done

### 1. Generate all required asset sizes from the uploaded image

Using ImageMagick, create the following from the uploaded PNG:

| File | Size | Purpose |
|------|------|---------|
| `public/brand/mark-color.png` | 1024x1024 | Primary mark (used by BrandMark component) |
| `public/brand/mark-color.webp` | 1024x1024 | WebP variant |
| `public/favicon.svg` | removed | No SVG source for raster logo |
| `public/favicon.png` | 32x32 | Favicon PNG |
| `public/favicon.ico` | 48x48 | ICO favicon |
| `public/favicon-16x16.png` | 16x16 | Small favicon |
| `public/favicon-32x32.png` | 32x32 | Medium favicon |
| `public/brand/favicon-16.png` | 16x16 | Brand dir copy |
| `public/brand/favicon-32.png` | 32x32 | Brand dir copy |
| `public/brand/favicon-color.png` | 180x180 | Brand favicon |
| `public/brand/favicon.ico` | 48x48 | Brand dir ICO |
| `public/icon-192.png` | 192x192 | PWA icon |
| `public/icon-512.png` | 512x512 | PWA icon |
| `public/brand/icon-192.png` | 192x192 | PWA maskable |
| `public/brand/icon-512.png` | 512x512 | PWA maskable |
| `public/brand/apple-touch-icon.png` | 180x180 | Apple touch icon |
| `public/apple-touch-icon.png` | 180x180 | Root apple touch |
| `public/og-image.png` | 1200x630 | OG image (icon centered on dark bg) |
| `public/og-image.jpg` | 1200x630 | OG image JPG variant |
| `public/brand/mark-micro.svg` | keep or replace | Micro mark |

### 2. Update index.html

- Remove the SVG favicon link (no SVG version of this raster icon)
- Update OG image meta tags to point to `/og-image.png` instead of the old SVG
- Update structured data logo URL to `/og-image.png`

### 3. Update BrandMark component

- `MARK_SRC` already points to `/brand/mark-color.png` -- just replacing the file is sufficient
- No code change needed unless we want to also update horizontal/stacked variants

### 4. Clean up old SVG logo files

Remove obsolete SVG logo files that are no longer the brand mark:
- `public/favicon.svg` (raster logo, no SVG equivalent)
- Optionally keep the old SVGs in `/public/` for backwards compat but they won't be referenced

### 5. Update site.webmanifest

Already references `/icon-192.png` and `/icon-512.png` -- replacing files is sufficient.

## Files affected

- ~15 image files regenerated in `public/` and `public/brand/`
- `index.html` -- minor meta tag updates
- No component code changes needed (BrandMark already references the correct paths)
