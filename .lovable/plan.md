# Replace mechanism step images

The four images in `MechanismGrid` still reference the older "rmbc/cedar" set (research magnifier, phone viewfinder, brief packet, gmail quote). They no longer match the rewritten step copy ("Read the site → Build the routes → Guide the customer → Hand you a brief") or the refreshed Cedar & Oak / Smart Intake brand narrative.

## What to regenerate

All four files at their existing paths (so no code changes needed):

1. `src/assets/rmbc/cedar/01-research-website-analysis.png` — **Read the site**
   - UI mock in a clean macOS-style browser frame: Cedar & Oak tree-care website on the left, PhotoBrief side panel on the right showing extracted services ("Emergency limb removal", "Full removal quote", "Stump grinding", "Health assessment") with checkmarks. Amber accent on detected items. Landscape.

2. `src/assets/rmbc/cedar/02-capture-phone-viewfinder.png` — **Build the routes**
   - Dark app-shell UI (portrait) showing PhotoBrief's route builder: a vertical list of 4 routes with per-route photo policy chips (Not needed / Optional / Recommended / Required) in cream + amber. One route expanded to reveal its question list. Replaces the phone-viewfinder framing entirely.

3. `src/assets/rmbc/cedar/03-brief-packet.png` — **Guide the customer**
   - Phone mockup (portrait, dark UI) of the customer-facing intake mid-flow: route header "Emergency limb removal", a single clear question, and the camera step appearing only because this route requires photos. Subtle Cedar & Oak branding in header.

4. `src/assets/rmbc/cedar/04-close-gmail-quote.png` — **Hand you a brief**
   - Landscape: a single completed PhotoBrief brief in an inbox-style card — customer name, address, route label, answers, photo thumbnails row, "Ready to quote" pill in amber. Same visual language as the landing hero "after" shot for continuity.

## Style & brand constants

- Accent amber `#F2A33A`, cream `#F4F1EA`, near-black backdrop `60 8% 5%`.
- BrandMark two-tone (Photo cream + Brief amber) wherever the logo appears in-frame.
- UI copy uses "intake / route / brief / ready to quote" — never "photo request".
- Cedar & Oak tree-care brand throughout for narrative continuity with hero/comparison.
- Generation tier: `premium` for all four (UI legibility matters).

## Code changes

None. File paths and the `MechanismGrid` component stay as-is; only the PNG bytes change. Alt text is empty (decorative) so no copy update needed.

## Out of scope

- Changing step copy, layout, or orientations.
- Touching other marketing images (already refreshed in the prior pass).
- Renaming the `rmbc/cedar/` directory.
