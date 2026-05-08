
# Intentional Product → Beta Transition

## The Problem

Right now the page goes: Use Cases → Website Intelligence → chapter divider → FreeProSpotlight → FoundingPartnerSection → Trust Points → Agent Application → Final CTA. The jump from "here's what the product does" to "apply for a beta seat" feels abrupt because:

1. **Website Intelligence already bleeds into beta** — its heading says "For beta partners, we build the first intake" but it's positioned as a product section. There's no moment where the page explicitly shifts from "what this product solves" to "why we're looking for partners right now."
2. **The chapter divider after Website Intelligence is the same thin gradient line** used everywhere — it doesn't signal that a major tonal shift is happening.
3. **FreeProSpotlight fires immediately** — the reader goes from product feature cards directly into "2 partners get Free Pro for Life" with no emotional bridge.
4. **Trust Points are orphaned** between the beta details and the application form, breaking the momentum toward applying.

## The Fix: A "Bridge" Section + Reordering

### 1. Add a dedicated "Why a beta?" bridge section

Between the chapter divider and FreeProSpotlight, insert a short, cinematic section that explicitly shifts the tone. This is not a new feature pitch — it's the "here's why we're doing this and why it matters for you" moment.

**Content:**
- Eyebrow: `Early access`
- Headline: "We're building this with you, not just for you."
- Body: 1–2 sentences explaining that PhotoBrief is in a hands-on beta because visual intake is workflow-specific — the product gets better when real businesses shape it. This makes the beta feel like a privilege and a collaboration, not just an early-bird discount program.

**Visual treatment:** No card, no panel — just centered text with generous breathing room, similar to Apple's "chapter opening" moments. A subtle lavender → mint gradient text on the headline to signal something new.

### 2. Move Trust Points above FreeProSpotlight

Trust points (secure links, no app required, your data stays yours) currently sit between the beta details and the application form. Move them to just after the bridge section, before the rewards. This answers the natural objection ("can I trust this?") before asking them to commit.

### 3. Upgrade the chapter divider before the beta block

Replace the thin gradient line between Website Intelligence and the bridge section with a stronger visual break — a wider gradient bar or a short spacing bump — to make the tonal shift unmistakable.

### 4. Reorder the beta block

New order after the chapter break:
1. **Bridge section** (new) — "We're building this with you"
2. **Trust Points** (moved up) — security, no app, data ownership
3. **FreeProSpotlight** — reward headline
4. **FoundingPartnerSection** — benefits, expectations, accordion details
5. **Ticker 3** (beta social proof)
6. **Agent Application** — the form
7. **Final CTA**

### 5. Refine Website Intelligence headline

Change "For beta partners, we build the first intake from your website" to something product-forward: "Your website becomes your intake engine." Move the beta-specific note into the body text so the section reads as product capability, not beta perk.

## Technical details

**File changed:** `src/pages/Landing.tsx`

- New `BetaBridgeSection` component (~25 lines) — pure text, no new imports needed
- Reorder JSX blocks in the main `LandingPage` return
- Update `WebsiteIntelligenceSection` headline/body copy
- Replace one `<ChapterDivider />` with a stronger visual break (wider gradient + more spacing)
