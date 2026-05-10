
## Goal

Reshape the marketing site into four focused pages and a tight homepage:

```
/           Compact highlight page → links to the others
/demo       Full live-demo experience (Reverse-Form Method shown live)
/beta       Full Founding Partner Beta page (program + apply agent)
/pricing    Full pricing page (already exists, light cleanup only)
```

## New site map

| Route | Purpose | Primary CTA |
|---|---|---|
| `/` | 1-screen story + signposts to deeper pages | "Try the demo" / "Apply for beta" |
| `/demo` | Show, don't tell — live brief assembly + "build my sample brief" tool | "Apply for the beta" |
| `/beta` | Full founding-partner pitch, seat tracker, onboarding agent, quick-apply form | "Open the agent" |
| `/pricing` | Already full — minor tweaks for cross-linking | "Apply for beta" |

Header nav becomes: **Demo · Beta · Pricing · Help**.

## `/` — Compact highlight page

Keep it short — the homepage's job is to orient and route, not to convert in isolation.

Sections, in order:
1. **Hero** — Tagline (Guide · Capture · Close), 2-sentence pitch, two CTAs: `Try the live demo →` and `Apply for the beta →`. Hero illustration stays.
2. **Marquee band** — kinetic stat strip (kept as-is).
3. **Mechanism (4 cards)** — the Reverse-Form Method in 4 steps. No deep content; teaser only.
4. **Before / after** — two-card comparison (kept, condensed copy).
5. **Three-up signpost row** — three large cards linking to `/demo`, `/beta`, `/pricing` with one-line value prop each.
6. **Compact FAQ** — 4 items max (was 8). "See all answers" link to `/help`.
7. **Footer CTA** — single-line: "Ready to replace the chase? → Apply".

Removed from `/`: Use Cases (trades), Website Intelligence, Live Demo embed, Beta Program section, full Apply agent, long FAQ, FinalCtaQuickApply form. All content survives — it just moves to its proper page.

## `/demo` — Full demo page

Currently `/demo` is only the conversational reverse-form discovery widget. Expand into a full marketing page that *is* the demo.

Sections:
1. **Hero** — "See exactly what your customers experience." CTA scrolls to live tool.
2. **Live brief assembly** — `<InteractiveHeroBriefAssembly />` (moved from landing's LiveDemoSection).
3. **Build-my-own widget** — existing `DemoDiscoveryChat` flow already on the page.
4. **Use cases / trades grid** — moved from landing.
5. **Footer CTA** — "Like what you saw? → Apply for the beta".

## `/beta` — New full Beta page

New file `src/pages/Beta.tsx`. Pulls together the founding-partner content currently scattered across the landing page.

Sections:
1. **Hero** — "20 seats. 60 days. Founding pricing forever." (uses BETA_TOTAL_PARTNERS / BETA_DURATION_DAYS).
2. **BetaSeatTracker** — moved from landing.
3. **What you get** — bullets pulled from `Pricing.tsx`'s `betaOffer` array (concierge setup, direct support, tiered rewards).
4. **Onboarding agent** — `<BetaOnboardingAgentExperience />` (moved from landing's ApplySection). This is the long-form apply flow.
5. **Quick-apply form** — `FinalCtaQuickApply` extracted from Landing.tsx into its own file (see refactor below) and rendered here as a fallback.
6. **FAQ** — 4-6 beta-specific items filtered from `faqItems`.

## `/pricing` — Light touches only

- Add a "See the live demo →" link in the hero alongside the existing apply CTA.
- Cross-link the beta-program block to `/beta` instead of inlining the apply agent.

## Routing & nav

- `src/App.tsx`: register `<Route path="/beta" element={<BetaPage />} />` with lazy import. Demo route already exists.
- `src/config/marketingNav.ts`:
  ```ts
  marketingLinks = [
    { to: "/demo", label: "Demo" },
    { to: "/beta", label: "Beta" },
    { to: "/pricing", label: "Pricing" },
    { to: "/help", label: "Help" },
  ];
  ```
- All on-page anchor links currently pointing to `#apply`, `#beta-program`, `#workflow` etc. on `/` are remapped to the new page routes (e.g. `Claim a founding seat` → `/beta`).
- Add 301-style client redirects (in-component): if a request hits `/?apply=1` or any old hash, scroll behavior still works on the homepage but the canonical link surface points to the new pages.

## Refactor extraction

To keep the new pages clean without duplicating logic, extract these from `Landing.tsx` into reusable pieces:

- `src/components/marketing/MechanismGrid.tsx` — the 4-step grid (used on `/` and `/demo`).
- `src/components/marketing/UseCasesGrid.tsx` — trades grid (moves to `/demo`).
- `src/components/marketing/BetaQuickApplyForm.tsx` — `FinalCtaQuickApply` + its zod schema (used on `/beta` and `/`'s footer CTA).
- `src/components/marketing/SectionIntro.tsx` — small helper, currently inline.

No business logic changes — pure reorg of presentation code.

## SEO

Each new/expanded page gets its own `<PageMeta>`:
- `/` — title shortened to "PhotoBrief — Guide. Capture. Close."
- `/demo` — already set, keep.
- `/beta` — new title "Founding Partner Beta | PhotoBrief".
- Update `public/sitemap.xml` to include `/demo` and `/beta`.

## Out of scope

- No backend, edge function, schema, or auth changes.
- No design-system or token changes.
- No copy rewrite beyond what's needed for the shorter homepage hero/signposts.
- Mobile tab bar / dashboard nav untouched.

## Implementation order

1. Extract shared marketing components (`MechanismGrid`, `UseCasesGrid`, `BetaQuickApplyForm`, `SectionIntro`).
2. Create `src/pages/Beta.tsx`.
3. Expand `src/pages/Demo.tsx` with the full-page sections.
4. Slim `src/pages/Landing.tsx` to the 7-section highlight version.
5. Add `/beta` route + update `marketingNav.ts`.
6. Update `Pricing.tsx` cross-links + sitemap.
