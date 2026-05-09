## Goal
Replace the cream/paper landing palette with a deliberate **soft navy paper** theme — one tonal family across header, hero, every section, every seam, and footer. Sections step through a 3-tone ladder for rhythm; header and footer match the page (no dark island).

## Palette (added once in `src/index.css`, all HSL)

A single navy-derived ladder. New tokens:

```
--pb-paper-0:  220 32% 96%   /* Tier 0 — base "soft navy paper" (lightest)  ~ #ECF0F7 */
--pb-paper-1:  220 30% 92%   /* Tier 1 — alt band (deeper paper)            ~ #DEE5F0 */
--pb-paper-2:  220 28% 86%   /* Tier 2 — feature band (deepest light tier)  ~ #C8D2E2 */
--pb-paper-edge: 220 30% 78% /* hairline / divider                          ~ #B0BCD0 */
--pb-ink:       219 47% 14%  /* unchanged — navy text                        */
--pb-ink-soft:  219 38% 26%  /* slightly cooler                              */
--pb-ink-muted: 219 22% 44%  /* slightly cooler                              */
--pb-amber:     33 88% 55%   /* unchanged accent (replaces violet/lavender uses) */
--pb-amber-soft:33 89% 69%
--pb-glass:     220 35% 99% / 0.72  /* header pill / floating cards          */
```

Re-point the legacy aliases (`--pb-cream`, `--pb-cream-warm`, `--pb-paper`, `--pb-panel`, `--pb-panel-2`) to the new tier values so existing components inherit the new look without rewriting every class.

## Section ladder (assignment)

```text
Header pill                  → glass on Tier 0 (frosted, 1px navy hairline)
Hero                         → Tier 0 + radial amber glow top-right
Ticker 1 (industry)          → Tier 1 (subtle band, no extra borders)
Pain Points + ROI            → Tier 0
Chapter Marker (seam A)      → Tier 1 hairline both sides, centered stamp
Brief Assembly               → Tier 0
SectionNav (sticky)          → Tier 0 glass, hairline bottom
Workflow                     → Tier 2  ← deepest light tier, anchors the middle
Comparison Seam              → Tier 1
Comparison (Before/After)    → Tier 1
Ticker 2 (product)           → Tier 0
UseCaseChipRow seam          → Tier 0 hairline
Use Cases                    → Tier 0
Website Intelligence         → Tier 1
Ticker 3 (beta crossover)    → Tier 2  ← signals entry to beta zone
Beta zone (founding partner) → Tier 0 with amber-soft tint wash
Reward Tiers                 → Tier 1
Beta Details accordion       → Tier 0
Final CTA                    → Tier 2 with amber-soft radial behind CTA
Footer                       → Tier 2, deepest light tier, navy text (no dark island)
```

This produces a deliberate cadence: 0 → 1 → 0 → 2 → 1 → 0 → 1 → 2 → 0/1 → 2, never two adjacent same-tier surfaces.

## Seam rules (every transition between sections)

- Adjacent tiers always differ by exactly one step (no jarring 0 → 2 unless preceded by a chapter marker, ticker, or seam component).
- Hairline divider (`hsl(var(--pb-paper-edge) / 0.6)`, 1px) at every same-direction tier change.
- Tickers are **always** half-step deeper than the surface they sit on; they double as connective tissue.
- Chapter markers and the Comparison Seam render as **inset rules** (centered stamp + 1px hairline left/right), not full-width bands, so the page reads as one continuous paper sheet with chapters, not boxes stacked.

## Header changes (`MarketingLayout.tsx` + `.pb-paper-pill` in `index.css`)

- Pill background: `hsl(var(--pb-glass))` with `backdrop-blur(14px)`, hairline border in `--pb-paper-edge`.
- Subtle 1px bottom shadow only, no warm glow.
- Left brand mark + right CTA buttons inherit navy text.
- On scroll the page shows through the pill thanks to the new cooler base — no more cream-warm leak.

## Footer changes (`MarketingLayout.tsx`)

- Remove `pb-footer-dark` and `pb-dark-island` classes when on the landing route.
- Background = Tier 2, text = `--pb-ink-soft`, links = `--pb-ink` on hover, amber underline on focus.
- Top hairline in `--pb-paper-edge` to seal the page.
- BrandMark switches back to `tone="light"` (navy on paper).

## Hero / accent / illustration

- Hero halo: amber-soft radial (`hsl(var(--pb-amber-soft)/0.18)` blur 110px) — keeps amber as the only "warm" accent against the new cool base.
- Illustration drop-shadow recolors to `hsl(var(--pb-ink) / 0.18)` so shadows feel cool, not warm.
- BetaSeatTracker progress bar: empty segments use `--pb-paper-edge`, filled use `--pb-amber`.

## Component touch-ups (no rewrites, just tier-correct backgrounds)

- `.pb-section-alt` → re-point to Tier 1.
- `.pb-beta-zone` → re-point its base to Tier 0 with a soft amber wash.
- `.pb-card` on the new paper surface → background `hsl(var(--pb-glass))`, hairline `--pb-paper-edge/0.5`, shadow `0 18px 50px -34px hsl(var(--pb-ink)/0.22)`.
- `.pb-command-panel` background switches to a light-navy gradient so the inset panels still pop.
- ROI calculator gradient (currently `from violet/0.10 via ink to lavender/0.06`): re-point to amber-soft tints on Tier 1 so it stops looking like a dark island.

## Files touched

1. `src/index.css` — palette tokens, `.pb-landing`, `.pb-paper-surface`, `.pb-paper-pill`, `.pb-section-alt`, `.pb-beta-zone`, `.pb-on-paper` overrides for paper-edge borders, `.pb-card`, `.pb-command-panel`, hairline utility class.
2. `src/components/layout/MarketingLayout.tsx` — drop dark-footer classes on landing, set footer container to Tier 2, switch footer BrandMark tone to `light`.
3. `src/pages/Landing.tsx` — assign tier classes per section per the ladder above (mostly swapping `pb-section-alt` placement, adding `pb-tier-2` to Workflow / Final CTA wrapper, switching one ticker to deeper tone).
4. `src/components/marketing/BetaSeatTracker.tsx` — progress bar empty segments use `--pb-paper-edge`.

## Out of scope

- Authenticated app shell (`--app-*` tokens) — untouched.
- Other marketing pages (Pricing, Auth) inherit the new tokens automatically; no per-page edits.
- Copy, layout, illustrations, components — no changes beyond color swaps.
- No reintroducing dark mode.

## Verification

After implementation, screenshot the landing at 1487×887 and at mobile 390×844, scrolling top → bottom, and confirm:
1. No cream/warm tone remains anywhere.
2. Each section's background is one of the three tiers, no two adjacent sections share a tier (except where separated by a ticker/seam).
3. Header pill and footer both visibly belong to the same family as the body.
4. Amber is the only warm color; everything else is the navy ladder.
