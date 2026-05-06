
## Goal

Replace the current `/founding-partner-beta` page (an internal "portfolio/copy bank" aimed at reviewers) with a customer-facing conversion landing page that matches what was previously on `/betalist`.

## What changes

### 1. Rewrite `src/pages/BetaPortfolio.tsx`

Transform from internal portfolio into a conversion-focused landing page with these sections:

1. **Hero** -- "Stop chasing customer photos." headline, subheadline, primary CTA ("Apply for Founding Partner Beta") linking to the application form section, secondary CTA ("See how it works") scrolling to workflow.
2. **Interactive product demo** -- Reuse the existing `InteractiveHeroBriefAssembly` component (already used on the landing page).
3. **Workflow steps** -- 3-4 step visual: Request, Capture, Check, Brief.
4. **Use cases** -- Service, quote, review, approval, return, documentation cards.
5. **Old way vs PhotoBrief way** -- Before/after comparison panel using existing `ComparisonTable` component or inline equivalent.
6. **Founding Partner Beta offer** -- Keep the existing benefits list (90 days free, concierge setup, 50% off, etc.) but present customer-facing (remove internal "positioning rules" and "copy bank" sections).
7. **Application form** -- Inline beta application form (name, email, business name, use case) that submits to the existing `beta-welcome-submit` edge function, matching the pattern in `BetaWelcome.tsx`.
8. **Trust/privacy notes** -- No app download, no credit card, privacy/terms links.
9. **Final CTA** -- Keep the existing branded closing CTA card.

### 2. Remove internal-only sections

These sections from the current page are internal tools, not customer-facing:
- "Submission copy bank" (one-liner, short pitch, BetaList angle, etc.)
- "Positioning rules" (do not say / say pairs)
- "Partner commitments" (what partners give back)
- "Surface gallery" mockups with "Portfolio asset" stamps

### 3. Update SEO metadata

- Update `canonicalPath` to `/founding-partner-beta`
- Update `title` and `description` for conversion (not portfolio review)
- Fix the JSON-LD `url` field (currently points to `/beta-portfolio`)

### 4. Keep existing design system

Continue using `pb-landing`, `pb-container`, `pb-card`, `pb-command-panel`, `pb-eyebrow`, `pb-section-title`, `pb-copy`, `pb-lens-field`, `pb-stamp` classes. Dark premium theme stays.

## Files affected

- `src/pages/BetaPortfolio.tsx` -- Major rewrite
- No route changes needed (route already points here)
