# BetaList submission images — 5-shot deck

Output: 5 PNGs at **1600×1200 (4:3, retina-grade for an 800×600 slot)**, saved to `/mnt/documents/betalist/`. All on PhotoBrief brand: near-black `#0D0D0B`, cream `#F4F1EA`, amber `#F2A33A`. BrandMark in cream. Inter-style typography, Kyle Milligan voice — no hype words, no exclamation points.

## The 5 shots

**01_hero.png — Statement card (mockup)**
Big cream headline left-aligned: **"Guide. Capture. Close."** Smaller amber kicker above: "Smart intake for service businesses." On the right, a floating dark "Brief #1042" card mockup peeking in (customer name, address, 3 answers, photo thumbnail, "Ready to quote" amber pill). Subtle grain + amber gradient bloom bottom-right. BrandMark top-left, `photobrief.ai` bottom-right.

**02_intake_setup.png — Real /intake screenshot, framed**
Capture the setup hub from preview (signed in as a seed user with a real workspace — Apex Roofing). Place in a soft dark window frame (subtle title bar, no traffic-light kitsch since brand is dark). Caption strip top: **"Scan your site. Get routes, questions, and a photo policy in 60 seconds."** Kicker: "Setup".

**03_recipient_intake.png — Real /i/:token in iPhone frame**
Open a published intake link in the preview at mobile width (440px), screenshot one of the guided question screens. Drop into a dark iPhone-style frame, centered on a cream→amber radial. Caption right: **"Your form gives you a name. We give you a brief."** Kicker: "What the customer sees".

**04_brief.png — Real completed brief, framed**
Screenshot the operator's brief view (route, contact, answers, photos, readiness score, next action). Frame as in 02. Caption top: **"Quote on the first reply."** Sub-caption: "Every brief lands ready — or tells you exactly what's missing." Kicker: "What lands in your inbox".

**05_photo_policy.png — Concept card (mockup)**
4-tile grid showing the four photo states with one-line operator copy each:
- `not_needed` — "Don't ask. Don't slow them down."
- `optional` — "Offer it. Don't block it."
- `recommended` — "Tell them why a photo helps."
- `required` — "No photo, no brief."
Headline above: **"Photos when they matter. Not when they don't."** Kicker: "Photo policy". Amber accent on the active "recommended" tile.

## How they get built

1. **Brand probe** — read `src/index.css`, `tailwind.config.ts`, `BrandMark` component to lock exact tokens, fonts, and the two-tone wordmark SVG. Read `mem://design/brand-system` and `mem://seed-users` to pick a workspace with believable seed data for screenshots.
2. **Real screenshots** (shots 02, 03, 04):
   - Sign in as the appropriate seed user via `browser--navigate_to_sandbox` + `browser--act`.
   - For 03, set viewport to 440×900 before navigating to a real published `/i/:token`.
   - Use `browser--screenshot`, save to `/tmp/`.
3. **Composition** — single Python/Pillow script (`/tmp/build_betalist.py`) that:
   - Loads brand tokens as constants.
   - Loads Inter + Inter Tight via `@fontsource` files already in the repo (or downloads via `urllib` to `/tmp/fonts/` if needed).
   - Renders each of the 5 canvases at 1600×1200, composites real screenshots into dark window/iPhone frames with rounded corners + soft shadows, draws headline/kicker/BrandMark.
   - Writes PNGs to `/mnt/documents/betalist/01_hero.png` … `05_photo_policy.png`.
4. **Hero & policy mockup chrome** — drawn directly in Pillow (no AI image gen needed; keeps it on-brand and crisp). Brief card on hero is a faux-UI render (rounded rect, real-looking field labels).
5. **QA pass** — for each PNG: open with `code--view`, check no overlap, no clipping, BrandMark legible, headline contrast ≥ AA, no orphan words, 4:3 exactly. Re-render until clean. Report what was checked.
6. **Deliver** — `<presentation-artifact>` tags for all 5 PNGs plus a zipped bundle `betalist_premium.zip`.

## Brand & copy guardrails

- BrandMark always cream-on-dark (`tone="dark"`), never inline `<img>` look-alike.
- No "AI-powered", no "revolutionary", no "seamless", no exclamation points.
- Tagline canonical form: **Guide · Capture · Close** (middots, not periods) on small/footer use; **"Guide. Capture. Close."** allowed only in the hero headline since you specified periods.
- Plan pricing not shown anywhere (BetaList isn't a pricing page).
- "Lovable Cloud"/"Supabase" never visible.

## What this plan does NOT do

- No new code in `src/`. No edits to the app.
- No mock data injected into the DB — uses existing seed workspace data only.
- No carousel page added to the marketing site (separate request if you want one).
- No video/GIF — BetaList submission is stills only per your screenshot.

## Open question I'm assuming the answer to (tell me if wrong)

- I'll use the **Apex Roofing** seed workspace for the real screenshots (roofer = clearest BetaList narrative). Say the word if you'd rather see HVAC or claims.
