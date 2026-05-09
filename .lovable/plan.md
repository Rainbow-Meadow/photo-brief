# Standardize Layout Schema

A repo-wide layout standardization pass. **No visual redesign, no copy rewrite, no route or behavior changes.** Only layout primitives + page wrappers are touched.

## 1. New shared layout primitives

Create a single module `src/components/layout/primitives/` with focused files:

- `PageShell.tsx` — authenticated app pages. Props: `width: "default" | "narrow" | "reading" | "full"` (max-w-7xl / 5xl / 3xl / none), handles horizontal padding + bottom safe-area for mobile tab bar.
- `PageStack.tsx` — vertical rhythm between page modules. Props: `gap: "default" | "compact" | "relaxed"`.
- `PageSection.tsx` — in-app section wrapper. Props: `variant: "default" | "card" | "elevated" | "muted" | "split"`.
- `Surface.tsx` — replaces ad-hoc `rounded-[2rem] bg-card/85 border shadow-[...] backdrop-blur` combos. Props: `variant: "panel" | "elevated" | "muted" | "outline"`, `radius: "default" | "lg" | "pill"`, `padding: "none" | "sm" | "md" | "lg"`.
- `ResponsiveGrid.tsx` — props: `cols: "1-2" | "1-3" | "1-4" | "sidebar" | "aside"`, `gap: "default" | "compact"`.
- `MarketingSection.tsx` — wraps `pb-section` / `pb-section-tight` with a `width: "default" | "narrow"` and optional `heading` slot for `eyebrow/title/subtitle`.
- `MarketingHero.tsx` — thin wrapper that standardizes hero spacing + width; content slots remain flexible. Used only where it cleanly simplifies.
- `WizardLayout.tsx` — `{ steps, currentStep, footer, progress }` slots. Renders left rail on desktop, stacked stepper on mobile, main panel + sticky footer actions.

Reuse existing `PageHeader` and `EmptyState` (already standardized — just confirm props cover icon/title/description/primary/secondary actions; small additive tweak only if missing).

All primitives consume tokens from `src/design-system/desktop/desktop.tokens.ts` + mobile tokens via `usePlatformSchema()` where it matters; default values come from semantic Tailwind classes already in the project.

Barrel: `src/components/layout/primitives/index.ts`.

## 2. Layout CSS additions

Add a small `@layer components` block in `src/index.css` for semantic utilities used by the primitives:

- `.app-shell-padding` — `px-3 sm:px-6 lg:px-10`
- `.app-shell-bottom-safe` — `pb-24 lg:pb-10` + `env(safe-area-inset-bottom)`
- `.stack-default` / `.stack-compact` / `.stack-relaxed` — vertical gaps
- `.surface-panel` / `.surface-elevated` / `.surface-muted` / `.surface-outline`
- `.radius-panel` / `.radius-lg` / `.radius-pill`

These wrap existing token values; no new colors.

## 3. Page migrations (in place, no new files)

For each page below: replace ad-hoc wrappers with primitives. Keep all content, SEO, JSON-LD, anchors, hooks, behavior identical.

**App pages** (wrap with `PageShell` + `PageHeader` + `PageStack` + `Surface`/`PageSection`):
- `src/features/workspace/pages/DashboardPage.tsx`
- `src/features/requests/pages/RequestsInboxPage.tsx`
- `src/features/guides/pages/GuideLibraryPage.tsx`
- `src/pages/AdminWebsiteIntelligence.tsx`

Note: `DashboardLayout` already provides outer shell + padding. `PageShell` here is the *inner* page constraint (max-width + stack); it composes with the layout, doesn't duplicate it. `DashboardLayout`'s current `<main>` keeps the outer chrome — the inner `mx-auto max-w-7xl` is replaced by `PageShell`.

**Marketing pages** (wrap sections with `MarketingSection`):
- `src/pages/Landing.tsx` — re-wrap each existing section using `MarketingSection`. Preserve the schema primitives already added (`Section`/`Container`/etc. in `src/pages/landing/schema.tsx`) — `MarketingSection` will become the canonical wrapper and the landing-local `Section` re-exports from it (or is removed in favor of it; will pick whichever is smaller-diff after re-reading `Landing.tsx`).
- `src/pages/Pricing.tsx`
- `src/pages/ForAiAgents.tsx`

**Wizard:**
- `src/features/intake/pages/WebsiteIntakePage.tsx` — refactor to `WizardLayout`. All step components, source toggles, hosted link/webhook logic, routing rules, field mapping, test lead, review remain unchanged — only the outer scaffold changes.

## 4. Cleanup

- Remove now-dead per-page `mx-auto max-w-*`, repeated `rounded-[2rem]`, custom shadows, one-off section padding **only inside the migrated pages**.
- Do **not** touch unrelated pages, feature components, agents, services, edge functions, workers, or routes.
- Keep landing schema (`src/pages/landing/schema.tsx`) — either reframe it as a thin re-export of the new primitives, or keep as-is if its API already matches. Decide after re-reading.

## 5. Docs

Create `docs/layout-system.md` covering:
- Primitive catalog with one-line purpose each
- Standard widths (app default/narrow/reading; marketing default/narrow)
- Standard spacing (app gaps, marketing section/tight)
- Radius scale
- Marketing vs app rules
- Mobile behavior (bottom-tab safe area, single-column default, no hover effects)
- ✅ Allowed vs ❌ discouraged code snippets

## 6. Validation

Run `bunx vitest run` for tests, rely on the harness for typecheck/lint/build. Fix regressions until clean. Do not run manual builds.

## Out of scope (explicit)

- No new landing page or LandingV2.
- No copy edits.
- No route changes.
- No router/Cloudflare/deployment file edits.
- No DB, auth, agent, or service changes.
- No design-token color changes.
- No aggressive sweep across every component — only the listed pages.

## Technical notes

- Primitives are pure presentational React + Tailwind; no new deps.
- `usePlatformSchema()` is read inside `PageShell` and `WizardLayout` only where mobile vs desktop branching is meaningful (e.g., wizard rail vs stacked stepper). Other primitives stay CSS-only for SSR-safety.
- All class composition via existing `cn()` from `src/lib/utils.ts`.
- No changes to `src/integrations/supabase/*`, `supabase/config.toml`, or `tailwind.config.ts` unless a new semantic utility requires it (none expected).
