## Goal

Regenerate the Landing hero so the two phones sit **side-by-side** (left: capture viewfinder, right: assembled brief) instead of stacked vertically, with an amber arrow flowing left → right between them.

## Steps

1. Generate a new photorealistic 16:9 image at `src/assets/hero-cedar-split-horizontal.png` (1920×1080):
   - Left phone: Cedar & Sons guided capture UI framed on the leaning oak (header "Cedar & Sons Tree Care · 23 Maple St", caption "Step 2 of 4 — Step back, capture the full canopy and lean", yellow shutter).
   - Right phone: assembled brief packet ("Cedar & Sons Tree Care — New Lead", "23 Maple St · 9:14 AM", 2×2 photo grid, customer notes, address with map snippet).
   - Thin amber arrow between them indicating capture → brief.
   - Off-white background, soft shadows, magazine quality, crisp UI text.
2. Update the import in `src/pages/Landing.tsx` to point at the new file.
3. Delete the old `src/assets/hero-cedar-split.png` (no longer referenced).

## Out of scope

- Hero copy, layout, or `aspect-[3/2]` frame in `Hero()` — the existing container already handles a wide image via `object-contain`.
