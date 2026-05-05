
# Seamless Site-Wide Visual Consistency

The landing page now has a unified, borderless dark aesthetic with a smooth gradient background. Several other pages still use visible card borders, alternating backgrounds, and hard dividers that break the seamless feel.

## Changes

### 1. Footer -- remove border and background tint

In `MarketingLayout.tsx`, the footer has `border-t bg-muted/30` creating a visible horizontal line and a different background band. Remove both so the footer blends into the page background.

### 2. Privacy page -- soften card borders

In `Privacy.tsx`, all content cards use `border bg-card/80` with hard rounded borders, making each section look boxed. Replace with subtle `border-white/[0.06]` (matching the landing page glass aesthetic) so cards feel embedded in the page rather than floating on it. Same for the hero header card and the contact card.

### 3. Terms page -- same card softening

`Terms.tsx` uses the same card pattern as Privacy. Apply identical treatment: soften borders to `border-white/[0.06]` and reduce the shadow intensity.

### 4. Badge chips on Privacy/Terms

The eyebrow badge chips use `border bg-background/70` which is visibly lighter than the ambient. Shift to `border-white/[0.08] bg-white/[0.04]` for a subtle glass look matching the landing page chips.

## Files affected

| File | Change |
|------|--------|
| `src/components/layout/MarketingLayout.tsx` | Footer: remove `border-t bg-muted/30` |
| `src/pages/Privacy.tsx` | Soften card borders and badge chip |
| `src/pages/Terms.tsx` | Same border softening as Privacy |

No structural or layout changes -- purely border/background refinements to eliminate visual "seams" between sections.
