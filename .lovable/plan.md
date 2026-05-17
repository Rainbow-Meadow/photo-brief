
# Ruthless refactor — every public page

Goal: each page does exactly its one job and nothing else. No decorative chrome, no second pitch, no third FAQ, no "and here's also…" sections.

## What each page's *one* job is

| Page | Job |
|---|---|
| `/` | Get the visitor to either try the demo or start a trial. |
| `/demo` | Let the visitor build a brief in 60s. |
| `/pricing` | Show plans, let them pick. |
| `/for-ai-agents` | Give a machine (or its operator) the endpoints + a working call. |
| `/help` | Answer the questions people ask. |
| `/privacy` `/terms` `/refund-policy` | Be readable legal compliance text. |

---

## `/` Landing — 371 → ~210 LOC

**Keep:** Hero, Mechanism (4 steps), Before/After comparison, Final CTA.

**Cut:**
- **`OneLinkAnywhereSection`** — restates the mechanism with logos. Pure padding. Delete the section and its file.
- **`SignpostSection` ("Three doors. Pick one.")** — duplicates the hero CTAs (demo / signup / pricing already live in the nav and hero). Three doors after a final CTA is choice paralysis. Delete.
- **`FaqSection`** — `/help` exists. The landing FAQ ships 4 stale Q&As and adds 80 LOC. Delete; link to `/help` from the Final CTA.
- **BrandMark under the hero image** — the global nav already shows it. Delete.
- **`[ 01 ]` / `[ 02 ]` / `[ 03 ]` numeral eyebrows** — leftover from an earlier "chapter" treatment. Strip across sections (keep `SectionIntro` eyebrows like `The mechanism`, `Before / after`).

**Net:** Hero → Mechanism → Before/After → Final CTA. Four sections. One job.

---

## `/demo` — 312 → ~210 LOC

**Keep:** Hero, the interactive `DemoDiscoveryChat` (this *is* the page).

**Cut:**
- **"Watch it work" (`InteractiveHeroBriefAssembly`)** section. The page's purpose is "build *your* brief" — a pre-baked walkthrough above it teaches passivity and steals the click from the real input. Delete the section and the lazy import.
- **"Built per trade" `UseCasesGrid` section.** It's a landing-page module wedged into a tool page. Delete.
- **`FinalCtaSection`** ("Start your 14-day trial / See pricing"). The chat itself converts: when the brief is built, that completion screen is the CTA. Replace the footer block with a single inline line after the brief: "Like what you got? Start your 14-day trial →".
- **Hero secondary CTA "Watch it work"** — dies with its section.

**Net:** Hero → DemoDiscoveryChat → inline post-brief CTA. One job.

---

## `/pricing` — 273 → ~180 LOC

**Keep:** Hero, `PricingCardGrid`, FAQ accordion (this is where pricing questions belong).

**Cut:**
- **`PublicPhotoPair`** (Cedar owner laptop + multi-trade fan). Decoration. People came to see prices, not lifestyle photography. Delete.
- **`pricingAxes` grid** ("Photos / Branding / Storage term / Team size"). The plan cards already encode this. Delete.
- **`intakeModes` grid** ("Smart Intake" vs "Smart Intake Team" big tiles above the actual price cards). The cards label themselves. Delete.
- **Bottom "Stop chasing. Start closing." panel.** Hero already has the trial CTA. Delete.
- **`[ 00 ]` and `[ 99 ]` numeral eyebrows.** Strip.

**Net:** Hero (with trial CTA) → Pricing cards → FAQ. One job.

---

## `/for-ai-agents` — 381 → ~230 LOC

**Keep:** Hero (one sentence + "see the API" + openapi link), the API code-tabs block, the MCP block, the discovery-links list.

**Cut:**
- **`QuotableFacts` + `ComparisonTable`** — marketing modules disguised as agent docs. Agents don't need a comparison table. Delete both imports + render.
- **`PublicPhotoPair`** (terminal + chat screenshots). Decorative; the actual code blocks are above. Delete.
- **`x402` section.** It's an early-experimental payment flow with one operator using it. Cut from the page; the info lives in `/mcp.json` and `https://mcp.photobrief.ai/x402/requirements`, which agents discover from the discovery list. Re-introduce when there's adoption.
- **Bottom FAQ accordion.** Duplicates `/help` verbatim and the page literally says "Same source as /help." Replace with a single line + link.
- **The two cards under the hero ("Smart intake from a website" / "Route-aware questions & photos")** — the H1 says this in one sentence already. Delete.

**Net:** Hero → API call → MCP → Discovery list → link to /help. One job (machine-readable wiring).

---

## `/help` — 95 LOC, already lean

**Keep:** business FAQ, recipient FAQ.

**Cut:**
- **The "Still have questions? → Try the live demo" CTA panel.** The demo doesn't answer help questions. If someone's on /help they want an answer, not a marketing handoff. Replace with one line: "Still stuck? Email hello@photobrief.ai."
- **Header `SectionHeader` description** — it summarizes the two H2s directly below it. Redundant. Keep the title, drop the description.

---

## `/privacy`, `/terms`, `/refund-policy` — legal pages

The *text* is legally required and stays untouched. The *chrome* is bloat.

**Cut from each:**
- Oversized hero (`clamp(2.25rem,5vw,3.75rem)` h1 + decorative `ShieldCheck`/`Scale`/`RefreshCcw` icon + `[ 00 ]` eyebrow + tagline subtitle like "no fake legal theater"). Replace with: a normal `<h1>`, a one-line "Last updated: …", done.
- Per-section `[ 01 ]` `[ 02 ]` numerals, `FileText` icons next to every H2, "border border-border bg-card p-8" panels around every section. Replace with plain `<h2>` + `<p>` stack — readable, scannable, prints sanely.
- Bottom "Contact" card with green sage tint and Mail icon. Replace with a single sentence at end of body: "Questions: hello@photobrief.ai."

Result: each legal page goes from ~150 LOC of decorative panels around boilerplate text to a clean document. **No legal text is altered.**

**Optional follow-up (not in this pass):** the three legal pages now share an identical shell — extract `<LegalPage title updatedAt sections />` and use it from all three. Cuts ~60 LOC total. Worth doing if you want.

---

## What I am *not* touching

- Sitemap, robots, prerender — done last round.
- `index.html` sitewide meta, `PageMeta` per-route — already correct.
- Auth-walled routes (`/auth`, `/onboarding`, app) — out of scope.
- Copy voice — I'm cutting sections, not rewriting surviving sentences. If you also want me to tighten the surviving copy line-by-line, say the word.

## Files touched

- `src/pages/Landing.tsx` (heavy)
- `src/pages/Demo.tsx`
- `src/pages/Pricing.tsx`
- `src/pages/ForAiAgents.tsx`
- `src/features/help/pages/HelpPage.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/Refund.tsx`
- Delete: `src/components/marketing/OneLinkAnywhereSection.tsx` and its icon barrel `src/components/marketing/icons/platforms/index.tsx` (only consumer is the section being cut)
- Update `src/test/landing-visual-contract.test.ts` to drop the section assertions

## One decision for you

Of all the cuts above, two are the kind of thing you might disagree with — flag them now or I make them:

1. **Killing the landing-page FAQ.** It does deflect some scroll-to-bottom intent before the final CTA. I'd cut it; `/help` exists and is one click. **Keep or cut?**
2. **Killing the x402 section on /for-ai-agents.** It's the only differentiated "agentic" thing on that page even if adoption is small. **Keep or cut?**

Defaults if you don't reply: cut both.
