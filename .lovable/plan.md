## Goal

Replace every illustration on the landing page with a cohesive set of **risograph-textured collages** that match the new Locomotive-inspired chrome (cream `#FAF7F2` ground, navy `#1B2A4A` ink, kinetic-orange `#F2A33A` accent). Tactile, two-color, photo-cutout + vector marks, visible paper grain and slight mis-registration.

## Visual recipe (applied to every image)

- **Substrate:** cream paper ground with subtle grain.
- **Inks:** navy as primary, kinetic-orange as accent. Treat as a 2-color riso print — overlap zones get a darkened multiply, mis-registration ~2–4px on accent layer.
- **Content mix:** halftoned photo cutouts of real trade subjects (a hand, a ladder, an HVAC unit, a yard) layered with bold geometric marks (circles, arrows, registration crosses, numerals).
- **Texture:** heavy grain, ink bleed at edges, tiny dust specks. No drop shadows, no gradients.
- **Margin:** generous negative space; subject anchored, not centered.
- **No text inside images** (typography lives in the page).

## Image set & aspect ratios

Hero / featured
1. `landing-hero-illustration.png` — **3:2** wide. Centerpiece collage: halftone close-up of a service-tech hand framing a phone over a worksite, orange registration ring, navy arrows.

RMBC method (square so they sit cleanly in the numbered grid)
2. `rmbc/research-magnifier.png` — **1:1** magnifier over a halftone photo strip, orange dot of focus.
3. `rmbc/mechanism-gears.png` — **1:1** interlocking navy gears + photo cutout of a clipboard, orange motion arc.
4. `rmbc/brief-packet.png` — **1:1** stacked document packet with orange tabs, halftone photo peeking from inside.
5. `rmbc/method-overview.png` — **1:1** isometric flow diagram (capture → brief → close), orange path line.
6. `rmbc/close-handshake.png` — **1:1** halftone handshake, orange checkmark stamp.

Trades (portrait so they read as character cards in the use-case grid)
7. `trades/plumber-illustration.png` — **3:4** wrench + pipe joint photo cutout, orange leak drop.
8. `trades/hvac-tech-illustration.png` — **3:4** outdoor condenser unit, orange airflow arrows.
9. `trades/landscaper-illustration.png` — **3:4** halftone lawn + slope contour lines, orange property pin.
10. `trades/junk-hauler-illustration.png` — **3:4** loaded truck bed silhouette, orange hazard triangle.
11. `trades/estimator-illustration.png` — **3:4** photo-grid contact sheet with orange measurement callouts.

Use-case scenes (new — currently the grid reuses HVAC/landscaper; we'll wire one per card)
- All 5 trades above become the per-card scene; no extra files needed beyond regenerating these five.

Total: **11 images regenerated in place**, same paths so no component imports change.

## Generation approach

- Use `imagegen--generate_image` with `model: "premium"` (no text in images, but premium gives us the cleanest halftone + grain control).
- Shared style preamble appended to every prompt to lock the riso look, palette hexes, grain, and mis-registration.
- Generate in parallel batches of 3–4.
- Save directly over existing paths so no code edits are required for imports.

## QA pass (mandatory before delivery)

1. Open each generated PNG, verify: cream ground, only navy + orange inks, visible grain, no stray colors, no embedded text, correct aspect ratio, subject readable at card size (~280px wide).
2. Drop the set into the live landing route at 1440 and 390 widths and screenshot to confirm cohesion across hero, RMBC strip, and trades grid.
3. If any image drifts (extra colors, photoreal slickness, text artifacts), regenerate that single image with a tightened prompt — do not touch the rest.

## Out of scope

- No layout, typography, or copy changes.
- No new image slots — only replacing the 11 files already imported.
- No dashboard / Pricing / Auth imagery (those come in the next reskin pass).
