## Goal

Use the dark-background BrandMark variant (`tone="dark"` → cream-colored mark + wordmark on `/brand/mark-on-dark.svg`) **only on actually dark surfaces**, the way the homepage does it (`<Section tone="dark">` → FinalCta + the dark footer when `isLanding`). Eliminate three current sources of drift:

1. A `tone="dark"` BrandMark that sits on a cream surface (invisible).
2. `tone="auto"` / `tone="color"` used inconsistently — both currently fall through to the light lockup, which makes future intent unreadable.
3. No contract test, so future pages can re-introduce mismatches.

## The homepage pattern (source of truth)

| Surface bg | Lockup tone | Asset | Used in |
|---|---|---|---|
| Cream `--pb-paper` (default Section) | `tone="light"` | `mark.svg` + navy/amber wordmark | MarketingLayout header, app sidebar, dashboard header, in-page marks |
| Dark `<Section tone="dark">` (FinalCta, `pb-footer-dark`) | `tone="dark"` | `mark-on-dark.svg` + cream/amber wordmark | MarketingLayout footer when `isLanding` |
| Color/illustration backdrop | `tone="light"` (treat as light unless backdrop is demonstrably dark) | light asset | Signup hero, StarterRequestCard, BetaWelcome stacked logo |

Rule: `tone` matches the surface the mark physically sits on, not the page's overall theme.

## Findings — current call-site audit

| File:line | Variant | Tone | Surface bg | Verdict |
|---|---|---|---|---|
| `src/pages/Landing.tsx:202` | horizontal | `dark` | Cream Hero `<Section>` | **Wrong** — cream ink on cream bg |
| `src/pages/Signup.tsx:186` | stacked | `color` | Inside white form card on cream | OK render, but `color` is a misleading alias for "light" |
| `src/pages/BetaWelcome.tsx:158` | stacked | `light` | Cream | OK |
| `src/pages/IntakeBadge.tsx:53` | horizontal | `forceDark ? "light" : "auto"` | Embeddable badge — bg is host-driven | Replace `"auto"` → explicit `"light"`; comment the inversion |
| `src/components/layout/MarketingLayout.tsx:63-64` | wordmark | `light` | Cream header | OK |
| `src/components/layout/MarketingLayout.tsx:89` | mark | `isLanding ? "dark" : "light"` | The mobile sheet trigger sits on the cream header, not on the page hero — `isLanding` is the wrong signal | **Wrong** — should always be `"light"` |
| `src/components/layout/MarketingLayout.tsx:125` | horizontal | `auto` | Inside cream mobile sheet | Replace `"auto"` → `"light"` |
| `src/components/layout/MarketingLayout.tsx:171` | horizontal | `isLanding ? "dark" : "light"` | Footer bg flips via `pb-footer-dark` when `isLanding` | **Correct** — this is the canonical pattern |
| `src/components/layout/DashboardLayout.tsx:55` | mark | `auto` | Cream app shell | Replace `"auto"` → `"light"` |
| `src/components/layout/AppSidebar.tsx:88-91` | mark/horizontal | `light` | Cream sidebar | OK |
| `src/components/layout/PublicRequestLayout.tsx:26` | horizontal | `dark` | Need to confirm — header may be cream | Verify against `PublicRequestLayout` header bg; correct to match |
| `src/components/editorial/EditorialAuthShell.tsx:41` | stacked | `auto` | Cream auth shell | Replace `"auto"` → `"light"` |
| `src/components/shared/PoweredByBadge.tsx:26` | wordmark | `auto` | Inherits from host page | Replace `"auto"` with a `tone` prop on `PoweredByBadge` so callers pass intent explicitly; default `"light"` |
| `src/features/workspace/components/StarterRequestCard.tsx:24` | mark | `color` | Cream card | Replace `"color"` → `"light"` |
| `src/features/integrations/components/ConnectorLogo.tsx:62` | mark | `auto` | Cream | Replace `"auto"` → `"light"` |

## Plan

### 1. Tighten `BrandMark` API (`src/components/layout/BrandMark.tsx`)

- Narrow `BrandTone` from `"auto" | "light" | "dark" | "color"` → `"light" | "dark"`.
- Remove the `auto`/`color` branches (they already collapse to "light"); export a deprecation comment so future PRs don't reintroduce them.
- Default `tone` stays `"light"` (matches the cream-bg majority case).

### 2. Fix the wrong call sites

- `Landing.tsx:202` — change `tone="dark"` → `tone="light"` (the mark sits below the cream illustration card, on cream bg).
- `MarketingLayout.tsx:89` — drop `isLanding` ternary, always `tone="light"` (mobile menu trigger is in the cream header on every route, including landing).
- `PublicRequestLayout.tsx:26` — read the header's actual bg; if cream, switch to `tone="light"`. If the layout's header is genuinely dark navy, keep `tone="dark"` and document why.

### 3. Replace soft tones with explicit ones (no visual change, just intent)

- `MarketingLayout.tsx:125`, `DashboardLayout.tsx:55`, `EditorialAuthShell.tsx:41`, `ConnectorLogo.tsx:62`: `"auto"` → `"light"`.
- `Signup.tsx:186`, `StarterRequestCard.tsx:24`: `"color"` → `"light"`.
- `IntakeBadge.tsx:53`: keep the host-driven inversion logic but spell it out — `tone={forceDark ? "light" : "dark"}` once we confirm which bg the badge sits on (the badge is meant to be embedded on customer sites, so this needs a one-line comment explaining that `forceDark` means "host page is dark, so render the light lockup"). Do not change runtime behaviour — only naming.

### 4. `PoweredByBadge` accepts `tone`

Add `tone?: BrandTone` (default `"light"`) and forward to `BrandMark`. No call sites currently pass it; existing renders stay light.

### 5. Contract test (`src/test/brand-mark-contract.test.ts`)

Plain string scan over the `src/` tree (same style as `landing-tokens.test.ts`):

- Fail if any file passes `tone="auto"` or `tone="color"` to `BrandMark`.
- Fail if `BrandMark` is rendered with `tone="dark"` in the same file as `<Section tone="light">` or default `<Section>` without an intervening `<Section tone="dark">` (heuristic: scan adjacent JSX). If the heuristic is too brittle, fall back to a hard allowlist of files permitted to use `tone="dark"` (Landing FinalCta + MarketingLayout footer + PublicRequestLayout if applicable).
- Fail if a raw `<img src=".../mark-on-dark.svg">` exists outside `BrandMark.tsx`.

### 6. Update `landing-visual-contract.test.ts`

Add an assertion: the only `BrandMark` in `Landing.tsx` uses `tone="light"` (since the FinalCta dark section doesn't render a BrandMark, only the hero does, and that one must be light).

### 7. QA

- `bun run test` — confirm the 7 existing suites + the new brand-mark contract test pass.
- Browser walk: `/`, `/auth`, `/dashboard`, `/r/<token>`, `/badge/intake` at 390px and 1280px — visually confirm BrandMark renders correctly (no invisible cream-on-cream, no navy-on-navy).
- Update Playwright baselines for any pages where the BrandMark visibly changes.

## Out of scope

- No changes to BrandMark assets or the wordmark colors.
- No changes to `PoweredByBadge` placement (only its API).
- No new `tone` values, no auto-detection from CSS variables.
