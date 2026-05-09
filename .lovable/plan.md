## Goal

Rebuild the Remotion video to match the dark editorial Field Manual system (cream hairlines on `#0E0E0C`, single amber accent per scene, mono plate codes), and score it with an ElevenLabs voiceover plus subtle SFX.

## Scope

```text
remotion/
  src/
    theme.ts            ← rewrite tokens (dark shell, no gradients/glow)
    MainVideo.tsx       ← rewrite: 5 scenes via TransitionSeries, drop old shell
    Root.tsx            ← update durationInFrames (5 × 180 = 900 @ 30fps = 30s)
    components/
      PlateFrame.tsx    ← new: hairline grid + plate code + corner ticks
      DrawnLine.tsx     ← new: strokeDashoffset animator
      MonoLabel.tsx     ← new: tracked +160 mono label w/ leader line
    scenes/
      SceneResearch.tsx     ← PLT.A.02  magnifier over wireframe
      SceneMechanism.tsx    ← PLT.A.03  three gears, smallest amber
      SceneBrief.tsx        ← PLT.A.04  exploded brief packet
      SceneCapture.tsx      ← PLT.A.01  phone + READY-TO-QUOTE stamp
      SceneClose.tsx        ← PLT.A.06  hexagon+square interlock + wordmark
  public/
    audio/
      voiceover.mp3     ← generated via ElevenLabs TTS (George - JBFqnCBsd6RMkjVDRZzb)
      ambient.mp3       ← generated via ElevenLabs Music (low ambient bed)
      tick.mp3          ← SFX: hairline draw tick (per scene start)
  scripts/
    generate-audio.mjs  ← one-off: call ElevenLabs, write to public/audio/
```

Old files removed: `AmbientBackground.tsx`, `SpotlightPrimitives.tsx`, `DashboardShell.tsx`, all `Scene*.tsx` under the old naming.

## Visual contract (locked, per `field-manual.art-direction.md`)

- Background: solid `#0E0E0C`, no gradients
- Lines: cream `#F4F1EA`, 1px hairline + 2.5px contour
- Accent: amber `#F2A33A`, **once per scene**, on the focal element
- Type: Fraunces (serif headlines, sparing) + Geist Mono (labels, plate codes, tracked +160, all-caps)
- Plate code bottom-right per scene (`PLT.A.0X / RFM-METHOD`)
- Faint 1px construction grid, 35–45% negative space

## Motion system

- Default entrance: `springTiming({ config: { damping: 200 }, durationInFrames: 24 })`
- Subject contour: SVG `strokeDashoffset` 0 → length over 30–45 frames
- Amber accent reveal: spring with overshoot (damping 14) at scene midpoint
- Scene transitions: `fade` (12 frames) — never wipe/slide; keeps editorial calm
- 5 scenes × 180 frames (6s) = 30s total; transitions overlap 12f → ~29.6s

## Voice + audio (ElevenLabs)

Voice: **George** (`JBFqnCBsd6RMkjVDRZzb`) — calm, editorial baritone.
Model: `eleven_multilingual_v2`, stability 0.55, similarity 0.78, style 0.35.

Script (≈28s read at speed 1.0, paced to scene cuts):

```text
[00.0] Most quotes die in the gap between question and answer.
[06.0] PhotoBrief closes the gap. Research the job.
[10.0] Mechanism, captured by the customer in their pocket.
[15.0] A brief, written for the way you actually quote.
[20.0] Ready to quote, before you pick up the phone.
[25.0] PhotoBrief. Guide. Capture. Close.
```

Audio bed: ElevenLabs Music API, prompt
`"Sparse editorial documentary score, low cello drone, single muted piano note every 4 seconds, no drums, 28 seconds, calm and confident"`, mixed at -18 dB under VO.

SFX: a single 0.4s `pencil tick` per scene cut (SFX API), aligned to `Sequence` starts at -10 dB.

Generation flow (one-off, run once and committed):

1. `scripts/generate-audio.mjs` reads `ELEVENLABS_API_KEY` from env, calls TTS → `public/audio/voiceover.mp3`, Music → `ambient.mp3`, SFX → `tick.mp3`.
2. Run via `bun remotion/scripts/generate-audio.mjs` from `/dev-server`.
3. Commit the three MP3s under `remotion/public/audio/`.
4. `MainVideo.tsx` mounts `<Audio src={staticFile('audio/voiceover.mp3')} />`, `<Audio src={staticFile('audio/ambient.mp3')} volume={0.25} />`, and per-scene `<Audio src={staticFile('audio/tick.mp3')} volume={0.4} />` inside each scene's `<Sequence>`.

Note: `ELEVENLABS_API_KEY` is already linked via the **Pb** ElevenLabs connection — no user action needed.

## Render

```bash
cd remotion && node scripts/render-remotion.mjs
# outputs /mnt/documents/photobrief-rmbc.mp4
```

The existing `scripts/render-remotion.mjs` already handles the Nix Chromium quirks; the only change is dropping `muted: true` so the new audio bakes in.

## QA

- `bunx remotion still src/index.ts main /tmp/f-{0,180,360,540,720,890}.png` — one frame per scene mid-point, inspect for: solid bg, single amber accent, plate code legible, no gradient drift.
- Verify final MP4 file exists under `/mnt/documents/`, length ≈30s, audio present (`ffprobe`).

## Out of scope

- App UI, email templates, OG images (already aligned in earlier turns).
- Workflow YAML changes — `render-demo-video.yml` already invokes the same render script.
