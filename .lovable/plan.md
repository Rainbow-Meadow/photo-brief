## Concept: "Field Manual"

A unified illustration system styled like plates from a 1960s technical manual, reinterpreted on the dark editorial shell. Every image reads like an engineering diagram of a job-site truth — drawn with hard-edge cream linework on dark navy, small amber callouts, monospace labels, and dimension markers. Bold, striking, never cute.

### The visual language (locked rules)

Every new image obeys this contract so the set reads as one system:

- **Canvas**: solid `hsl(60 8% 5%)` background (matches `--background`). No drop shadows, no gradients, no glow.
- **Lines**: cream `#F4F1EA` strokes only, two weights — 1px hairline for grid/dimension/leader lines, 2.5px for the primary subject silhouette.
- **Accents**: amber `#F2A33A` used **once or twice per image** — to highlight the single most important element (the leak, the gear that turns, the brief that lands). Kinetic orange `#FF5A1F` reserved for true CTAs only, never illustration.
- **Type**: monospace labels (Geist Mono / IBM Plex Mono), all-caps, tracked +160. Sized 9-11px equivalent. Numbered call-outs ("01", "02") with leader lines, tiny dimension ticks, fictional plate numbers ("PLT.A.04 / RFM-METHOD"), grid coordinates.
- **Composition**: subject centered or rule-of-thirds, generous whitespace (35-45% of canvas), surrounded by faint grid notation. Think Charles Eames meets a structural blueprint.
- **No** soft shading, no characters with faces, no isometric cartoons, no skeuomorphic "fun" 3D, no stock-illustration pastels.

### Coverage (what gets remade)

| Group | Files | Notes |
|---|---|---|
| Hero | `hero-new.png` | The marquee plate. Subject: a phone-shaped brief with a photo viewport; amber leader pointing to "READY-TO-QUOTE" stamp. |
| RMBC method (5) | `research-magnifier`, `mechanism-gears`, `brief-packet`, `method-overview`, `close-handshake` | Each plate diagrams one step of the Reverse-Form Method™. Numbered 01-05 in the corner. |
| Comparison (2) | `before-intake-form` (chaotic stack of misshapen forms with red Xs in cream/amber) vs `after-capture-pipeline` (ordered pipeline with one amber check) | The two sit side-by-side; layout symmetry is the message. |
| Trades (5) | `landscaper`, `hvac-tech`, `plumber`, `junk-hauler`, `estimator` | Each is a tool-of-the-trade as a single-subject blueprint plate (pruning shears, manifold gauge set, P-trap, dolly, clipboard). No human figures. |
| Scenes (5) | `beta-notebook`, `founding-badge`, `mailbox-flag`, `reward-ribbons`, `transformation` | Plate-style: an open notebook with grid pages, a die-stamp medallion, a flag-up mailbox, a ribbon rosette, a before/after split. |
| Empty states (4) | `no-guides`, `no-keys`, `no-requests`, `no-team` | Smaller footprint; a single object with one amber ⌀ marker — closed book, blank tag, empty inbox tray, lone chair around a table. |

**Out of this pass**: `junk-removal/*` and `submission/*` are real customer-style photos powering the interactive demo. They stay — the Field Manual style would break the "this is a real intake" illusion. If desired later, we can apply a subtle navy-tint LUT to harmonize them with the dark shell, but no replacement.

### How we'll roll it out (concept board + 1 sample first)

**Step 1 — Art-direction doc** (this turn): Write `src/assets/field-manual.art-direction.md` capturing the locked rules above, the master prompt template, and per-image prompt seeds for all 22 replacements. This becomes the contract for any future image generated in this system.

**Step 2 — One pilot image** (this turn): Generate the new `hero-new.png` using `imagegen` at `premium` quality (legible monospace type matters; `fast`/`standard` mangles small text). Save to `src/assets/hero-new-v2.png` so the original stays as backup. Wire it temporarily into `src/pages/Landing.tsx` so you can see it live.

**Step 3 — Mini concept board** (this turn): Generate three small thumbnail variants of *one* RMBC plate (`mechanism-gears`) at `fast` quality so you can compare composition options side-by-side without burning premium credits.

**Step 4 — You review, then I batch the rest** (next turn): Once you green-light the pilot + variant, I generate the remaining 20 images in a single follow-up turn, swap imports, delete the originals (keeping the v2 suffix off the final files), and re-record any Playwright snapshots that include illustrations.

### Production prompt template (locked)

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

### Acceptance criteria for the pilot

Before declaring step-2 done I'll inspect the rendered hero with `image_tools--zoom_image` and verify:

- Background is the exact dark navy (no halo, no JPEG compression bands).
- Cream linework holds at 2-pixel min stroke without antialiasing mush.
- Amber accent appears once and only once.
- Monospace labels are legible at the size they'll render in the hero.
- No accidental human figures, faces, or stock-illustration drift.

If any check fails I'll regenerate before showing it to you.

## Out of scope

- LUT-grading the real demo photos (junk-removal, submission).
- Animations on the new images (hover effects, parallax) — left to a follow-up if you want motion.
- Changing the BrandMark assets (already locked in the previous turn).
