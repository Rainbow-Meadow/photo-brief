## Goal

Give every major content section on the landing page its own anchor illustration. Five sections still need one. New illustrations are **object/scene-based, no people, no professions** — they extend the existing hand-drawn ink + lavender/ochre watercolor language already used by the hero and trade illustrations.

## Sections still missing an anchor (5)

| # | Section | Concept | Filename |
|---|---|---|---|
| 1 | "See the difference" (InteractiveHeroBriefAssembly intro) | A crumpled scrap of paper transforming into a neatly clipped photo packet — visualizes vague → structured. | `transformation-illustration.png` |
| 2 | Founding Partner Beta | A small corkboard with three numbered ribbon badges ("001 / 002 / 003") and a brass pin — captures the limited-seat founding cohort feel. | `founding-badge-illustration.png` |
| 3 | Reward Tiers | A stack of layered rosette ribbons / award medals with paper tags fanned out — speaks to escalating rewards. | `reward-ribbons-illustration.png` |
| 4 | Beta Details (accordion) | An open lined notebook with handwritten clauses, a paperclip, and a small magnifying glass resting on the page — reads as "the fine print". | `beta-notebook-illustration.png` |
| 5 | Final CTA | A raised mailbox flag with a couple of envelopes tucked inside, ribbon tied — invites the next move without depicting a person. | `mailbox-flag-illustration.png` |

All assets land in `src/assets/scenes/` (new folder) so they're cleanly separated from `src/assets/trades/`.

## Visual spec (shared)

- 1024×1024 PNG, transparent background, "on a clean white background" prompt.
- Loose ink line + watercolor wash; palette: lavender `#8f63ff` / `#b98cff`, ochre/cream accents, soft graphite shadows. Same painterly weight as the existing hero/trade illustrations so they read as a family.
- No human figures, no logos, no readable text inside the art (numerals like "001" are fine as scribbled marks).
- Composition centered with breathing room — they'll be rendered at ~`max-w-[420px]` with a `drop-shadow` consistent with `TradeAccent`.

## Placement (`src/pages/Landing.tsx`)

1. **"See the difference"** — replace the `StatAccent` in the existing `SectionIntro` with `<TradeAccent src={transformationIllo} … />`.
2. **Founding Partner Beta** — find the section's `SectionIntro` (or top heading) and pass the badge illustration as `accent`. If it doesn't use `SectionIntro`, drop a `TradeAccent`-shaped block beside the heading using the same 1.15fr / 0.85fr split.
3. **Reward Tiers** — same treatment with the rosette illustration.
4. **Beta Details Accordion** — small inline anchor (max-w 280–320px) next to the accordion header so it doesn't overpower the disclosure UI.
5. **Final CTA** — anchor the mailbox-flag illustration to the side of the CTA copy on `lg`, stacking above on mobile.

`TradeAccent` is reused as-is — no new helper. Imports added at the top of `Landing.tsx`.

## Out of scope

- No copy changes, no new sections, no layout overhauls beyond placing the accent.
- No edits to existing trade illustrations or the hero.
- No backend, no SEO/meta changes.

## Files

- New: 5 PNGs under `src/assets/scenes/`.
- Edited: `src/pages/Landing.tsx` (imports + 5 accent placements).
