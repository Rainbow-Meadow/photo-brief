## Goal

Take the 5 trade illustrations out of the Use Cases cards and reuse them as larger, side-anchored anchor visuals next to each section's intro — giving the page a stronger editorial rhythm.

## Anchor mapping (one illustration per section)

| Section | Illustration | Why |
|---|---|---|
| Pain Point | junk-hauler | Chaos of unsorted photos = hauler's load |
| Workflow | hvac-tech | Steady, methodical process |
| Comparison (messy/clean) | estimator | Before/after assessment fits damage estimating |
| Use Cases | landscaper | Showcases breadth/variety |
| Website Intelligence | plumber | "Under the hood" feel |

All 5 illustrations stay used; none deleted.

## Changes — `src/pages/Landing.tsx` only

1. **`useCases` array**: remove the `image` field from each entry.
2. **`UseCaseSection`**: remove the `<img>` rendered inside each card; restore the simpler card header (number + title). Pass `landscaperIllo` as `accent` on its `SectionIntro`.
3. **`PainPointSection`**: render its heading via `SectionIntro` with `junkHaulerIllo` as `accent` (or add a matching anchor block above the existing pain-point UI if it doesn't already use SectionIntro).
4. **`WorkflowSection`**: remove the current right-column `estimatorIllo` accent block; instead pass `hvacTechIllo` as `SectionIntro` `accent` so anchoring is consistent.
5. **`ComparisonSection`**: pass `estimatorIllo` as `SectionIntro` `accent` (only on the "messy" mode call so it appears once, not duplicated in the clean half).
6. **`WebsiteIntelligenceSection`**: pass `plumberIllo` as `SectionIntro` `accent`.

## Visual spec for the anchor

- Reuse existing `SectionIntro` `accent` slot (already supports a 1.15fr / 0.85fr two-column layout on `lg`, stacks on mobile).
- Image wrapper: `max-w-[420px] w-full`, `drop-shadow-[0_18px_30px_rgba(12,9,21,0.35)]`, gentle paper-tape framing consistent with the hero.
- `loading="lazy"`, `decoding="async"`, descriptive `alt` per trade.
- No new CSS tokens; no animation beyond what `.touch-blur-reduce` already governs.

## Out of scope

- No copy changes, no new sections, no new assets, no backend.
- Hero "Built for…" trade strip stays as-is.
