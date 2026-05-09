## Goal

Replace the solid background pixels in marketing illustrations with **true alpha transparency** (alpha channel = 0), so the images composite cleanly onto any page background — not painted over a checkerboard, not a baked white/cream rectangle.

## Scope (images to process)

PNG illustrations in `src/assets/` that have a flat solid background:

- `src/assets/hero-new.png` (the new landing hero)
- `src/assets/brand/*.png` — logo variants (re-process to guarantee clean alpha; skip if already fully transparent)
- `src/assets/comparison/*.png`
- `src/assets/empty-states/*.png`
- `src/assets/rmbc/*.png`
- `src/assets/scenes/*.png`
- `src/assets/trades/*.png`

Excluded (real photographs with meaningful backgrounds, no flat color to remove):

- `src/assets/leak-photo.jpg`
- `src/assets/junk-removal/*.jpg|webp`
- `src/assets/submission/*.jpg`

## Method — flood-fill to alpha (lossless on subject edges)

Use a Python/Pillow script. For each PNG:

1. Open as RGBA. Sample the 4 corner pixels to detect the dominant background color (white `#FFFFFF`, cream `#FAF7F2`, or near-white).
2. Run a **scanline flood fill** from each corner with a small color tolerance (Euclidean distance ≤ 24 in RGB). This only erases connected background regions — it will not punch holes through the subject even if the subject contains similar colors.
3. Set matched pixels' alpha to 0 (preserve their RGB so anti-aliased edges don't fringe).
4. Apply a 1px **alpha matte clean-up**: for pixels with partial alpha touching fully transparent ones, recompute RGB by un-premultiplying against the detected bg color to remove the white/cream halo.
5. Save back over the original path (PNG, RGBA). Skip files where >98% of pixels are already transparent (already done).

Verification step (mandatory before finishing):

- Re-open each output, composite it once over `#FF00FF` magenta and once over `#1B2A4A` navy, and write side-by-side QA thumbnails to `/tmp/alpha-qa/`. Inspect to confirm:
  - No white/cream rectangle remains.
  - Subject edges are not eroded and have no colored halo.
  - No interior holes punched into the subject.
- If any image fails QA, raise tolerance or restrict seeds and re-run for just that file.

## Code references — no changes expected

References to these PNGs already use `<img src={…}>` with transparent-aware layouts (BrandMark, marketing sections). No component edits required; the file swap is enough.

## Out of scope

- JPG photos (no alpha channel; backgrounds are real scenes).
- Any AI-based segmentation — the user explicitly chose flood-fill.
- SVG assets (already vector-transparent).
