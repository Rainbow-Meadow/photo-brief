## Problems

1. **Marquee overlaps the hero image.** The `MarqueeBand` sits directly under `<Hero />` with no top spacing, and the hero's right column (BeforeAfterSlider + BrandMark at `mt-6`) extends to the bottom of its `Section`. The marquee band's top edge cuts into the bottom of the phone/laptop image.
2. **Header nav pill is too light against the dark landing.** `.pb-paper-pill` uses a near-white background (`hsl(220 35% 99% / 0.78)`). The user wants the pill itself to be **dark** so it reads as part of the dark landing, while text stays cream (current).

## Fix

### 1. Marquee no longer touches the hero (`src/pages/Landing.tsx`)

In the `MarqueeBand` wrapper (line 132), add vertical breathing room above the band so it can't ride up into the hero image:
- Add `mt-12 sm:mt-20` to the outer `<div>`.

(No change to `MarqueeRow` or its inner spacing.)

### 2. Dark pill — `.pb-paper-pill` (`src/index.css`, ~line 428)

Swap the pill surface to a dark token while keeping the existing cream text/links untouched:

```css
.pb-paper-pill {
  background: hsl(var(--pb-panel) / 0.82);     /* dark graphite, was near-white */
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid hsl(var(--pb-ink-soft) / 0.14);
  box-shadow:
    0 14px 36px -22px hsl(var(--pb-shadow) / 0.6),
    0 1px 0 hsl(var(--pb-ink-soft) / 0.06) inset;
  --pb-wordmark-gradient: linear-gradient(135deg, hsl(var(--pb-ink)) 0%, hsl(var(--pb-amber)) 100%);
}
```

Tokens used already exist (`--pb-panel`, `--pb-ink-soft`, `--pb-shadow`, `--pb-ink`, `--pb-amber`). The existing `.pb-paper-link` color (`--pb-ink-soft / 0.78`) now reads correctly cream-on-dark, with the amber hover/active state preserved.

### 3. Sign-in / menu buttons — leave as-is

Their `text-[hsl(var(--pb-ink-soft))]` already works against the dark landing canvas; with the pill now dark too, no change needed.

## Verification

- Reload `/` at 1313 desktop and 390 mobile — confirm marquee has clear gap above it (no overlap with hero image) and the header pill reads as a soft dark capsule with cream wordmark + amber active link.
- Tab through pill links — hover/active still flips to amber.
- Re-run `bun run test:visual -- --project="public-desktop"` afterward; baselines will need a refresh (expected).

## Out of scope

- No changes to `MarqueeRow`, BrandMark, or hero contents.
- No new CSS variables, no Tailwind config changes.
