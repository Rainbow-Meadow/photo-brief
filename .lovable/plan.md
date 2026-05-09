## Goal
Make every illustration on the landing page float naturally on the dark page: strip the cream background to transparent and recolor the navy linework so it reads against the dark surface. Amber accents stay.

## Images in scope (7 used on `/`)
1. `src/assets/landing-hero-illustration.png` (hero, fig. 01)
2. `src/assets/comparison/before-intake-form.png`
3. `src/assets/comparison/after-capture-pipeline.png`
4. `src/assets/rmbc/research-magnifier.png` (Mechanism step 01 + Website Intelligence)
5. `src/assets/rmbc/mechanism-gears.png` (Mechanism step 02)
6. `src/assets/rmbc/brief-packet.png` (Mechanism step 03)
7. `src/assets/rmbc/method-overview.png` (Mechanism step 04 / "Close")

Trade illustrations (`plumber`, `hvac-tech`, `landscaper`, `junk-hauler`, `estimator`) are imported but **not rendered** in the current `UseCasesSection`, so they are excluded.

## Changes

### 1. Regenerate 7 illustrations as dark-tuned, alpha-transparent PNGs
Use `imagegen--edit_image` on each source file with a consistent prompt:

> "Remove the cream/off-white background entirely so it's fully transparent. Recolor every navy/dark-blue line and fill to warm cream (#FAF7F2) so it reads on a dark navy/charcoal background. Keep all amber/orange accents exactly as they are. Preserve the original linework, proportions, and composition. Output as a clean transparent PNG."

Save each to a new path so we don't lose the cream-bg originals:
- `src/assets/landing-dark/hero.png`
- `src/assets/landing-dark/before-intake-form.png`
- `src/assets/landing-dark/after-capture-pipeline.png`
- `src/assets/landing-dark/research-magnifier.png`
- `src/assets/landing-dark/mechanism-gears.png`
- `src/assets/landing-dark/brief-packet.png`
- `src/assets/landing-dark/method-overview.png`

Aspect ratios: hero `3:2`, comparison pair `16:9`, the rest `1:1`.

### 2. Update `src/pages/Landing.tsx`
- Repoint the 7 imports (lines 63, 69–74) to the new `@/assets/landing-dark/*` paths.
- Drop the cream plate behind each image so the transparent art sits on the card itself:
  - Hero (line 190): replace `border border-border bg-[#FAF7F2]` with just the aspect wrapper (no border, no bg). Keep the `Fig. 01 / Reverse-Form Method™` overlay.
  - Mechanism workflow card (line 312): remove `border border-border bg-muted` and the `p-6` padding on the img, drop `opacity-90`.
  - Before/After comparison (lines 360, 384): remove `border border-border bg-muted` and the `p-4` on the img.
  - Website Intelligence (line 452): remove `border border-border bg-muted` and the `p-12` on the img.

No copy, layout, grid, or component changes beyond the wrappers listed above.

### 3. QA
After regen, visually confirm each new PNG: transparent background, cream linework, amber accents intact, no halo/fringe around the alpha edge. If any image still shows residual cream halo, re-run `edit_image` on that file with a stricter "remove all off-white pixels, no fringe" instruction.

## Out of scope
- Trade illustration files (not currently rendered).
- BrandMark, icons, logos, and any non-illustration imagery.
- Card backgrounds, section backgrounds, copy, and layout.
- Keeping the original cream-bg files in place untouched (we're adding alongside, not overwriting).