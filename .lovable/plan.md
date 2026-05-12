# Landing Page Layout Refactor

Tighter overall vertical rhythm. Mobile + desktop both covered. No copy changes, no asset swaps, no token edits. Section order preserved (Hero → Marquee → Mechanism → Comparison → Signpost → FAQ → Final CTA).

---

## 1. Hero (`Landing.tsx` → `Hero`)

- Cap the right-column `BeforeAfterSlider` height (`max-h-[480px] lg:max-h-[520px]`, image `object-contain`) so the row no longer inherits a tall image height.
- Keep two-column layout with `lg:items-center`; with the shorter image, copy column naturally vertically centers — empty band above the eyebrow goes away.
- Headline stays as the 3-line display stack (`Guide.` / `Capture.` / `Close.`).
- **Mobile CTAs:** switch from stacked to inline pair — primary `Try the live demo` + secondary ghost `Apply for the beta →` side-by-side in one row. Wrap with `flex flex-row flex-wrap gap-3` instead of stacking.
- Section padding untouched.

## 2. Marquee band (`Landing.tsx` → `MarqueeBand`)

- Reduce `py-8` → `py-5`, tighten row gap `space-y-3` → `space-y-2`.
- Replace `bg-card` with an accent-tinted strip (subtle amber wash, e.g. `bg-[hsl(var(--accent-kinetic)/0.08)]` with the existing `border-y border-border`).
- Both rows kept (mantra + stats), opposite directions unchanged.

## 3. Mechanism (`MechanismGrid.tsx`)

- **Alternate sides per row:** odd rows image-left / copy-right, even rows image-right / copy-left (independent of orientation). Keep the orientation-based column-span split (landscape 7/5, portrait 5/7).
- **Oversized step numeral:** replace the small `ls-numeral` with a large display numeral (e.g. `font-display text-7xl lg:text-8xl text-muted-foreground/30`) anchored above or behind the title in the copy column.
- **Tighter rhythm:** `space-y-16 lg:space-y-24` → `space-y-12 lg:space-y-16`.
- **Mobile order:** within each row, copy renders before image (currently image first). Use `order-` utilities so desktop side-alternation is preserved.

## 4. Before / After comparison (`Landing.tsx` → `ComparisonSection`)

- Replace the two-card grid with a **single split panel**: one bordered container, vertical seam down the middle at `lg`, "Before" left half / "After" right half. Mobile stacks vertically with a horizontal seam.
- **Image on top of each half:** illustration first (no `aspect-[16/9]` muted box, no `p-4`), then numeral + heading + bullets beneath.
- **Dim Before / brighten After:** Before half gets `opacity-60 grayscale-[0.4]` and a quiet background; After half gets full color, a thin accent-kinetic border, and the elevated surface tint.
- Bullet rows kept as-is (icon + sentence).

## 5. Signpost — three doors (`Landing.tsx` → `SignpostSection`)

- **Hero the Beta door:** desktop grid becomes `lg:grid-cols-2` with rows: Beta spans the full top row (large, accent border or accent surface), Demo + Pricing share the bottom row as smaller tiles. Mobile stacks all three full-width.
- **Borderless rows:** drop the `Card` panel. Each door is bare content (no fill, no border) separated from siblings by a top hairline (`border-t border-border pt-8`). Beta keeps a subtle accent treatment so it still reads as the priority.
- **Title-led order inside each door:** `Title` → `Body` → footer row containing eyebrow + icon + arrow CTA. Drop the icon from the top.

## 6. FAQ (`Landing.tsx` → `FaqSection`)

- **Sticky intro + scrolling Q&A:** replace narrow single-column with a 2-column layout at `lg`: left rail (`lg:col-span-4`) holds the `SectionIntro` and the "Read the full help center →" link, sticky (`lg:sticky lg:top-24 self-start`). Right rail (`lg:col-span-8`) holds the accordion. Mobile stacks intro → accordion → link.
- All items collapsed by default (current behavior).
- Keep 4 questions.
- **Drop numerals** from each accordion trigger — just the question, font-display medium. Adjust `AccordionContent` `pl-12` → `pl-0` (or small left padding to align with the question).

## 7. Final CTA (`FinalCtaSection.tsx`, applied globally — Beta page also updates)

- **Asymmetric two-column layout** at `lg`: oversized headline left (`lg:col-span-7`), eyebrow + body + CTAs stacked right (`lg:col-span-5`, vertically centered). Mobile stacks naturally.
- **Accent surface:** swap `Section tone="dark"` for an accent-tinted surface — subtle amber wash on top of the dark base (`bg-gradient-to-br from-[hsl(var(--accent-kinetic)/0.12)] to-transparent`) so the closing CTA reads as the loudest moment on the page.
- **Big primary + text link:** primary CTA becomes `size="lg"` solid button at slightly larger weight; secondary becomes a quiet underlined text link beneath the primary (not an inline `CTA secondary`). Keep `CTAGroup` only for the primary; render secondary as a `<NavLink>` with `ls-cta-quiet` styling below.

---

## Technical notes

- All edits stay in: `src/pages/Landing.tsx`, `src/components/marketing/MechanismGrid.tsx`, `src/components/marketing/FinalCtaSection.tsx`. No token, schema, or shared-primitive changes.
- Tokens and colors continue to come from `src/index.css` (`--accent-kinetic`, `--background`, `--border`, etc.) — no inline hex.
- Beta page (`src/pages/Beta.tsx`) inherits the new Final CTA layout automatically since the change is global; no Beta-specific edits needed.
- After implementation: capture desktop (1366) + mobile (375) screenshots of each section to verify nothing regressed.

## Out of scope

- Copy text, eyebrow numbering, asset swaps.
- `SectionIntro`, `Section`, `Container`, `Card`, `CTA` primitives — used as-is.
- Other pages (Pricing, Demo, Help, etc.) and design tokens.
