# Plan: Public PhotoBrief Demo — Conversational Reverse Form

## The hook
A visitor lands on the demo, types *"I'm a plumber and customers send me photos of leaking faucets"*, the AI asks 1–2 quick clarifying questions, then drops them straight into a **plumbing-specific guided photo capture** that ends with a real, branded brief emailed to both the visitor and you.

This is the reverse-form experience — but the visitor IS the business owner, and they walk through what their own customer would experience.

## Heads-up on "ephemeral, no DB"
Real photo capture + AI brief generation needs `requests`, `submissions`, `submission_media`, and R2 storage. To honor the "ephemeral" intent without rebuilding the pipeline:
- Everything lives in a hidden **Demo workspace** invisible to your normal inbox.
- Rows are tagged `is_demo = true` and **auto-purged after 24h** (rows + R2 objects).
- Effectively ephemeral, zero new pipeline code.

## The conversational discovery (the new part)

Reuses the existing `aiService.generateGuideFromPrompt` (already used in `CreateRequestPage` for the AI request builder) but flips the prompt direction.

```text
Visitor lands on /demo
   ↓
Step 1 — "What kind of service do you provide?"
   Free text + chips: Plumbing · Roofing · HVAC · Auto repair · Property mgmt · Other
   ↓
Step 2 — "What does a typical photo request look like for you?"
   e.g. "Leaking faucet under the kitchen sink"
   ↓
Step 3 — AI asks ONE clarifying follow-up if useful
   e.g. "Do you usually need to see the shut-off valve too?"
   (Skip if confidence is high)
   ↓
Step 4 — "Last thing — your name and email so we can send you the finished brief"
   ↓
   AI generates a tailored guide draft (title, intro message, 3–6 photo steps with
   specific prompts, e.g. "Wide shot of the faucet base", "Close-up of the drip
   point", "The shut-off valve under the sink")
   ↓
   Backend: create demo request with that guide → redirect to /r/<token>
   ↓
Step 5 — Visitor walks through the actual recipient capture flow against
   their own custom brief. Takes/uploads 1–3 sample photos.
   ↓
Step 6 — Submit → existing AI analysis runs → confirmation page shows the
   finished brief preview ("Here's what your customer would have sent you")
   ↓
Emails fire to (a) visitor and (b) FOUNDER_NOTIFY_EMAIL with the brief PDF link
```

## Routes & entry points

1. **`/demo`** — full-bleed marketing page with PB navy/amber branding. Hero pitch + the conversational form embedded.
2. **Landing page embed** — section after `InteractiveHeroBriefAssembly` titled *"Try it on your own business"* with a single CTA → `/demo` (we don't try to fit a multi-step chat inline; the landing card is a teaser).

## Backend pieces

### One-time migration
- Create `PhotoBrief Demo` workspace owned by your founder account.
- Add `is_demo BOOLEAN DEFAULT FALSE` column on `requests`.
- Cron job `demo-cleanup` (hourly): purge demo-workspace requests > 24h old + cascade media in R2.

### New edge function: `demo-discovery`
Single endpoint that powers the conversational flow:
- `POST /demo-discovery` with `{ step, history, serviceType, scenario, name, email }`
- Wraps the existing `aiService.generateGuideFromPrompt` logic but seeded with a system prompt: *"You're helping a service business design the perfect photo intake template for their own customers. Their service is X. Their typical request is Y. Generate a guide draft."*
- Returns either `{ nextQuestion: "..." }` or `{ ready: true, draft: RequestDraft }`.
- When `ready`, server-side: creates a demo guide + demo request in the Demo workspace, returns `{ requestLink: '/r/<token>', requestId }`.
- Turnstile-protected on the final step.

### New edge function: `demo-cleanup` (hourly cron)
- Deletes demo-workspace requests > 24h old, cascading submissions/media + R2 objects.

### Reuse existing
- `PublicRecipientPage` for the capture experience (no changes besides a branding flag).
- `ai-analyze-media` + `ai-summarize-submission` for brief generation (already triggered by submit).
- `notify-event` — add a demo branch: when `workspace_id === DEMO_WORKSPACE_ID`, suppress normal owner notifications and instead send the new `demo-brief-delivery` email to BOTH the visitor and `FOUNDER_NOTIFY_EMAIL`.

### Secrets
- `FOUNDER_NOTIFY_EMAIL` — your inbox.
- `DEMO_WORKSPACE_ID` — populated after migration.

### New transactional email template: `demo-brief-delivery`
- Subject: *"Your sample PhotoBrief is ready — [service type]"*.
- Body: brief summary, photo thumbnails (24h signed URLs), the AI's analysis, CTA *"Want this for your business? Start free trial."*

## Frontend pieces

### `src/pages/Demo.tsx`
- `MarketingLayout`, full PB branding.
- Hero copy: *"See exactly what your customers would experience — built for your business in 60 seconds."*
- New `<DemoDiscoveryChat>` component (chat-style UI, mirrors `AIRequestBuilderChat` styling but inverted: assistant asks the questions, visitor answers).
- Uses `aiService`-style streaming if available, otherwise simple request/response.
- On `ready`, redirects to `/r/<token>`.

### `<DemoDiscoveryChat>` component
- Local state machine: `service → scenario → [optional clarifier] → contact → generating → ready`.
- Calls `demo-discovery` between steps.
- Shows a live preview pane on desktop ("Building your brief…") that gradually reveals the guide steps as the AI generates them.

### Landing embed
- New section in `Landing.tsx` after the existing interactive hero.
- Title + 2-line pitch + single button `/demo`.
- Optional: 1 typed-out example showing what the AI generates ("Plumber → 4-step leak inspection brief").

### Capture-flow demo branding
- Add `forceDemoBranding` flag to `RecipientBrandingContext` set when the loaded request's workspace is `DEMO_WORKSPACE_ID`.
- Forces full BrandMark + tagline header, adds a small "DEMO" pill in the corner so visitors know it's a sandbox, keeps `PoweredByBadge`.

## Anti-abuse
- Turnstile on the final discovery step (before request creation).
- Rate-limit `demo-discovery` per IP (10/hour) inside the edge function.
- 24h cleanup caps storage exposure.
- `notify-event` short-circuits all integrations / SMS / webhooks for demo-workspace requests.

## Out of scope
- No login on the demo flow.
- No persistence beyond 24h.
- No SMS, no integration triggers, no real owner notifications.
- No saving the generated guide to the visitor's account (we don't have one — it's a marketing demo).

## Implementation order
1. Migration: Demo workspace + `is_demo` column + `demo-cleanup` cron.
2. Add secrets (`FOUNDER_NOTIFY_EMAIL`, `DEMO_WORKSPACE_ID`).
3. `demo-discovery` edge function (reusing AI guide-generation logic).
4. `demo-cleanup` edge function.
5. `demo-brief-delivery` email template + registry entry.
6. `notify-event` demo-workspace branch.
7. `<DemoDiscoveryChat>` component + `/demo` page.
8. Landing embed.
9. Capture-flow `forceDemoBranding` flag.
10. End-to-end smoke test (plumber, roofer, HVAC scenarios) and verify cleanup.

## Why this works as marketing
- Visitor types something specific to *their* business → instant personalization.
- They feel the conversational intelligence (the same engine powering the real product).
- They experience the recipient side (which is the magic moment competitors don't have).
- They get a polished brief in their inbox they can show to a partner/customer.
- You see every demo submission in real time — instant qualified-lead pipeline.
