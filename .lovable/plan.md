## Goal
Use the dark-background BrandMark lockup in the landing hero so the mark + wordmark read correctly against the dark hero background.

## Change
**`src/pages/Landing.tsx`** (line 202) — set `tone="dark"` on the hero `BrandMark`:

```tsx
<BrandMark
  variant="horizontal"
  tone="dark"
  size={28}
  className="mt-6 justify-center opacity-80"
/>
```

This swaps `MarkImage` to `/brand/mark-on-dark.svg` and recolors the wordmark `Photo`/`.ai` text to cream (amber `Brief` stays). No other BrandMark instances exist on the landing page, so no other edits are needed.

## Out of scope
- BrandMark usages outside `Landing.tsx` (Auth, Signup, BetaWelcome, etc.) — those screens are on cream backgrounds and should keep their current tone.
- No changes to BrandMark component, brand assets, or color tokens.