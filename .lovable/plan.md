## Goal

Every container, section wrapper, headline, paragraph, and button on the landing page renders through **one immutable schema**. No ad-hoc Tailwind for color, font family, font size, spacing, or button styling inside `Landing.tsx`. The schema is the only way to compose marketing UI.

## What ships

### 1. New schema module

`src/pages/landing/schema.tsx` — a small, frozen set of React primitives. Components only accept structural props (children, `as`, `id`, `tone`); they do **not** accept `className` overrides. Visual variance is opt-in via a fixed `variant` enum.

Primitives:

```text
<Section tone="paper" | "dark" | "alt"  size="default" | "tight">
<Container width="default" | "narrow">
<Eyebrow>
<Title level={1|2|3}>      // h1/h2/h3, single sans family
<Subtitle>                  // lead paragraph under Title
<Body size="sm" | "md" | "lg">
<Card tone="paper" | "dark" elevated?>
<Grid cols={1|2|3|4} gap="sm" | "md">
<CTA variant="primary" | "secondary" | "quiet" size="md" | "lg" to=…>
<CTAGroup>                  // flex wrap with consistent gap
```

Rules baked in:
- Typography: one sans family for everything (drop the italic serif `pb-section-title` look). Sizes are fixed clamp() ramps — H1, H2, H3, Subtitle, Body-lg/md/sm — no per-instance overrides.
- Color: every primitive resolves color from the section `tone` only. `tone="paper"` uses cream + ink tokens; `tone="dark"` uses navy + cream-on-dark; `tone="alt"` is a subtle tinted band.
- Spacing: `Section` owns vertical rhythm (one `default`, one `tight`). Inner spacing inside `Container` is fixed.
- Buttons: `CTA` is the only way to render a marketing button. Three variants exactly: **primary** (solid amber on navy text), **secondary** (outlined navy/cream), **quiet** (text link with arrow). Touch behavior follows existing `.pb-btn-platform` rules (44px min, no hover on touch).

### 2. Schema CSS

`src/pages/landing/schema.css` — a single `@layer components` block with the *only* class set the schema renders: `.ls-section`, `.ls-section--dark`, `.ls-section--alt`, `.ls-section--tight`, `.ls-container`, `.ls-container--narrow`, `.ls-eyebrow`, `.ls-h1/h2/h3`, `.ls-subtitle`, `.ls-body-{sm,md,lg}`, `.ls-card`, `.ls-card--dark`, `.ls-grid-{1,2,3,4}`, `.ls-cta-primary`, `.ls-cta-secondary`, `.ls-cta-quiet`, `.ls-cta-group`. Imported once from `src/index.css`.

All values pull from the existing two-palette tokens already defined in `src/index.css` (navy, amber, cream, ink). No new colors introduced.

### 3. Rebuild `src/pages/Landing.tsx`

Keep every existing section and its content (hero, ROI calculator, beta program, workflow, comparison, use cases, website intelligence, FAQ, final CTA, etc.) — only the wrappers and presentational elements change.

For each section:
- Outer `<section className="pb-section …">` → `<Section tone=… size=…>`
- Inner `.pb-container` div → `<Container>`
- `<span className="pb-eyebrow">` → `<Eyebrow>`
- `<h1 className="pb-display">`, `<h2 className="pb-section-title">`, `<h3 …>` → `<Title level=…>`
- Lead `<p className="pb-copy …text-lg">` → `<Subtitle>`
- Body `<p className="pb-copy …">` → `<Body size=…>`
- `<div className="pb-card …">` → `<Card>`
- All `<Button variant="pb-primary|pb-secondary|pb-ghost">` → `<CTA variant="primary|secondary|quiet">`
- Per-instance `text-white`, `text-[hsl…]`, font-serif italic, custom font sizes, custom paddings → **deleted**. Tone is inherited from the parent `Section`.

Rich/interactive children (`InteractiveHeroBriefAssembly`, `BetaSeatTracker`, ROI sliders, comparison table, FAQ accordion, lucide icons) are kept as-is and rendered inside the new primitives.

### 4. Cleanup

After Landing.tsx no longer references them, remove from `src/index.css`:
- `.pb-section`, `.pb-section-tight`, `.pb-section-alt`, `.pb-container`, `.pb-container-narrow`, `.pb-eyebrow`, `.pb-copy`, `.pb-card`, `.pb-display`, `.pb-section-title`, the long `.pb-on-paper .pb-dark-island .text-white\/N` ladder.

Keep: `.pb-landing` (page-level background), `.pb-paper-pill` / `.pb-paper-link` (used by `MarketingLayout` header), `.pb-footer-dark` (footer), `.pb-btn-platform` (still backs `CTA`).

Other pages that still import the old classes (Pricing, Privacy, Terms, ForAiAgents, etc.) are **out of scope** for this request — they keep working because we only delete classes Landing exclusively used. Anything shared with another page stays.

### 5. Verification

- Visit `/` at 440px and 1440px: every section renders, hero shows the single full logo, CTAs are clickable and styled, no missing styles, no console errors, no 404s.
- `rg "pb-section|pb-card|pb-eyebrow|pb-copy|pb-display|pb-section-title|font-serif|text-white\\/" src/pages/Landing.tsx` returns **zero matches**.
- `rg "className=" src/pages/Landing.tsx` shows only structural utility classes (flex/grid layout) on non-schema wrappers — never color, font, or button classes.
- Build passes; no TypeScript errors.

## Out of scope

- Header (`MarketingLayout`) and footer styling.
- `BrandMark`, `PoweredByBadge`, `BetaSeatTracker`, `InteractiveHeroBriefAssembly` internals.
- Other marketing pages (Pricing, ForAiAgents, etc.).
- Color tokens — the two-palette system in `src/index.css` is already the single source of truth and is not changed.
