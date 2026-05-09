## Goal

Reskin every page in the app to match the updated landing's editorial Locomotive-inspired language: Geist Sans + Geist Mono, sharp 1px borders (radius `0` / `0.25rem`), kinetic-orange accent, mono numerals/eyebrows, uppercase-tracked CTAs, paper/alt/dark section tones. The brand rules in memory (cream + navy + amber, BrandMark two-tone) stay intact.

## Approach: Full editorial port

Promote the landing's ad-hoc `ls-*` schema in `src/pages/landing/schema.css` + `schema.tsx` into a **first-class shared design system** that any page (marketing, app, admin) can compose. Then rewrite each page on top of those primitives instead of the current shadcn-rounded-soft-card look.

## Phase 1 — Promote the schema (foundation)

1. **Move + rename**: `src/pages/landing/schema.{tsx,css}` → `src/components/editorial/{Section,Container,Eyebrow,Title,Subtitle,Body,Card,Grid,CTA,CTAGroup}.tsx` with the `.ls-*` CSS moved to `src/components/editorial/editorial.css` (imported once from `src/index.css`). Update `Landing.tsx` import path.
2. **Add app-shell-friendly variants** so primitives work inside `DashboardLayout` (which has its own header):
   - `Section size="page"` — no top padding, for in-app pages
   - `Section tone="paper-soft"` — uses cream `--pb-paper` for app surfaces
   - `Card variant="data"` — denser padding for tables/forms
   - `Card variant="form"` — wraps form blocks
3. **Add editorial form primitives**: `EditorialField`, `EditorialInput`, `EditorialSelect`, `EditorialTextarea` — sharp 1px borders, mono labels, kinetic focus ring. These wrap shadcn underneath so validation/`react-hook-form` keeps working.
4. **Editorial table primitive**: `EditorialTable` (head row mono uppercase, hairline rules, no zebra) for inbox/customers/guides/admin lists.
5. **Editorial nav chrome**: re-skin `MarketingLayout` header pill and `DashboardLayout` header to use sharp borders, mono labels, kinetic accent on active nav. Re-skin `AppSidebar` items (mono `0X · LABEL` format) and `MobileTabBar` (sharp top border, no soft pill).
6. **Token reconciliation**: confirm `--accent-kinetic`, `--accent-sage`, `--pb-paper`, `--pb-ink-soft` exist in `src/index.css`; add any missing ones (no new colors, only aliases) so the editorial schema doesn't depend on landing-only vars.

## Phase 2 — Marketing pages (uses MarketingLayout)

Rewrite to compose the promoted primitives, matching landing rhythm (eyebrow → display title → subtitle → grid of sharp-bordered cards):

- `Pricing.tsx` — Section + Grid of `Card` for tiers; replace `PricingCardGrid` rounded shadcn cards with sharp editorial cards; uppercase CTA on selected tier; mono price numerals.
- `Auth.tsx`, `Signup.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` — narrow Container, single `Card variant="form"` with editorial inputs, mono eyebrow ("[ 01 ] SIGN IN"), kinetic CTA.
- `Privacy.tsx`, `Terms.tsx` — narrow Container, editorial typography, mono section numerals.
- `ForAiAgents.tsx` — full editorial port mirroring landing layout.
- `BetaInvite.tsx`, `BetaWelcome.tsx`, `Unsubscribe.tsx`, `NotFound.tsx` — single-card editorial treatment.

## Phase 3 — Recipient / public flows

- `PublicRecipientPage.tsx`, `RecipientConfirmationPage.tsx`, `PublicIntakePage.tsx`, `WebsiteIntakePage.tsx`, `IntakeBadge.tsx` — apply editorial chrome but **preserve mobile capture UX rules** from `mem://design/touch-vs-desktop` (no hover, no blur). Use `Card variant="form"` and editorial inputs; keep `RecipientBrandingContext` overrides intact.

## Phase 4 — Dashboard app pages (uses DashboardLayout)

Re-skin in place; same data, new chrome:

- `DashboardPage`, `RequestsInboxPage`, `RequestDetailPage`, `CreateRequestPage` (preserve fullscreen wizard), `SubmissionReviewPage`
- `CustomersPage`, `CustomerDetailPage`
- `GuideLibraryPage`, `GuideBuilderPage`, `GuideDetailPage`
- `IntegrationsPage`, `SupportPage`, `BetaGuidePage`
- Workspace settings: `OnboardingPage`, `BrandSettingsPage`, `MessageTemplatesPage`, `SmsSettingsPage`, `TeamSettingsPage`, `BillingSettingsPage`, `AcceptInvitePage`

For each: `PageHeader` becomes editorial (mono eyebrow + display title + hairline rule), tables → `EditorialTable`, forms → editorial fields, metric/empty-state cards → sharp `Card`. Replace `MetricCard`, `EmptyState`, `StarterRequestCard`, `UpgradePromptCard`, `StatusBadge`, `PlanTag`, `ScoreRing`, `ReadinessProgress` chrome with editorial equivalents (logic untouched).

## Phase 5 — Admin pages

- `AdminBeta`, `AdminCommandCenter`, `AdminInvites`, `AdminAIRerun`, `AdminWebsiteIntelligence` — same chrome treatment; admin pages are dense, so use `Card variant="data"` and `EditorialTable`.

## Phase 6 — Shared widgets

Re-skin so they look correct on every page they appear in:
- `FeedbackWidget`, `NotificationBell` dropdown, `WorkspaceSwitcher`, `MobileSettingsSheet`, `PoweredByBadge`, `FoundingCustomerBanner`, `PaymentTestModeBanner`, `ChannelPicker`, `TurnstileWidget` wrapper, dialog/sheet/drawer chrome (override shadcn radius to `0.25rem` and 1px borders via component variants — not by editing shadcn primitives).

## Phase 7 — QA

1. Run existing tests: `landing-tokens`, `landing-typography`, `landing-visual-contract`, `nav-links`, `route-contract`. Update visual-contract snapshots that asserted landing-only `ls-*` selectors.
2. Browser walk every top-level route (marketing, dashboard tier accounts from `mem://seed-users`, recipient flow, admin) at mobile + desktop viewports, screenshot, fix layout regressions.
3. Verify dark mode is **not** reintroduced (memory rule); editorial dark sections use the existing `--pb-ink` palette, not a `.dark` class.

## Out of scope

- No business-logic changes, no DB migrations, no copy edits beyond mechanical replacements (e.g., button label casing).
- BrandMark rendering rules unchanged.
- Remotion scenes, edge functions, workers — untouched.

## Technical details

- Schema lives in `src/components/editorial/`; barrel export `index.ts`.
- `editorial.css` imported once from `src/index.css` after Tailwind base/components/utilities so `@layer` precedence holds.
- shadcn overrides via per-component CVA variants (`variant="editorial"`) — never edit `src/components/ui/*` primitives directly.
- All colors stay HSL via existing tokens; no new color values introduced.
- Touch rules from `mem://design/touch-vs-desktop` enforced: editorial card hover gated behind `@media (hover: hover)` (already true in current schema — keep pattern).
