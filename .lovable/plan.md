
## Language changes

Shift all "beta now live/open" phrasing to "accepting applications" framing, and update CTAs to emphasize the application + review process. Key copy changes across the landing page and banner:

| Current | Updated |
|---------|---------|
| "Founding Partner Beta now open" | "Accepting beta applications" |
| "Apply for beta access" (CTA) | "Apply now" or "Submit your application" |
| "Apply now — limited to 30 spots" | "Apply now — 30 seats, reviewed for fit" |
| "Join the Founding Partner Beta" (form heading) | "Apply for the Founding Partner Beta" |
| "Limited spots · We typically reply within a few days" | "Every application is reviewed for workflow fit · Limited to 30 seats" |
| "Invite-only beta" chip | "Reviewed for fit" chip |

Also update `FoundingCustomerBanner.tsx` copy to match ("Accepting beta applications — limited seats").

## Urgency component: `BetaSeatTracker`

Create a new `src/components/marketing/BetaSeatTracker.tsx` component that communicates scarcity and the deliberate review process.

**Visual design:**
- A compact, visually prominent bar/pill showing remaining seats (e.g., "23 of 30 seats remaining")
- Segmented progress bar (30 segments) — filled segments use the brand lavender, empty segments are dim
- Below the bar: short copy reinforcing the review process ("Each applicant is reviewed for workflow fit before acceptance")
- When all seats are filled, the component switches to a bold "All 30 seats filled" state with a waitlist CTA instead of apply, and a visual change (e.g., amber/gold accent, lock icon)

**Data source:** Add a `BETA_SEATS_FILLED` constant to `betaProgram.ts` (default `0`). This is a manual counter you update as partners are accepted — no database query needed. The component computes `remaining = BETA_TOTAL_PARTNERS - BETA_SEATS_FILLED`.

**Placement:**
- In the hero area, directly below the trust chips ("No app for customers", "Reviewed for fit", "Concierge setup")
- In the application form section, above the form fields
- Optionally in the `FoundingCustomerBanner`

**Filled state behavior:** When `BETA_SEATS_FILLED >= BETA_TOTAL_PARTNERS`, all "Apply" CTAs across the page switch to "Join the waitlist" and the form submit button updates accordingly.

## Files changed

1. **`src/config/betaProgram.ts`** — Add `BETA_SEATS_FILLED` constant
2. **`src/components/marketing/BetaSeatTracker.tsx`** — New urgency component
3. **`src/pages/Landing.tsx`** — Update copy throughout + place `BetaSeatTracker` in hero and form sections + conditional waitlist CTAs
4. **`src/components/marketing/FoundingCustomerBanner.tsx`** — Update copy + optional seat count
5. **`src/test/nav-links.test.ts`** — No changes expected (no new routes)
