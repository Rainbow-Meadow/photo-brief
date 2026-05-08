## Goal
One CSS file owns the entire color system. Two palettes only — `:root` (light) and `.dark` (dark). No more layered overrides, no more JS color mirrors, no more legacy `--pb-*` violet/lavender/electric/mint aliases.

## The two palettes (immutable)

**Light** — anchored to the brand mark
- Surface: cream `#FAF7F2` (39 33% 97%)
- Ink: navy `#1B2A4A` (219 47% 20%)
- Primary/CTA: amber `#F2A33A` (33 88% 55%)
- Primary hover: `#D88A20` (35 74% 49%)
- Accent wash: amber-tint (33 92% 92%)
- Border/input: warm cream (32 18% 86%)

**Dark** — inverted, same brand
- Surface: deep navy `#0B1426` (219 50% 7%)
- Ink: cream (39 33% 97%)
- Primary/CTA: amber-light (33 89% 62%)
- Accent: navy-tint (219 40% 22%)
- Border: navy-line (219 26% 20%)

Each palette defines exactly one value per semantic token. Components only consume semantic tokens (`--background`, `--foreground`, `--primary`, `--card`, `--border`, etc.) and brand tokens (`--brand-navy`, `--brand-amber`, `--brand-cream`).

## Files deleted

- `src/theme.css` — gone (cyan/teal palette, conflicting tokens)
- `src/brand-overrides.css` — gone (was the patch-over-patch layer)
- `src/design-system/shared/brand.tokens.ts` — gone
- `src/design-system/shared/color.tokens.ts` — gone
- Their entries in `src/design-system/index.ts`
- Their imports in `src/main.tsx`

## Files rewritten

**`src/index.css`** — single source of truth. The `@layer base { :root { ... } .dark { ... } }` block is fully replaced with the two palettes above. All legacy variables removed: `--pb-night`, `--pb-ink`, `--pb-panel`, `--pb-line`, `--pb-violet`, `--pb-lavender`, `--pb-electric`, `--pb-mint`, `--pb-shadow`, `--pb-paper`, `--pb-muted`, `--app-pill-*`, `--brand-lens`, `--brand-flash`, `--brand-graphite`, `--gradient-radial-glow`, `--ambient-future`, `--glass-bg-onDark`, etc. Anything not in the canonical token list is removed. Sidebar tokens consolidate to `--sidebar-*` reading from the brand palette.

**`tailwind.config.ts`** — the `extend.colors` map is pruned to only the semantic tokens that exist in the new palette. Any `pb-*` color extensions are removed.

**3 components using `BRAND` JS object** — switch to CSS vars:
- `src/components/ui/glass-panel.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/shared/MetricCard.tsx`

## Dark mode behavior

Follow OS preference by default; the existing toggle (sun/moon switch) remains and overrides via the `.dark` class on `<html>`. No other changes to the toggle wiring.

## Cleanup pass

A grep removes any remaining hardcoded color references in components that name dead tokens (`--pb-violet`, `--pb-electric`, `--brand-flash`, `--brand-graphite`, etc.). Each gets remapped to the closest semantic token (usually `--primary`, `--brand-amber`, or `--brand-navy`). Estimated <30 occurrences across the codebase.

## Out of scope

- No component redesigns — only token swaps.
- No copy/layout changes.
- The BrandMark wordmark inline-style override on Landing is removed once `--pb-wordmark-navy` lives in one place and isn't fighting an override.

## Risk note

Some marketing pages used `--pb-violet` literally for big hero text. After the rewrite those will read amber (the new accent). That's the intended outcome of the brand overhaul — but it means hero text on Landing/About/etc. shifts from purple to navy/amber instantly when this lands.