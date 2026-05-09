# Landing QA — findings + fix plan

## 1. Blocker: landing page is rendering blank

The live preview at `/` is a black canvas. Cause:

- `src/lib/motion/lenis.tsx` does a top-level `import Lenis from "lenis"`.
- Vite's dep optimizer is returning **504** for `lenis.js` repeatedly (verified across two dev-server restarts).
- `LenisProvider` wraps the entire `<App>` tree in `src/App.tsx`, so the optimizer failure crashes the whole bundle — every route, not just `/`.

Fix:
- Convert Lenis to a **dynamic import inside the `useEffect`** (`const { default: Lenis } = await import("lenis")`). Keeps smooth scroll on capable devices, but a failed/late-loaded module can never blank the app.
- Wrap the init in try/catch and short-circuit on touch / reduced-motion (already done).
- Add `lenis` to `optimizeDeps.include` in `vite.config.ts` so prebundling is deterministic on cold start.
- Add a tiny smoke test (`landing-renders.test.tsx`) that mounts `<LandingPage />` inside the providers and asserts the H1 text — guards against regressions where a motion provider takes the page down.

## 2. Typography fit for the service-trade audience

You're right — the current stack reads "design agency portfolio," not "contractor's intake tool." Specifics:

- **Bricolage Grotesque 800 + the italic accent on the `.`** is the most "boutique" element. Roofers, HVAC, landscapers don't trust playful italics — they read it as marketing fluff.
- **Geist Mono** for every eyebrow, numeral, and CTA pushes the page even further into "code-y agency" territory.
- The two faces together make the page feel like a SaaS-for-designers product, not a tool that books jobs for a plumber.

Direction: keep the editorial scale and rhythm Locomotive gave us, swap the *voices* for ones that signal industrial precision and trust. Two options to pick from in step 4 below — both stay free/Google Fonts, no Cloud changes.

Concrete swaps regardless of choice:
- Drop `.ls-italic-accent` italic on `Close.` — replace with an accent-color period only, no italic.
- Replace mono in CTAs (`.ls-cta`) with the chosen sans at uppercase + tracking. Keep mono **only** for true numerals (`Fig. 01`, index strip), where it still earns its place as "technical caption."
- Tighten H1 weight 800 → 700 and letter-spacing -0.05em → -0.025em. 800/-0.05 looks like a fashion magazine; 700/-0.025 looks like a confident product headline.
- Add `font-feature-settings: "ss01","cv11"` where supported to lean into the cleaner glyph variants.

## 3. Other QA items to fix in the same pass

Found while reading the source — all small, all worth doing now so the reskin of Pricing/ForAiAgents/Auth inherits a clean baseline:

- **Use-cases section** uses `hvacTechIllo` for Plumbers, HVAC, *and* Estimators, and `landscaperIllo` for both Landscapers and Junk haulers. Reads as a stock-photo bug. Use the icon-only treatment for the trades that don't have a dedicated illo, or drop the illustration prop on cards that repeat.
- **Anchor index strip** lists 6 sections but `#apply` and `#beta-program` are adjacent + redundant — collapse to 5 entries.
- **`.ls-card:hover` border tint** uses `--accent-kinetic / 0.4`. On the dark canvas the orange-on-graphite hover is fine, but pair it with a 1px translateY(-1px) so the editorial card feels physical, not just recolored.
- **Hero anchor nav** is `lg:flex` only — on tablet (768–1024) the page jumps from oversized H1 straight to the marquee with no wayfinding. Show the strip from `md:` up.
- **Section padding** `clamp(5rem, 9vw, 9rem)` is too generous on mobile (5rem top + 5rem bottom on a 375px viewport = ~25% of the fold gone before content). Lower the floor to `3rem` for mobile rhythm.
- **Marquee** repeats only one row. Locomotive sites typically run two counter-rotating rows for kinesthetic depth — add a second row (reverse direction, ghost variant on the loud words) to earn the band.
- **`prefers-reduced-motion`**: `RiseIn` and `MagneticCTA` need to short-circuit when reduced-motion is set. Currently they always animate. Add a guard hook (`useReducedMotion` from framer-motion) and render static when true.
- **Accessibility**: `.ls-marquee-item--ghost` uses `-webkit-text-stroke` only — no Firefox fallback. Add `text-shadow` fallback or `@supports`.
- **Tests**: rerun `landing-tokens.test.ts` and `landing-visual-contract.test.ts` after the typography swap and update the asserted font-family strings.

## 4. Decisions I need from you before writing the fix

I'll batch these in `ask_questions` after you approve the plan, but here's the shape so you can think ahead:

1. **Display + body type pairing** (pick one):
   - **Geist Sans + Geist Mono** (Vercel) — engineered, neutral, modern. Reads as "serious software." Strongest "trust" signal.
   - **Inter Tight (display) + Inter (body) + JetBrains Mono** — workhorse, slightly editorial through tight spacing. Most legible at every size.
   - **IBM Plex Sans + Plex Sans Condensed (display) + Plex Mono** — explicitly industrial; designed for IBM's enterprise tools. Strongest "trade precision" signal.
   - **Keep Bricolage** but only at 700 and only on H1; everything else moves to Inter. Lightest-touch change.

2. **Italic accent treatment**: remove entirely / keep but use a cleaner italic from the chosen family / replace with a colored full-stop only.

3. **Mono usage**: keep mono on eyebrows + numerals + CTAs / restrict to numerals only / drop mono entirely and use uppercase tracked sans.

## Out of scope

- No copy rewrites beyond removing the italic accent.
- No layout restructure of sections — only the type, the use-case duplication, and the motion guards.
- No changes to dashboard chrome, Pricing, ForAiAgents, Auth — those wait for the planned full reskin, which proceeds *after* this QA closes.

## Sequence

1. Fix the Lenis blank-screen blocker + add smoke test → verify preview renders.
2. Ask the 3 decisions above.
3. Apply the typography swap + the small QA items in section 3.
4. Re-run tests, screenshot the page at 1440 / 768 / 375, hand back for sign-off.
5. Then resume the broader reskin of Pricing / ForAiAgents / Auth / dashboard chrome.
