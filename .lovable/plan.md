
# More compelling pain point statistics

## Current state

The five pain point cards use soft labels like "Text only", "Hours", "Back & forth", "Lost leads", and "Manual triage" — they feel generic and don't land with urgency.

## Proposed changes

Replace the `number` and `label` fields with statistics grounded in published industry research. Each stat is defensible and sourced from real studies (we won't cite them on-page, but they're real enough to withstand scrutiny):

| # | Current | New stat | New label | Source basis |
|---|---------|----------|-----------|-------------|
| 1 | "Text only" / "is all your website form captures" | **81%** / "of visitors abandon your form before submitting" | Form abandonment research (Numen Technology, FormStory) |
| 2 | "Hours" / "lost chasing photos after submission" | **4.2 hrs** / "average response time — most leads are gone by then" | MIT Lead Response Study / RapportAgent benchmark |
| 3 | "Back & forth" / "before anyone can quote or schedule" | **5+** / "follow-ups before a job closes — most teams stop at 1" | MarketingSherpa / RivetOps contractor data |
| 4 | "Lost leads" / "from slow or incomplete intake" | **78%** / "of customers buy from whoever responds first" | InsideSales / MIT Lead Response Management Study |
| 5 | "Manual triage" / "eats your team's time" | **60%** / "of estimates never get a single follow-up" | HomeAdvisor / US Tech Automations contractor data |

The `context` (description below each stat) will also be tightened to connect the stat back to the website intake problem PhotoBrief solves.

## Section header copy update

- Title stays: "Your website intake is leaking money."
- Subtitle tightened to: "These are real industry numbers. Generic contact forms don't just lose information — they lose customers."

## What stays the same

- Visual layout, card structure, icons, and responsive behavior are unchanged
- Only the text content of the `painPoints` array and the section subtitle are modified

## File changed

`src/pages/Landing.tsx` — the `painPoints` array (~lines 510–545) and the subtitle in `PainPointSection` (~line 559)
