
# Spotlight Video: Product Demo + Beta Recruitment

## Overview

Extend the current ~60s video to ~90s by keeping the existing product demo scenes (hook, create request, customer capture, brief arrives) and appending beta recruitment scenes. The video first shows what PhotoBrief does, then pitches the founding partner beta.

## Updated Structure (~90 seconds, 2700 frames at 30fps)

### Scene 1 -- Hook (0-3.3s, 100 frames) -- KEEP AS-IS
Pain-point text: "Your customers have the photos you need. They just don't know which ones."

### Scene 2 -- Logo + Value Prop (3.3-6.3s, 90 frames) -- KEEP AS-IS
Logo reveal + "Tells them exactly what to send."

### Scene 3 -- Create Request Demo (6.3-18.3s, 360 frames) -- KEEP AS-IS
Dashboard form demo with typing animation.

### Scene 4 -- Customer Capture Demo (18.3-32.3s, 420 frames) -- KEEP AS-IS
Phone mockup showing guided photo capture.

### Scene 5 -- Brief Arrives (32.3-46.3s, 420 frames) -- KEEP AS-IS
Completed brief with photo grid, AI checks, summary.

### Scene 6 -- Beta Transition (46.3-50s, 110 frames) -- NEW
Dark background. Text: **"We're building this with you."** Kicker pill: "Founding Partner Beta". Brief pause to shift tone from demo to recruitment.

### Scene 7 -- What Partners Get (50-62s, 360 frames) -- NEW
Left: heading "What founding partners get". Right: benefit cards staggering in:
- 60 days free access
- Concierge setup for your first templates
- Direct feedback channel + priority input
- Early access to future tools
- Up to 75% off post-launch

Caption: "Everything you need to start. Nothing to lose."

### Scene 8 -- Reward Tiers (62-74s, 360 frames) -- NEW
Five tier cards/rows animating in (Top 2: Free Pro for life, Elite: 75% off forever, Strong: 50% off forever, Solid: 75% off first year, Participating: 50% off first year). Emphasize "Free Pro for life" with a glow/scale accent on the top tier. Caption: "Rewards based on feedback quality, not usage volume."

### Scene 9 -- Closing CTA (74-90s, 480 frames) -- REWRITE EXISTING
Dark background. Logo. Bold text: **"30 seats. 60 days. Your feedback shapes the product."** CTA pill: "Apply for the founding beta" + "photobrief.ai". Subtle "30 of 30 seats open" counter. Pulsing glow, clean resolved ending.

## Technical Details

- Rewrite `remotion/src/MainVideo.tsx` -- keep Scenes 1-5 intact, add 3 new scene functions (SceneBetaTransition, ScenePartnerBenefits, SceneRewardTiers), rewrite SceneClosing
- Update `TOTAL_FRAMES` to ~2700 and composition `durationInFrames` in `Root.tsx`
- Reuse all existing primitives and theme -- no new dependencies
- After code changes: render to `/mnt/documents/photobrief-spotlight.mp4`, regenerate GIF preview and thumbnail
