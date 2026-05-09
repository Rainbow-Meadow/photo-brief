# Landing Page Polish + RMBC Visual System

Three coordinated workstreams: (1) meticulous spacing/alignment/sizing audit per section, (2) regression tests that lock in the visual language, (3) a new set of line-art illustrations explicitly themed to the RMBC method (Research → Mechanism → Brief → Close).

---

## 1. Section-by-Section Spacing & Alignment Audit

For each section in `src/pages/Landing.tsx` (in render order) I'll inspect at three viewports (390, 834, 1378) and normalize against a single rhythm: section padding, container width, eyebrow→title→subtitle gap, title→content gap, intra-grid gap, card padding, illustration size relative to copy column.

Sections to audit (in order):

1. **Hero** (`MarketingHero`) — headline width, subtitle line-length, CTA group spacing, trust-strip gap, hero illustration max-width and centering relative to phone (per earlier rule: logo stays centered over phone).
2. **Industry-signal ticker** — vertical padding, ticker item spacing, divider treatment.
3. **Pain Points** (`PainPointSection`) — eyebrow→title gap, stat card grid gap, citation footer alignment, dollarized consequence emphasis.
4. **Brief Assembly** (`InteractiveHeroBriefAssembly` wrapper) — container width vs. inner widget, caption spacing.
5. **Workflow** (`WorkflowSection`, 4 steps) — equal card heights, icon badge size, step number alignment, body line-length.
6. **Comparison** (`ComparisonSection`) — left/right column parity, row vertical rhythm, italic kicker placement.
7. **Use Cases** (`UseCaseSection`) — trade illustration size cap, micro-story line-length, stamp/badge alignment.
8. **Website Intelligence** (`WebsiteIntelligenceSection`) — three-card grid gap, "read · map · ship" eyebrow rhythm.
9. **ROI Calculator** (`RoiCalculatorSection`) — input/output column balance, number tabular-nums, CTA spacing.
10. **Beta Crossover ticker** — match section #2 rhythm.
11. **Founding Partner Beta** (`FoundingPartnerBetaSection`) — sticky `#apply` panel offset, seat tracker spacing, badge illustration size.
12. **Reward Tiers** (`RewardTiersSection`) — tier card parity, ribbon illustration size, consequence line spacing.
13. **Fine-print accordion** — item padding, divider weight.
14. **Final CTA** (`Section tone="dark"`) — 4-line urgency stack rhythm, mailbox illustration size, CTA group centering.

**Normalization rules I'll apply (where missing):**
- Section vertical rhythm: `pb-section` everywhere, `spacing="tight"` only for tickers/accordion.
- Eyebrow → title: 12px. Title → subtitle: 12px. Subtitle → content: 32–48px (clamp).
- Grid gaps: `gap-5 md:gap-6` for card grids; `gap-3 md:gap-4` for trust strips.
- Illustration max-widths: hero ~520px, trade illustrations ~280px, scene illustrations ~360px.
- Text column max widths: section header `max-w-2xl`, body `max-w-prose`.
- All CTAs use the `CTA` schema primitive (no ad-hoc buttons).

Output: edits scoped to `src/pages/Landing.tsx` and inline section components only. No design-system token changes. Hover/touch rules from `mem://design/touch-vs-desktop` preserved.

---

## 2. Visual Regression / Consistency Tests

Add a new test file `src/test/landing-visual-contract.test.tsx` (vitest + @testing-library/react, jsdom). These are *contract* tests, not pixel snapshots — they assert the structural rhythm so future edits can't silently drift.

Assertions per section:
- Each `<section>` (or `MarketingSection`/`Section` primitive) renders with the expected `id` and an allowed tone (`paper | alt | dark`).
- Each section header block contains exactly one eyebrow, one h2, optional subtitle, in that DOM order.
- Card grids contain the expected count (e.g. workflow=4, intel=3, reward tiers=N).
- All CTAs in the page resolve to `.ls-cta` or `MarketingCTA` — no raw `<button class="bg-primary">`.
- Hero illustration is centered (parent has `justify-center` / `mx-auto`) and the brand mark is rendered above it.
- No section uses both `spacing="tight"` and a dark tone unless whitelisted (tickers/accordion/final CTA).
- Section render order matches the documented sequence above (regression for accidental reorders).

Plus a small lint-style test `src/test/landing-tokens.test.ts`:
- Greps `src/pages/Landing.tsx` for forbidden classes (`text-white`, `bg-black`, hex literals, `text-[#`, `bg-[#`) — fails if found.
- Verifies every imported asset under `@/assets/...` is referenced at least once.

Run via existing vitest config; no new deps.

---

## 3. New RMBC-Themed Line-Art Illustrations

Same artistic line — soft cream background, navy line work, amber accent, the visual language already used in `src/assets/scenes/*` and `src/assets/trades/*`. Four new pieces, one per RMBC stage, plus one composite "method overview" graphic:

| File | Stage | Concept |
|---|---|---|
| `src/assets/rmbc/research-magnifier.png` | Research | Magnifier hovering over a website wireframe with photo thumbnails surfacing — the site-scan moment. |
| `src/assets/rmbc/mechanism-gears.png` | Mechanism | A labeled "Reverse-Form Method™" device: form upside-down, photo tiles dropping out the bottom in order. |
| `src/assets/rmbc/brief-packet.png` | Brief | A neatly assembled lead packet (photos + answers + AI summary) tied with an amber ribbon. |
| `src/assets/rmbc/close-handshake.png` | Close | A quote PDF sliding into an inbox with a checkmark — the "ready to quote" moment. |
| `src/assets/rmbc/method-overview.png` | Composite | Four-panel strip used at the top of the mechanism section. |

Generated via `imagegen--generate_image` (premium for the composite, fast for the singles), `transparent_background: false`, prompts pinned to: "soft cream #FAF7F2 background, hand-drawn navy #1B2A4A line art, single amber #F2A33A accent highlight, editorial illustration, warm and confident, no text labels, matches PhotoBrief brand line work". After generation I'll QA each by viewing and re-prompt if any drift from the established style.

Placement on the page:
- `research-magnifier` → header of Website Intelligence section (replaces nothing, additive).
- `mechanism-gears` → header of new "The Mechanism" intro panel above Workflow.
- `brief-packet` → header of Brief Assembly section.
- `close-handshake` → final CTA section, replacing or paired with `mailbox-flag-illustration`.
- `method-overview` → small inline strip near the top of Pain Points, anchoring the RMBC narrative.

---

## Out of Scope
- No copy rewrites (Stefan-Georgi pass already shipped).
- No layout/component refactors beyond spacing tokens.
- No design-system or color-token changes.
- No changes to auth, pricing, dashboard, or BetaOnboardingAgentExperience.

## Files Touched
- `src/pages/Landing.tsx` (spacing normalization + new image placements)
- `src/test/landing-visual-contract.test.tsx` (new)
- `src/test/landing-tokens.test.ts` (new)
- `src/assets/rmbc/*.png` (5 new illustrations)
