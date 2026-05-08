## Goal

Make the landing page visually feel custom-illustrated end-to-end (matching the existing hand-drawn `landing-hero-illustration.png`), and make the product copy speak directly to:

1. Landscapers
2. Junk haulers
3. Repair & HVAC technicians
4. Plumbers
5. Damage / return estimators (insurance, warranty, e-commerce returns)

## 1. Generate five new hand-drawn illustrations

Style brief locked to the existing hero so the page reads as one set:
- Loose ink line + soft watercolor wash
- Off-white paper background, lavender (#8f63ff / #b98cff) and warm ochre accents
- Phone-in-hand framing showing a guided photo intake — same compositional DNA as the hero
- Transparent or paper-tone background so they sit on `pb-section` (ivory) and `pb-section-alt` zones

Files (PNG, ~1024×1024, `transparent_background: true`):

| File | Subject |
|---|---|
| `src/assets/trades/landscaper-illustration.png` | Landscaper standing on a lawn, phone framing a yard with overgrown beds and a fence line |
| `src/assets/trades/junk-hauler-illustration.png` | Hauler beside a cluttered garage, phone capturing pile + driveway access |
| `src/assets/trades/hvac-tech-illustration.png` | HVAC tech kneeling at a condenser unit, phone showing make/model + nameplate prompt |
| `src/assets/trades/plumber-illustration.png` | Plumber under a sink, phone capturing leak + shutoff valve |
| `src/assets/trades/estimator-illustration.png` | Estimator at a damaged room / dented package, phone assembling an evidence packet |

All use the `imagegen` premium tier with the same prompt scaffold as the hero so line weight matches.

## 2. Deploy illustrations across the page

```text
Hero ........................ keep current heroIllustration
PainPointSection ............ add small inline illustration per pain point (rotates with active pain)
WorkflowSection ............. add a single supporting illustration (estimator) beside the steps
UseCaseSection .............. retitle 5 cards to the 5 trades; each card gets its illustration
WebsiteIntelligenceSection .. add landscaper illustration as a soft right-side accent
```

Specifically:

- **`useCases` array (line 177)** — replace the 5 generic entries with one per trade:
  1. Landscapers — "Quote yards without a site visit"
  2. Junk haulers — "Price the pile from the driveway"
  3. Repair & HVAC techs — "Show up with the right part"
  4. Plumbers — "Diagnose the leak before the truck rolls"
  5. Damage / return estimators — "Turn customer photos into an evidence packet"
  Each card gains an `image` field rendered above the number/stamp, ~120px tall, mix-blend or transparent to sit on ivory.

- **`PainPointSection`** — add an illustration slot to each pain point that swaps with the active index (uses the trade illustration that matches the pain).

- **`WorkflowSection`** — add the estimator illustration as a right-column accent so the steps no longer feel text-only.

- **`HeroSection`** — add a small "Built for…" trade strip under the hero CTA: 5 inline trade icons + names, linking via anchor to their use-case card.

## 3. Copy retargeting

Tight edits, no structural rewrite:

- Hero subhead: append "Built for landscapers, junk haulers, HVAC and repair techs, plumbers, and damage estimators."
- `painPoints` array — make at least one example per trade so the rotating carousel rotates through the five trades.
- `<PageMeta>` title/description — include the trade list for SEO.
- `useCaseSection` `description` — name the trades explicitly.
- ROI calculator default labels left as-is (numeric, trade-agnostic).

## 4. Files touched

- New: 5 PNGs in `src/assets/trades/`
- Edited: `src/pages/Landing.tsx` (imports, `useCases`, `painPoints`, hero subhead, use-case + workflow + pain-point JSX, PageMeta)
- Possibly: small CSS additions in `src/index.css` for `.pb-trade-illustration` sizing

## Out of scope

- No backend / data changes
- No changes to Comparison junk-removal photos (those are real photos, intentional)
- No new routes or sections — only enriching existing ones
