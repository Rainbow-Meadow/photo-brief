## Root cause hypothesis

Sticky CSS on `.pb-deck > .pb-slide` is correct in isolation. The reason it isn't pinning in the live preview is the surrounding layout in `src/components/layout/MarketingLayout.tsx`:

```tsx
<div className="pb-landing flex min-h-screen flex-col">
  <div className="sticky top-0 z-40 …">…header…</div>
  …
  <main className="flex-1">
    <Outlet />        {/* ← <SlideStack> renders here */}
  </main>
  <footer …>…</footer>
</div>
```

`<main>` is a column-flex item with `flex: 1 1 0%`. Combined with the sibling sticky header inside the same flex column, browsers do not reliably promote sticky descendants of a flex-grow item to the document scroll context — the slides flow normally instead of pinning. We can also see the symptom directly: the page just scrolls smoothly through every slide.

## Fix (CSS-only, scoped to marketing layout)

Restructure `MarketingLayout` so the marketing routes use a plain block layout — no enclosing flex column around `<main>`. Concretely:

1. **Drop the outer flex column.** Replace `<div className="pb-landing flex min-h-screen flex-col">` with `<div className="pb-landing min-h-screen">`. Header, main, and footer become normal block-flow children, which is what `position: sticky` expects.
2. **Drop `flex-1` on `<main>`.** Use `<main className="relative">`. Footer sits below main naturally.
3. **Keep the existing sticky header** (`sticky top-0 z-40 …`) — sticky on the header still works because it now lives in normal block flow.
4. **Keep the existing dark footer** styling.
5. **No changes** to `SlideStack`, `Slide`, `RawSlide`, or any deck CSS in `index.css`. The sticky-stack rules already in `.pb-deck > .pb-slide { position: sticky; top: 0; height: 100svh; }` will start working as soon as the flex column above it is gone.

## Verify

- `/` — scroll: the hero pins; the marquee slide lifts up over it; each of the four mechanism slides takes over in turn; the comparison, signpost, and FAQ/CTA slides each pin then get covered. Active dot in the rail tracks the current slide.
- `/pricing`, `/beta`, `/demo`, `/for-ai-agents` — same pinning behavior across the deck on each page.
- Header stays pinned at the top throughout. Footer renders once the final slide is fully covered.
- `prefers-reduced-motion: reduce` — slides fall back to normal stacked sections (existing CSS).
- Mobile (≤ 1024px) — rail hidden (existing CSS), slides still pin.

## Fallback (only if CSS layout fix doesn't pin)

If after the layout change sticky still does not pin in some browser environment, swap `SlideStack` to a Framer Motion `useScroll` + `useTransform` per-slide implementation that translates each slide from `y: 100%` to `y: 0` against the document scroll. This guarantees the lift-over effect without depending on the sticky containing-block chain.

## Out of scope

- No changes to slide content, copy, or imagery.
- No new motion libraries unless the fallback is needed.
- No changes to the dashboard / public-recipient layouts.
