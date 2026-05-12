## Marketing-only proximity scroll snap

A lightweight CSS-only snap layer that gives the marketing surface a "deck" feel — when you let go near a section boundary the page settles to the start of that section — while preserving free scrolling inside long sections (FAQ, comparison) and leaving Lenis inertia, app routes, and embeds untouched.

### Why CSS proximity (not JS hijacking)
- `scroll-snap-type: y proximity` cooperates with Lenis; `mandatory` fights it.
- Zero accessibility cost: keyboard, screen-reader, find-in-page, anchor links, and `scrollIntoView` all keep working.
- Touch devices behave naturally (proximity only nudges on idle).
- No layout changes required — sections don't need to be 100vh.

### Scope
- Marketing routes only (every page rendered under `MarketingLayout`: `/`, `/pricing`, `/for-ai-agents`, `/privacy`, `/terms`, `/auth`, `/forgot-password`, `/reset-password`, `/unsubscribe`, `/help`, `/demo`, `/beta`, `/signup`, `/beta-invite/:token`, `/welcome`).
- Explicitly excluded: app shell routes, `/badge/intake`, `/i/:token`, `/r/:token`, `/r/:token/done`, `NotFound`. These never render `MarketingLayout`, so they're untouched by construction.

### Implementation

**1. `src/components/layout/MarketingLayout.tsx`** — toggle a marker class on `<html>` only while a marketing route is mounted.
```tsx
useEffect(() => {
  const root = document.documentElement;
  root.classList.add("pb-snap-root");
  return () => root.classList.remove("pb-snap-root");
}, []);
```
Class is removed on unmount so navigating into the app instantly drops the snap behavior.

**2. `src/index.css`** — add the snap utility scoped to that class.
```css
@media (prefers-reduced-motion: no-preference) {
  html.pb-snap-root {
    scroll-snap-type: y proximity;
  }
  /* Snap each top-level marketing <section> to the viewport top, accounting for the floating sticky header (~80px). */
  html.pb-snap-root .pb-landing > main > section {
    scroll-snap-align: start;
    scroll-snap-stop: normal;     /* never block fast scrolls */
    scroll-margin-top: 5rem;       /* clears the sticky pill nav */
  }
  /* Footer should not act as a snap target. */
  html.pb-snap-root .pb-landing > footer {
    scroll-snap-align: none;
  }
}
```
- `proximity` (not `mandatory`) → only snaps when the scroll naturally settles within ~10–15% of a boundary.
- `scroll-snap-stop: normal` → multi-section flicks aren't trapped on the next section.
- `scroll-margin-top: 5rem` → snap point sits below the floating pill nav so headings aren't covered.
- `prefers-reduced-motion` guard → users with reduced motion get no snap at all.

**3. Smooth scrolling alignment** — Lenis already animates `window.scrollTo`, so anchor links (`#workflow`, `#faq`, etc.) and the "Skip to content" type behaviors continue to land cleanly on snap points (Lenis settles the scroll, browser proximity snaps at rest).

### What this does NOT change
- No JS scroll listeners, no wheel/keyboard hijacking, no per-section observers.
- No section markup changes anywhere — all current `Section` components already render as `<section>`.
- No effect on horizontally scrolling marquees, modals, sheets, or nested scroll containers (snap is on the document only).
- No effect on `MarketingLayout` short pages (auth/legal): with one section there's nothing to snap to, so behavior is unchanged.
- App routes, embeds, and recipient capture flows are untouched — they don't render `MarketingLayout`, so the `pb-snap-root` class never gets added.

### Verification
After the edit, in preview:
1. Land on `/` and let the wheel coast near the Mechanism / Comparison / FAQ / CTA boundaries — page should settle on the section top with the heading just below the pill nav.
2. Inside the long FAQ accordion, mid-section scroll must remain free (no snap-back).
3. Click footer "Privacy" → scroll naturally on a short page (no snap artifacts).
4. Hard-refresh on `/dashboard` (or any app route) — `html.pb-snap-root` should not be present and scroll should be 100% native.
5. Test `prefers-reduced-motion: reduce` (DevTools rendering pane) — snap disabled entirely.

### Out of scope
- Section indicator dots / progress rail, presenter-style page-by-page nav, scroll-driven animations, per-section background swaps, anchor-aware nav highlighting. These are separate features and can build on the snap foundation later if requested.
