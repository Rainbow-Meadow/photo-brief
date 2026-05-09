## Goal

Regenerate every landing illustration in **bold flat kinetic vector** style and wire up the three trade cards (Plumbers, Junk haulers, Estimators) that currently have `illo: null` so every slot has an image.

## Visual recipe

- **Pure flat vector** — no halftone, no grain, no texture, no gradients, no shadows.
- **Palette (strict, only these):** cream `#FAF7F2` ground, deep navy `#1B2A4A` primary, kinetic orange `#F2A33A` accent. Optional off-white `#FFFFFF` highlight inside shapes.
- **Forms:** chunky geometric shapes with thick uniform navy outlines (~6–10px relative to canvas), bold filled silhouettes, minimal interior detail. Poster-art energy: think Locomotive / French serigraph / Modernist trade poster.
- **Kinetic gestures:** speed lines, motion arcs, registration crosses, off-axis tilt, repeated chevrons — every scene should feel like it is *doing* something.
- **Composition:** subject anchored off-center on a generous cream field, overlapping orange shape provides energy.
- **No text** anywhere in the image.

## Image slots (11 total — every slot filled)

Hero (3:2):
1. `landing-hero-illustration.png` — hand holding a phone framing a worksite, orange burst ring, navy speed lines.

RMBC method (1:1 — square):
2. `rmbc/research-magnifier.png` — chunky magnifier over a stack of photo rectangles, orange focal dot.
3. `rmbc/mechanism-gears.png` — interlocking navy gears + a clipboard, orange motion arc.
4. `rmbc/brief-packet.png` — fanned document folders with orange tabs, photo card peeking out.
5. `rmbc/method-overview.png` — three connected blocks (camera → doc → handshake) joined by an orange path with arrowheads.
6. `rmbc/close-handshake.png` *(currently unused — leave file but skip wiring)* handshake with orange checkmark.

Trades (3:4 portrait — used in the use-case grid):
7. `trades/plumber-illustration.png` — wrench on an elbow pipe, orange leak drop.
8. `trades/hvac-tech-illustration.png` — outdoor condenser unit, orange airflow chevrons.
9. `trades/landscaper-illustration.png` — property aerial outline with slope contour lines, orange location pin.
10. `trades/junk-hauler-illustration.png` — pickup truck loaded with debris silhouette, orange hazard triangle.
11. `trades/estimator-illustration.png` — 2×2 photo contact-sheet card with orange measurement callout brackets.

## Code wiring

In `src/pages/Landing.tsx`:
- Add three imports: `plumberIllo`, `junkHaulerIllo`, `estimatorIllo` from `@/assets/trades/...`.
- Replace the three `illo: null` entries in the trades array (lines 385, 388, 389) with the new imports.

No other component changes — RMBC and HVAC/landscaper slots already wire through.

## QA pass

1. Inspect each generated PNG: cream ground, only navy + orange (+ optional white inside shapes), no text, no halftone or grain, kinetic energy present, correct aspect ratio.
2. Open `/` at 1440 and 390 viewports, screenshot hero + RMBC strip + trades grid, confirm cohesion.
3. Regenerate any single image that drifts (extra colors, photoreal, embedded text) with a tightened prompt — leave the rest untouched.

## Out of scope

- No layout, typography, copy, or component structure changes beyond wiring the three new trade imports.
- No dashboard/Pricing/Auth imagery (next reskin pass).
