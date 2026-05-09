# Fix the baked-in checkerboard on the new illustrations

The new illustrations look great, but the image generator saved them as flat RGB PNGs with the transparency-checkerboard pattern **baked in as actual gray squares** (verified: `landing-hero-illustration.png` is mode `RGB`, no alpha channel). That's why the hero shows a visible gray grid behind the line art.

## Fix

Post-process all 11 illustrations to strip the fake checkerboard and produce true transparent PNGs — no regeneration needed, so the artwork stays exactly as approved.

### Approach

For each PNG in the list below:
1. Open as RGBA.
2. Build an alpha mask by detecting the line-art pixels:
   - Keep any pixel close to navy `#1B2A4A` (within a tolerance).
   - Keep any pixel close to amber `#F2A33A`.
   - Keep darker mid-tones along anti-aliased edges (luminance threshold + saturation check) so strokes stay smooth.
3. Set every other pixel's alpha to 0 (true transparent).
4. Apply a 1px feather on the alpha edge so strokes don't look pixelated against the cream page bg.
5. Overwrite the file in place.

This produces a clean transparent PNG that drops onto the cream `#FAF7F2` page background invisibly, no checkerboard, no white box.

### Files to process

```
src/assets/landing-hero-illustration.png
src/assets/scenes/transformation-illustration.png
src/assets/scenes/founding-badge-illustration.png
src/assets/scenes/reward-ribbons-illustration.png
src/assets/scenes/beta-notebook-illustration.png
src/assets/scenes/mailbox-flag-illustration.png
src/assets/trades/landscaper-illustration.png
src/assets/trades/junk-hauler-illustration.png
src/assets/trades/hvac-tech-illustration.png
src/assets/trades/plumber-illustration.png
src/assets/trades/estimator-illustration.png
```

### Implementation

A single Python script using Pillow + NumPy, run once via `code--exec`. Loops through the file list, applies the mask logic, saves back as RGBA PNG.

### QA

1. Inspect 2–3 processed PNGs (hero + one badge + one trade) to confirm: alpha is present, line art is intact, no halo around strokes.
2. Reload `/` in the preview at 1380px and screenshot the hero, transformation, beta-program, use-cases, and final-CTA sections.
3. Verify each illustration sits cleanly on the cream background with no visible square grid.
4. If any image still shows artifacts (e.g. amber accent eaten away because the tolerance was too tight), tune the tolerance and re-run for that file only.

## Out of scope

- No re-generation of the artwork itself.
- No code changes in `Landing.tsx` (paths and dimensions stay the same).
- No changes to brandmark or other brand assets.
