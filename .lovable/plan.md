## Rebalance negative space in the mechanism section

### Problem
`MechanismGrid` wraps every illustration in a fixed `aspect-[16/10]` frame at `lg:col-span-7`. Two of the four assets (steps 02 Mechanism, 03 Brief) are tall portrait phone mockups, so they sit as tiny columns inside a giant landscape box with vast empty gutters left and right. The two landscape assets (01, 04) look fine. Copy column is also top-aligned within a tall row, leaving dead space below the paragraph.

### Changes (single file: `src/components/marketing/MechanismGrid.tsx`)

1. **Tag each step with orientation.** Add `orientation: "landscape" | "portrait"` to the `workflowSteps` items:
   - 01 Research → landscape
   - 02 Mechanism → portrait
   - 03 Brief → portrait
   - 04 Close → landscape

2. **Adjust column split per orientation.**
   - Landscape rows: image `lg:col-span-7`, copy `lg:col-span-5` (current).
   - Portrait rows: image `lg:col-span-5`, copy `lg:col-span-7` so the phone has a narrower column and the copy gets more breathing room — eliminates the empty gutters around the phone.

3. **Drop the fixed aspect frame; cap height instead.**
   - Replace the `aspect-[16/10]` wrapper with a flex container: `flex items-center justify-center`.
   - Image renders at intrinsic ratio with `h-auto w-full max-h-[520px] object-contain` for landscape, `max-h-[560px] w-auto mx-auto` for portrait. Removes the giant empty box around portrait phones and keeps landscape images full-bleed within their column.

4. **Vertically center copy in each row.** Already `items-center` on the row — keep, and ensure copy column uses the row's vertical centering instead of stretching. Trim row gap from `lg:gap-12` to `lg:gap-16` for a touch more horizontal breathing room between image and copy.

5. **Tighten vertical rhythm.** Reduce `space-y-16 lg:space-y-24` to `space-y-20 lg:space-y-28` only if rows shrink noticeably — keep current values otherwise; verify in preview.

6. **Mobile (`<lg`):** unchanged single-column stack; image still renders at intrinsic ratio with same `max-h` caps so portrait phones don't dominate small screens.

### Out of scope
- Copy text, asset swaps, animations, the `SectionIntro` heading block, other sections.
- Any token/color changes.

### Verification
After edit, screenshot the section at 1399×887 to confirm:
- Portrait rows no longer have huge empty side gutters.
- Landscape rows still fill their column.
- Copy sits visually centered next to each image.
