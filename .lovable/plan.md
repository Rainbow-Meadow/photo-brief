## Goal

Bring the three beta sections in line with the editorial 2-column rhythm used by Pain Point, Workflow, Comparison, Use Cases and Website Intelligence — eyebrow + title + description on the left, illustration as a right-column accent (`SectionIntro` with `accent`).

Today these three sections each use ad-hoc layouts and place the illustration inline (small, off-grid). This makes the beta zone feel disconnected from the rest of the page.

## Current vs target

| Section | Today | Target |
|---|---|---|
| Founding Partner Beta | Eyebrow + title + body stacked above a 2-col `narrative / apply agent` grid; badge illustration tucked top-left of narrative at 260px | Lift eyebrow + title + lead paragraph into a `SectionIntro` with `foundingBadgeIllo` as `accent`. Keep the existing narrative-detail + apply-agent grid below it as a separate row. |
| Reward Tiers | Centered `max-w-3xl` block; ribbons illustration centered above eyebrow at 220px | Convert the intro (eyebrow + title + description) into a `SectionIntro` with `rewardRibbonsIllo` as `accent`. Keep the tier list and "what drives placement" block below at the same `max-w-3xl` width. |
| Beta Details Accordion | Centered `max-w-3xl`; notebook centered above the "Fine print / Show all details" header strip at 200px | Convert the header strip into a `SectionIntro` (eyebrow = "The fine print", small title like "Everything in writing.", short one-liner description) with `betaNotebookIllo` as `accent`. Move the master "Show all details" toggle to a small row directly above the accordion (below the intro), preserving the divider rule. |

## Visual contract (matches the rest of the page)

- Use the existing `SectionIntro` component with `accent={<TradeAccent src={...} alt="..." />}`.
- On `lg`: 1.15fr / 0.85fr split, left-aligned text, illustration right; on mobile, stacks centered. (Already what `SectionIntro` provides.)
- Illustrations render at `max-w-[420px]` via `TradeAccent` — same scale as the upstream sections.
- Remove the small inline `<img>` blocks added to these three sections in the prior pass; they're replaced by the `SectionIntro` accent so the illustration appears once, properly sized.

## Copy

No new copy needed — we'll reuse what's already on each section. Only addition: a single-sentence description for the Beta Details intro since today it's just an eyebrow strip. Suggested: "How the program runs, what we ask of partners, and exactly how rewards are decided." (Open to other phrasing — flag if you want different wording.)

## Out of scope

- No changes to the apply agent, the seat tracker, the reward callout card, the tier list, or the accordion content/items.
- No new illustrations; no asset edits; no SEO/meta changes; no backend.
- The beta-zone background tinting (`pb-beta-zone`, `pb-section-alt`) stays as-is.

## Files

- Edited: `src/pages/Landing.tsx` only (three section refactors + remove three small inline `<img>` blocks added previously).
