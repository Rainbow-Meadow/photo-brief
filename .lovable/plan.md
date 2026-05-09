## Goal
Revert the landing copy to Stefan Georgi's strict RMBC / Reverse-Form Method™ voice from the original rewrite — punchy, dollarized, open-loop, "you" 3× more than "we", every claim earned with a number. Keep the new Guide·Capture·Close visual treatment intact.

## Note on scope
The current `Landing.tsx` has a leaner section list than the original DR rewrite (no standalone PainPoint, FoundingPartner narrative, RewardTiers, BetaDetails, FineprintAccordion, or stat-stuffed TickerBars — those were removed in later edits). This plan **hardens copy in the sections that exist today**; it does not re-add deleted sections. If you want those sections re-added too, say the word and I'll plan that as a follow-up.

## Edits — all inside `src/pages/Landing.tsx` (copy-only, no layout/component/asset changes)

### Hero (≈157–186)
- **Eyebrow:** `[ 01 ] Visual intake, redesigned` → `[ 01 ] The Reverse-Form Method™`
- **Headline:** keep the 3-beat `Guide. / Capture. / Close.` stack (you love the visual pairing).
- **Subtitle (replace):**
  > Your contact form is leaking money. The Reverse-Form Method™ patches it — *you* tell customers exactly what to send, in the order an estimator needs it, and a quote-ready packet lands in your inbox on the first try.
- **CTA labels:** `Apply for founding seat` → `Claim a founding seat`; `See the mechanism →` stays.

### SEO / JSON-LD (88–129)
- `SOFTWARE_APP_JSONLD.description` → "Your contact form is leaking money. PhotoBrief's Reverse-Form Method™ tells customers exactly what to send — and a quote-ready lead packet lands in your inbox on the first try. No chasing. No callbacks. No vague 'I need a quote'."
- `PageMeta` title → `PhotoBrief — Stop the leak. Quote on the first reply.`
- `PageMeta` description → mirror of the JSON-LD line above.

### Marquee band (236–254)
- Row 1: keep `Guide · Capture · Close · photo·brief` (matches the visual).
- Row 2 (replace ghost stats with dollarized DR lines): `81% bail before they hit submit` · `78% buy from whoever responds first` · `4.2 hr avg lead response time` · `60% of estimates never followed up` · `5+ follow-ups to close — most stop at 1` · `Reverse-Form Method™`.

### Mechanism / workflowSteps (262–296)
- Section eyebrow → `[ 02 ] The mechanism`; title → `Stop asking. Start telling.`; subtitle → `The Reverse-Form Method™. Four moves that turn "I need a quote" into a quotable job in 38 seconds.`
- Each step body rewritten in DR voice with concrete artifacts:
  - **01 Research** — "We scan your site, your trade, and the photos your estimators *actually* need. The ones that kill callbacks."
  - **02 Mechanism** — "The customer taps a link. The camera opens at the *right* angle. The right shot lands. No app, no login, no thinking."
  - **03 Brief** — "Photos, notes, and address arrive as one packet — formatted for your inbox, your CRM, and the person writing the quote."
  - **04 Close** — "Your team quotes on the *first* reply. The lead doesn't cool. The job moves."

### Comparison (329–391)
- Title → `The intake your customers feel — and the one your estimator doesn't curse at.`
- Subtitle → `Same five minutes. Two different futures for the lead. One ends in a quote.`
- Before bullets:
  - "Photos missing or shot from across the yard."
  - "Three follow-ups before anyone can price it."
  - "The lead cools while you chase context."
- After bullets:
  - "Right angle. Right lighting. Right context — every single time."
  - "One packet hits your inbox: photos, notes, location, scope."
  - "Your estimator quotes on the first reply. The job moves."

### Use cases (397–428)
- Title → `Built around the work, not the form.`
- Subtitle → `Coverage templates per trade. Mute customer? Doesn't matter. The form does the talking.` (already close — tighten only)
- Each `note` becomes a 1-line micro-story:
  - Plumbers — "Under-sink, shut-off, the *exact* leak — captured in order."
  - HVAC — "Outdoor unit, indoor air-handler, breaker panel — one tap each."
  - Landscapers — "Front yard, back yard, slope, side-gate access — drone-free."
  - Junk haulers — "The pile, the path, the hazards — before the truck rolls."
  - Estimators — "Photo coverage that actually prices the job."

### Website intelligence (434–477)
- `Scan` → "We crawl your site, score every intake path, and find where leads bleed out."
- `Route` → "Templates routed to your existing forms, embeds, or webhook — no rebuild."
- `Observe` → "Every submission tracked end-to-end with photo-coverage scoring."
- Title → `Your site is already telling us how to fix it.`
- Subtitle → `An automation layer that turns the intake you already own into a Reverse-Form pipeline.`

### Live demo (483–500)
- Title → `Watch a vague "I need a quote" turn into a quotable job in 38 seconds.`
- Subtitle → `Hit the steps. The packet builds in real time.` (kept)

### Beta program (506–521)
- Title → `Twenty-five seats. Sixty days. Founding pricing forever.`
- Subtitle → `This isn't a waitlist. It's a 25-person room — and we're hiring two co-builders. Every founding partner walks out with a reward.`

### Apply (527–544)
- Title → `Six minutes with the onboarding agent.`
- Subtitle → `Tell us about the work. If a founding seat has your name on it, you'll hear back within 48 hours.`

### Final CTA (582–615)
- Eyebrow → `[ 10 ] Pick up the pen`
- Headline → `Ready to replace the chase?` (keep — already DR-shaped)
- Body (replace) → `Twenty-five seats. Sixty days. Two free-for-life winners. Founding pricing for the lifetime of your account — never repriced, never rolled back.`
- Quick-apply form eyebrow `30-second application` → `Thirty seconds to a founding seat`.

## Out of scope
- No layout, component, animation, color, illustration, or asset changes.
- No re-adding the PainPoint, ROI calculator, FoundingPartnerNarrative, RewardTiers, BetaDetails accordion, or stat-TickerBar sections that were removed in later edits.
- Auth, pricing, dashboard, FAQ items — untouched.

## Verify
- Read the rendered `/` at 1513×887. Confirm: hero subtitle reads the leak line, marquee row-2 shows the dollarized stats, every section title/eyebrow lands in DR voice, no broken JSX, no stray ™ encoding issues.