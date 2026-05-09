# Field Manual — Image System Art Direction

A unified illustration system for PhotoBrief.ai. Every image reads like a plate from a 1960s technical manual, reinterpreted on the dark editorial app shell. Bold, striking, never cute.

## Locked visual contract

Every image in this system MUST obey these rules so the set reads as one body of work.

| Rule | Specifics |
|---|---|
| Background | Solid dark navy `#0E0E0C` (matches `hsl(60 8% 5%)` / `--background`). No gradients, no glow, no drop shadow, no vignette. |
| Lines | Cream `#F4F1EA` only. Two stroke weights: 1px hairline (grid, dimension, leader lines), 2.5px (primary subject contour). |
| Accent | Amber `#F2A33A`. Used **once per image**, on the single most important element. Kinetic orange `#FF5A1F` is reserved for app CTAs and never appears in illustrations. |
| Type | Monospace all-caps (Geist Mono / IBM Plex Mono), tracked +160. Sized 9–11px equivalent. Numbered call-outs `01`, `02`. Plate number bottom-right e.g. `PLT.A.04 / RFM-METHOD`. Tiny dimension ticks where appropriate. |
| Composition | Centered or rule-of-thirds single subject. 35–45% negative space. Faint 1px construction grid behind the subject. |
| Forbidden | Soft shading, character faces, isometric cartoons, skeuomorphic 3D, pastel stock-illustration look, glossy renders, JPEG halos. |

## Master prompt template

```
Editorial technical-manual plate, single subject, drawn as cream (#F4F1EA)
hairline + 2.5px contour lines on a solid dark navy (#0E0E0C) background.
One amber (#F2A33A) accent applied to [SUBJECT-FOCAL-ELEMENT] only.
Monospace all-caps labels tracked +160 with leader lines and tiny
dimension ticks. Plate number "[PLT.X.NN]" in the bottom-right corner.
Faint 1px construction grid behind subject. 35-45% negative space.
No drop shadows, no gradients, no character faces, no isometric, no
photoreal, no soft pastel, no 3D rendering. Subject: [SUBJECT-DESCRIPTION].
Composition: [LAYOUT]. Aspect ratio: [AR].
```

## Per-image seeds

### Hero
- **hero-new** — Phone-shaped brief packet, centered, with a photo viewport showing a faintly drawn job site. Amber leader points to a "READY-TO-QUOTE" stamp at the top corner. PLT.A.01. AR 16:10.

### RMBC method (Reverse-Form Method™, plates 02–06)
- **research-magnifier** — Oversized magnifier glass over a half-revealed website wireframe. Amber accent on the glass rim. PLT.A.02.
- **mechanism-gears** — Three interlocking gears, the smallest one amber. Dimension ticks on each gear's diameter. PLT.A.03.
- **brief-packet** — A folded brief packet exploded into 3 stacked layers (cover, photos, summary) with leader-line labels. Amber band around the cover. PLT.A.04.
- **method-overview** — Five numbered nodes connected by hairline arrows in a cyclic loop. The capture node is amber. PLT.A.05.
- **close-handshake** — Two abstract geometric forms (a hexagon and a square) interlocking like a key and lock. Amber on the connection point. PLT.A.06. (No human hands.)

### Comparison
- **before-intake-form** — Stack of 4 misaligned, dog-eared paper forms with hairline X marks through several fields. PLT.B.01. AR 4:3.
- **after-capture-pipeline** — Single horizontal pipeline of 4 ordered tiles with one amber check at the end. PLT.B.02. AR 4:3.

### Trades (single-tool blueprints, no humans)
- **landscaper** — Bypass pruning shears, blade open. Amber on the cutting edge. PLT.C.01.
- **hvac-tech** — Manifold gauge set with two pressure dials. Amber on the high-pressure needle. PLT.C.02.
- **plumber** — P-trap assembly, exploded view. Amber on the slip nut. PLT.C.03.
- **junk-hauler** — Hand truck/dolly, side profile. Amber on the wheel hub. PLT.C.04.
- **estimator** — Clipboard with a half-completed grid form and a mechanical pencil. Amber on the pencil tip. PLT.C.05.

### Scenes
- **beta-notebook** — Open notebook, grid pages, a single amber dot in one cell. PLT.D.01.
- **founding-badge** — Octagonal die-stamp medallion with "FOUNDING" engraved. Amber on the center. PLT.D.02.
- **mailbox-flag** — Rural mailbox, flag up. Amber on the flag. PLT.D.03.
- **reward-ribbons** — Single award rosette, 6 pleats. Amber on the center button. PLT.D.04.
- **transformation** — Vertical split: chaotic dot field on left, ordered grid on right. Amber arrow between. PLT.D.05.

### Empty states (smaller footprint, ⌀ marker)
- **no-guides** — Closed book with a ⌀ amber tag on the spine. PLT.E.01. AR 1:1.
- **no-keys** — Single blank key tag on a ring with one amber ⌀ stamp. PLT.E.02. AR 1:1.
- **no-requests** — Empty inbox tray, top view. Amber ⌀ on the rim. PLT.E.03. AR 1:1.
- **no-team** — A round meeting table with one chair, four other slots empty. Amber ⌀ on the lone chair. PLT.E.04. AR 1:1.

## Acceptance checklist

For every generated image, verify with `image_tools--zoom_image`:

- [ ] Background is the exact dark navy — no halo, no JPEG bands.
- [ ] Cream linework holds at 2-pixel min stroke without antialiasing mush.
- [ ] Amber accent appears once and only once.
- [ ] Monospace labels are legible at the size they'll render.
- [ ] No accidental human figures, faces, or stock-illustration drift.

If any check fails, regenerate before shipping.
