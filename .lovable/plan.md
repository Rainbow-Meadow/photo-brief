# Tighten landing-page spacing

The landing page reads loose because the global section + intro tokens are sized for editorial pacing. Compressing them ~25–35% across the board makes the page feel denser without breaking rhythm.

## Where the air is coming from

| Token | Current | Why it matters |
|---|---|---|
| `.pb-section` padding-block | `clamp(3rem, 6vw, 5.5rem)` (48–88px) | Top + bottom padding on every section |
| `.pb-section-tight` padding-block | `clamp(1.75rem, 3vw, 3rem)` (28–48px) | Used by comparison, rewards, fine-print |
| `MarketingHero` extra top | `pt-[5.5rem] sm:pt-[6rem]` (88–96px) | Hero offset under the floating nav |
| `MarketingSection` intro→children gap | `mt-10` (40px) | Title block to content gap inside every section |
| `MarketingSection` title `mt-4`, subtitle `mt-4` | 16/16px | Internal intro stack |
| Hero grid `gap-10 lg:gap-16` | 40 / 64px | Copy ↔ illustration spacing in hero |
| Hero internal `mb-6 sm:mb-8`, `mt-6 sm:mt-8` | 24/32px stacked | Brandmark → eyebrow → title → subtitle stack |

## Changes (all scoped to `.pb-landing` so other marketing pages stay untouched)

In `src/index.css`, add a focused override block right after the existing `.pb-landing` rule:

```css
.pb-landing .pb-section { padding-block: clamp(2rem, 4vw, 3.75rem); }   /* 32–60px */
.pb-landing .pb-section-tight { padding-block: clamp(1.25rem, 2.2vw, 2.25rem); } /* 20–36px */
.pb-landing .pb-section-title { font-size: clamp(1.6rem, 3.4vw, 2.6rem); } /* slight type tighten so headings don't feel oversized in denser layout */
```

Then in the layout primitives:

- `MarketingHero.tsx`: drop top padding to `pt-[4rem] sm:pt-[4.75rem]` and outer offset to `-mt-[4rem] sm:-mt-[4.5rem]` to keep nav clearance correct.
- `MarketingSection.tsx`: change intro→children gap from `mt-10` to `mt-6 sm:mt-8`; tighten title `mt-4` → `mt-3` and subtitle `mt-4` → `mt-3`.

In `src/pages/Landing.tsx`:

- Hero grid `gap-10 lg:gap-16` → `gap-8 lg:gap-12`.
- Hero copy stack: `mb-6 sm:mb-8` (brandmark wrapper) → `mb-4 sm:mb-6`; the two `mt-6 sm:mt-8` blocks (title and subtitle wrappers) → `mt-4 sm:mt-6`.
- Trim a few oversized stack gaps that read loose at 1380px+: any section-internal `mt-12 / mt-16 / space-y-12` patterns get pulled to `mt-8 / mt-10 / space-y-8`. I'll grep these first and apply only where the surrounding layout still looks balanced (i.e. not inside cards or grids that need their own breathing room).

No changes to:

- Card padding, button sizes, or typography weight
- Footer, header, or marketing pages other than `/`
- Pricing, Terms, Privacy, ForAiAgents, BetaWelcome — they keep the original generous tokens

## QA

1. Reload `/` at 1380px; screenshot top, mid, and bottom of the page; eyeball that section breaks still feel intentional (not cramped, not loose).
2. Re-screenshot at 768px (tablet) and 390px (mobile) to confirm the smaller `clamp()` floor still gives readable rhythm.
3. Spot-check `/pricing` and `/terms` to confirm those pages are unchanged.
4. Refine any single section that ended up too tight by raising its specific `mt-*` back one step.

## Out of scope

- No copy edits, no component restructuring, no illustration changes
- No changes to navigation, footer, or dashboard
