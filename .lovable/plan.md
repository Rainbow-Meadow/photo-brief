## Refactor `InteractiveHeroBriefAssembly` to the Cedar & Sons exchange

The interactive demo currently stars **ClearPath Junk Removal / Sarah Johnson / garage cleanout**. It should mirror the same Cedar & Sons exchange shown in the hero before/after slider so the whole landing page tells one story end-to-end.

### Story to mirror

- **Brand:** Cedar & Sons Tree Care — green palette, `TreePine` icon, tagline "Tree care done right."
- **Customer:** Jamie Smith at **23 Maple St**
- **Job:** Leaning oak after the storm — removal + stump grind
- **Outcome on the business phone:** Quote-ready packet, $1,450 removal / $390 stump grinding / **$1,840 total**, "Available Thursday 8am."

### Photo set (4 shots)

Replace the 4 junk-removal images with new tree-care photos under `src/assets/tree-care/`:

1. `leaning-oak-wide.webp` — wide shot of the leaning oak with the house in frame *(Verified)*
2. `oak-trunk-closeup.webp` — closeup of the trunk base / lean angle — generated **blurry-feeling first attempt** stays in the BLURRY_INDEX retake flow *(Verified after retake)*
3. `house-elevation.webp` — house side that the tree threatens — overhead branches *(Needs review — proximity to roof)*
4. `driveway-access.webp` — driveway showing truck/chipper access *(Verified)*

Generate all four with `imagegen` (fast tier, ~1024×1024, .webp via .jpg fallback if needed).

### Question set (replaces junk-removal Qs)

`CUSTOMER_ANSWERS` becomes:

- "What's the issue?" → "Leaning oak after storm"
- "Tree height (approx)?" → "40–50 ft"
- "Stump grinding needed?" → "Yes"

`CustomerQuestionsScreen` chips become tree-relevant: issue chips (Leaning, Dead/dying, Storm damage, Limbs over house), height segmented (Under 20 ft / 20–40 / 40+), stump (Yes / No).

### Brand + copy swaps

- `BRAND` constant → name "Cedar & Sons Tree Care", short "Cedar & Sons", tagline "Tree care done right.", color `#15803d` (green-700), light `#dcfce7`, mid `#86efac`, ring `rgba(21,128,61,0.25)`.
- Replace every `Truck` icon used as the brand mark with `TreePine` (header, idle dashboard, request screen hero).
- Website URL "clearpathjunk.com" → "cedarandsonstreecare.com".
- Request screen body copy → "Big tree out front looks bad after the storm — can you come look?" and address line → "23 Maple St".
- Notification/lead name → "Jamie Smith"; package line → "Leaning oak — 23 Maple St".
- `BriefCompleteScreen` AI summary → "Leaning oak at 23 Maple St — removal + stump grind. ~40 ft, ground-level driveway access. All photos verified. Confirm proximity to roofline before crew dispatch."
- `BriefCompleteScreen`: add a small **Quote line items** block above the "Quote now" button — Tree removal $1,450 / Stump grinding $390 / **Total $1,840**, plus "Available Thursday 8am" microcopy. (Matches the after-hero email.)
- `CustomerConfirmationScreen` copy → "Cedar & Sons has your photos and will follow up with a quote." (auto-flows from BRAND.name.)

### Files

- **New:** `src/assets/tree-care/leaning-oak-wide.webp`, `oak-trunk-closeup.webp`, `house-elevation.webp`, `driveway-access.webp` (4 generated images)
- **Edit:** `src/components/marketing/InteractiveHeroBriefAssembly.tsx` — swap `BRAND`, `photos`, `CUSTOMER_ANSWERS`, replace `Truck`→`TreePine`, update request-screen form text, question chips, AI summary, add quote line items to `BriefCompleteScreen`
- **No changes to:** state machine, phase flow, phone mockup chrome, lead-capture form, `Demo.tsx` wrapper

### Out of scope

- No backend / lead-capture changes.
- No layout or motion changes to the dual-phone shell.
- Keep the existing BLURRY_INDEX retake mechanic — just attach it to the trunk closeup instead of the appliance.
