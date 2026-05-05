
# Responsive Landing Page Typography & Spacing Overhaul

After auditing the landing page at both 390px mobile and 1280px desktop, here are the issues and fixes:

## Problems Identified

- **Hero title** is disproportionately large on mobile (13.2vw = ~51px at 390px) and slightly too tight on desktop
- **Section titles** scale too aggressively (clamp min 2.35rem is large for mobile)
- **Body text** (`.pb-copy`) has no responsive sizing — fixed color only, no font-size/line-height
- **Workflow step titles** (`text-2xl` = 24px) are heavy on mobile
- **Beta section title** jumps from `text-3xl` to `text-5xl` — too large at sm breakpoint
- **Pricing path card titles** at `text-3xl` are oversized on mobile
- **Section padding** is generous; could be tighter on mobile for less scrolling
- **Container** side padding (1rem per side) is tight on mobile
- **Eyebrow badges** don't scale between mobile/desktop
- **Comparison signals** and use case cards have uniform padding that feels loose on mobile

## Changes

### 1. `src/index.css` — Foundation typography tokens

- `.pb-copy`: Add `font-size: clamp(0.938rem, 0.4vw + 0.875rem, 1.125rem); line-height: 1.65`
- `.pb-container`: Add sm breakpoint with wider side padding (`3rem` at 640px+)
- `.pb-section`: Reduce to `clamp(3.5rem, 7vw, 7rem)`
- `.pb-section-tight`: Reduce to `clamp(3rem, 5.5vw, 5rem)`
- `.pb-eyebrow`: Add responsive sizing (smaller on mobile, current size at sm+)
- `.pb-hero-title`: Adjust to `clamp(2.75rem, 6.5vw, 5.5rem)` with line-height `1.0` and weight `740`
- `.pb-section-title`: Adjust to `clamp(1.75rem, 4.2vw, 3.5rem)` with line-height `1.06` and weight `700`

### 2. `public/hero-refinements.css` — Hero-specific overrides

- Desktop hero title: `clamp(2.75rem, 5.2vw, 5rem)`, line-height `1.04`, weight `720`, max-width `17ch`
- Hero subtitle span: `clamp(1.6rem, 2.8vw, 2.6rem)`, weight `640`
- Mobile override: title `clamp(2.5rem, 11vw, 3.5rem)`, max-width `13ch`
- Mobile subtitle: `clamp(1.35rem, 6.5vw, 1.9rem)`

### 3. `src/pages/Landing.tsx` — Component-level responsive classes

**HeroSection:**
- Body text: `text-base sm:text-lg leading-7 sm:leading-8` (down from `text-lg sm:text-xl`)
- CTA button group: `mt-7 sm:mt-8` and `gap-2.5 sm:gap-3`
- Route chips grid: `gap-1.5 sm:gap-2`, text `text-[0.7rem] sm:text-xs`

**WorkflowSection:**
- Section body text: `text-base sm:text-lg`
- Step title: `text-xl sm:text-2xl` (down from `text-2xl`)
- Step body: `text-sm sm:text-base`
- Card padding: `p-4 sm:p-5 md:p-6` (down from `p-5 md:p-6`)

**ComparisonSection:**
- Section body text: `text-base sm:text-lg`
- Toggle bar: `py-2.5 sm:py-3`
- Signal items: `p-3 sm:p-4`, number badges `h-7 w-7 sm:h-8 sm:w-8`
- Signal text: `text-sm sm:text-base`

**UseCaseSection:**
- Section body text: `text-base sm:text-lg`
- Card title: `text-lg sm:text-xl` (down from `text-xl`)
- Card padding: `p-4 sm:p-5 md:p-6`

**FoundingPartnerSection:**
- Title: `text-2xl sm:text-3xl lg:text-4xl` (down from `text-3xl sm:text-5xl`)
- Body text: `text-base sm:text-lg`
- Panel padding: `p-5 sm:p-6 lg:p-8 xl:p-10`

**PricingPathSection:**
- Card title: `text-2xl sm:text-3xl` (down from `text-3xl`)
- Card padding: `p-5 sm:p-6 lg:p-8`
- Body text: `text-sm sm:text-base leading-6 sm:leading-7`

**FinalCta:**
- Container padding: `p-6 sm:p-8 lg:p-12`
- Body text: `text-base sm:text-lg`
- Footnote: `text-xs sm:text-sm`

All changes maintain the existing dark theme, brand colors, and design token system. No custom color classes added.
