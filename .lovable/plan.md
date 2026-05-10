## Goal
Beef up the kinetic stat strip on the landing page (`MarqueeBand`) by adding a third scrolling row and several more service-trade statistics, so the band reads like an editorial ticker of "the industry problem" rather than two thin lines.

## Changes — `src/pages/Landing.tsx`, `MarqueeBand` only

Keep the existing two rows, add a third row, and pad rows 1 and 2 with extra stats so the rhythm stays balanced.

```text
Row 1 (left, 45s)   : tagline words + brand mark   ← unchanged
Row 2 (right, 60s)  : core demand-side stats       ← add 3 more
Row 3 (left, 75s)   : ops / quoting / no-show stats ← NEW
```

### Row 2 — add to existing list
- "1 in 4 jobs lost to a missing photo"
- "$1,200 avg revisit cost when the brief is wrong"
- "Most quotes go out 2+ days late"

### Row 3 — NEW (left, 75s, alternating ghost/accent rhythm)
- "63% of homeowners ghost after the first quote"
- "Only 12% of contractors send a recap after the visit"
- "Site visits add 45 min per lead — most are avoidable"
- "92% of buyers expect a reply same-day"
- "Reverse-Form Method™" (accent)
- "1 packet. 1 inbox. 0 back-and-forth." (accent)

Use the same `<span className="ls-marquee-item …">` markup and `·` ghost separators already in use, so it inherits Geist display + paper foreground styling from `schema.css` (`.ls-marquee-item`, `--accent`, `--ghost`).

### Container
Bump `space-y-3` → `space-y-4` so three rows breathe; keep border-y + bg-card wrapper.

## Out of scope
- No changes to `MarqueeRow` component, `schema.css`, or the section anchor strip.
- No new sections, no copy changes outside the band.
- Stats are illustrative industry figures consistent with the existing tone — tell me if you want me to swap in specific cited numbers instead.
