## Sitewide deck mode — sticky-stack reveal across all marketing pages

Replace the proximity snap with a true presentation deck: every section is a 100vh "slide" that pins to the viewport, and the next slide rises up over it like a card on a stack. Pure CSS sticky-stack — no JS hijacking, plays with Lenis, scales to every marketing route.

### The primitive (new)

`src/components/marketing/SlideStack.tsx`
```tsx
export function SlideStack({ children }) {
  const slides = Children.toArray(children);
  return (
    <div className="pb-deck" style={{ "--slide-count": slides.length }}>
      {slides.map((c, i) => (
        <div className="pb-slide" style={{ "--i": i, zIndex: i + 1 }} key={i}>
          {c}
        </div>
      ))}
    </div>
  );
}
```
`src/index.css` additions:
```css
.pb-deck > .pb-slide {
  position: sticky;
  top: 0;
  height: 100svh;          /* svh handles mobile URL bar */
  min-height: 100svh;
  overflow: hidden;
  background: hsl(var(--background));   /* opaque so it covers the one beneath */
  isolation: isolate;
}
@media (prefers-reduced-motion: reduce) {
  .pb-deck > .pb-slide {
    position: relative;     /* graceful fallback: stacked normal flow */
    height: auto;
    min-height: 100svh;
  }
}
```
The trick: every slide sticks at top 0 with `height: 100svh`. The document height equals `slides × 100svh`. As you scroll, each slide stays glued to the viewport top while the next one (later in DOM, higher z-index) translates upward through normal scroll, sliding over the pinned one.

### Slide content rules
A new `<Slide>` wrapper enforces the contract:
```tsx
<Slide tone="paper|alt|dark" anchor="workflow">
  <div className="pb-slide-inner">…</div>
</Slide>
```
- `pb-slide-inner`: `mx-auto w-full max-w-7xl h-full px-6 pt-24 pb-12 flex flex-col justify-center` — vertically centers content under the floating nav (top safe-zone 6rem).
- `tone` sets the background color via existing `--pb-tier-*` tokens so adjacent slides read distinct as they stack.
- `anchor` sets `id` for hash navigation and `scroll-margin-top: 0` (sticky already handles offset).

### Removing the previous layer
- Delete the `html.pb-snap-root { scroll-snap-type… }` block added last turn.
- Drop the `pb-snap-root` toggle effect from `MarketingLayout`.
- Lenis stays unchanged (its smooth `window.scrollTo` works with sticky stacks).

### Page refactors

**`src/pages/Landing.tsx` — 9 slides**
1. Hero
2. Marquee band (compact, full-bleed, 100svh with stat cards centered)
3. Mechanism · 01 Research (one row of MechanismGrid, big)
4. Mechanism · 02 Mechanism
5. Mechanism · 03 Brief
6. Mechanism · 04 Close
7. Comparison (Before/After cards side by side)
8. Signpost (3 doors)
9. FAQ (top 4 items, "More" link) + Final CTA merged into one slide with two-column layout, OR FaQ slide + FinalCTA slide if it doesn't fit (decide during build).

`MechanismGrid` is dissolved — replaced by 4 individual `<Slide>` blocks rendering one step each at large size (image dominates left/right, copy centered vertically). Existing `workflowSteps` data array is reused via a new `MechanismSlide` component.

**`src/pages/Pricing.tsx` (7 sections → 7 slides)** Each existing `<Section>` becomes a `<Slide>`. Pricing card grid centered vertically. FAQ slide trims to 3 items.

**`src/pages/Beta.tsx` (9 → 9 slides)** Same wrap. Long form sections (eligibility list, partner perks) compressed via two-column layout.

**`src/pages/Demo.tsx` (7 → 7 slides)** Wrap each. Interactive hero pinned full-bleed.

**`src/pages/ForAiAgents.tsx` (6 → 6 slides)** Wrap each.

**`src/pages/Privacy.tsx`, `Terms.tsx`, `Help`, `Auth`, `ForgotPassword`, `ResetPassword`, `Unsubscribe`, `Signup`, `BetaInvite`, `BetaWelcome`** — these are forms or long-form legal text. Wrap the page in a single `<Slide>` so the deck behavior is consistent (one slide = native scroll inside if needed). No content edits.

### Header & footer
- Sticky header (`pb-paper-pill`) keeps `z-50`, floats above all slides.
- Footer is **outside** the `SlideStack`, rendered after it in `MarketingLayout`. Reaching the footer naturally exits the deck.
- A small **slide indicator rail** (right-side dots, one per slide) is added to `MarketingLayout` when the current page renders a `SlideStack`. Click = `element.scrollIntoView({behavior:'smooth'})`. Active dot tracked via `IntersectionObserver` on each `.pb-slide`. Dots hide on touch and on `prefers-reduced-motion`.

### Mobile (`<sm`)
- Slides keep `height: 100svh`. Inner content uses smaller type and tighter spacing (Tailwind responsive utilities already in place).
- For very dense slides (Comparison's two cards), stack vertically inside the slide and reduce illustration size.

### What's left out (intentionally)
- No keyboard/wheel hijacking. Native scroll + Lenis only.
- No scroll-driven scale/opacity choreography on outgoing slide. Pure cover-up reveal as requested. (Easy to add later via `animation-timeline: scroll()` once we want polish.)
- No per-page section count audit at build time — verified visually in preview at 1440×900 and 390×844 after the refactor.

### Risks / tradeoffs you should accept before I build
- **FAQ truncation on Landing**: only 4 items will be shown on the slide; the rest live in `/help`.
- **Type may shrink** on the Comparison slide at narrow desktop widths (1280–1366) to keep both cards visible.
- **Tall content overflow**: any slide whose content genuinely can't be made to fit 100svh (e.g. the full pricing comparison table, full Beta eligibility list) will get an internal scroll inside the pinned slide — the next slide still rises up when the user scrolls past the page-level scroll position. I'll flag any such slide during build and propose a split.
- **`/auth`, `/signup`, legal pages** stay as single full-height slides — no card-stack effect on them since they're one section.

### Verification (post-build)
1. `/` at 1440×900: scroll once — Hero stays pinned while Marquee rises over it. Repeat through all 9 slides. Reach footer.
2. `/` at 390×844 (mobile): same behavior, slide indicator hidden.
3. `/pricing`, `/beta`, `/demo`, `/for-ai-agents`: each section pins and is overlaid by the next.
4. `/privacy`: single slide, scrolls naturally to footer.
5. `/dashboard` and `/r/:token`: zero deck behavior (no `SlideStack` rendered).
6. DevTools "reduce motion": slides become normal stacked sections, no pinning.
7. Anchor link `/#workflow` lands on the Research slide.
