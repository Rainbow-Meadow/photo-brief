## Goal
Make the full PhotoBrief.ai logo (mark + two-tone wordmark + "Guide · Capture · Close" tagline) appear prominently on the landing page hero — currently only the wordmark shows in the nav.

## Change
Edit `src/pages/Landing.tsx` hero block (around lines 340–352, just above the eyebrow/H1):

Add a `<BrandMark variant="horizontal" tone="dark" size={72} showTagline eager />` lockup as the first element in the left-copy column, with margin below it. This renders:
- The color mark icon (~72px)
- "PhotoBrief.ai" wordmark (navy + amber + faded .ai)
- Uppercase "GUIDE · CAPTURE · CLOSE" tagline underneath

Then keep the existing eyebrow chip ("Accepting beta applications") and H1 below it.

Responsive: use `size={56}` on mobile via two BrandMarks gated by `sm:hidden` / `hidden sm:flex`, matching the pattern already used in `MarketingLayout.tsx`.

## Notes
- BrandMark already supports `variant="horizontal"` + `showTagline` — no component changes needed.
- Import for BrandMark needs to be added to `Landing.tsx` (not currently imported there).
- No color/token changes; reuses the established navy/amber/cream system.
- Nav wordmark stays as-is so the header doesn't double up.