## Goal
Balance the hero section so the right-side illustration fills its column instead of floating small in lots of empty space.

## Changes (single file: `src/pages/Landing.tsx`, hero block lines ~349–451)

1. **Rebalance the column ratio**
   - Change grid from `lg:grid-cols-[1.1fr_0.9fr]` to `lg:grid-cols-2` so the right column has equal width to grow into.

2. **Let the illustration fill its column**
   - Remove the `max-w-md` / `sm:max-w-lg` caps on the `<img>`.
   - Make it `w-full` with no max width on `lg`, anchored right (`lg:justify-end` already there).
   - Add a soft scale-up on large viewports (`lg:scale-110 lg:translate-x-4` or similar) so it visually anchors the column without being cropped.
   - Keep aspect ratio intact (1024×1024 source).

3. **Grow the lavender glow halo**
   - Bump the halo from `max-w-md` / `blur-[80px]` to roughly `max-w-xl` / `blur-[110px]` and shift it slightly behind the phone so the right side reads as a finished composition rather than a small illustration on white.

4. **Vertically center alignment stays** (`items-center` on the grid) — the illustration grows to roughly match the height of the left column instead of sitting short.

## Out of scope
- No new copy, no new sections, no changes to the seat tracker, trades strip, or CTAs.
- No changes outside the hero grid block.
- No design-token changes.

## Verification
- Reload `/` at 1403×887 (current viewport) and confirm the illustration column is visibly fuller and roughly column-balanced with the copy.
- Spot-check `sm` (≥640px single column) and `lg` (≥1024px two column) to make sure nothing overflows horizontally.
