## Rebalance the "Last Word" final CTA section

The section currently has the headline alone in the left column and everything else (illustration, body, CTAs) crammed into the right — leaving a big empty void under the headline.

### Change (single file: `src/pages/Landing.tsx`, FinalCta, ~lines 1796–1846)

Restructure to a balanced two-column layout:

**Left column** (text, left-aligned, vertically centered):
- Eyebrow "The last word"
- Headline "Get quote-ready leads, not vague messages."
- Body paragraph ("Stop chasing customers…")
- CTA group (Apply for the beta / See plans)

**Right column** (illustration, vertically centered):
- Mailbox illustration, increased to ~`max-w-[320px]`, centered within its column

### Implementation notes
- Move `<Eyebrow>` inside the grid's left column so the whole text block aligns together.
- Grid: `lg:grid-cols-2 lg:items-center gap-10 lg:gap-16`.
- Drop the `lg:pt-3` and `mb-6` on the image; use flex centering instead.
- Keep all copy, CTAs, tones, and tokens unchanged — purely a layout rebalance.

### Out of scope
No copy changes, no other sections, no token/CSS edits.
