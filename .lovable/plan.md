## Next refactor: migrate `ForAiAgents.tsx` to layout primitives

This is the last marketing page on the remaining list in `docs/layout-system.md`. It currently hand-rolls the same `pb-container + pb-section + eyebrow/title/subtitle` pattern that `MarketingHero` and `MarketingSection` already encapsulate (used in `Landing.tsx` and `Pricing.tsx`).

`WebsiteIntakePage.tsx` → `WizardLayout` is the other remaining migration but is much larger (678 lines, real state machine). Recommend doing it as a separate follow-up so this PR stays narrow and visually verifiable.

### Scope (this refactor only)

In-place edits to `src/pages/ForAiAgents.tsx`:

1. **Hero** — replace the bespoke `<section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[5.5rem] sm:-mt-[5rem] sm:pt-[6rem]">` + inner `pb-container pb-section text-center` with `<MarketingHero align="center">`. Keep the `<div className="pb-lens-field" />` decorative layer as a child of the hero so the dark-on-dark ambient field still renders.
2. **API section (`#api`)** — wrap with `<MarketingSection id="api" eyebrow="REST API" title="Create a photo request" subtitle={…}>`. Move the rest (Tabs, response/required-fields cards) into the section body.
3. **MCP section (`#mcp`)** — wrap with `<MarketingSection id="mcp" eyebrow="MCP & Agent manifests" title="Plug PhotoBrief into your agent" subtitle="…">`.
4. **x402 section (`#x402`)** — wrap with `<MarketingSection id="x402" eyebrow={…CreditCard… "Agentic payments"} title="Pay per call with x402" subtitle={…}>`.
5. **Discovery section (`#discovery`)** — wrap with `<MarketingSection id="discovery" eyebrow="Discovery" title="Every machine-readable endpoint">`.
6. **FAQ section (`#faq`)** — wrap with `<MarketingSection id="faq" width="narrow" eyebrow="FAQ" title="Quotable answers" subtitle={…}>`.

### Preserved (no changes)

- All section IDs (`#api`, `#mcp`, `#x402`, `#discovery`, `#faq`) and `aria-labelledby` headings — anchors keep working.
- `PageMeta`, JSON-LD blocks, breadcrumbs.
- `QuotableFacts` and `ComparisonTable` composite sections (already self-contained).
- All inner content: tabs, code blocks, `pb-card`, `pb-command-panel`, lavender/mint accent classes, accordions, links.
- Dark/on-dark color treatment — `MarketingSection` does not override text colors, the `pb-on-dark` ambient container further up the tree keeps applying.

### Things to confirm during the edit

- `MarketingSection`'s heading block uses `pb-section-title` + `pb-eyebrow` + `pb-copy` (same classes already used here) — verified in `MarketingSection.tsx`. The migration produces identical typography.
- The hero currently uses negative top margin to bleed under the marketing nav (`-mt-[4.5rem] pt-[5.5rem]`). `MarketingHero` does not add this. **Decision needed:** either (a) preserve the bleed by passing a `className` override / wrapping `MarketingHero` in a `relative isolate -mt-[…] pt-[…]` div, or (b) drop the bleed for layout consistency with `Landing.tsx`'s migrated hero. Recommend **(a)** — keep current visual.
- After the edit, the hero's two preview cards (`Globe2`, `Route`) and trailing `<div className="h-12" />` spacer stay as children of `MarketingHero`.

### Validation

- Visit `/for-ai-agents` at the current 1162px viewport and at 390px mobile via the preview to confirm hero, section padding, and FAQ width are unchanged.
- Confirm in-page anchors (`#api`, `#mcp`, `#x402`, `#discovery`, `#faq`) still scroll correctly.
- Run `bunx vitest run` (route + nav-link tests).
- No DB, route, auth, or service changes.

### Out of scope

- `WebsiteIntakePage.tsx` → `WizardLayout` migration (separate follow-up; bigger surface area, real state).
- Any copy or visual redesign.
- Touching `QuotableFacts` / `ComparisonTable` internals.
