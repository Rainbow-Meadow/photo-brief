## Goal

Rebuild the 30s product video so it follows the actual **RMBC copywriting framework** — Research, Mechanism, Benefits, Close — instead of the current Research/Mechanism/Brief/Capture/Close mash-up. Visual language (Field Manual: navy + cream + amber, Fraunces + Geist Mono, plate frames, drawn hairlines) is already on-brand and stays. Voiceover, music, and the script are rewritten to match the new structure. The committed MP4 the landing page links to (`public/marketing/photobrief-demo.mp4`) is replaced with the new render.

## The four RMBC beats (script + visuals)

Total length: **32 seconds** at 30fps = 960 frames, 4 scenes × 8s. Slower pacing than the current 6s/scene — gives each beat room to land.

### 01 — Research (the problem)
- **VO:** "Every contact form leaks. A name, an email, and 'I need a quote' — no photos, no address, no scope. So you call back. They don't pick up. The quote dies."
- **Visual:** the existing magnifier-on-wireframe scene, retimed and recropped. Add a torn "QUOTE" stamp that fades to grey at the end of the beat to physicalise the dead lead.

### 02 — Mechanism (the Reverse-Form Method™)
- **VO:** "PhotoBrief reverses the form. *You* tell the customer what to send — and the camera opens at the right angle, on the right shot, in their pocket. No app. No login. No thinking."
- **Visual:** keep the interlocking-gears motif but redraw as a phone + brief packet locking together. Amber accent on the contact point. Annotation labels the move as "RFM-METHOD / MECHANISM."

### 03 — Benefits (the new scene — replaces "Brief" + "Capture")
- **VO:** "A quote-ready packet lands in your inbox on the first reply. Photos in order. Address geocoded. Notes attached. No chasing. No callbacks. No vague leads cooling overnight."
- **Visual:** three stacked benefit plates that draw on in sequence, each with a ✓ rendered as a hairline check. Final plate stamps "READY-TO-QUOTE" in amber. This is the one fully new scene file (`SceneBenefits.tsx`).

### 04 — Close (the offer + brand)
- **VO:** "PhotoBrief. Guide. Capture. Close."
- **Visual:** mark draws on first (cream Photo + amber Brief two-tone), then the wordmark slides in beside it, then the tagline stamps below in mono. End on a still hold of the full lockup for ~20 frames. Replaces the current hexagon/key motif which doesn't reference the new BrandMark.

## Audio rebuild (`remotion/scripts/generate-audio.mjs`)

- Rewrite `SCRIPT` to the four beats above as one stitched VO take. Keep voice = George (`JBFqnCBsd6RMkjVDRZzb`), `eleven_multilingual_v2`, settings tuned slightly more declarative: `stability: 0.45, similarity_boost: 0.78, style: 0.4, speed: 0.97`.
- Regenerate `ambient.mp3` with a tighter prompt: "Sparse editorial documentary score, 32 seconds, low cello drone with a single piano note on each scene cut, no drums, no swells, restrained. Field manual aesthetic." Length bumped to 33s.
- Keep `tick.mp3` (single soft pencil tick) — re-fire on each scene cut, but drop the volume from 0.45 → 0.32 so the VO sits forward.

Audio regeneration requires `ELEVENLABS_API_KEY` (already configured as a project secret). I'll run `node remotion/scripts/generate-audio.mjs` from the sandbox; outputs land in `remotion/public/audio/` and are committed.

## Code changes

| File | Change |
|---|---|
| `remotion/src/scenes/SceneResearch.tsx` | Retime to 240 frames, add fading "QUOTE" stamp at end. |
| `remotion/src/scenes/SceneMechanism.tsx` | Replace gears with phone-locking-into-brief lockup. Retime to 240 frames. |
| `remotion/src/scenes/SceneBenefits.tsx` | **New file.** Three stacked benefit plates + READY-TO-QUOTE stamp. 240 frames. |
| `remotion/src/scenes/SceneClose.tsx` | Replace hexagon/key with two-tone BrandMark draw + wordmark + tagline. 240 frames. |
| `remotion/src/scenes/SceneBrief.tsx`, `SceneCapture.tsx` | **Delete.** Folded into Mechanism (capture) and Benefits (brief packet). |
| `remotion/src/MainVideo.tsx` | Update SCENES array to the new 4, scene length 240, `TOTAL_FRAMES = 960`. |
| `remotion/scripts/generate-audio.mjs` | New `SCRIPT`, new music prompt, bump music length to 33s. |
| `public/marketing/photobrief-demo.mp4` | Re-rendered output committed in place. |

No changes to: `src/pages/Landing.tsx` (the `<DemoVideoSection>` and "30-sec demo" label still apply), `theme.ts`, plate/label primitives, or the GitHub Actions render workflow.

## Out of scope (explicit)

- Updating the landing page's `workflowSteps` array (still Research/Mechanism/Brief/Close). Worth aligning to RMBC in a follow-up, but it touches marketing copy beyond the video.
- Captions/SRT — current video has none; not adding in this pass.
- Switching voices, fonts, color tokens, or the BrandMark contract.

## Verification

1. `node remotion/scripts/generate-audio.mjs` succeeds; three MP3s present.
2. `bunx remotion still src/index.ts main /tmp/check-{0,240,480,720,950}.png --frame=N` for each scene's mid-point — visually confirm composition, mark, and stamps render correctly.
3. Full render: `cd remotion && npm run render` → 8MB-range MP4 at `public/marketing/photobrief-demo.mp4`.
4. Landing page demo section plays the new file end-to-end.
