## Problem
The hero illustration tells a 3-beat horizontal story (Guide → Capture → Close) at a 3:2 aspect ratio, but it's being rendered inside a portrait `aspect-[4/5]` frame with `object-cover` — so the right third (inbox + checkmark) gets cropped off. The grid also gives the copy column 1.4× the width of the image column, squeezing it further.

## Fix (Hero block in `src/pages/Landing.tsx`, lines ~155–208)

1. **Rebalance the grid**
   - `lg:grid-cols-[1.4fr_1fr]` → `lg:grid-cols-2`
   - `lg:items-end` → `lg:items-center` so the headline and illustration share a vertical center line.

2. **Match the frame to the source aspect**
   - `aspect-[4/5]` → `aspect-[3/2]` (matches the 1536×1024 source).
   - `object-cover` → `object-contain` with a cream background (`bg-[hsl(var(--background))]` or existing brand cream) so the full scene is visible with no cropping.
   - Keep the `border border-border`, the `Fig. 01` / `Reverse-Form Method™` corner overlay, and the BrandMark below.

3. **Subtle polish**
   - Bump `opacity-90` → `opacity-100` on the image (the muted overlay was compensating for the crop; with `object-contain` it can read at full strength).
   - Keep the existing `mix-blend-difference` corner labels — they remain legible on cream.

## Out of scope
- No copy, color token, or typography changes.
- No new assets; the same `landing-hero-illustration.png` is reused.
- No mobile-specific changes — the `grid gap-10` already stacks correctly under `lg`.

## Verify
- Open `/` at 1513×887 (current viewport) and 390×844. Confirm: full illustration visible (hand → phone → inbox), headline and image vertically centered, no cropping, no layout shift.