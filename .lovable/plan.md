## Goal

Current tiers (96% / 92% / 86% lightness) read as nearly identical until the Workflow/Footer block. Push the ladder deeper and saturate it so each band is unmistakably its own surface, while staying in the "light navy paper" family (no dark mode).

## New palette (in `src/index.css`)

Increase saturation and widen the lightness gap between tiers:

- `--pb-tier-0`: `220 38% 94%` (was 32% / 96%) — base paper, still the lightest
- `--pb-tier-1`: `222 36% 87%` (was 30% / 92%) — alt band, now clearly cooler/deeper
- `--pb-tier-2`: `224 34% 78%` (was 28% / 86%) — feature anchor, distinctly denim
- `--pb-paper-edge`: `224 28% 66%` — stronger hairline so seams read on every transition
- `--pb-glass`: `220 40% 99% / 0.78` — header pill stays bright against deeper page
- `--pb-ink-soft`: nudge to `222 40% 22%` for contrast on Tier 2

Amber accents (`--pb-amber`, `--pb-amber-soft`) unchanged — they'll pop more against the deeper base.

## Section ladder adjustments

Keep the existing 3-tone rhythm, but add tier swaps where the page currently feels flat:

- Hero → Tier 0
- Pain Points → Tier 1 (was 0) so the first transition is visible immediately
- Brief Assembly → Tier 0
- Workflow → Tier 2 (unchanged, now genuinely denim)
- Comparison → Tier 1
- Use Cases → Tier 0
- Website Intelligence → Tier 1
- Beta zone → Tier 0 with amber wash (unchanged)
- Reward Tiers → Tier 1
- Final CTA + Footer → Tier 2

Tickers continue to render a half-step deeper than the surface they sit on (`color-mix` with `--pb-paper-edge`).

## Component touch-ups

- `.pb-card`: bg stays `--pb-glass`, border bumped to `hsl(var(--pb-paper-edge) / 0.7)`, shadow uses `--pb-ink / 0.18`.
- `.pb-section-alt` rebound to Tier 1 token.
- `.ls-section--dark` rebound to Tier 2 token (already light-navy, just deeper now).
- Header pill: keep glass, but add a 1px bottom border in `--pb-paper-edge / 0.6` so it separates from the deeper hero.
- Footer top hairline uses full `--pb-paper-edge`.

## Files

- `src/index.css` — palette tokens, `.pb-card`, `.pb-section-alt`, header glass border
- `src/pages/landing/schema.css` — `.ls-section--dark` background swap
- `src/pages/Landing.tsx` — tier classes on Pain Points, Comparison, Use Cases, Website Intelligence, Reward Tiers
- `src/components/layout/MarketingLayout.tsx` — header pill border, footer hairline

## Out of scope

Authenticated app shell, copy, layout, illustrations, dark mode.
