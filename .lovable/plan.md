## Goal

Replace the generic brief-packet thumbnail in the Before / After section with a **purpose-built pair of comparison illustrations** so the contrast between the chaotic intake form and the guided capture pipeline reads visually, not just through bullet copy.

Right now the section is asymmetric (only the After card has art) and the art it does have is just the same packet used elsewhere on the page — it doesn't depict the comparison.

## What changes

1. **Generate two new 16:9 illustrations** in the same bold flat kinetic vector style (cream / navy / kinetic orange) used across the new landing imagery:
   - `src/assets/comparison/before-intake-form.png` — a chaotic generic web form: tilted form panel with empty input fields, a broken/cracked photo placeholder icon, three red question-mark bubbles floating around it, navy "missing" X marks. Tells the "photos missing, follow-ups, lead cools" story at a glance.
   - `src/assets/comparison/after-capture-pipeline.png` — a phone screen showing a guided capture flow: navy phone with three small photo thumbnails stacked on the screen plus a checklist, an orange chevron arrow flowing into a packet icon on the right. Tells the "right angle, single packet, instant quote" story.

2. **Wire them into `ComparisonSection`** in `src/pages/Landing.tsx`:
   - Add an image block to the Before card (mirroring the existing After block's structure) using the new before image.
   - Swap the After card's `briefPacketIllo` for the new `after-capture-pipeline.png`.
   - Both cards keep the existing `aspect-[16/9]` frame so the layout stays balanced.

3. **No copy, layout, or token changes.** Bullets, headings, colors, and the rest of the page are untouched. `briefPacketIllo` stays in its original RMBC slot.

## QA

- Inspect both PNGs: cream ground only, navy + orange only (no extra colors), no embedded text, kinetic vector style consistent with the rest of the landing set.
- Open `/` at 1440 and 390, screenshot the comparison section, confirm the two cards now read as a true visual before/after pair and the Before card no longer feels empty.

## Out of scope

- No changes to bullets, eyebrows, or section copy.
- No changes elsewhere on the page or to other illustrations.
