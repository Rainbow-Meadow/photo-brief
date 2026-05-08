## Goal

Make the entire landing page live on **one cohesive editorial paper system**. No dark navy zone, no two-palette split. Quiet ivory bands provide section rhythm. Violet/lavender is the only accent.

## What changes

### 1. Surface — kill the dark zone

`src/index.css`
- **`.pb-landing`** — replace the dark gradient with the same warm-paper background as `.pb-paper-surface`. Remove the violet/electric radial washes; keep one very subtle lavender radial top-center for warmth.
- **`.pb-paper-fade-bottom`** — remove (no dark to fade into anymore).
- **`.pb-section-alt`** — repurpose to a quiet **ivory band** (slightly deeper cream, e.g. `hsl(var(--pb-cream-warm))` with hairline ink rules at top/bottom) instead of the dark-tinted version it has now.
- Apply `.pb-on-paper` semantics globally: ensure the `<main>` carries `pb-on-paper` so every white-text class auto-maps to ink.

### 2. Page structure — one surface

`src/pages/Landing.tsx`
- Add `pb-on-paper` to `<main className="pb-landing">`.
- **Remove** the inner `<div className="pb-paper-surface pb-on-paper">` wrapper around the top half — the whole page is now paper.
- **Remove** `<div className="pb-paper-fade-bottom" />`.
- **Remove** the violet "major chapter break" gradient divider between WebsiteIntelligence and BetaBridge — replace with a standard `<ChapterDivider tone="paper" />`.
- Apply `tone="paper"` to all remaining `TickerBar`, `SectionNav`, `ChapterDivider` calls (the Beta-zone ones currently default to `dark`).
- Wrap the new alt-band sections (BetaBridge+TrustPoints, BetaAgent application) with the repurposed `.pb-section-alt` (now ivory).

### 3. Color pass — violet/lavender only, no mint

Replace every `--pb-mint` accent with violet/lavender (or neutral ink for body):

- **`SectionIntro` titles** with mint gradient (BetaBridge "with you") → solid violet emphasis or `pb-gradient-text` (already lavender→violet).
- **`StatAccent` `tone="mint"`** (WebsiteIntelligence) → `tone="lavender"`. Drop the mint and amber tone branches entirely from the component (lavender only).
- **`FreeProSpotlight`** "Free Pro for Life" gradient lavender→mint → solid `pb-violet`. Replace `<Gift className="text-pb-mint">` with lavender.
- **`FoundingPartnerSection`** mint accents on tier numbers (`text-pb-mint`) and check icons → lavender / `pb-violet`.
- **`WorkflowSection`** vertical timeline gradient `from-lavender via-mint` → `from-lavender via-violet`.
- **ROI calculator** mint annual-revenue card → lavender (already has a lavender card above; differentiate with intensity, not hue).
- **`BetaOnboardingAgentExperience`** — mint "Live" pulse dot, mint progress bar gradient, mint left-bar callouts, mint security `ShieldCheck` → lavender / violet.

### 4. Component dark-token cleanup

These still reference dark tokens directly and need to flip to ink-on-paper equivalents (or be removed since `.pb-on-paper` overrides handle most of them):

- `bg-[hsl(var(--pb-ink))]` icon-badge backgrounds (PainPoints, Workflow, old StatAccent) → `bg-[hsl(var(--pb-ink-soft)/0.06)]` with `border-[hsl(var(--pb-ink-soft)/0.18)]`.
- `border-[hsl(var(--pb-line-strong))]` → `border-[hsl(var(--pb-ink-soft)/0.18)]`.
- `bg-[hsl(var(--pb-night)/0.82)]` on the sticky `SectionNav` → `bg-[hsl(var(--pb-cream)/0.86)]` with paper backdrop blur.
- The hairline rules in refactored sections (`border-white/12`) — already auto-mapped by `.pb-on-paper`, but audit for any heavy `border-white/20+` that won't map cleanly.

### 5. Final section rhythm

Top → bottom, all on paper:

```
Hero (paper)
Ticker 1 (paper)
PainPoints + ROI (ivory alt)
Brief Assembly (paper)
SectionNav (paper sticky)
Workflow (paper)
Comparison (ivory alt)
Ticker 2 (paper)
UseCases (paper)
WebsiteIntelligence (ivory alt)
BetaBridge + TrustPoints (paper)
FreeProSpotlight (ivory alt — emphasis band)
FoundingPartner (paper)
Ticker 3 (paper)
BetaAgent application (ivory alt)
FinalCta (paper)
```

## Out of scope

- No font changes — italic-serif headlines and SF Pro body stay as-is.
- BrandMark / logo behavior unchanged.
- No copy changes.
- Other pages (pricing, dashboard, etc.) unchanged — only `Landing.tsx`, `BetaOnboardingAgentExperience.tsx`, and `index.css`.

## Verification

After edits, screenshot the full landing in the preview and confirm: (a) no dark navy band anywhere, (b) clean ivory↔cream alternation, (c) no remaining mint accents, (d) hairlines and serif numerals read consistently top-to-bottom.
