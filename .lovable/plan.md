
# One schema for every page

Today three layout systems coexist:

```text
ls-*  schema      → Landing, Demo, Beta, marketing components       (editorial)
pb-*  + Marketing → Pricing, ForAiAgents, Privacy, Terms, helpers   (legacy)
PageShell/Section → every in-app page (Dashboard, Inbox, Guides…)   (app)
```

We promote `ls-*` into the single schema and delete the other two.

---

## 1. Extend the schema

Move `src/pages/landing/schema.{tsx,css}` → `src/design-system/schema.{tsx,css}` (it is no longer landing-only). Update the three landing-* test files and their imports accordingly.

Add what the schema is missing for in-app use, keeping the existing API stable so today's Landing/Demo/Beta keep working:

- **`Section`** — add `density="marketing" | "page"` (default `marketing`). `page` collapses vertical padding to `clamp(1.25rem, 3vw, 2.5rem)` so app screens don't feel airy.
- **`Container`** — extend `width` to `"default" | "narrow" | "reading" | "full"` (1320 / 880 / 720 / 100%).
- **`Stack`** *(new)* — vertical rhythm primitive, `gap="compact" | "default" | "relaxed"`. Replaces `PageStack`.
- **`Card`** — add `variant="paper" | "dark" | "muted" | "outline"` and `padding="none" | "sm" | "md" | "lg"`. Covers every `Surface` use today.
- **`Grid`** — keep `cols={1|2|3|4}`, add `cols="sidebar"` (280 + 1fr) and `cols="aside"` (1fr + 320). Covers every `ResponsiveGrid` use.
- **`SectionHeader`** *(new)* — heading + description + right-aligned `actions` slot, used inside `Section` for in-app modules ("Customers" + "Add customer" button). Replaces `PageSection`'s heading block.
- **`Wizard`** *(new)* — multi-step setup chrome ported from `WizardLayout` (only `WebsiteIntakePage` uses it).
- **`Prose`** *(new)* — single-column reading container with type ramp tuned for legal/help copy. Replaces ad-hoc `pb-copy` blocks in Privacy/Terms.

Defaults remain marketing-leaning so Landing/Demo/Beta render unchanged. App pages opt in with `<Section density="page">`.

---

## 2. Migrate every page

Roughly 35 pages, in three batches so each batch is shippable and testable on its own:

**Batch A — finish marketing/legal**
`Pricing`, `ForAiAgents`, `Privacy`, `Terms`, `Auth`, `Signup`, `ForgotPassword`, `ResetPassword`, `BetaInvite`, `BetaWelcome`, `Unsubscribe`, `NotFound`, `IntakeBadge` (keep `tone="light"` brand-mark contract).

Marketing helpers in the same batch: `HowItWorksSteps`, `ComparisonTable`, `QuotableFacts`, `BetaOnboardingAgentExperience`, `FreeProEligibilityModal` (drop pb-* class names → `Card`/`Body`/`Grid`).

**Batch B — workspace + customer-facing app**
`DashboardPage`, `BrandSettingsPage`, `SmsSettingsPage`, `TeamSettingsPage`, `MessageTemplatesPage`, `OnboardingPage`, `AcceptInvitePage`, `BillingSettingsPage`, `CustomersPage`, `CustomerDetailPage`, `RequestsInboxPage`, `RequestDetailPage`, `CreateRequestPage`, `SubmissionReviewPage`, `IntegrationsPage`, `SupportPage`, `BetaGuidePage`, `PublicRecipientPage`, `RecipientConfirmationPage`, `PublicIntakePage`.

**Batch C — guides, intake wizard, admin**
`GuideLibraryPage`, `GuideBuilderPage`, `GuideDetailPage`, `WebsiteIntakePage` (uses new `Wizard`), `AdminBeta`, `AdminInvites`, `AdminCommandCenter`, `AdminAIRerun`, `AdminWebsiteIntelligence`.

Migration recipe per page:

```text
<PageShell><PageStack><PageSection heading=…>     →
<Section density="page"><Container><Stack><SectionHeader title=…>

<Surface variant="panel">                          →  <Card variant="muted">
<ResponsiveGrid cols="1-3">                        →  <Grid cols={3}>
<MarketingSection eyebrow title subtitle>          →  <Section><Container><SectionHeader …>
<MarketingHero align="center">                     →  <Section><Container width="narrow"><div text-center>
```

---

## 3. Delete the legacy systems

After Batch C lands and visual regression is green:

- Remove the entire `src/components/layout/primitives/` folder (all 8 files + barrel).
- Strip these CSS rules from `src/index.css`: `.pb-section`, `.pb-section-tight`, `.pb-section-alt`, `.pb-section-title`, `.pb-container`, `.pb-container-narrow`, `.pb-eyebrow`, `.pb-copy`, `.pb-hero-title`, `.pb-display`, `.pb-paper-surface`, `.pb-on-paper`, `.pb-on-dark`.
- **Keep**: `--pb-*` color tokens, the `.pb-landing` gradient class, `.pb-paper-pill` / `.pb-paper-link` (used by `MarketingLayout` nav chrome — out of scope).
- Add a contract test `src/test/schema-contract.test.ts` that fails CI if any source file imports from `@/components/layout/primitives` or uses the deleted pb-* class names.

---

## 4. Out of scope

- DB, auth, plan gating, edge functions.
- Brand color tokens (`--pb-paper`, `--pb-ink`, accent amber etc.) — preserved exactly.
- `MarketingLayout` header pill, `DashboardLayout`, `AppSidebar`, `MobileTabBar` — these are *layout chrome*, not page schema.
- `BrandMark` contract (`tone="dark"` everywhere except `IntakeBadge`).
- Copy and information architecture — purely a presentation refactor.

---

## 5. Verification

- Per batch: visual diff a representative page at desktop + mobile, run `vitest` (esp. landing-* + new schema-contract test), run `playwright` visual suite.
- Spot-check: Landing hero unchanged, Pricing pricing-cards unchanged, Dashboard density unchanged, WebsiteIntake wizard nav unchanged.
- Final: `rg "pb-section|pb-container|MarketingSection|PageShell|PageSection|PageStack|Surface\\b|ResponsiveGrid|WizardLayout" src` returns nothing.

---

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| In-app pages suddenly feel airy | `density="page"` is required on app `<Section>`; defaults preserve marketing look. |
| Surface visual regressions on Dashboard widgets | `Card variant="muted"` reproduces `Surface variant="panel"` 1:1 in CSS. |
| Wizard step nav drift | Port `WizardLayout` markup verbatim under new name; only the import path changes. |
| Hidden pb-* usage in inline class strings | Final ripgrep + contract test catches them before the legacy CSS is removed. |

---

## Technical details

- New schema location: `src/design-system/schema.tsx` + `schema.css`. The existing `src/design-system/` already holds tokens, so the schema lives next to them.
- `Section` density implementation: a single CSS modifier `.ls-section--page { padding-block: clamp(1.25rem, 3vw, 2.5rem); }`; no JS changes beyond the prop.
- `SectionHeader` is markup-only (eyebrow + h2/h3 + subtitle + actions row) — reuses existing `ls-eyebrow`, `ls-h2`, `ls-subtitle` classes; no new CSS.
- `Wizard` keeps `WizardLayout`'s public API (`steps`, `currentStep`, `onStepChange`, `children`) so the only change in `WebsiteIntakePage` is the import.
- Batches A/B/C are independently mergeable — the legacy primitives stay alive until the deletion step at the end of Batch C.
