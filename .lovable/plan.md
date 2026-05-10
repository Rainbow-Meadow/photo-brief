## Goal

Make the landing page demo serve the new Remotion video (currently `public/marketing/photobrief-spotlight.mp4`) at the existing `/marketing/photobrief-demo.mp4` path, and retire the stale file.

## Changes

1. **Replace the file**
   - Delete `public/marketing/photobrief-demo.mp4` (old render).
   - Rename `public/marketing/photobrief-spotlight.mp4` → `public/marketing/photobrief-demo.mp4`.
   - Net result: one file remains, at the path the Landing page already references and the Remotion render script already targets.

2. **Fix the runtime error introduced last turn**
   - `DemoVideoSection` was added but a duplicate/old reference is causing `ReferenceError: Can't find variable: DemoVideoSection`. Re-check `src/pages/Landing.tsx` and ensure the component is defined exactly once and in module scope before `LandingPage` uses it. No other behavior changes.

3. **No changes to**
   - Remotion source (`remotion/src/**`) — the new render is already what we want to ship.
   - `remotion/package.json` render script — it already outputs to `photobrief-demo.mp4`, so future re-renders will overwrite the renamed file correctly.
   - `.github/workflows/render-demo-video.yml` — already commits `photobrief-demo.mp4` on main.
   - The `<DemoVideoSection>` markup, poster, analytics event, or section index entry.

## Out of scope

- Re-rendering Remotion in this session (the new MP4 already exists on disk).
- Any visual or copy changes to the demo section.
