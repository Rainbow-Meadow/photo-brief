
# Unified Page Spacing Schema

The landing page already uses a consistent set of utility classes (`pb-container`, `pb-section`, `pb-section-tight`) defined in `index.css`. Other marketing pages (Pricing, Privacy, Terms, Waitlist, BetaPortfolio, ForAiAgents, BetaGuidePage) use ad-hoc Tailwind with inconsistent max-widths (`max-w-3xl` to `max-w-7xl`), padding (`px-4 sm:px-6 lg:px-8`), and section spacing (`py-14 sm:py-20`, `py-16`, `pt-16 lg:pt-20`, etc.).

## The master schema

Already defined in `index.css`:

```
pb-container  → width: min(100% - 2rem, 1180px); margin-inline: auto;
               @sm: min(100% - 3rem, 1180px)
pb-section    → padding-block: clamp(3.5rem, 7vw, 7rem); position: relative;
pb-section-tight → padding-block: clamp(2.5rem, 4.5vw, 4rem); position: relative;
```

Add one new utility for narrower content pages (Privacy, Terms, FAQ):

```
pb-container-narrow → width: min(100% - 2rem, 860px); margin-inline: auto;
                      @sm: min(100% - 3rem, 860px)
```

## Pages to refactor

### Pricing (`src/pages/Pricing.tsx`)
- Hero: replace `mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8` with `pb-container pb-section`
- Beta offer grid: replace `px-4 pb-8 pt-4 sm:px-6 lg:px-8` + `mx-auto max-w-6xl` with `pb-container pb-section-tight`
- Intake modes: same pattern
- Plan cards section: same pattern
- FAQ section: replace `mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8` with `pb-container-narrow pb-section`

### Privacy (`src/pages/Privacy.tsx`)
- Hero card section: replace `mx-auto max-w-5xl px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pt-20` with `pb-container-narrow pb-section`
- Content cards section: replace `mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24` with `pb-container-narrow pb-section`

### Terms (`src/pages/Terms.tsx`)
- Same as Privacy — apply identical refactor

### Waitlist (`src/pages/Waitlist.tsx`)
- Main grid: replace `mx-auto max-w-6xl px-4 py-16 sm:py-20` with `pb-container pb-section`

### ForAiAgents (`src/pages/ForAiAgents.tsx`)
- All sections: replace various `mx-auto max-w-Xyl px-4 py-16 sm:px-6 lg:px-8 lg:py-20` with `pb-container pb-section`

### BetaPortfolio (`src/pages/BetaPortfolio.tsx`)
- Remove leftover `border-y bg-muted/25` on one section (violates seamless rule)
- Normalize all sections to use `pb-container pb-section`

### BetaGuidePage (`src/features/help/pages/BetaGuidePage.tsx`)
- Normalize badge chip to match `border-white/[0.08] bg-white/[0.04]` glass style

## Files affected

| File | Change |
|------|--------|
| `src/index.css` | Add `pb-container-narrow` utility |
| `src/pages/Pricing.tsx` | Replace ad-hoc spacing with schema classes |
| `src/pages/Privacy.tsx` | Replace ad-hoc spacing with schema classes |
| `src/pages/Terms.tsx` | Replace ad-hoc spacing with schema classes |
| `src/pages/Waitlist.tsx` | Replace ad-hoc spacing with schema classes |
| `src/pages/ForAiAgents.tsx` | Replace ad-hoc spacing with schema classes |
| `src/pages/BetaPortfolio.tsx` | Normalize spacing + remove border-y divider |
| `src/features/help/pages/BetaGuidePage.tsx` | Normalize badge chip style |

Result: every marketing page uses the same 4 utility classes for layout, creating predictable, uniform spacing site-wide.
