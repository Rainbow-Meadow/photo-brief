
# Landing Page Layout Harmonization

## Problems Found

1. **Hero is too tall on desktop** — the dual-phone interactive demo is inside the hero's `lg:grid-cols` layout, causing the hero to stretch vertically to accommodate ~800px of phone content. The hero text and the demo compete for attention.
2. **Interactive demo has redundant header** — "See how a PhotoBrief comes together" title + subtitle inside the hero grid is redundant alongside the main hero headline.
3. **Section gaps are uneven** — the space between Comparison → Use Cases and Use Cases → Founding Beta is visibly larger than other section transitions (roughly 200px of dead dark space).
4. **Use case cards orphan** — 5 cards in a 3-col grid leaves 2 orphans on the bottom row, creating asymmetry.
5. **Section Nav** isn't sticky-visible when scrolling — it sits between the very tall hero and the workflow section, often hidden.

## Changes

### 1. Separate Interactive Demo from Hero (`Landing.tsx` — `HeroSection`)
- Remove `<InteractiveHeroBriefAssembly />` from inside the hero's grid
- Place it as its own standalone section below the hero (but above `SectionNav`)
- Remove the hero's `lg:grid-cols-[0.88fr_1.12fr]` layout — hero becomes a simple centered/left-aligned block
- The interactive demo keeps its own header ("See how a PhotoBrief comes together")

### 2. Tighten Hero (`Landing.tsx` — `HeroSection`)
- Remove the 2-column grid; hero content flows as a single centered or left-aligned column
- Reduce bottom padding: `pb-12 sm:pb-14 lg:pb-20` → `pb-8 sm:pb-10 lg:pb-14`
- This makes the hero fit in ~one viewport on desktop

### 3. Create InteractiveDemo section (`Landing.tsx`)
- New `<section>` wrapping `<InteractiveHeroBriefAssembly />` with `pb-section-tight` spacing
- Centered layout, max-width constraint for the phone pair
- Remove the inline header from the component since it's now a standalone section

### 4. Normalize section spacing (`index.css`)
- `pb-section`: keep `clamp(3.5rem, 7vw, 7rem)` — fine for primary sections
- `pb-section-tight`: tighten to `clamp(2.5rem, 4.5vw, 4rem)` (was `clamp(3rem, 5.5vw, 5rem)`)
- This reduces the dead-space gaps between sections

### 5. Use case grid fix (`Landing.tsx` — `UseCaseSection`)
- Change from `lg:grid-cols-3` to `md:grid-cols-2 lg:grid-cols-3` with the 5th card spanning or centering
- Or: keep 5 cards but add `last:md:col-span-2 last:lg:col-span-1` to center the orphan row

### 6. Consistent section header spacing
- All sections use the same pattern: eyebrow → mt-4 → title → mt-4 → body → mt-8 → content
- Audit each section for deviations (some use mt-5, some mt-4, some mt-3) and normalize

## Files Modified
- `src/pages/Landing.tsx` — restructure hero, create demo section, normalize spacing
- `src/index.css` — tighten `pb-section-tight`
- `src/components/marketing/InteractiveHeroBriefAssembly.tsx` — adjust header (may keep or simplify since it becomes standalone)
