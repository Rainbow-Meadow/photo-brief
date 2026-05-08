## Goal

In the landing hero, render exactly one logo — the primary full logo at `/brand/full-logo.svg` — sized large enough that the mark + wordmark + tagline details are clearly legible on both mobile and desktop.

## Current state

`src/pages/Landing.tsx` (lines 343–346) renders the hero brand using two stacked `BrandMark variant="horizontal"` instances (one mobile, one desktop) that compose the camera mark + `Photo` + `Brief` + `.ai` + tagline at runtime. This composite is small relative to the hero (size 56 / 76) and re-implements the lockup instead of using the canonical art file.

The header (sticky nav) also shows a small wordmark pill — that lives outside the hero and is **not** in scope per the request ("address the hero").

## Change

In `src/pages/Landing.tsx`, replace the two `BrandMark` calls in the hero left column with a single `<img>` of the canonical primary lockup:

- `src="/brand/full-logo.svg"`
- `alt="PhotoBrief.ai — Guide · Capture · Close"`
- `loading="eager"`, `decoding="async"`, `fetchPriority="high"`
- Responsive sizing via Tailwind, large enough to read details:
  - Mobile (<sm): `h-20` (80px)
  - sm: `h-28` (112px)
  - lg: `h-36` (144px)
- `width: auto`, no cropping, left-aligned, sits above the eyebrow chip with the existing `mb-6 sm:mb-8` spacing.

No other hero content (eyebrow, headline, body, CTAs, bullets) changes. No changes to `BrandMark.tsx`, the header, or other pages.

## Verification

- View `/` at mobile (440px) and desktop widths; confirm only one logo appears in the hero, the mark/wordmark/tagline within it are legible, and layout below it is unchanged.
- Confirm no console 404 for `/brand/full-logo.svg`.
