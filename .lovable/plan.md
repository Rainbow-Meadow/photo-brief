## Locomotive-Inspired UI Reimagination

A complete visual rewrite of the marketing surface and the authenticated app shell, built in the spirit of Locomotive (locomotive.ca) — kinetic, editorial, image-led, with a reinterpreted palette and orchestrated scroll choreography. We do **not** clone Locomotive; we adopt its design grammar and apply it to PhotoBrief.

---

### 1. Design language

**Aesthetic pillars**
- Editorial type at hero scale: huge display headings with mixed weights, kinetic letter spacing, and the occasional italic accent. A new variable display face (Inter Tight or Bricolage Grotesque via @fontsource) paired with the existing system stack for body.
- Kinetic motion as the signature. Smooth scroll, sticky scroll-linked sections, parallax media, marquee strips, magnetic CTAs, masked text reveals on scroll, and a subtle custom cursor on pointer devices.
- Asymmetric editorial grids (12-col with intentional negative space, dropped baselines, off-grid pull quotes).
- Image-forward: existing illustrations re-presented inside large bordered "plates" with grain overlay and slow ambient motion instead of decorative cards.
- Restraint elsewhere — most surfaces are quiet so the kinetic moments land.

**Reinterpreted palette** (drops cream/navy/amber as the lead tokens; brand wordmark colors stay intact via BrandMark only)
- `--background` near-black `#0E0E0C` (warm off-black)
- `--foreground` paper white `#F4F1EA`
- `--muted` graphite `#1C1C1A`
- `--accent` single saturated signal `#FF5A1F` (kinetic orange)
- `--secondary-accent` a quiet sage `#B8C5A6` for tertiary highlights
- Hairline borders at 8% paper white. No gradients except a single subtle radial behind hero.

**Typographic system**
- Display: Bricolage Grotesque variable (700 / 800), tracking -0.04em, line-height 0.92 for hero.
- UI/body: Inter Tight (existing fallback acceptable).
- Mono accents (Geist Mono) for section numerals (`[01]`, `[02]`, `[03]`) and timestamps.

**Motion stack**
- `lenis` for inertial smooth scroll.
- `framer-motion` for orchestrated reveals, sticky scenes, marquees, magnetic buttons.
- `prefers-reduced-motion` short-circuits Lenis + Framer to instant transitions; touch devices skip cursor + parallax (per existing touch-vs-desktop memory).

---

### 2. What changes

**Marketing (full reimagination)**
- `src/pages/Landing.tsx` — rebuilt section-by-section, not patched. New section flow:
  1. Kinetic hero (vertical "Guide / Capture / Close" stacked display, accent-orange underline that draws on load, subtle parallax illustration plate).
  2. Sticky scroll mechanism — the five RMBC illustrations become a horizontally pinned scroll story.
  3. Marquee of trade names + tagline.
  4. Editorial features grid (asymmetric 12-col, oversized numerals).
  5. Live brief assembly demo retained but reframed in a dark editorial frame.
  6. Founding-partner / beta seat tracker as an editorial "ledger" block.
  7. Pricing teaser → links to Pricing page.
  8. Final CTA with the existing quick-apply form, restyled.
- `src/pages/Pricing.tsx`, `src/pages/ForAiAgents.tsx`, `src/pages/Auth.tsx`, `src/pages/Signup.tsx`, `src/pages/BetaInvite.tsx`, `src/pages/BetaWelcome.tsx`, `src/components/layout/MarketingLayout.tsx`, `src/components/layout/PublicRequestLayout.tsx` — re-skinned to the new tokens, new nav (thin top bar, oversized hover labels, sliding underline indicator, mobile drawer with full-bleed type).

**Dashboard chrome (re-skin, not re-architect)**
- `src/components/layout/DashboardLayout.tsx`, `AppSidebar.tsx`, `MobileTabBar.tsx`, `NotificationBell.tsx`, `BrandMark.tsx` (variant tweaks only), `PageHeader.tsx` — adopt new tokens, hairline borders, mono numerals on section headers, restrained motion, no glass blur on touch.
- Feature pages keep their layouts; they inherit the new tokens automatically through `--background`, `--card`, `--border`, etc. No per-page rewrites.

**Tokens & primitives**
- `src/index.css` — replace the `:root` palette with the new near-monochrome system; keep legacy `--pb-*` aliases mapped to new equivalents so deeply-coupled components don't break. Remove cream-specific gradients. Add new tokens: `--accent-kinetic`, `--surface-paper`, `--rule-hairline`, `--grain-opacity`.
- `src/pages/landing/schema.css` — rewritten for the new aesthetic (kinetic typography classes, editorial grid, mono numerals). Same `ls-*` API so `schema.tsx` primitives don't change shape.
- `tailwind.config.ts` — add the new font families, mono numeral utilities, and accent-kinetic color.

**New utility modules**
- `src/lib/motion/lenis.tsx` — Lenis provider, no-ops under `prefers-reduced-motion` and on touch.
- `src/components/motion/` — `MagneticCTA`, `MarqueeRow`, `RevealText`, `StickyScrollScene`, `GrainOverlay`, `KineticCursor` (desktop only).

**Tests**
- Update `src/test/landing-tokens.test.ts` and `src/test/landing-visual-contract.test.ts` to assert the new section structure and primitives, not the old.
- Add a small `src/test/motion-reduced.test.ts` ensuring Lenis + Framer providers respect reduced motion.

---

### 3. Out of scope

- No backend changes. Waitlist edge function, plan gates, RLS, auth flows untouched.
- No copy rewrites beyond the hero stack. All product names, tagline, plan tier names, beta language preserved.
- No changes to the in-app feature pages' layouts (Requests, Submissions, Guides, Customers, Settings, Billing, Admin). They inherit new tokens only.
- BrandMark wordmark colors stay navy + amber (per brand memory). Only surrounding chrome changes.
- No new content imagery. Existing transparent PNGs in `src/assets/` are reused inside new presentation frames.

---

### 4. Risks & mitigations

- **Lenis + sticky/native scroll quirks** — gate Lenis to desktop pointer + non-reduced-motion; provide instant fallback. Test the wizard route and any modal that uses `position: fixed`.
- **Token swap regressions** — keep `--pb-*` legacy aliases pointing at new values for at least one release so deep components don't break visually.
- **Bundle size** — Lenis (~5kb) + framer-motion (already present?) + Bricolage variable font subset. Subset to Latin and self-host via `@fontsource-variable/bricolage-grotesque`.
- **Test churn** — landing contract tests will need rewriting; that's expected for a redesign of this scope.

---

### 5. Sequence (single implementation pass)

1. Tokens: rewrite `:root` in `src/index.css` + tailwind font/color additions + legacy `--pb-*` aliases.
2. Motion infra: add Lenis provider, base motion components, wire into `App.tsx`.
3. Marketing layout + nav redesign (`MarketingLayout.tsx`).
4. Landing page rebuild section-by-section.
5. Pricing + ForAiAgents + Auth/Signup/Beta pages re-skinned.
6. Dashboard chrome re-skin (`DashboardLayout`, `AppSidebar`, `MobileTabBar`, `PageHeader`).
7. Update tests.
8. Visual QA at 1378 desktop, 768 tablet, 390 mobile.

### 6. Files touched (high-level)

```text
src/index.css                              rewrite :root
tailwind.config.ts                         fonts, accent-kinetic
src/pages/landing/schema.css               rewrite
src/pages/Landing.tsx                      rebuild
src/pages/Pricing.tsx                      re-skin
src/pages/ForAiAgents.tsx                  re-skin
src/pages/Auth.tsx, Signup.tsx             re-skin
src/pages/BetaInvite.tsx, BetaWelcome.tsx  re-skin
src/components/layout/MarketingLayout.tsx  rebuild nav
src/components/layout/PublicRequestLayout.tsx  re-skin
src/components/layout/DashboardLayout.tsx  re-skin
src/components/layout/AppSidebar.tsx       re-skin
src/components/layout/MobileTabBar.tsx     re-skin
src/components/layout/PageHeader.tsx       re-skin
src/lib/motion/lenis.tsx                   NEW
src/components/motion/*.tsx                NEW (6 files)
src/test/landing-*.test.ts                 update
src/test/motion-reduced.test.ts            NEW
mem://design/color-system, brand-system    update notes
```

### 7. Dependencies to add

- `lenis` (^1.1)
- `@fontsource-variable/bricolage-grotesque`
- `framer-motion` (if not already installed — will check at implementation time)
