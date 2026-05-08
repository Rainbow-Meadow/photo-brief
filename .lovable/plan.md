# Consolidate the beta zone

Today the beta zone is 6 stacked sections that repeat the same ideas (apply CTA appears 5+ times, "Free Pro for Life" 4 times, expectations / rewards / scoring split across header columns *and* accordions). Goal: keep every fact, drop the duplication, give it one cohesive shape.

## New shape (3 sections)

```text
┌─ FOUNDING PARTNER BETA ────────────────────────────────────┐
│  LEFT (narrative)              │  RIGHT (apply agent)      │
│  • Eyebrow: Accepting apps     │  BetaOnboardingAgent      │
│  • Headline: "Built with real  │  (existing component,     │
│    workflows, with you"        │   unchanged)              │
│  • 2-paragraph intro           │                           │
│  • BetaSeatTracker             │                           │
│  • Reward callout (Trophy +    │                           │
│    "2 partners get Free Pro    │                           │
│    for Life" + terms link)     │                           │
│  • Trust strip (3 icons inline)│                           │
└────────────────────────────────────────────────────────────┘
┌─ REWARD TIERS (inline table) — ivory alt ──────────────────┐
│  Compact tier rows + "what drives placement" hairline note │
└────────────────────────────────────────────────────────────┘
┌─ DETAILS (collapsed) ──────────────────────────────────────┐
│  ▸ What it means to be a founding partner (expectations)   │
│  ▸ Scoring rubric — how we pick the top 2                  │
└────────────────────────────────────────────────────────────┘
                       FinalCta (unchanged)
```

## What's removed / merged

- **BetaBridgeSection** → folded into the new header's narrative column.
- **trustPoints strip** → 3-icon hairline row at the bottom of the narrative column.
- **FreeProSpotlight** → reward becomes a Trophy callout block inside the narrative column. No standalone CTA (the agent IS the CTA, right next to it).
- **Beta TickerBar (3rd one)** → removed; its 5 facts are already in the header (seat tracker, reward, beta length, concierge, every-partner-rewards).
- **FoundingPartnerSection benefit columns** ("Beta partners get" / "We ask for") → removed from the header. "Beta partners get" content merges into the rewards section; "We ask for" becomes the expectations accordion.
- **Rewards accordion** → promoted to its own inline section (ivory alt) so partners see tiers without clicking.
- **Expectations + Scoring accordions** → kept, only 2 items now, below the rewards section.
- **ChapterDivider before BetaBridge** stays (still the Product → Beta break).

## CTA discipline

Apply CTAs in the beta zone go from **5+ → 2**:
1. The agent form itself (in the merged header)
2. FinalCta

Reward "Terms & eligibility" link stays as a quiet underline next to the trophy callout.

## Files touched

- `src/pages/Landing.tsx`
  - Replace lines ~460–500 (BetaBridge + trustPoints strip + FreeProSpotlight wrapper + FoundingPartner + Ticker + apply section) with the new 3-section block.
  - Delete `BetaBridgeSection`, `FreeProSpotlight` functions.
  - Rewrite `FoundingPartnerSection` into two smaller components: `RewardTiersSection` (inline rewards) and `BetaDetailsAccordion` (expectations + scoring only).
  - Build new `FoundingPartnerBetaSection` that holds narrative + agent in a `lg:grid-cols-[0.95fr_1.05fr]` layout, with the agent sticky-top on desktop.
  - Remove the now-unused `trustPoints` const usage at the section level (move data inline into the new header).

No other files change. No copy is invented — all text comes from existing constants (`PARTNER_BENEFITS`, `PARTNER_EXPECTATIONS`, `DETAILED_EXPECTATIONS`, `REWARD_TIERS`, `REWARD_CRITERIA`, `SCORING_RUBRIC`, `trustPoints`) and the existing section bodies, just rearranged.

## Visual rhythm

- Section 1 (header + apply): paper (cream)
- Section 2 (reward tiers): `pb-section-alt` ivory band — gives the rewards visual weight
- Section 3 (details accordion): paper, tight
- FinalCta: paper (unchanged)

Keeps the cream ↔ ivory alternation already established earlier in the page.
