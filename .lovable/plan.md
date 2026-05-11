## Goal

Reframe the hero before/after around the recurring **Cedar & Sons** roofing story so it ties into the rest of the site (MechanismGrid, Pricing, ComparisonSection all reference Cedar).

## Story

Cedar & Sons (the contractor) just got a new roofing lead from a homeowner.

- **Before** — Phone shows a vague iMessage from an unknown number to Cedar & Sons: tiny blurry far-away roof photo + "hey can you quote this? thx". No address, no scope. Same cluttered truck-cab bokeh.
- **After** — Same phone, same hand. Now showing the **Cedar & Sons app** Job Brief packet:
  - Header bar: small "Cedar & Sons" wordmark + "Job Brief"
  - Crisp close-up shingle damage photo
  - Address: 142 Cedar Lane
  - Scope: Replace 12 sq damaged shingles
  - Customer: J. Martinez
  - Green "Ready to quote" pill

## Steps

1. **Regenerate the two hero images** (portrait 3:4, 1152×1536, premium tier), keeping identical hand/phone/lighting/crop:
   - `src/assets/hero/hero-before-messy-intake.jpg` — same messy iMessage, but explicitly addressed to a "Cedar & Sons Roofing" contact (header of the SMS thread reads "Cedar & Sons Roofing"), reinforcing the recipient.
   - `src/assets/hero/hero-after-photobrief-packet.jpg` — Job Brief screen with a small "Cedar & Sons" wordmark in the top status bar/header, plus the structured fields above.

2. **Update alt text + caption** in `src/pages/Landing.tsx` to reference Cedar & Sons:
   - beforeAlt: "Cedar & Sons receives a vague text-message lead with a blurry roof photo."
   - afterAlt: "Cedar & Sons sees a quote-ready PhotoBrief packet — address, scope, and a clear roof photo."

3. **No structural changes** to `BeforeAfterSlider`, layout, or other sections. Caption strip stays "Fig. 01 · Reverse-Form Method™".

## Out of scope
- No copy/CTA changes in surrounding hero text.
- No edits to MechanismGrid, Pricing, or Comparison illustrations.

## Files
- **Regenerate**: `src/assets/hero/hero-before-messy-intake.jpg`, `src/assets/hero/hero-after-photobrief-packet.jpg`
- **Edit**: `src/pages/Landing.tsx` (alt text only)
