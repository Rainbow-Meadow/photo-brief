## What's broken

The dot rail never updates and clicking a dot does nothing. Root cause is in `src/components/marketing/SlideStack.tsx`:

```tsx
{slides.map((child, i) =>
  cloneElement(child, {
    "data-pb-index": i,
    style: { ...child.props.style, zIndex: i + 1 },
  }),
)}
```

`Slide` and `RawSlide` are function components whose signatures only destructure a fixed set of props (`children`, `anchor`, `label`, `scroll`, `tone`, `className`, `width`, `align`). They never forward unknown props or `style` to the root `<div>`. Result:

- `data-pb-index` is dropped → `IntersectionObserver` reads `Number(null) → NaN` → `setActive` never runs → active dot is frozen on slide 0.
- Rail `goTo(i)` queries `[data-pb-index="${i}"]` → returns null → clicks are no-ops.
- `style.zIndex` is dropped → slides stack in DOM order only (works visually for "next on top" but the stacking is implicit).

Sticky CSS on `.pb-deck > .pb-slide` is correct and pins the slides — the user perceives "page just scrolls" because the indicator never responds and there's no visible affordance that the deck is doing anything.

## Fix

Update `src/components/marketing/SlideStack.tsx`:

1. **Forward injected props in `Slide` and `RawSlide`.** Accept `style` and a rest (`...rest`) for `data-*`/`aria-*` attributes, and spread them on the root `<div>` after the existing class/id so SlideStack's `cloneElement` props actually reach the DOM. Merge style as `{ ...style }` (z-index from SlideStack wins).

2. **No behavior change for direct callers.** Existing `<Slide anchor=… tone=…>` usage stays valid; the new `style`/rest are optional.

3. **Keep IntersectionObserver thresholds and rail markup as-is** — once `data-pb-index` lands in the DOM they'll start working.

## Verify

- Open `/` in preview, scroll: confirm each slide pins at the top of the viewport and the next slide lifts up over it (sticky-stack already in CSS).
- Watch the right-side dot rail: active dot should advance as each slide takes over the viewport.
- Click any dot: page should `scrollIntoView` to that slide.
- Repeat spot-check on `/pricing`, `/beta`, `/demo`, `/for-ai-agents`.
- Reduced-motion: rail hidden, slides fall back to normal stacked sections (existing CSS).

## Out of scope

- No changes to slide content, CSS, Lenis config, or the Landing test contract.
- No new motion/JS scroll hijacking.
