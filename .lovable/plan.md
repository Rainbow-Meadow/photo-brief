
## Goal

Restructure `/founding-partner-beta` to match the detailed BetaList-optimized spec: hero with messy-to-clean transform visual, inline application form immediately after the hero (near above-the-fold), expanded form fields, reordered sections, and updated copy.

## Changes to `src/pages/BetaPortfolio.tsx` (full rewrite)

### 1. Hero section (above the fold)
- Headline: "Stop chasing customer photos."
- Subheadline: "Send one guided PhotoBrief link and get a clean, AI-checked brief back."
- Primary CTA: "Apply for Founding Partner Beta" (scrolls to form)
- Secondary CTA: "See how it works" (scrolls to workflow)
- **Hero visual** (right column on desktop, below form on mobile): a side-by-side "messy incoming photos" (scattered cards with issue chips: "Blurry," "Too dark," "Wrong angle," "Label unreadable") transforming into a structured brief with requested shot slots, status chips ("Accepted" / "Needs retake"), and issue flags. Pure CSS/React, no images needed.

### 2. Application form (immediately after hero, inside same section)
Placed right below hero copy so it's visible at or near the fold. Short form with 5 fields:
- Work email (required)
- Business name (required)
- Website (optional)
- Monthly photo requests (dropdown: Fewer than 10, 10-50, 51-200, 200+)
- Workflow/use case textarea (required)

Submits to existing `beta-welcome-submit` edge function (already accepts `website` and `monthly_volume`). Includes inline terms/privacy note and "no credit card" reassurance.

### 3. Sections in order (after hero+form)
1. **Product visual / How it works** — 4-step workflow cards: Request, Capture, Check, Brief. Headline: "One link. Guided photos. Organized brief."
2. **Use cases** — Headline: "Built for moments when photos decide the next step." Cards for: quotes, dispatch prep, approvals, returns/warranty, documentation, review workflows.
3. **Old way vs PhotoBrief way** — Existing `ComparisonTable` component.
4. **Founding Partner Beta offer** — Updated copy: "Free access for 60-90 days, concierge setup, priority support, direct input on the roadmap, early access to future tools, and 50% off the first year after launch." 7 benefit cards.
5. **Repeated form** — Same form shown again for users who scrolled past the first one.
6. **Trust notes** — Expanded from simple bullet points to 3 cards with titles: "Private & secure" (data never shared, secure expiring links), "Business-owned requests" (workspace controls access/retention/export), "No spammy customer experience" (one branded link, no app, no account, no marketing emails).
7. **Final CTA** — "Limited spots available." with apply button.

### 4. Removed
- `InteractiveHeroBriefAssembly` import (replaced with custom `HeroTransformVisual` showing messy-to-clean transformation)
- Old `name` field from form (replaced with `website` and `monthly_volume`)

### 5. Other updates
- Beta benefit copy updated to "60-90 days" (from "90 days")
- `formState` interface expanded with `website` and `monthly_volume` fields
- Form submission body includes new fields (already supported by edge function)

## Files affected
- `src/pages/BetaPortfolio.tsx` — Full rewrite
