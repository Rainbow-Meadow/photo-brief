# Landing page mobile performance pass

Lighthouse mobile shows Performance 62, **LCP 7.5s**, FCP 3.2s, SI 8.0s, total payload **11 MB**, 199 KB unused JS. Root causes are all in the landing image stack and the GTM loader, not in core app code.

## What's actually slow

| Issue | Evidence | Real cause |
|---|---|---|
| LCP 7.5s | `hero-before-messy-intake.jpg` is the LCP, served at full source resolution to a ~390 px viewport | No responsive `srcset`, no preload, no AVIF/WebP negotiation |
| 11 MB payload | 4× comparison PNGs at 1.3–1.8 MB each (`before-cedar-intake.png`, `after-cedar-brief.png`, etc.) | Source PNGs shipped as-is to all viewports |
| 199 KB unused JS | `googletagmanager.com/gtag/js` (109 KB) + Cloudflare speculation prefetch of `/metrics/` (90 KB) | GTM still loads inside the LCP window on slow networks |
| 22 KB unused CSS | Tailwind+design-system bundle | Acceptable; not worth aggressive purging right now |
| Images missing `width/height` warning | Comparison `<img>` tags have no `width`/`height` even though CLS measured 0 | Add explicit dimensions for the audit signal |

The Cloudflare Image Resizing helper (`src/lib/cfImage.ts`) already exists and is wired to `photobrief.ai/cdn-cgi/image/...` — we just aren't using it on the landing page.

## Plan

### 1. Route landing images through `cfImage` + responsive `srcset`

In `src/pages/Landing.tsx` `ComparisonSection` (and any sibling sections that render large `<img>`):

- Replace each `<img src={importedPng} ... />` with `src={cfImage(importedPng, { width: 720, format: "auto" })}` and `srcSet={cfImageSrcSet(importedPng, [480, 720, 1080])}` plus `sizes="(min-width: 1024px) 50vw, 100vw"`.
- Add intrinsic `width` / `height` to every comparison `<img>` (use the source aspect ratio; 1280×960-ish is fine — values just need to express the ratio).
- Keep `loading="lazy"` and add `decoding="async"` on every below-the-fold image.

Effect: each comparison panel drops from ~1.5 MB PNG to ~80–150 KB AVIF/WebP per viewport.

### 2. Optimize the hero before/after slider (LCP)

In `src/components/marketing/BeforeAfterSlider.tsx`:

- Pipe `before` and `after` props through `cfImage(..., { width: 640, format: "auto" })` plus a 2-step `srcSet` (`[480, 720, 960]`).
- Keep `loading="eager"` + `fetchpriority="high"` only on the *visible* layer (currently the `after` image is the base — that's the LCP candidate).
- Lower the `before` overlay to `fetchpriority="low"` so it doesn't fight the LCP.

In `index.html`:

- Add a single `<link rel="preload" as="image" imagesrcset="..." imagesizes="100vw" fetchpriority="high">` pointing at the `cfImage`-wrapped hero-after URL at width 720. (We hard-code the published URL, same pattern as the existing `og:image`.)

### 3. Push GTM out of the LCP window

In `src/lib/analytics.ts`:

- Today GTM loads on first interaction OR a fixed timeout. Tighten the timeout fallback to `requestIdleCallback(..., { timeout: 8000 })` and skip loading entirely when `navigator.connection?.saveData === true` or `effectiveType` is `2g`/`slow-2g`.
- No behavior change for desktop or fast mobile users.

### 4. Address the "image dimensions" audit row

For every remaining `<img>` on the landing page (comparison illustrations, BrandMark already uses SVG so it's fine), add `width` and `height`. Already done on the slider; only the comparison `<img>` tags are missing them.

### 5. Verify

- `bun run build` and check the `dist/assets/index-*.css` size hasn't regressed.
- Re-run the mobile speed test on the published URL after the change is live.
- Target: LCP ≤ 3.0s, Performance ≥ 85, payload < 2 MB on first mobile load.

## Files touched

```text
src/pages/Landing.tsx                              # comparison <img> → cfImage + srcset + width/height
src/components/marketing/BeforeAfterSlider.tsx     # cfImage wrap, fetchpriority on overlay
src/lib/analytics.ts                               # idle-callback + saveData gate for GTM
index.html                                         # preload hero-after via cfImage URL
```

## Out of scope

- Changing source artwork or replacing PNG masters with WebP on disk (Cloudflare format negotiation makes this unnecessary).
- Tailwind purge changes for the 22 KB unused-CSS row — too small to justify the regression risk right now.
- Touching the `/metrics` Cloudflare speculation prefetch — that's a CF zone setting, not app code.
