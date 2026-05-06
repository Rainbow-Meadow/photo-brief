## Update Button, Card, and Modal for platform-aware behavior

### 1. Add platform-aware CSS utilities to `src/index.css`

Append new utility classes inside `@layer utilities`:

- **`.pb-btn-platform`** — base class applied to all buttons:
  - `@media (hover: hover)`: `duration-200` transition, hover lift (`-translate-y-px`), hover shadow upgrade on glass/primary variants, `hover:brightness-[1.04]` on default
  - `@media (hover: none)`: `min-height: 44px` touch target, `active:scale-[0.97]` press feedback, `duration-150` faster transition, no hover-dependent styles
  - `@media (max-width: 767px)`: enforces `min-h-[44px]` on all buttons

- **`.surface-card-interactive`** update (already partially exists):
  - `@media (hover: hover)`: hover lift + shadow upgrade + border highlight transition (260ms)
  - `@media (hover: none)`: `active:scale-[0.98] active:opacity-90` with 100ms transition

### 2. Update `src/components/ui/button.tsx`

- Add `pb-btn-platform` to the base `cva()` string
- Move hover-specific classes (`hover:brightness-[1.04]`, `hover:-translate-y-px`, `hover:shadow-glass-lg`, `hover:bg-[...]`) out of variant strings — they're now handled by the CSS media queries in `.pb-btn-platform` and variant-specific `@media (hover:hover)` rules
- Keep `active:translate-y-0` on `pb-primary`/`pb-secondary` for desktop press reset
- No API changes — `ButtonProps` stays identical

### 3. Update `src/components/ui/card.tsx`

- Add an `interactive?: boolean` prop to `Card`
- When `interactive` is true, add `surface-card-interactive cursor-pointer` class (platform behavior handled by CSS)
- Adjust `CardHeader` padding: `p-4 sm:p-6` (tighter on mobile)
- Adjust `CardContent` padding: `p-4 pt-0 sm:p-6 sm:pt-0`
- Adjust `CardFooter` padding: `p-4 pt-0 sm:p-6 sm:pt-0`
- Adjust `CardTitle` size: `text-xl sm:text-2xl`

### 4. Update `src/components/ui/dialog.tsx`

- Import `useIsMobile` from `@/hooks/use-mobile`
- Import `DrawerContent`, `DrawerClose` from `@/components/ui/drawer`
- Keep the existing desktop `DialogContent` as an internal `DesktopDialogContent`
- Create a new `DialogContent` wrapper that:
  - On mobile (`useIsMobile()`): renders children inside `DrawerContent` (bottom sheet) with a close button
  - On desktop: renders the existing centered modal with backdrop blur and zoom animation
- `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` remain unchanged
- No changes to consumer code — the platform switch is automatic

### Files changed

| File | Change |
|------|--------|
| `src/index.css` | Add `.pb-btn-platform` with hover/touch media queries |
| `src/components/ui/button.tsx` | Add platform base class, clean hover-only styles into CSS |
| `src/components/ui/card.tsx` | Add `interactive` prop, responsive padding, platform card feedback |
| `src/components/ui/dialog.tsx` | Auto bottom-sheet on mobile via Drawer, centered modal on desktop |
