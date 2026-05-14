# PhotoBrief — 90s Marketing / Demo / Walkthrough Video

Full ground-up redesign of `remotion/`. Keeps the dark navy + cream + amber Field Manual contract, but trades the static 5-plate structure for a paced, three-act spot with a real demo walkthrough in the middle and operator-voice copy throughout.

---

## 1. Story & structure (90s @ 30fps = 2,700 frames)

Three acts, eight scenes. Pacing is intentionally uneven: punchy beats (~4s) for pain, longer beats (~10–14s) for the demo.

```text
ACT I — THE PAIN (0:00 – 0:18)  ─────── 540f
  S1  Cold open: "Did they send the damn pictures yet?"   4s
  S2  The graveyard of half-finished forms                6s
  S3  Reframe: the form isn't the problem, the ask is     8s

ACT II — THE MECHANISM / DEMO (0:18 – 1:08) ──── 1,500f
  S4  Paste your site URL → routes appear (UI mock)      10s
  S5  Per-route questions + 4-state photo policy         12s
  S6  Recipient phone POV: guided intake, one thumb      14s
  S7  Operator inbox: the brief lands, "ready to quote"  14s

ACT III — THE PAYOFF (1:08 – 1:30) ──── 660f
  S8  Stat wall + tagline + wordmark close               22s
```

Total: 2,700 frames. Built with `<TransitionSeries>` so cuts overlap (account for ~20f overlap per cut → bump scene durations slightly to land at exactly 90s).

---

## 2. Voice script (Kyle Milligan rules)

Operator voice. Short. Specific. No hype. Read at ~155 wpm ≈ 230 words for 90s.

```text
[S1, 4s]  Cold open, single line on screen:
          "It's 9pm. You still don't know what the job is."

[S2, 6s]  "Seventeen 'Contact Us' submissions this week.
           Half of them: just a name and 'need a quote.'
           You text back. They ghost. Repeat."

[S3, 8s]  "The form isn't the problem. The ask is.
           Generic forms get generic answers.
           A roofer needs different answers than a mover.
           A leak needs different photos than a re-roof."

[S4, 10s] "Paste your website. PhotoBrief reads it
           and proposes the routes a customer comes in for —
           repair, install, quote, emergency. You approve."

[S5, 12s] "Per route, the right questions. And a photo policy
           with four settings, not a checkbox:
           not needed, optional, recommended, required.
           Photos only when they actually move the job forward."

[S6, 14s] "Your customer gets one link. On their phone.
           One thumb. Plain words. No login.
           They answer, attach what's asked, hit send."

[S7, 14s] "You get a brief. Contact, answers, photos,
           a readiness score, and either 'ready to quote'
           or a short list of what's still missing.
           Stop chasing. Start closing."

[S8, 22s] "PhotoBrief. Guide, capture, close.
           Built for roofers, HVAC, contractors,
           real estate, and claims adjusters
           tired of chasing customers over text."
```

Generated via ElevenLabs (`remotion/scripts/generate-audio.mjs` already exists — extend it). Same script saved to `remotion/src/script.ts` so on-screen captions stay in sync and tests can assert key lines render.

---

## 3. Advanced Remotion features to use

Not all at once for novelty — each chosen for a specific scene.

| Feature | Where | Why |
|---|---|---|
| `@remotion/transitions` (`fade`, `wipe`, `clockWipe`, `slide`) via `<TransitionSeries>` | Between every scene | Coherent, varied, intentional cuts |
| `@remotion/google-fonts` (Fraunces + Geist Mono, already loaded) + `@remotion/fonts` for an Inter UI face | Demo scenes (S4–S7) | UI mocks need a real product sans, not a serif |
| `@remotion/captions` + `@remotion/install-whisper-cpp` (or hand-authored caption JSON to skip transcription) | Whole video | Burned-in operator-voice captions, word-level pop |
| `@remotion/shapes` | S2, S3, S8 | Crisp polygons / rings without raw SVG math |
| `@remotion/paths` (`evolvePath`, `getLength`) | S1 underline, S3 connector lines, S8 close | Drawn-on hairlines on the beat |
| `@remotion/noise` | Persistent grain layer | Filmic texture instead of flat black |
| `Audio` + `useAudioData` + `visualizeAudio` from `@remotion/media-utils` | S2 form-graveyard scene | Subtle waveform pulse under the VO |
| `Sequence` with negative `from` + `extrapolateLeft`/`Right: 'clamp'` | All scenes | Pre-roll motion that's already moving on cut-in |
| `spring()` with varied `damping`/`stiffness` per layer | All | No two elements share the same curve |
| `<Img pauseWhenLoading>` + `delayRender`/`continueRender` | Photo grid in S5/S6 | Guarantees every photo is decoded before the frame renders |
| `<OffthreadVideo>` | Optional micro-loops in S7 inbox | If we shoot a 2s screen-cap, embed without main-thread cost |
| `staticFile()` brand assets | Throughout | Already wired |
| `calculateMetadata` on the Composition | `Root.tsx` | Pull total duration from the script file so script edits auto-resize the video |
| Parametric props with Zod schema | `Composition` | `theme`, `showCaptions`, `voiceover` toggles for re-renders |
| `<Series>` inside scenes | S2 form list, S5 photo policy | Clean intra-scene chaptering |
| `useBufferState` | Photo-heavy scenes | Avoid dropped frames during render |

Explicitly NOT using: 3D / Three Fiber (overkill), Lottie (no source files), Mapbox (irrelevant), `backdropFilter` (sandbox crashes).

---

## 4. Visual system (kept, sharpened)

- **Palette**: existing `theme.ts` tokens — bg `#0E0E0C`, ink `#F4F1EA`, amber `#F2A33A`. Add one cool ink `#9FB3C8` strictly for UI-mock chrome in S4–S7 so demo screens read as "product" not "plate."
- **Type**: Fraunces 500 for headlines, Geist Mono for plate codes / captions / UI labels, Inter 500 for in-UI mock copy.
- **Motion language**:
  - Default entrance: 18-frame spring (`damping: 22, stiffness: 180`) + 8px y-offset.
  - Hero entrance (act openers): 28-frame spring + blur 8→0px via `filter`.
  - Default exit: 12-frame fade + 6px y-offset.
  - Default scene cut: `wipe` from-bottom with `springTiming({ damping: 200, durationInFrames: 22 })`.
  - Accent cut between acts: `clockWipe` with amber stroke flash.
- **Persistent layers** (span all 2,700f, outside `TransitionSeries`):
  - `PlateGrid` (existing construction grid, dimmed to 40%).
  - `GrainOverlay` via `@remotion/noise` at 6% opacity.
  - Bottom-edge `PLT.xx / RFM-METHOD` plate code that ticks up per scene.
  - Caption track (toggleable via prop).

---

## 5. Scene-by-scene blocking

**S1 — Cold open.** Black plate. Single Fraunces line draws on left-aligned, 96pt. Amber underline traced via `evolvePath` on the last word ("job"). VO lands on the underline.

**S2 — Graveyard.** Stack of 6 mock form-submission cards slides up in staggered springs (`<Series>`). Each card greys out and a red strike animates across as VO says "ghost." Subtle waveform bar at the bottom driven by `visualizeAudio` of the VO track.

**S3 — Reframe.** Split screen: left, generic "Contact Us" wireframe (existing). Right, four route chips (Repair / Install / Quote / Emergency) pop in with `spring`. Hairline connectors drawn between the form and chips with `evolvePath`.

**S4 — Paste URL.** Mock browser chrome (Inter UI). URL types in via per-character `interpolate` over `photobrief.ai/intake`. A scan bar sweeps across with amber glow. Routes materialize as cards in a 2×2 grid with staggered springs. Operator approves with a checkmark draw.

**S5 — Questions + photo policy.** Left column: animated question list (typewriter). Right column: 4 photo-policy chips (`not_needed`, `optional`, `recommended`, `required`) — each chip lights up as VO names it. The "required" chip pulses amber. Real photos from `public/photos/` (already present) tile in behind `required`.

**S6 — Recipient POV.** Tilted iPhone frame center stage (SVG, no asset needed). Inside the frame: a 3-step micro-flow — question → photo capture (uses `wide-garage.jpg`) → submit. Whole phone has a slow 2° parallax wobble via sin-wave. Hand silhouette? Skip — too cute. One thumb implied by tap-ripple at button positions.

**S7 — Operator inbox.** Cut to laptop-ish UI. A new row slides in at top of an inbox list. Click-expand reveals the brief: contact block, 3 answers, 4 thumbnail photos (from `public/photos/`), readiness ring filling to 92% via `spring`, "Ready to quote" pill flips in with `flip` transition on a single element. Final beat: amber stamp drops "READY."

**S8 — Close.** Three stat tiles wipe in (`clockWipe` per-tile staggered): "4× more complete briefs" / "0 follow-up texts" / "90 seconds to publish." Then everything clears to the existing wordmark + tagline close from current `SceneClose.tsx` (reused, retimed to 8s).

---

## 6. Audio

- Replace `voiceover.mp3` with re-generated 90s VO (extend `scripts/generate-audio.mjs`, ElevenLabs voice already used).
- Keep `ambient.mp3` as bed at 0.14 volume (down from 0.18 — VO is denser now).
- Replace `tick.mp3` per-cut with three variants (soft tick / hard tick / amber stinger on act breaks). Author in script, store in `public/audio/`.
- Master VO with `Audio volume={(f) => …}` to duck under stingers.

---

## 7. File layout after rebuild

```text
remotion/
  src/
    index.ts
    Root.tsx                    # Composition w/ Zod props + calculateMetadata
    MainVideo.tsx               # Persistent layers + TransitionSeries of 8 scenes
    script.ts                   # Single source of truth for VO + caption timings
    theme.ts                    # Extended w/ ui-mock cool ink + motion presets
    motion.ts                   # Reusable spring presets, entrance/exit helpers
    components/
      PlateFrame.tsx            # Kept
      GrainOverlay.tsx          # New (@remotion/noise)
      Captions.tsx              # New (caption track renderer)
      PlateCodeTicker.tsx       # New (bottom-right plate code per scene)
      DrawnLine.tsx             # Kept
      MonoLabel.tsx             # Kept
      ui/
        BrowserChrome.tsx       # New (S4)
        PhoneFrame.tsx          # New (S6)
        InboxRow.tsx            # New (S7)
        BriefCard.tsx           # New (S7)
        RouteChip.tsx           # New (S3, S4)
        PhotoPolicyChip.tsx     # New (S5)
        ReadinessRing.tsx       # New (S7)
    scenes/
      S1ColdOpen.tsx
      S2Graveyard.tsx
      S3Reframe.tsx
      S4PasteUrl.tsx
      S5Questions.tsx
      S6Recipient.tsx
      S7Inbox.tsx
      S8Close.tsx
  public/
    audio/{ambient,voiceover,tick-soft,tick-hard,stinger}.mp3
    photos/* (kept)
    brand/* (kept)
  scripts/
    generate-audio.mjs          # Extended for new script + multiple stingers
    render-remotion.mjs         # Existing, unchanged
```

Old `SceneResearch/Mechanism/Brief/Capture/Close.tsx` deleted (Close logic ported into S8).

---

## 8. Build order

1. Bump deps (`@remotion/transitions`, `@remotion/shapes`, `@remotion/paths`, `@remotion/noise`, `@remotion/media-utils`, `@remotion/captions`, `inter` via `@remotion/google-fonts/Inter`).
2. Author `script.ts` + regenerate `voiceover.mp3` + new tick/stinger audio.
3. Build `motion.ts` presets, `Captions.tsx`, `GrainOverlay.tsx`, `PlateCodeTicker.tsx`.
4. Build UI mock primitives (`BrowserChrome`, `PhoneFrame`, `InboxRow`, `BriefCard`, `RouteChip`, `PhotoPolicyChip`, `ReadinessRing`).
5. Build scenes S1 → S8 in order, rendering each as a still at its midpoint via `bunx remotion still` to QA.
6. Wire `MainVideo.tsx` with `<TransitionSeries>` + persistent layers, set `Composition` to 2,700f / 30fps / 1920×1080.
7. Render full MP4 to `/mnt/documents/photobrief-demo-v2.mp4` and inspect 6 spot-frames (one per act + one per UI scene).
8. Update `.github/workflows/render-demo-video.yml` output path (still `public/marketing/photobrief-demo.mp4` — overwrite).

---

## 9. Open questions before I build

1. **Voiceover voice**: keep the current ElevenLabs voice, or pick a new one (e.g. warmer male operator voice)?
2. **Captions on by default?** Most LinkedIn / X autoplay is muted — I'd default ON. Confirm.
3. **Stat tiles in S8**: are "4× more complete briefs / 0 follow-up texts / 90s to publish" claims you're comfortable with, or should I use softer phrasing ("more complete briefs / fewer follow-up texts / publish in minutes")?
4. **Scope of UI mocks**: hand-built SVG/HTML components (faster, fully animatable) vs. real screenshots of `/intake` and `/i/:token` recorded with Playwright (more "real," slower to iterate). I'd default to hand-built. Confirm.

