## Goal

Right now on desktop the landing page reads like a phone screen stretched onto a 1382px viewport: a single ~672px center column with huge empty purple gutters on either side. Mobile and tablet stay perfect — only `lg:` and `xl:` breakpoints change.

## Changes

### 1. Hero — two-column on `lg+`
File: `src/pages/Landing.tsx` (~lines 308–411)

Convert the centered stack into a 2‑column grid at `lg:` (≥1024px), keep the current centered stack on mobile/tablet.

```text
mobile / tablet (unchanged)        desktop ≥1024px
┌────────────────────┐             ┌──────────────────────┬────────────────┐
│      [mark]        │             │  Accepting beta…     │                │
│   Accepting beta…  │             │  Replace weak        │   [big mark]   │
│   Replace weak     │             │  website forms…      │   with halo    │
│   website forms…   │             │  Lede copy…          │                │
│   Lede copy        │             │  [CTA] [CTA] [CTA]   │  Seat tracker  │
│   [CTA] [CTA] [CTA]│             │  chip chip chip      │   card        │
│   chips            │             │                      │                │
│   seat tracker     │             └──────────────────────┴────────────────┘
└────────────────────┘             ratio ~ 1.15fr / 0.85fr, gap 4rem, items-center
```

Specifics:
- Grid: `lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:text-left`.
- Drop `mx-auto max-w-2xl` on h1/p at `lg:` so they fill the left column; widen `pb-container` for hero only via `lg:max-w-[1280px]`.
- CTA row: `lg:justify-start` instead of `sm:justify-center`.
- Chips row: `lg:justify-start mx-0`.
- BetaSeatTracker: move into the right column under the brand mark on `lg+`, stays centered below CTAs on smaller screens (render twice with `lg:hidden` / `hidden lg:block`, or use CSS order).
- Brand mark: only the `lg:` 144px variant lives in the right column; mobile/tablet variants stay where they are.

### 2. Section titles — let them breathe on desktop
Several section heads use `mx-auto max-w-3xl text-center` which keeps long copy in a narrow column even at 1400px. Loosen to `lg:max-w-5xl` for these (text stays centered, just wider before wrapping):
- Brief assembly section header (line 427)
- Use cases header (line 1182)
- Website intelligence header (line 1222)
- Final CTA copy (line 1557)

### 3. Use cases grid — 4-up on `xl`
Line 1196: today the grid maxes at `lg:grid-cols-3`. Add `xl:grid-cols-4` so wide screens get a tighter, more scannable row instead of three large cards with side gutters. Cards already collapse cleanly on smaller widths.

### 4. Container ceiling for wide viewports
`src/index.css` line 423 caps `.pb-container` at 1180px. Bump to 1280px (still narrower than the 1400px design-system `containerMax` and well within Apple-style readable bounds). This single change gives the whole page ~100px more horizontal room on `xl` without touching mobile (the `min(100% - 2rem, …)` formula keeps small screens identical).

## Out of scope

- No copy changes, no new sections, no color/typography tweaks.
- Mobile and tablet layouts are not touched — all changes are gated behind `lg:`/`xl:` or live in the `min(...)` clamp.
- Dashboard shell, marketing nav, and other layouts already refactored in earlier turns are left alone.

## Verification

After implementing, screenshot the landing page at 1440×900 and 1024×768 to confirm:
- Hero shows side-by-side layout at 1440, stacked at 1024.
- Use cases shows 4 columns at 1440, 3 at 1280, 2 at md, 1-card carousel at mobile.
- No horizontal scrollbar at any width.
