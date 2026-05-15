## Goal

Kill the static tile-grid idea. Reuse the existing **MarqueeBand** as the visual proof — but feed it monochrome platform marks instead of the current word loops. The marquee already conveys "this works everywhere" through motion; logos make it literal.

## Section anatomy

Slot order on `Landing.tsx`:

```text
<Hero />
<OneLinkAnywhereSection />   ← new [ 01 ]: heading + subhead + 3-step strip + logo marquee
<MechanismSection />         ← stays [ 02 ]
<ComparisonSection />        ← [ 03 ]
<SignpostSection />          ← [ 04 ]
<FaqSection />               ← [ 05 ]
<FinalCta />
```

The current `<MarqueeBand />` (Guide/Capture/Close + Reverse-Form Method™ word loops) is **deleted** from the page. The motion lives on inside the new section as the logo strip.

### Layout

```text
┌──────────────────────────────────────────────┐
│ [ 01 ]  ✦ Works where you already work       │
│                                              │
│  One link. Drop it anywhere customers        │
│  already find you.                           │
│                                              │
│  Your site already works. Your booking tool  │
│  already works. We don't replace any of it — │
│  we replace the form that's losing you jobs. │
│                                              │
│  ── 3-step paste-it strip ───────────────    │
│  01 Copy your link  02 Paste it where        │
│  customers click    03 Briefs land ready     │
│                     to quote                 │
│                                              │
│  ┌── full-bleed marquee band ────────────┐   │
│  │  → Wix · Squarespace · Webflow ·      │   │
│  │    WordPress · Shopify · Carrd ·      │   │
│  │    Instagram · Linktree · Google …    │   │
│  ├────────────────────────────────────────┤   │
│  │  ← SMS · Email · QR code · Facebook · │   │
│  │    TikTok · Google Business · …       │   │
│  └────────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

Two `MarqueeRow` rows, opposite directions, just like today's word marquee — but each item is `<PlatformMark /> <span>Name</span>` instead of a phrase. Same band container styling: `border-y border-border bg-[hsl(var(--accent-kinetic)/0.08)]`, same `ls-marquee-item` rhythm with ghost dots between groups.

## Copy (Kyle voice)

- **Eyebrow**: `[ 01 ] ✦ Works where you already work`
- **H2**: `One link. Drop it anywhere customers already find you.`
- **Subhead**: `Your site already works. Your booking tool already works. We don't replace any of it — we replace the form that's losing you jobs.`
- **3-step strip**:
  - `01 — Copy your Smart Intake link.`
  - `02 — Paste it where customers already click.`
  - `03 — Briefs land in your inbox, ready to quote.`
- **Marquee row 1** (right→): `Wix · Squarespace · Webflow · WordPress · Shopify · Carrd · Instagram · Linktree · TikTok · Facebook`
- **Marquee row 2** (←left): `SMS · Email signature · QR code · Google Business · WhatsApp · Messenger · Voicemail link · Booking page` (bridges social + outreach groups so motion never feels repetitive)

The marquee carries the "it goes anywhere" beat without needing labeled buckets — which is the point.

## Implementation details

1. **New file `src/components/marketing/OneLinkAnywhereSection.tsx`**
   - Renders `<Section>` + `<Container>` with `SectionIntro` (eyebrow + title + subhead).
   - Renders the 3-step `<ol>` (mirrors `MechanismGrid`'s rhythm).
   - Renders the two-row marquee band inline, using `MarqueeRow` from `@/components/motion/MarqueeRow`.
   - Marquee items: `<span class="ls-marquee-item inline-flex items-center gap-2"><Mark className="h-4 w-4" /> Name</span>` separated by the existing `ls-marquee-item--ghost` `·` dots.

2. **New SVG marks under `src/components/marketing/icons/platforms/`**
   - One file per mark, single-color via `currentColor`, sized through className.
   - Set: `WixMark`, `SquarespaceMark`, `WebflowMark`, `WordpressMark`, `ShopifyMark`, `CarrdMark`, `InstagramMark`, `FacebookMark`, `LinktreeMark`, `TiktokMark`, `WhatsappMark`, `MessengerMark`, `GoogleBusinessMark`.
   - SMS / Email / QR / Voicemail / Booking reuse `lucide-react` (`MessageSquare`, `Mail`, `QrCode`, `Voicemail`, `CalendarClock`) wrapped to a common `MarkProps` shape so the marquee item code is uniform.
   - Re-drawn from open simple-icons style outlines, no brand fill colors (trademark-safe).
   - Barrel export `src/components/marketing/icons/platforms/index.ts`.

3. **`src/pages/Landing.tsx`**
   - Delete the local `MarqueeBand` function.
   - Remove its `<MarqueeBand />` slot from the `Page` body.
   - Remove the `MarqueeRow` import (now consumed inside the new section, not Landing directly).
   - Import + render `<OneLinkAnywhereSection />` between `<Hero />` and `<MechanismSection />`.

4. **No new design tokens. No new CSS classes.** Reuse `ls-marquee-item`, `ls-marquee-item--ghost`, `ls-marquee-item--accent`.

5. **Touch behavior** — `MarqueeRow` already respects reduced-motion / touch; nothing extra needed. Marks are decorative inside an aria-labelled list, no hover affordance.

6. **Accessibility**
   - Section: `aria-labelledby` on H2.
   - 3-step strip: `<ol>` with `<li>` items.
   - Marquee band: wrapped in `<div role="list" aria-label="Platforms PhotoBrief drops into">`, each item `role="listitem"` with `aria-label="{platform name}"`. Decorative `·` dots get `aria-hidden`.

## Tests

`src/test/landing-one-link-section.test.ts`:
- Renders `Landing`, asserts the new H2 text is present.
- Asserts the 3-step `<ol>` has exactly 3 `<li>` children.
- Asserts the platform marquee container is present and contains at least 14 platform `aria-label`s.
- Asserts the **old** `MarqueeBand` content (`Reverse-Form Method™`, `Guide` word loop) is **gone**.
- Asserts new section appears in DOM order **before** the existing `[ 02 ] The mechanism` eyebrow.

Existing `landing-visual-contract`, `landing-typography`, `landing-tokens` tests stay untouched — confirm they still pass after the marquee swap.

## Out of scope

- No backend changes.
- No real-color brand logos. Monochrome only.
- No clickable tiles / outbound links.
- No analytics events on marquee items.
- No changes to `MarqueeRow` itself — it stays a generic primitive.

## Risk

- **Trademark**: monochrome silhouettes for compatibility purposes are standard, but if legal pushes back the marquee can swap to typographic-only by deleting the icon component from each item — one-line change inside `OneLinkAnywhereSection.tsx`.
- **Lost copy**: the deleted word marquee carried the `Reverse-Form Method™` phrase and the `Guide · Capture · Close` tagline. Tagline already lives in the BrandMark/footer; if anyone wants `Reverse-Form Method™` preserved on the landing page, it can move into the FinalCta or the Mechanism eyebrow — flag at implementation time.
