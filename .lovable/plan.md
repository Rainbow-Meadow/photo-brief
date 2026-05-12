# Refactor mechanism steps to alternating stacked rows

## Problem
4-column grid forces each step image to ~280px wide on desktop. The device mockups become unreadable. User confirmed contrast wasn't the issue — size is.

## New layout
Replace the 4-column `Grid` of `Card`s in `src/components/marketing/MechanismGrid.tsx` with **four full-width rows**, each split 6/6 on desktop:

```
Row 01: [ IMAGE ............ ] [ 01 / 04                ]
                                Research
                                We scan your site...
Row 02: [ 02 / 04           ] [ ............ IMAGE ... ]
        Mechanism
        The customer taps...
Row 03: [ IMAGE ............ ] [ 03 / 04                ]
Row 04: [ 04 / 04           ] [ ............ IMAGE ... ]
```

Implementation details:
- New layout lives entirely in `MechanismGrid.tsx`. Keep the exported `workflowSteps` array and `MechanismGrid` component name (consumed by `Landing.tsx` and tests).
- Each row: `grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`, image takes `lg:col-span-7`, copy takes `lg:col-span-5`. Even rows flip with `lg:[&>*:first-child]:order-2`.
- Image container: `aspect-[4/3]` (or `16/10`), full column width (~700px on a 1399px viewport — roughly 2.5× current size), light cream background (`bg-[hsl(var(--pb-paper-edge))]`), `object-contain`, modest padding so device doesn't kiss the edge.
- Copy column: keep the `01 / 04` numeral header, `ls-h3` title, `Body size="sm"` paragraph. Add a thin separator and bump the title to `ls-h2` for the larger format.
- Vertical rhythm between rows: `space-y-16 lg:space-y-24`.
- Mobile (`<lg`): single column, image stacks above copy on every row (no flip), still much larger than today.
- Stagger reveal with existing `RiseIn` per row.

## Out of scope
- Copy changes, asset swaps, animations beyond the existing `RiseIn`.
- Other sections.

Tests in `src/test/landing-visual-contract.test.ts` only assert that `MechanismSection` exists in `Landing.tsx` — unaffected.
