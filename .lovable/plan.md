
# Codebase Cleanup — Remove Dead Code

## What gets removed

### 1. Unused marketing components (8 files)
These are imported nowhere outside their own file:
- `src/components/marketing/FinalCtaCard.tsx`
- `src/components/marketing/FirstPassGuaranteeBand.tsx`
- `src/components/marketing/HeroGlassStory.tsx`
- `src/components/marketing/HeroProductMockup.tsx`
- `src/components/marketing/IndustryGrid.tsx`
- `src/components/marketing/StatsBand.tsx`
- `src/components/marketing/TestimonialsRow.tsx`
- `src/components/marketing/TrustLogosStrip.tsx`

### 2. Unused shared component
- `src/components/shared/StatusPill.tsx` — never imported

### 3. Unused pricing component
- `src/components/pricing/UpgradePrompt.tsx` — superseded by `UpgradePromptCard`; zero imports

### 4. Unused AI feature files
- `src/features/ai/index.ts` — empty placeholder exporting nothing; only comment references `AssistantPanel` which lives elsewhere
- `src/features/ai/components/AIGuideGeneratorDialog.tsx` — never imported

### 5. Deprecated service shim
- `src/services/requestBuilderAi.ts` — marked deprecated, zero consumers

### 6. Unused config files (4 files)
- `src/config/aiChecks.ts`
- `src/config/curatedCategories.ts`
- `src/config/industries.ts`
- `src/config/overlayTypes.ts`

### 7. Dead CSS files
- `src/App.css` — never imported
- `public/hero-refinements.css` — never referenced
- `public/marketing-theme.css` — never referenced

### 8. Stale asset
- `public/placeholder.svg` — never referenced

### 9. CI/tmp artifacts (not source code)
- `.ci-diagnostics/` directory (4 files) — one-off CI debug reports
- `tmp/ci-report.md` — stale CI artifact

### 10. Stale audit/internal docs
These are point-in-time audit documents that are not referenced by any code or CI workflow:
- `docs/asset-audit.md`
- `docs/business-feature-switch-audit.md`
- `docs/cloudflare-host-audit.md`
- `docs/landing-page-effectiveness-audit.md`

### 11. Stale plan file
- `.lovable/plan.md` — completed plan, no longer needed

## What stays (confirmed in-use)
- All routes in `App.tsx` and their page/feature files
- `remotion/` — used by GitHub Actions workflow
- `workers/router/` — Cloudflare Worker for production routing
- `scripts/` — referenced in `package.json` and CI
- `docs/founding-partner-beta-plan.md`, `docs/beta-program-emails.md`, `docs/database-architecture.md`, `docs/hybrid-hosting.md`, `docs/analytics-ga4.md`, `docs/r2-submission-media.md`, `docs/seo-llm-discovery.md`, `docs/betalist-submission.md` — active reference docs
- All edge functions
- `src/brand-overrides.css` — imported in `main.tsx`
- `.env.development` / `.env.production` — used by Vite

## Approach
Delete all files listed above. No code edits needed in remaining files since none of these are imported.
