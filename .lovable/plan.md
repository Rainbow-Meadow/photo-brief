## What's off

On desktop, the hero stack uses arbitrary Tailwind margins (`mt-6` / `mt-8` / `mt-10`) that don't ladder with the type scale, and the marquee renders at hero-headline weight (`clamp(2rem, 5vw, 3.75rem)` ≈ 60px at 1347px wide) with `py-5` + `space-y-2`, so the band reads as a second hero rather than a thin accent strip. The result: spacing between eyebrow → H1 → subtitle → CTAs feels uneven, and the marquee crowds whatever sits below it.

## Fix — desktop-first, two surgical edits

### 1. `src/pages/Landing.tsx` — even hero rhythm

Replace the ad-hoc margins on the hero left column with a single proportional ladder, em-anchored to the H1 so it scales with the clamp:

```text
eyebrow                     ← (block start)
↓ mt-8         (was mt-6 on H1)
H1 ls-display-stack
↓ mt-6         (was mt-8 on subtitle)
subtitle
↓ mt-8         (was mt-10 on CTA row)
CTAs
```

Concrete edits inside `Hero()` (lines 79 / 88 / 93):
- `<h1 className="ls-h1 ls-display-stack mt-8">`
- `<p className="ls-subtitle mt-6 max-w-[44ch]">`
- `<div className="mt-8 flex flex-row flex-wrap items-center gap-x-5 gap-y-3">`

Also drop the freshly-added `mt-12 sm:mt-20` on `MarqueeBand` outer div down to `mt-10 sm:mt-14` — the band is no longer scrolling under the hero, but should still feel like part of the same composition.

### 2. `src/design-system/schema.css` — slim the marquee band

Make the band visually a thinner accent strip on desktop while leaving the mobile size alone:

```css
.ls-marquee-item {
  /* was clamp(2rem, 5vw, 3.75rem) — too close to ls-h1 */
  font-size: clamp(1.5rem, 3.2vw, 2.5rem);
  letter-spacing: -0.018em;
  padding-inline: 1.25rem;
  /* unchanged: font, weight, color, white-space */
}
```

And in `Landing.tsx` MarqueeBand wrapper (line 132), drop padding + row gap:
- `py-5` → `py-3`
- `space-y-2` → `space-y-1`

Net effect: band height drops ~40%, sits as a clear horizontal divider between hero and the mechanism section instead of competing with the H1.

## Out of scope

- No mobile-specific tuning (user picked desktop).
- No changes to Section padding tokens, BeforeAfterSlider, BrandMark, or marquee content/colors.
- No new tokens — only existing Tailwind margins and the one `.ls-marquee-item` rule.

## Verification

- Reload `/` at 1347 desktop — confirm eyebrow→H1→subtitle→CTA spacing feels even and the marquee reads as a single thin accent band, not a second hero.
- Spot-check at 1280 and 1536 to confirm the clamps still scale cleanly.
- `bun run test:visual -- --project="public-desktop"` baselines will need refresh (expected).
