## Goal

Replace the 8 active marketing images across Landing, Pricing, Beta, and ForAiAgents so every visual matches the smart-intake-first, photos-when-they-matter framing. One fictional tree-care brand (e.g. "Cedar & Oak") carries Landing for narrative continuity.

## Brand constants (apply to every image)

- Accent amber `#F2A33A`, cream `#F4F1EA`, dark backdrop near `60 8% 5%`.
- Tagline `Guide · Capture · Close` — never altered.
- BrandMark wordmark in two-tone (Photo cream + Brief amber) wherever the logo appears in-frame. Never an inline `<img>` for the logo.
- Mobile screenshots: phone frames matching the existing app shell dark mode. Desktop screenshots: clean macOS-style window, no overdone shadows.
- All UI mock copy must reflect the new vocabulary: "intake", "route", "brief", "ready to quote" — never "photo request" or "send photos".

## Image briefs

### 1. Landing — Hero pair
**Style:** UI screenshots inside product frames. Phone frames, both sides.
**Trade:** Tree care (introduces the Cedar & Oak narrative).
**Before** (`hero/hero-before-messy-intake.jpg`): A generic-looking inbox on a phone — 4–5 lead notifications stacked, each vague: "Hi do you do tree work?", "Need a quote", "(no subject)". Muted, slightly chaotic. Reads as the cost of a generic contact form.
**After** (`hero/hero-after-photobrief-packet.jpg`): The same phone, PhotoBrief-styled inbox — 3–4 clean briefs each labeled with route ("Emergency limb", "Full removal quote", "Stump grind"), customer name, address, readiness pill, and a thumbnail row when photos exist. Calm, ordered, amber accents.

### 2. Landing — Comparison pair
**Style:** Mixed device frames. Desktop browser left, phone right. No editorial photography.
**Story:** Same Cedar & Oak business, two different routes from the smart intake.
**Before** (`comparison/before-cedar-intake.png`): Desktop browser frame on the Cedar & Oak site showing a generic "Contact us" form with 3 fields + Submit. Honest, dated, what 90% of trade sites look like today.
**After** (`comparison/after-cedar-brief.png`): Phone frame showing two completed briefs side by side or stacked: one "Emergency limb" (photos required, urgency tag) and one "Full removal quote" (photos recommended, address, access notes). Same brand, different route, different photo policy.

### 3. Pricing — Pair
**Style:** Editorial photography (no UI). Warm, natural light. Real-feeling owner-operator energy.
**Image 1** (`pricing/pricing-cedar-owner-laptop.png`): Tight editorial shot of an owner-operator at a laptop in a small office or kitchen, scrolling a brief. Mug, paperwork, daylight. Suggests Starter/Pro tier reality. Laptop screen content visible but not the hero — implied, not crisp UI.
**Image 2** (`pricing/pricing-multi-trade-fan.png`): Editorial composition showing the same intake adapting per route — could be a flat-lay of phone(s) showing different trades' briefs (roofer, plumber, landscaper) with a soft amber wash, or a hand holding a phone with a route picker visible. Reads "one tool, every trade."

### 4. Beta — Pair
**Style:** Editorial photography. Async, calm, no video calls anywhere in either shot.
**Image 1** — rename `beta/beta-concierge-call.png` → `beta/beta-async-setup.png`: Editorial shot of a founder at a laptop typing a setup note, soft daylight, coffee, notebook with a few hand-sketched route names. Reinforces "concierge over chat, not calls."
**Image 2** (`beta/beta-feedback-thread.png`): Editorial shot framing a screen mid-feedback exchange — partner's note visible, PhotoBrief reply in amber, hands or coffee in foreground. Photographed editorially, not a clean product mock. *Note: user picked editorial style + "feedback thread in product frame" — interpreted as editorial-with-screen-content. If a true product render is preferred, swap during generation.*

### 5. ForAiAgents — Pair
**Style:** Both technical UI in dark frames. Cohesive with the rest of the page.
**Image 1** (`agents/agents-terminal-curl.png` — keep filename, replace content): Three-step request lifecycle diagram in dark UI: panel 1 = `POST /api-create-intake` curl with API key header; panel 2 = routing decision (route matched, photo policy: required); panel 3 = JSON brief response with customer + route + answers + photo URLs. Connected by thin amber arrows. Mono font, copy-real text.
**Image 2** (`agents/agents-mcp-chat.png`): Side-by-side dark UI diptych — left: AI agent chat (Claude/Cursor styling) where the agent invokes the PhotoBrief MCP tool to ask the customer guided questions; right: the assembled brief output with route, answers, and photo readiness. Shows agent + intake working together end-to-end.

## Code changes after assets land

- Update import path in `src/pages/Beta.tsx` from `beta-concierge-call` → `beta-async-setup` (filename rename).
- Update alt text on each `<img>` to match the new content (intake/brief/route language; no "photo request").
- Verify all 4 marketing pages render the new images at the existing aspect ratios; tweak `aspect-*` utilities only if dimensions change materially.
- No copy changes (already done in prior pass).

## Generation approach

- Use `imagegen--generate_image` at `standard` quality for editorial photos (Pricing, Beta) — better fidelity for human subjects and lighting.
- Use `premium` quality for any image containing legible UI text (Hero pair, Comparison pair, Agents pair) so route names, brief fields, and code remain crisp at retina.
- All outputs land in their existing `src/assets/<section>/` paths so imports keep working (except the Beta rename).

## Out of scope

- Trade illustrations (`src/assets/trades/*`), scene illustrations (`src/assets/scenes/*`), and unused legacy assets — none currently imported by marketing pages.
- Email templates, OG/social cards, app dashboard art, intake/badge product surfaces.
- Any further copy work.
