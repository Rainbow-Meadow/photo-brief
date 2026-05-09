# Hero alignment + consistency pass

The hero is positioned where you want it. Auditing the markup shows a few inconsistencies between individual pieces — different sizing for sibling elements, asymmetric padding, and one label that escaped the design tokens. This plan aligns them without moving anything.

## Issues found

1. **Asymmetric outer padding.** The grid has `pl-[84px]` on the left only and nothing on the right, so the right column hugs the viewport edge. It's also a fixed value at every breakpoint, which overflows on mobile.
2. **"Built for" label is off-system.** Uses `font-black … text-base` while every other small-caps label in the hero (Eyebrow, trust strip, etc.) uses the `text-[10px] tracking-[0.28em]` pattern.
3. **Trade pill icons are stretched.** `w-[37px] h-[27px]` (a leftover from a different lucide class) gives them a non-square aspect and they tower over the pill text. Sibling inline icons in this same hero use `h-3.5 w-3.5` / `h-4 w-4`.
4. **Trust-strip spacing breaks the rhythm.** Every other left-column block uses paired `mt-X sm:mt-Y` (e.g. `mt-6 sm:mt-8`). The trust strip is `mt-6` only.
5. **Brand mark wrapper has `overflow-hidden`.** Now that we sized the wordmark down, the clip guard isn't needed and just risks hiding the trailing `.ai`.
6. **Right column wrapper has unused `relative`.** Minor — only the inner illustration container needs it for the blur backdrop.

## Changes (all in `src/pages/Landing.tsx`, hero block ~line 348–453)

- **Outer grid wrapper**
  - `pl-[84px]` → `px-0 lg:pl-20 lg:pr-8` so the offset only kicks in at desktop and is balanced on the right.
- **"Built for" label**
  - Replace classes with the same token used by `Eyebrow`: `text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--pb-ink-muted))]`.
- **Trade pill icon**
  - `lucide lucide-trending-down w-[37px] h-[27px] text-[hsl(var(--pb-violet))]` → `h-4 w-4 text-[hsl(var(--pb-violet))]` (square, matches the pill's text size).
- **Trust strip spacing**
  - `mt-6 flex flex-wrap …` → `mt-6 sm:mt-8 flex flex-wrap …` so it follows the same paired-rhythm as its neighbors.
- **Right column brand mark wrapper**
  - Drop `overflow-hidden` from the wordmark container; the responsive sizes already fit.
- **Right column root**
  - Drop the unused `relative` (kept on the inner illustration wrapper that owns the blur).

## Out of scope
- Layout/positioning changes — the column structure, brand-mark-above-phone arrangement, and BetaSeatTracker placement stay exactly as they are.
- Copy, tokens, or BrandMark internals.
