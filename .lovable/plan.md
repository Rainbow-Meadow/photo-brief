# Slide lock: fix mobile clipping + add real dwell

## Problems

1. **Mobile clipping.** `.pb-slide-inner` is locked to `height: 100svh` with `overflow: hidden`. On phones (440×798 today), Hero, Comparison, FAQ+CTA, and Signpost slides have more content than fits — the bottom is silently cut off.
2. **No actual lock.** The pinned-stack math in `SlideStack.tsx` maps scroll progress linearly across `count - 1` segments, so every pixel of scroll moves the next slide up. There is no moment where a slide is "locked" — the user feels a continuous slide instead of a beat per panel.

## Fix

### 1. Disable the pinned deck on mobile (and keep desktop pinning)

Below `lg` (1024px), fall back to the same stacked layout we already use for `prefers-reduced-motion`. Slides become normal sections that grow with their content, no clipping, no fixed stage. This is the cleanest fix and matches what mobile users expect (vertical scroll through full sections).

- `SlideStack.tsx`: in the scroll effect, treat `window.innerWidth < 1024` like reduced-motion — make stage `static`, clear transforms, skip the rAF loop. Re-enable on resize past the breakpoint.
- `index.css`: extend the existing `prefers-reduced-motion` fallback block to also apply at `(max-width: 1023.98px)`. Hide the rail there too (already hidden below `lg`).
- Keep `Slide` content as-is. On desktop the deck still pins; on mobile it scrolls naturally.

### 2. Add a real dwell at each lock

Reserve scroll space so each slide has both a **transition** segment (cover the previous slide) and a **dwell** segment (locked, no movement). Tunable via one constant.

In `SlideStack.tsx`:

- Add `DWELL_RATIO = 0.5` (≈1 viewport of scroll dwell vs ~1 viewport of transition per slide). Net: ~1s of locked feel at typical scroll speeds.
- Deck height becomes `(1 + (count - 1) * (1 + DWELL_RATIO)) * 100svh` instead of `count * 100svh`.
- Progress math: split each slide segment into `[transition | dwell]`. During transition, animate `translateY` 100% → 0% as today. During dwell, hold at 0%. Active-index stays on the locked slide for the dwell duration.

```text
slide 0  ─────────────────  (initial viewport, no transform)
slide 1  ▒▒▒▒▒▒▒░░░░░░░░░  ▒ = rise from 100%→0%, ░ = locked at 0%
slide 2                    ▒▒▒▒▒▒▒░░░░░░░░░
...
```

- `goTo(i)` updates to land at the start of slide `i`'s dwell (i.e., end of its transition) so clicking a rail dot snaps to the locked state, not mid-transition.

### Verification

After changes, confirm at three widths via browser tool:
- 390×844 (mobile) — stacked, every slide fully visible end-to-end, no clipping.
- 820×1180 (tablet) — stacked, same.
- 1440×900 (desktop) — pinned deck, each slide rises and then visibly holds before the next one starts.

## Files

- `src/components/marketing/SlideStack.tsx` — viewport gate + dwell math + `goTo` update
- `src/index.css` — extend reduced-motion fallback to `max-width: 1023.98px`

## Out of scope

- Restructuring slide content to fit 100svh on desktop (Hero/Comparison fit fine at ≥lg today).
- Changing slide copy, imagery, or the rail design.
