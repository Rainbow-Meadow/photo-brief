## Problem
The image-edit model rendered the transparency checkerboard as actual pixels (alternating white + light-gray squares baked into the RGB) instead of producing real alpha. The resulting PNGs are technically RGBA but every "transparent" pixel is opaque white/gray.

## Fix
Post-process each generated file in `src/assets/landing-dark/` with a Python/PIL script that strips the checker by alpha-keying neutral grays:

For each pixel:
- If `R == G == B` (within ±4 tolerance) **and** the value is in the checker range (≥190), set `alpha = 0`.
- Otherwise leave RGB untouched and force `alpha = 255`.

This preserves the cream linework (RGB ≈ 250,247,242 — not neutral gray, G≠B), the navy fills, and the amber accents, while wiping the white/grey checker squares to true transparency. A small alpha feather pass on the resulting edges (1-px box blur on the alpha channel only) prevents jagged edges.

### Files processed (in place)
- `src/assets/landing-dark/hero.png`
- `src/assets/landing-dark/before-intake-form.png`
- `src/assets/landing-dark/after-capture-pipeline.png`
- `src/assets/landing-dark/research-magnifier.png`
- `src/assets/landing-dark/mechanism-gears.png`
- `src/assets/landing-dark/brief-packet.png`
- `src/assets/landing-dark/method-overview.png`

### QA
After running, inspect each PNG over a dark background (open via `code--view`). Verify:
- No checker remnants
- No halo around cream/navy linework
- Amber accents intact
- Edges look clean (no jaggies)

If any image still shows residual gray fringe, tighten the gray tolerance or raise the brightness threshold and re-run that file.

## Out of scope
- No re-generation via the AI image tool (the alpha keying is deterministic and faster).
- No Landing.tsx changes — paths and wrappers already point at these files.