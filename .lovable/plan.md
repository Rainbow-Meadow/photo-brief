## Dark-background brand variant

The `BrandMark` component already accepts a `tone` prop and several callsites pass `tone="dark"`, but the prop is ignored — so on dark surfaces (floating nav over dark hero, the `FinalCta` "last word" section, public request layout) the navy mark and "Photo" / ".ai" wordmark portions disappear into the background. Only "Brief" (amber) is visible — exactly what the screenshot shows.

### Changes

**1. New asset: `public/brand/mark-on-dark.svg`**
- Recolor the existing `mark.svg` artwork: replace navy strokes/fills (`#1B2A4A` / `hsl(219 47% 20%)`) with cream (`#FAF7F2`). Amber accents stay amber. Same dimensions, same artwork — only the navy ink swaps to cream so it reads on dark navy backgrounds.
- Add a matching raster fallback `public/brand/mark-on-dark.png` (1024×1024) for the `<picture>` fallback path.

**2. Wire up `tone` in `src/components/layout/BrandMark.tsx`**
- `MarkImage` accepts `tone`; when `tone === "dark"`, swap `MARK_SVG` → `/brand/mark-on-dark.svg` and `MARK_PNG` → `/brand/mark-on-dark.png`.
- `Wordmark` accepts `tone`; when `tone === "dark"`:
  - "Photo" → `hsl(var(--pb-cream))` (cream)
  - "Brief" → keep `hsl(var(--pb-wordmark-amber))` (amber stays — readable on both)
  - ".ai" → `hsl(var(--pb-cream) / 0.7)`
- `Tagline` accepts `tone`; when `tone === "dark"` use `hsl(var(--pb-cream) / 0.75)`.
- `tone="light" | "auto" | "color"` keep current behavior (no regression).
- Pipe `tone` through all variants (mark, wordmark, stacked, horizontal).

**3. No new tokens needed**
`--pb-cream` already exists in `src/index.css`. No CSS changes.

**4. Memory update**
Update `mem://design/brand-system` to document:
- `mark-on-dark.svg` / `mark-on-dark.png` exist
- `tone="dark"` is now a real, honored variant for use on navy/dark surfaces

### Out of scope
- No callsite changes (existing `tone="dark"` callers will start rendering correctly automatically).
- No changes to `full-logo.svg`, favicon set, email assets, or Remotion theme — those surfaces are cream/light by design.
- No new color tokens.

### Files touched
- New: `public/brand/mark-on-dark.svg`, `public/brand/mark-on-dark.png`
- Edit: `src/components/layout/BrandMark.tsx`
- Edit: `mem://design/brand-system`

### Validation
Visit `/` (floating nav over dark hero edge, FinalCta section) and `/r/...` (PublicRequestLayout) — wordmark + mark should be fully legible on the dark backgrounds.
