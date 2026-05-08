
# Separate Desktop vs Touch UX

The project already has strong foundations:
- Tailwind's `hoverOnlyWhenSupported: true` wraps all `hover:` utilities in `@media (hover: hover)`, so they already don't fire on touch devices
- CSS in `index.css` already has `@media (hover: hover)`, `@media (hover: none)`, and mobile-width overrides
- The design system has separate desktop/mobile token sets

The remaining gaps are:

## 1. Suppress expensive effects on touch devices (index.css)

Add to the existing `@media (hover: none)` / mobile blocks:
- Disable `pb-lens-field` (radial gradient overlays) — they cause compositing overhead during scroll
- Reduce `backdrop-blur` values on sticky nav (e.g. `backdrop-blur-xl` to `backdrop-blur-sm`)
- Kill `animate-sheen` infinite animation
- Kill `animate-ping` on the interactive hero (or reduce to a static dot)
- Disable decorative blur blobs (`blur-[60px]`, `blur-[50px]`) — replace with simpler opacity gradients or hide entirely

## 2. Add `will-change` and containment for scroll performance (index.css)

- Add `contain: layout style paint` to `.pb-card` on touch devices to isolate repaints
- Add `will-change: transform` only to elements that actually animate (sticky nav), not broadly

## 3. Remove `active:scale-[0.98]` from non-button elements (InteractiveHeroBriefAssembly.tsx)

The interactive hero has `active:scale-[0.98]` on several div-like containers. On touch, any press-and-drag (scroll attempt) triggers the scale transform, fighting smooth scroll. These should be buttons or have the active effect removed on touch.

## 4. Ensure `.pb-card:hover` transform is fully suppressed on touch (index.css)

The existing `@media (hover: hover)` block handles `.pb-card:hover` — but there's no explicit neutralization in `@media (hover: none)`. Add:
```css
@media (hover: none) {
  .pb-card { transition: none; }
}
```

## 5. Disable floating decorative elements on mobile (Landing.tsx)

The three `pb-lens-field` divs and decorative blur blobs are purely visual. On mobile/touch, hide them with a CSS class or conditional rendering using the existing `useIsMobile()` hook (already available but not used in Landing.tsx).

## Files to change

| File | Change |
|------|--------|
| `src/index.css` | Add touch-device rules: suppress lens-field, reduce blur, kill sheen/ping, add containment, neutralize card transitions |
| `src/pages/Landing.tsx` | Conditionally hide decorative blur blobs and lens-field on mobile; remove sticky nav heavy backdrop-blur on touch |
| `src/components/marketing/InteractiveHeroBriefAssembly.tsx` | Remove `active:scale` from scrollable containers; conditionally skip ping animation on touch |

No new files, no routing changes, no design system restructuring needed.
