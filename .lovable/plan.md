
# Rebuild Spotlight Video — SaaS Best Practices

## What changes

The current video is ~67 seconds with 8 scenes covering many features (website intake, routing, capture, AI checks, briefs, closing). The uploaded guide says to **focus on ONE core feature** and keep it 60-90 seconds.

**The one feature:** The end-to-end request flow — create a photo request, customer captures photos on their phone, you get a ready-to-act brief. This is PhotoBrief's core loop and the easiest to grasp.

## New video structure (~60 seconds, 1800 frames at 30fps)

### Scene 1 — Hook (0-3s, 90 frames)
Pain-point text animation: **"Your customers have the photos you need. They just don't know which ones."** Dark background, large kinetic type, no logo yet. Grabs attention with a relatable frustration.

### Scene 2 — Logo + Value Prop (3-6s, 90 frames)  
Logo reveal + one-line value prop: **"PhotoBrief tells them exactly what to send."** Clean, confident, fast. Establishes what the product does in one sentence.

### Scene 3 — Product Demo: Create Request (6-18s, 360 frames)
Show the dashboard UI: creating a new request, picking a template, adding a customer name + email. Typing animation for form fields. Ends with "Send request" button press and success confirmation. Conversational caption: "Pick a template. Add their name. Hit send."

### Scene 4 — Product Demo: Customer Capture (18-32s, 420 frames)
Phone mockup showing the customer experience: open link, see guided photo steps, take photos one at a time with simple instructions. Progress bar fills. Photos stack up. Caption: "They open a link. No app. No account. Just photos."

### Scene 5 — Product Demo: Brief Arrives (32-46s, 420 frames)
Back to dashboard: the completed brief with organized photos, AI quality notes, customer answers, and a summary. Caption: "You get the photos, organized, checked, and ready to act on."

### Scene 6 — Closing CTA (46-60s, 420 frames)
Dark background. Logo. One bold line: **"Stop chasing photos. Start getting briefs."** CTA pill: "Try PhotoBrief free" + "photobrief.ai". No fake button — just a clear action statement. Clean, resolved ending.

## Creative direction

- **Same brand palette** — Graphite + Electric Violet (existing `theme.ts`)
- **Same font** — Inter (already loaded)
- **Motion style** — Cinematic minimal. Slow confident reveals for text, snappy springs for UI elements. No bouncy playfulness.
- **Transitions** — Direct crossfade via opacity. No flashy wipes.
- **Tone** — Conversational, benefit-focused. Every caption answers "why should I care?" not "what does this do?"

## Files modified

- `remotion/src/MainVideo.tsx` — rewritten with 6 scenes (down from 8), tighter timing
- `remotion/src/scenes/` — existing scene files left as-is (they're from an older composition); new scenes built inline in MainVideo or as new files
- `remotion/src/theme.ts` — unchanged
- `remotion/src/components/` — reuse existing primitives

## Rendering

Render via the existing `remotion/scripts/render-remotion.mjs` script to `/mnt/documents/photobrief-demo.mp4`. Spot-check key frames with `bunx remotion still` before full render.
