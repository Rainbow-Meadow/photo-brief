# Make every section seam active

Right now the page has 4 active seams (3 TickerBars + SectionNav) and 5 passive ones (3 `ChapterDivider` hairlines + 2 implicit alt-bg edges). Plan: turn each remaining seam into an interactive moment, keeping plain dividers only for the smallest sections.

## Seam map

```text
HERO
  ▼ [Ticker 1]                          keep
PAIN POINTS (ivory)
  ▼ hairline                            → A. ChapterMarker
BRIEF ASSEMBLY
  ▼ [Section Nav]                       keep
WORKFLOW
  ▼ implicit                            → B. Promote Comparison toggle to seam
COMPARISON (ivory)
  ▼ [Ticker 2]                          keep
  ▼ hairline                            → C. Industry chip filter
USE CASES
  ▼ implicit (ivory)                    keep — Website Intel intro acts as marker
WEBSITE INTEL (ivory)
  ▼ hairline                            → D. Re-add Ticker 3 (beta crossover)
BETA ZONE
  FOUNDING PARTNER
  ▼ implicit                            keep — small section, plain ok
  REWARD TIERS (ivory)
  ▼ implicit                            → E. "Show all details" toggle
  DETAILS ACCORDION
  ▼ hairline                            keep — dark transition is its own moment
FINAL CTA (dark)
```

## Five new active seams

**A. `ChapterMarker`** — replaces the 3 paper `ChapterDivider` calls. Editorial marker with:
- Eyebrow stamp (`CHAPTER II · The fix`)
- Hairline that animates in on scroll (CSS only)
- A 2-word swap rotating every 2.4s (`messy form → clean packet`, etc.)
Different stamp + word pair per chapter break.

**B. Promote the Before/PhotoBrief toggle into the seam above Comparison.** Today it lives mid-card. Lift it into a slim header strip between Workflow and Comparison:
- Eyebrow `SEE THE DIFFERENCE`
- Toggle `[ Before ] [ PhotoBrief ]` centered, big, hairlines above/below
The original in-card toggle is removed.

**C. Industry chip row** between Ticker 2 and Use Cases. Horizontal scroll-snap pills: `Roofing · Junk removal · HVAC · Restoration · Cleaning · All`. Active pill highlights matching `UseCaseCard`s (others dim to 40%). State-change button row as seam + filter.

**D. Re-add Ticker 3** between Website Intelligence and the Beta Zone (replaces the `ChapterDivider`):
`{N} founding partner seats · Free Pro for Life reward · {N}-day beta · Concierge setup included · Every partner earns a reward`
`tone="paper"` with a faint lavender top-border to bridge into the lavender beta zone.

**E. "Show all details" master toggle** between Reward Tiers and Beta Details. Single pill: `Show all details ⌄ / Hide details ⌃`. Opens/closes both accordion items at once. Individual accordions still toggle. State-change button as seam.

## What stays passive (intentional)

- Hero→Ticker1, Comparison→Ticker2, SectionNav→Workflow: tickers/nav already active.
- Use Cases → Website Intel: ivory alt + section intro is enough; adding more crowds C and D.
- Founding Partner → Reward Tiers: small section per user's exception.
- Beta Details → Final CTA: the dark transition is its own active moment.

## Files touched

- `src/pages/Landing.tsx`
  - New helpers: `ChapterMarker`, `ComparisonSeam`, `IndustryChipRow`.
  - Delete `ChapterDivider`.
  - Lift `activeIndustry` state into `Landing`; pass into `UseCaseSection`.
  - Update `UseCaseSection` to dim non-matching cards.
  - Move Comparison toggle out of `ComparisonSection` into the new seam.
  - Re-add `TickerBar` before the beta zone.
  - Add controlled `accordionValue` state for the master toggle in `BetaDetailsAccordion`.
- `src/index.css`
  - Keyframes `pb-rule-draw` (hairline) and `pb-word-swap` (rotating words).
  - `.pb-chapter-marker`, `.pb-comparison-seam`, `.pb-industry-chip` styles in the paper system.
  - Respect `prefers-reduced-motion` and existing `.touch-blur-reduce` rules.

## Out of scope

- No copy rewrites inside sections.
- No new images.
- No changes to the dark FinalCta or footer.
