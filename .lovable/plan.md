## Problem
The hero on `/` clips the wordmark to "PhotoBrie" because:
- `src/pages/Landing.tsx` (line 354–361) renders the brand lockup as `<img src="/brand/full-logo.svg" ...>`.
- The generated `public/brand/full-logo.svg` uses `<text>` for "PhotoBrief.ai" inside a viewBox whose width was estimated (`markSize + gap + 360 + padding*2 ≈ 526`). The actual rendered text width at font-size 86 with `letter-spacing: -0.05em` overflows that 360px allotment, so anything past the viewBox right edge is clipped when scaled by `<img>` with `w-auto`.
- This also violates the brand-system rule (`mem://design/brand-system`): "BrandMark renders Photo (navy) + Brief (amber) two-tone — never inline `<img>` for the logo."

## Fix

### 1. Replace the hero `<img>` with the `BrandMark` component (primary fix)
In `src/pages/Landing.tsx` hero block, swap:

```tsx
<img src="/brand/full-logo.svg" ... className="h-20 sm:h-28 lg:h-36 w-auto" />
```

for responsive `BrandMark` instances:

```tsx
<BrandMark variant="horizontal" size={80}  eager className="sm:hidden" />
<BrandMark variant="horizontal" size={112} eager className="hidden sm:inline-flex lg:hidden" />
<BrandMark variant="horizontal" size={144} eager className="hidden lg:inline-flex" />
```

`BrandMark` already composes the new mark (`/brand/mark.svg`) with the two-tone wordmark using real CSS — no SVG text clipping possible, and respects the brand-system memory.

### 2. Rebuild `public/brand/full-logo.svg` so any future consumer renders correctly
Regenerate with a viewBox sized to actually contain the wordmark:
- Approximate `text-width ≈ chars × font-size × avg-glyph-ratio`. For Inter/SF heavy bold, "PhotoBrief" (10 chars) at fs 86 with `-0.05em` ≈ ~10 × 86 × 0.55 = ~473px, plus ".ai" at fs 53 ≈ ~85px → ~560px text.
- Set viewBox width = `padding + markSize + gap + textWidth + safetyPad + padding` (≈ 16 + 120 + 14 + 560 + 40 + 16 = ~766) so even with font fallback variance there is no clipping.
- Keep height = markSize + 2·padding so the lockup vertical proportions stay identical.
- Optionally render the wordmark via `<text>` AND set `overflow="visible"` on the SVG root as a belt-and-suspenders guard.

### 3. QA
- Reload the preview at `/`, screenshot the hero at the current viewport (1223×887) plus `sm` (640px) and `lg` (1280px) widths, crop the lockup region with `image_tools--zoom_image`, and confirm the full "PhotoBrief.ai" wordmark renders without clipping.
- Open `/brand/full-logo.svg` directly to confirm it no longer clips for downstream consumers.

## Out of scope
- No changes to wordmark colors, tagline, BrandMark API, color tokens, or layout primitives.
- No changes to other BrandMark usages (header, footer, sidebar, dashboard) — they already use the component correctly.