## Goal

Make every illustration on the landing page render on a true transparent background (alpha channel), instead of baked-in cream `#FAF7F2`. This removes the visible "card" rectangle around each illo when it sits on a tinted section (amber strip, navy block, etc.) and keeps the line-art floating cleanly.

Real photographs (`junk-removal/*.jpg`, `submission/*.jpg`, `leak-photo.jpg`) are out of scope — they stay as JPGs.

## Scope: assets to convert

All PNG illustrations imported by `src/pages/Landing.tsx`, plus the matching source files so other pages benefit:

RMBC set (5):
- `src/assets/rmbc/research-magnifier.png`
- `src/assets/rmbc/mechanism-gears.png`
- `src/assets/rmbc/brief-packet.png`
- `src/assets/rmbc/close-handshake.png`
- `src/assets/rmbc/method-overview.png`

Hero + scenes (5):
- `src/assets/landing-hero-illustration.png`
- `src/assets/scenes/founding-badge-illustration.png`
- `src/assets/scenes/reward-ribbons-illustration.png`
- `src/assets/scenes/beta-notebook-illustration.png`
- `src/assets/scenes/mailbox-flag-illustration.png`

Trades (2 used on Landing, plus the 3 siblings for consistency):
- `src/assets/trades/landscaper-illustration.png`
- `src/assets/trades/hvac-tech-illustration.png`
- `src/assets/trades/junk-hauler-illustration.png`
- `src/assets/trades/plumber-illustration.png`
- `src/assets/trades/estimator-illustration.png`

Empty-states (4) — same line-art family, used elsewhere in app:
- `src/assets/empty-states/no-guides.png`
- `src/assets/empty-states/no-keys.png`
- `src/assets/empty-states/no-requests.png`
- `src/assets/empty-states/no-team.png`

Brand marks are already correct (logo files have proper alpha) — skip.

## How

Run a one-shot Python script (`Pillow` + `numpy`) that, for each file above:

1. Opens the PNG as RGBA.
2. Computes per-pixel distance from cream `#FAF7F2` (and near-whites within tolerance ~18 in each channel).
3. Sets matching pixels' alpha to 0; feathers a 1-px edge to avoid jaggies on the navy line-art.
4. Preserves all non-background pixels (navy lines, amber accents) at full opacity.
5. Overwrites the file in place (Vite re-imports automatically).

Tolerance is tuned so the amber `#F2A33A` and navy `#1B2A4A` strokes are never touched. A dry-run preview on `mechanism-gears.png` and `landing-hero-illustration.png` is checked first; if any line bleeds, tolerance is dropped and re-run.

## Verification

- After the script, render each converted file over a checkerboard via the QA pass (composite to `/tmp` PNGs, inspect, do not ship).
- Reload `/` in preview and confirm: hero illo, mechanism banner, brief packet, handshake, founding badge, ribbon, notebook, mailbox, magnifier, landscaper, HVAC tech all show no cream halo on cream / amber / navy backgrounds.
- Existing regression tests (`landing-visual-contract`, `landing-tokens`) keep passing — no import paths or component structure change.

## Out of scope

- No copy, layout, or component edits in `Landing.tsx`.
- No changes to JPG photos.
- No new illustrations.
- No design-token changes.

## Files touched

- 20 PNG files overwritten in place under `src/assets/**`.
- No `.tsx` / `.ts` files modified.
