## Goal
Replace the current hero illustration with one seminal, iconic image that embodies all three beats of the brand promise — **Guide → Capture → Close** — in a single composition.

## Concept

**"The Guided Capture"** — one unified kinetic-vector scene reading left → center → right:

```text
   GUIDE              CAPTURE              CLOSE
 ───────────         ─────────           ──────────
  Navy hand          Phone in hand        Folded brief
  pointing /         framing the          packet sliding
  spotlight          HVAC unit            into inbox tray
  beam onto          (live capture        with orange
  the subject        viewfinder)          checkmark seal
```

All three beats live in **one continuous composition** — not a triptych with dividers, but a single illustration where the eye travels through the story:

1. **Left third — GUIDE**: A navy hand/finger emerging from frame edge, casting an orange directional beam (think stage spotlight or guidance arrow) onto the subject. Tiny "01" tick mark.
2. **Center — CAPTURE**: The hero phone (same kinetic vector language as current hero) framing an HVAC condenser inside its viewfinder. Orange burst rays radiate outward — the moment of capture. Tick "02".
3. **Right third — CLOSE**: A neat brief-packet/folder with orange tab sliding into a simple inbox tray, sealed with an orange checkmark. Tick "03".

A single thin orange arc/ribbon weaves through all three zones, tying them into one gesture (Guide → Capture → Close as one continuous motion, not three separate steps).

**Style** (locked to existing kinetic vector system):
- Cream `#FAF7F2` background, navy `#1B2A4A` solid shapes, orange `#F2A33A` accents
- Thick navy outlines, flat fills, no gradients/halftones/shadows/photos
- Poster-art energy, kinetic gestures, FIG. 01 / REVERSE-FORM METHOD™ corner ticks preserved
- Aspect 3:2 (1536×1024) to match current hero slot

## Implementation

1. Generate `src/assets/landing-hero-illustration.png` (overwrite current hero) at 1536×1024 via `imagegen--generate_image` with a detailed kinetic-vector prompt encoding the three-zone composition above.
2. No code changes needed — `Landing.tsx` already imports this exact path. Existing `FIG. 01` / `REVERSE-FORM METHOD™` overlay labels stay.
3. QA: view the generated PNG, confirm all three beats are legible, palette is correct, no embedded text, composition reads left-to-right, and the orange ribbon ties the scene together. Iterate prompt if any beat is missing or muddy.

## Out of scope
- No layout, copy, or token changes in `Landing.tsx`
- No changes to RMBC, trades, or comparison illustrations
- No new asset files — overwriting the existing hero path only