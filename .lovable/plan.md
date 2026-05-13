
# Kyle Milligan copy pass — PhotoBrief (Smart Intake era)

A top-to-bottom rewrite of every customer-facing line on the marketing site and the auth/signup flow, in the voice Kyle Milligan teaches: one promise, one reader, one-idea-per-sentence, ruthless verbs, specificity over adjectives, and a curiosity-driven rhythm that pulls the eye down the page.

The pass also realigns positioning to the new product shape: **PhotoBrief reads your existing website, builds a smart intake configuration from it, and routes every customer through the right path — not the same generic form.** Photos become *one possible ingredient*, not the whole meal.

## What PhotoBrief is now (the truth the site has to tell)

> PhotoBrief uses your existing website as the source material. It scans the site, spots your services, customer intents, and the gaps in your current form, and builds intake routes — each with the right questions and its own photo policy.
>
> When a customer hits **/i/:token**, they walk a guided flow. Based on the route they pick, PhotoBrief decides whether photos are *not needed*, *optional*, *recommended*, or *required*.
>
> The output isn't a pile of photos. It's an **intake brief**: who the customer is, what they need, which route they matched, what they answered, whether photos came in or are still needed, how ready the request is, and what you should do next.
>
> When photos are useful but not mandatory, they upload inside the intake or skip. When photos are truly required, PhotoBrief hands the customer into the existing **/r/:token** guided capture flow — the specialized photo engine, untouched.

The new mental model the site must communicate:

> **Customer website CTA → Smart Intake → route-specific questions → photo decision → intake brief → optional guided photo handoff only when needed.**

The big shift: PhotoBrief no longer opens with *"send me photos."* It opens with *"what does the business need to know to act?"*

## Voice contract (every line)

- **One reader.** A small-business owner whose website form gives them a name and a sentence. *You*, never "businesses" or "users."
- **One promise per page.** Each surface has a single dominant outcome.
- **Lead with the bleed.** Open with the cost of the same generic form for every lead, then name the fix.
- **Specificity beats adjective.** "Three follow-up emails before you can price it." Not "lots of back-and-forth."
- **Conversational rhythm.** Short. Then medium. Then a sentence that earns its length.
- **Verbs do the lifting.** "Reads your site, builds the routes, decides on photos, hands you a brief."
- **Curiosity gaps where they're earned.** Eyebrows tease, bodies pay off.
- **Plain words.** "Send" over "submit." "Quote" over "estimation workflow."

## Positioning rules baked into every page

1. **Lead with intake, not photos.** Hero, marquee, mechanism, signposts — all repointed at replacing the generic form.
2. **Your website is the source material.** Make the *"PhotoBrief reads your site and builds the intake for you"* moment a recurring beat. It's the demo-magic moment.
3. **Routes, not a single form.** The product creates *route-specific* intake. Different services, different questions, different photo policy.
4. **The four photo policies are a feature, not a footnote.** Name them in human terms: *not needed*, *optional*, *recommended*, *required*. The conditional logic is part of the pitch.
5. **The deliverable is a brief, not photos.** Every customer outcome ends in *an intake brief you can act on*.
6. **The guided photo flow is the closer.** Frame `/r/:token` as the specialist that takes over only when a route demands it.

## Guardrails (locked, not rewritten)

- Tagline `Guide · Capture · Close` — verbatim everywhere.
- Pricing numbers, plan names, included photo counts, beta seat count, beta day count — unchanged.
- `Reverse-Form Method™` retained; framing shifts to position it as the *intake* mechanism, not a photo-only mechanism.
- Brand tokens, layout, components, routes, analytics events, JSON-LD shape — untouched. Strings only.
- Legal pages, `llms.txt`, `llms-full.txt`, manifests — out of scope.
- `/i/:token`, `/r/:token`, `/intake/*` flow copy — already pivoted/QA'd; not retouched here.

## Surfaces in scope

**Marketing pages**
- `src/pages/Landing.tsx` — hero, marquee, mechanism intro, before/after, signpost cards, FAQ intro, final CTA. Repositioned around *site → routes → brief*.
- `src/pages/Pricing.tsx` — hero, beta-offer cards, intake-mode cards, FAQ, founding-partner closer.
- `src/pages/Beta.tsx` — hero, what-you-get, what-we-need-back, urgency, CTA.
- `src/pages/Demo.tsx` — hero, scenario copy, narration. New story arc: *paste your URL → see your routes → watch a lead become a brief*.
- `src/pages/ForAiAgents.tsx` — hero, capability blurbs, endpoint descriptions. Reframes the API around intake creation and brief retrieval.

**Shared marketing components**
- `HowItWorksSteps.tsx` — four steps now narrate **scan site → build routes → guided intake (with photo decision) → brief delivered**.
- `MechanismGrid.tsx` — four cards mirror the same four moves.
- `ComparisonTable.tsx` — *generic contact form vs PhotoBrief smart intake*. Rows about routing, route-aware questions, photo policy, brief output.
- `UseCasesGrid.tsx` — trade vignettes start with a website lead, show the route picked, end with the brief.
- `QuotableFacts.tsx` — stats repointed at intake/lead-response economics.
- `FinalCtaSection.tsx` — default labels.
- `BetaQuickApplyForm.tsx`, `FoundingCustomerBanner.tsx`, `FreeProEligibilityModal.tsx` — labels, helper text, button states.

**Shared content**
- `src/features/help/content/faq.tsx` — owner-voice questions ("Will it know when to ask for a photo?", "Does it really read my site?", "What if my customer just wants a callback?"). Answers ≤ 3 sentences, lead with the answer.
- `src/config/microcopy.ts` — `business.*` strings only. (`recipient.*` stays — public-flow scope-locked.)
- `src/config/access.ts` — CTA labels (`signupCtaLabel`, `signupCtaShortLabel`, `planCtaLabel`).
- `src/config/betaProgram.ts` — only human-readable label strings (e.g. `MAX_DISCOUNT_LABEL`).

**Auth & signup flow**
- `Auth.tsx`, `Signup.tsx`, `BetaInvite.tsx`, `BetaWelcome.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx` — page titles, helpers, button states, success/error toasts. Welcome state reframed around *"point us at your website and we'll build your intake"*.

## What changes per surface (representative)

**Landing hero.** Keep `Guide. Capture. Close.` Sub becomes: name the leak (one form for every lead), name the fix (PhotoBrief reads your site and builds route-specific intake), name the deliverable (a brief you can quote — with photos when, and only when, the route says so).

**Marquee.** Parallel one-clause hooks: *"Your form asks 5 fields. Your customers needed different ones." "78% buy from whoever quotes first." "PhotoBrief reads your site in 60 seconds." "Photos when they matter. Skipped when they don't."*

**Mechanism (4 cards).** **Read the site → Build the routes → Guide the customer → Hand back a brief.** Verb-first titles, 1–2 sentence bodies. Photo policy gets a single line inside card 3.

**Before/After.** Left = "what your website form gives your inbox today" (name, email, one sentence, no context, no photos when you needed them, photos when you didn't). Right = "what PhotoBrief drops in instead" (matched route, route-specific answers, photos when the route called for them, ready-to-quote brief).

**Signpost cards.** Demo: *see your own intake assemble in 60 seconds.* Beta: *founding seats.* Pricing: *plans that scale with intake volume.*

**FAQ.** New questions: *Does PhotoBrief actually read my website? Will it know when to ask for a photo? What about leads that don't need photos at all? Where does my existing form fit? What's an intake brief, exactly? What happens when a route requires photos?* Lead with the answer.

**Pricing hero.** Reframe from "Apply now. Lock in launch-year savings." to a benefit-first hook: what the seat actually buys (a working intake replacement built from your site, white-glove setup, founding pricing). Scarcity line beneath, not in the headline.

**Pricing intake-mode cards.** Existing "Every plan / Pro and above" split rewritten so each card sells the *outcome* of that intake mode, not the mechanism.

**Beta page.** Three-beat structure: what you get, what we ask in return, what happens next.

**Demo.** Narration restructured: starts at *"paste your website URL,"* shows the routes PhotoBrief built, walks one customer through a route, shows the photo-policy decision in action, ends at a brief in the inbox.

**ForAiAgents.** Reframes the API around `create_intake` and brief retrieval as the primary verbs; photo capture endpoints positioned as the optional follow-on the route may trigger.

**Auth/Signup.** Replaces generic "Welcome back" / "Create your account" with PhotoBrief-specific framing tied to the new promise: *"Sign in to your intake inbox," "Your intake routes are one URL away."* Errors stay neutral and actionable.

## Process

1. Draft new strings file-by-file in the order above.
2. Apply via targeted `code--line_replace` edits — no file rewrites, no JSX moved, no props changed.
3. Run `lint`, `typecheck`, `vitest`. Existing tests (`recipient-copy.test.ts`, `nav-links.test.ts`, `landing-typography.test.ts`, `brand-mark-contract.test.ts`) catch any contract I break.
4. Spot-check `/`, `/pricing`, `/beta`, `/demo`, `/auth`, `/signup` in the preview at the current 440 px viewport so new line lengths still wrap cleanly on mobile.

## Out of scope

- Any backend, RLS, edge function, or schema.
- Any component structure, prop, or layout class.
- `/i/:token`, `/r/:token`, `/intake/*` flow copy.
- `llms.txt`, `llms-full.txt`, OpenAPI, agent manifests.
- Privacy, Terms, Unsubscribe.

## Deliverable

A single PR's worth of strings-only edits across the files above. Site looks identical, reads like a Kyle Milligan sales letter the whole way down, and finally tells the truth about what PhotoBrief is now: **the smart intake layer that reads your website, builds the routes, decides when photos matter, and hands you a brief you can act on — with the guided photo flow waiting in the wings for the routes that actually need it.**
