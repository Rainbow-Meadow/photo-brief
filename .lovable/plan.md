## Goal
Make every editorial card on the landing page render at equal height within its row, so grids like the workflow strip (Research / Mechanism / Brief / Close) stop stair-stepping when copy lengths differ.

## Root cause
`Card` (in `src/pages/landing/schema.tsx`) maps to `.ls-card` in `src/pages/landing/schema.css`. The class sets padding, border, background — but no `height`. Inside CSS grids (`.ls-grid-*` and the ad-hoc Tailwind grids in `src/pages/Landing.tsx`), grid items default to `stretch`, but the card's intrinsic content height wins because nothing tells the card to fill its track. Result: short-copy cards shrink, tall ones expand.

## Change

**`src/pages/landing/schema.css`** — extend the `.ls-card` rule so every card is a flex column that fills its grid/flex parent:

```css
.ls-card {
  /* existing properties … */
  height: 100%;
  display: flex;
  flex-direction: column;
}
```

This is enough because:
- All landing card grids in `Landing.tsx` (lines 344, 420, 468, plus the `Grid` helper) are CSS grids whose items default to `align-items: stretch`, so `height: 100%` resolves to the row height.
- The workflow-strip cards each contain an image block + heading + body; making `.ls-card` a flex column means future `mt-auto` pinning still works and nothing in the current markup relies on intrinsic card height.

## Out of scope
- No copy or layout changes inside any card.
- No changes to `BetaSeatTracker`, `FoundingCustomerBanner`, `PricingCardGrid`, or other components that don't use `.ls-card`.
- No changes to the `Grid` helper or the Tailwind grid wrappers in `Landing.tsx`.

## Verification
After the CSS edit, scan the preview for the workflow strip, comparison pair, intel cards, and FAQ/use-case grids — each row should render flush at the bottom regardless of copy length.