# Smooth the page-end transitions

Right now the bottom of the page reads as three hard bands stacked on top of each other:

```text
[ lavender beta zone        ]   ← light
─── hard line ───
[ dark FinalCta             ]   ← dark navy
─── hard line ───
[ cream footer (default bg) ]   ← light
```

Two seams, both visible. Goal: make the dark closer feel intentional and continuous.

## Changes

1. **Soften the top edge of the dark zone** (`src/index.css` → `.pb-final-dark`)
   - Replace the hard `border-top` with a tall radial/linear fade so the lavender beta zone bleeds into the dark navy over ~80px instead of cutting at a 1px line.
   - Keep the existing violet glow inside the dark zone.

2. **Let the page end in dark** — extend the dark island through the footer
   - Add a `.pb-footer-dark` modifier in `src/index.css` that matches the `.pb-final-dark` deep navy (no top border, no bottom fade — it's the very end of the page).
   - In `src/components/layout/MarketingLayout.tsx`, give the `<footer>` a route-aware class: when the current route is the landing page (`/`), apply `pb-footer-dark pb-dark-island` so the footer continues the dark surface and BrandMark/links/copyright stay legible. On all other routes it stays as-is.
   - Tighten the visual handoff: tiny `border-top: 1px solid hsl(var(--pb-violet) / 0.18)` between FinalCta and footer for a hairline editorial seam (not a hard color change).

3. **Footer text colors on the dark variant**
   - Footer already uses `text-[hsl(var(--pb-muted))]`, `hover:text-white`, and `text-white/36` — those read fine on dark. No copy changes needed; just confirm contrast inside `.pb-dark-island` (which preserves the white tokens).

## Files touched

- `src/index.css` — update `.pb-final-dark` top edge; add `.pb-footer-dark`.
- `src/components/layout/MarketingLayout.tsx` — apply the dark footer class only on the landing route via `useLocation()`.
- `src/pages/Landing.tsx` — no change (the FinalCta wrapper stays).

## Out of scope

No changes to the beta zone palette, FinalCta copy, or any earlier section. No new components.
