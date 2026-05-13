# Mechanism — parallel copy + inline numbered badge

## Copy (parallel structure: 2-word verb-led title, single ~10-word sentence body)

| # | Title | Body |
|---|---|---|
| 01 | **Read your site** | We pull every service from your website, in your customers' words. |
| 02 | **Build the routes** | Each service gets its own questions and its own photo policy. |
| 03 | **Guide the customer** | One CTA picks the route, asks what's needed, opens the camera only when it matters. |
| 04 | **Hand you a brief** | Who, what, route, answers, photos, next step — quote on the first reply. |

All four titles: two words, verb + object. All four bodies: one sentence, ~10–14 words.

## Numeral treatment — inline numbered badge

Replace the giant 7xl/8xl ghost numeral block with a small circular badge sitting beside the title on the same line:

- 28px circle, 1px amber outline (`hsl(var(--accent-kinetic))`), transparent fill
- Inside: `01`–`04` in mono, 11px, amber, tracking-wide
- Sits to the LEFT of the `<h3>` title, vertically centered, with a 12px gap
- Wrap title row in `flex items-center gap-3`
- Remove the existing top border + `pt-6` on the title (badge replaces the visual anchor)

Result: title row reads as `(01) Read your site` — quiet, on-brand, and the body sentence carries the eye instead of competing with a giant numeral.

## File changes

- `src/components/marketing/MechanismGrid.tsx` — update the four `body` strings, two `title` strings ("Read the site" → "Read your site", "Hand you a brief" stays), swap the numeral block (lines ~78-84) for the inline badge markup. No prop or export changes.

## Out of scope

- Image swaps, layout/orientation changes, section eyebrow/title/subtitle copy, animation timing.
