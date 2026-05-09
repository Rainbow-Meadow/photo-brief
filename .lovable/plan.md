# Landing copy rewrite — Stefan Georgi / RMBC

A complete copy refactor of `src/pages/Landing.tsx` (and the content arrays it consumes) into Stefan Georgi's RMBC framework: **R**esearch · **M**echanism · **B**elief · **C**lose. Voice will be punchy, emotional, long-form direct response. Page gets noticeably longer because each section earns its job in the funnel instead of just describing a feature.

## The proposed mechanism

Every Georgi page lives or dies on the named mechanism — the "this is why it works when nothing else has" idea. After reading the page end-to-end, the cleanest fit is:

> **The Reverse-Form Method™** — instead of asking your customer *"what do you need?"* and hoping they spell it out, you *tell them exactly what to send* — guided, in order, from their phone. The mechanism is the **inversion**: the form follows the job, not the other way around.

This frames PhotoBrief as a category-of-one (no one else inverts the form), explains the website-scan ("we have to read your services first to know what to ask for"), and makes the lead packet feel like an inevitable output, not a feature. Used as the spine of the page from hero to final close.

## Voice rules

- Short. Punchy. One thought per line.
- Open loops: stat → silence → reveal.
- Specific over generic ("the $480 driveway hauler" not "your business").
- Italicized asides that sound like a human voice next to the reader.
- "You" 3× more often than "we." "We" only when it earns trust.
- No corporate hedge words ("solutions", "leverage", "streamline").
- Earn every claim with a number, a name, or a citation.
- CTA copy never describes the button — it describes the *next moment in the reader's life.*

## Section-by-section direction

### 1. Hero — Big Promise + Mechanism Tease (RMBC: open with Belief shift)
- Eyebrow: "Founding Partner Beta · Now Reviewing Applications"
- Headline (3 lines, drumbeat): *"Your contact form is leaking money."* / *"Replace it with the Reverse-Form Method™."* / *"Lead packets land ready to quote — not vague messages you have to chase."*
- Sub: 2-sentence promise + mechanism name-drop + who it's for.
- Primary CTA: *"Apply for a Founding Seat →"* · Quiet CTA stays.
- Trust strip rewrites to outcomes: "No app for your customer · 12-min concierge setup · You keep every photo."

### 2. Industry-signal ticker — Research stack
Tighter, more visceral stats: *"81% bail before they hit submit"*, *"4.2 hrs to your first reply — your competitor took 22 minutes"*, *"60% of estimates die without a single follow-up"*, *"$1 in = $36 back when intake actually works"*, *"5+ touches to close — most teams stop at 1."*

### 3. Pain Point section ("The problem") — Research, deep
- New title: *"Your website intake is leaking money — and you can't see where."*
- Lead-in paragraph that names the cost in dollars per month for a typical contractor doing 500 visits/mo.
- Carousel: 5 stats stay, but each gets a Georgi treatment — open loop, named source, dollarized consequence, twist of the knife.
- 81% StatAccent re-captioned: *"of website forms are abandoned mid-submit. That's 4 out of every 5 ready-to-buy customers walking off your lot before you ever knew they were there."*
- Tagline below ROI: *"This is the leak. The Reverse-Form Method™ is how you patch it."*

### 4. Brief Assembly section — Mechanism reveal
- Eyebrow: "The Mechanism"
- Title: *"Watch a vague 'I need a quote' turn into a quotable job in 38 seconds."*
- Lead-in: 3-sentence tour of the inversion — *we read your site → we know your services → we ask only what we need → photos and notes arrive labeled to the right service line.*

### 5. Workflow (4 steps, "How it works") — Mechanism mechanics
Re-eyebrow each step in DR voice:
1. **Scan** — *"We read your site like your best estimator would."*
2. **Map** — *"We compress 27 service pages into 3 customer choices."*
3. **Capture** — *"Your customer takes the right photo, not just any photo."*
4. **Deliver** — *"Your inbox gets a packet. Not a guessing game."*
Each body re-written ~40% longer with concrete example ("the driveway photo, the breaker plate, the panel access shot").

### 6. Comparison (Before / PhotoBrief) — Belief stack
Rewrite both signal lists as *parallel pairs*, dollarized where possible. Add a new italic kicker between the two columns: *"Same customer. Same job. Different intake. Different outcome."*

### 7. Use cases — Belief / proof per trade
Rewrite each card as a 3-beat micro-story: *the moment intake fails → what PhotoBrief would have caught → the dollar at stake.* Stamps stay. Each gets a fresh title verb. Tone: *"The HVAC tech who showed up without the right capacitor — twice."*

### 8. Website Intelligence — Mechanism, technical layer
- Title: *"Your website is already telling us how to fix it."*
- 3 cards rewritten as *"What we read · What we map · What we ship"* (verb-led, present tense, owned by us).
- Closing line: *"Beta partners get this built for them in 7 days. Free."*

### 9. Beta crossover ticker
Rewrites: *"30 founding seats"*, *"2 win Free Pro for Life"*, *"Concierge setup in 7 days"*, *"60-day clock starts when the last seat fills"*, *"Every partner earns a reward tier."*

### 10. Founding Partner Beta — Big Belief + Authority
- Title: *"This isn't a waitlist. It's a 30-person room — and we're hiring two co-builders."*
- Lead: 3 short paragraphs — why a beta and not a launch, why these 30, what kind of person we're looking for, why now.
- Reward callout rewrite: *"The 2 partners who teach us the most? They never pay for PhotoBrief Pro again. Ever."*
- Trust strip: 3 micro-promises, italic, single-sentence each ("Your photos never train our models. Period.").

### 11. Reward Tiers — Stack the value
- Title stays warm but adds DR weight: *"Every founding partner walks out with something."*
- Add a 1-line consequence per tier ("Free Pro for Life = $588/yr you'll never invoice").

### 12. Fine print accordion
- Section eyebrow: *"Everything in writing — because that's what founding partners deserve."*
- Tightened intro line, but inner copy mostly intact (legal-adjacent).

### 13. Final CTA — The Close
- Eyebrow: *"One last thing."*
- Title: *"30 seats. 60 days. Two free-for-life winners. Pick up the pen."*
- Body: 4-line urgency stack — what they're applying for, what it costs (nothing), what they walk away with (a working intake regardless of acceptance), and the one-sentence dare.
- Primary CTA: *"Send My Application →"* (replaces "Apply for the beta")
- Secondary stays "See plans".

## Files touched

- `src/pages/Landing.tsx` — all visible strings in JSX (hero, sections, CTAs, footers within sections, accent captions).
- Content arrays inside `Landing.tsx`: `painPoints`, `workflowSteps`, `useCases`, `messySignals`, `cleanSignals`, `websiteIntelCards`, `trustPoints`, `TRADES`, `sectionLinks`, `SOFTWARE_APP_JSONLD.description` (kept SEO-aligned), TickerBar `items` props.
- `src/components/marketing/HowItWorksSteps.ts(x)` if it duplicates step copy used in JSON-LD.
- Any image `alt` text that becomes inaccurate.

## Out of scope

- Layout, components, animations, colors, illustrations.
- The auth pages, pricing page, dashboard, BetaOnboardingAgentExperience copy (it's a workspace component).
- New section additions — we work within the existing 13 sections.
- FAQ content (lives in `src/features/help/content/faq.tsx`, not visible on landing).

## How we'll ship

One pass on `Landing.tsx` from top to bottom, rewriting strings in place. Then a sweep of the content arrays. Then a quick read at desktop + mobile widths to make sure no rewritten line breaks the layout.
