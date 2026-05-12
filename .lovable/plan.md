# Refactor mechanism image containers

## Problem
On the "Stop asking. Start telling." section, each step card uses `aspect-square` + `object-cover` on a dark `bg-muted` tile. The illustrations are device mockups (phone, laptop, browser) sitting on **transparent/white canvases with lots of padding**, so `object-cover` crops them and the actual screen content shrinks to a thumbnail you can't read.

## Fix (presentation-only, single file: `src/components/marketing/MechanismGrid.tsx`)

1. **Switch fit mode**: `object-cover` → `object-contain` so the full mockup is shown without cropping.
2. **Give it a readable canvas**:
   - Replace `bg-muted` with a light cream/parchment surface (`bg-[hsl(var(--pb-paper))]` or `bg-background/5` with a subtle inner ring) so the white-canvas mockups don't disappear into a dark tile.
   - Add internal padding (`p-3 sm:p-4`) so the device isn't flush to the border.
3. **Better aspect ratio**: `aspect-square` → `aspect-[4/3]` (landscape mockups read better; phone shots still center nicely with `object-contain`). Keep `overflow-hidden` and the existing border.
4. **Bigger on wide screens**: keep `Grid cols={4}` at `lg+`, but on `md` drop to 2 columns so each tile roughly doubles in size where the screenshot showed the cramped layout. Implement via a wrapper class (`md:[&>*]:col-span-2 lg:[&>*]:col-span-1`) or by passing responsive cols if the schema supports it — confirm by reading `design-system/schema.tsx`.
5. **Optional polish**: add `rounded-sm` corners to match the rest of the editorial cards and a hairline `ring-1 ring-border/60` for separation against the dark page.

No changes to copy, layout outside this card, asset files, or business logic. Visual contract tests in `src/test/landing-visual-contract.test.ts` aren't affected (they don't assert on image classes).

## Out of scope
- Replacing the source illustrations themselves
- Other image containers on the site (PublicPhotoPair, BeforeAfterSlider, etc.) — say the word and I'll extend the same treatment to them.
