## Goal

Refactor the Remotion video to a **9:16 vertical mobile composition (1080×1920)**, trimmed to **~30 seconds**, with each scene re-laid-out for portrait. The 1920×1080 landscape composition is removed.

## Output

- New master: `/mnt/documents/photobrief-demo-mobile.mp4` (1080×1920, 30fps, ~900 frames, H.264 + AAC, +faststart)
- Existing `photobrief-demo-master.mp4` stays on disk but is no longer regenerated.

## Format & timing

- Composition `id="main"`: **1080×1920 @ 30fps**, **900 frames (30.0s)**.
- Re-cut to **6 scenes** (drop S3 reframe and merge S2 pain into S1 hook; merge S7+S8 into one close). New scene budget (frames, includes 12f transition overlap):

```
S1  Hook + Pain        150f  (5.0s)
S2  Reframe→Scan       150f  (5.0s)   "different jobs, different questions" + paste URL
S3  Routes approved    120f  (4.0s)
S4  Photo policy       150f  (5.0s)
S5  Recipient phone    180f  (6.0s)   hero scene — phone fills frame
S6  Brief + Close      210f  (7.0s)   inbox row → brief card → "Stop chasing. Start closing."
Σ                      960f
− 5 transitions × 12f   60f
=                      900f  (30.0s)
```

- VO is re-recorded (6 shorter lines via existing `scripts/generate-audio.mjs`). Tick SFX on each cut. Ambient bed unchanged.

## Per-scene re-layout (portrait)

All scenes use a vertical safe-area: 80px side margins, 220px top reserve (label + eyebrow), 260px bottom reserve (caption + plate code). Type stacks vertically; no two-column layouts.

- **S1 Hook+Pain** — Fraunces headline at ~96px, 3 stacked lines: *"It's 9pm."* / *"17 'Contact Us' forms."* / *"You text. They ghost."* Amber underline traces under "ghost".
- **S2 Reframe→Scan** — Top half: "The ask is wrong." Bottom half: shrunken `BrowserChrome` with URL field, scan progress bar. Browser scaled ~0.55 to fit width.
- **S3 Routes approved** — Vertical stack of 4 `RouteChip`s (Repair / Install / Quote / Emergency) springing in one-by-one with amber check.
- **S4 Photo policy** — 2×2 grid of the four policy chips (`PhotoPolicyChip`), Fraunces caption above: *"Photos only when they help."*
- **S5 Recipient phone** — `PhoneFrame` rotated to occupy ~80% of vertical canvas (already portrait — just scale up). Caption ribbon: *"One link. One thumb. No login."*
- **S6 Brief + Close** — Inbox row drops in (full-width), expands into `BriefCard` (scaled to fit 960px width), `READY` stamp lands, then dissolves to closing card: BrandMark + tagline *"Guide · Capture · Close. Stop chasing. Start closing."*

## Files

**Edit**
- `remotion/src/Root.tsx` — width 1080, height 1920, durationInFrames from new TOTAL_FRAMES.
- `remotion/src/script.ts` — rewrite `SCENES` array (6 entries), shorter VO lines, recalculated captions, `TRANSITION_FRAMES = 12`.
- `remotion/src/MainVideo.tsx` — reduce `SCENE_COMPONENTS` to 6, simplify `ACT_BREAKS` (one act break at index 2).
- `remotion/src/components/PlateFrame.tsx` — replace hard-coded `W=1920, H=1080` in `CornerTicks` with `useVideoConfig()`; tighten margins for portrait (M=32, top label at 56/40, bottom plate code at 40).
- `remotion/scripts/generate-audio.mjs` — picks up new VO strings automatically; just re-run.
- `remotion/scripts/render-master.mjs` — output path → `/mnt/documents/photobrief-demo-mobile.mp4`, append `+faststart` remux step at end.
- `remotion/scripts/qa-stills.mjs` — render at new aspect.

**Create**
- `remotion/src/scenes/S1HookPain.tsx`
- `remotion/src/scenes/S2ReframeScan.tsx`
- `remotion/src/scenes/S3Routes.tsx`
- `remotion/src/scenes/S4Policy.tsx`
- `remotion/src/scenes/S5Phone.tsx`
- `remotion/src/scenes/S6BriefClose.tsx`

**Delete**
- `remotion/src/scenes/S1ColdOpen.tsx` … `S8Close.tsx` (all 8 existing scene files).
- Old VO files `public/audio/vo-1.mp3` … `vo-8.mp3` regenerated as `vo-1.mp3` … `vo-6.mp3`.

**Untouched**
- `remotion/src/theme.ts`, `motion.ts`, `components/ui/*`, `Captions.tsx`, `GrainOverlay.tsx`, `PlateCodeTicker.tsx`. UI mock components (`BrowserChrome`, `PhoneFrame`, `BriefCard`, etc.) are reused at smaller scales — no internal changes.

## Render & verify

1. `cd remotion && bun run scripts/generate-audio.mjs` (regenerate 6 VO lines).
2. `node scripts/render-master.mjs /mnt/documents/photobrief-demo-mobile.mp4`.
3. `ffmpeg -y -i ... -c copy -movflags +faststart` for browser-streamable output.
4. `ffprobe` to confirm 1080×1920, 900 frames, 30.0s.
5. QA stills at frames 60, 240, 420, 600, 780 — confirm no clipped text, plate chrome inside safe area, phone fits.

## Out of scope

- No landscape master regeneration.
- No changes to web app code (`src/`), only the `remotion/` directory.
- No new shared UI components — only re-composition of existing ones.
