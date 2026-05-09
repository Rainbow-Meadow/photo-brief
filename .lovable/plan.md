## Goal

In the Final CTA section ("One last thing — 30 seats. 60 days…"), replace the **upper illustration** (`closeHandshakeIllo`) on the right column with a **short contact form** so visitors can apply right there without scrolling back to the agent. The lower mailbox illustration stays.

## What the form looks like

Three fields + submit, sized to fit the right column on desktop and stack cleanly on mobile.

```
┌─────────────────────────────────┐
│  EYEBROW: 30-second application │
│  Name                           │
│  [____________________]         │
│  Work email                     │
│  [____________________]         │
│  Company / website (optional)   │
│  [____________________]         │
│  [ Send my application  → ]     │
│  Prefer the full 6-min agent?   │
│  → Open the onboarding agent    │
└─────────────────────────────────┘
```

- Card uses existing dark-section surface tokens (`bg-white/5`, `border-white/12`, rounded, padded) — matches the navy `Section tone="dark"` it sits in.
- Labels + helper text use existing `Body` / `Eyebrow` primitives. No new design tokens.
- Submit button reuses `<CTA variant="primary">` so visual language is identical to "Send my application" elsewhere.
- Secondary inline link scrolls to `#apply` (the full `BetaOnboardingAgentExperience`) so users who want the long flow still get there.

## Behavior

- Client-side validation with **zod** (already in deps): `name` required ≤80, `email` required valid ≤254, `company` optional ≤120.
- Submits via the existing `waitlist-submit` edge function (already public, already CORS-ready). Payload:
  ```ts
  { name, email, business_name: company, source: "landing-final-cta", interest: "founding-partner" }
  ```
- States: idle → submitting (button disabled + spinner) → success (form swaps to a short "You're in the queue. Watch your inbox." confirmation block) → error (toast via existing `useToast`).
- If `isFull` prop is true, eyebrow changes to "Join the waitlist" and submit button label matches.
- Honeypot field (`website_url`, hidden) to deter basic spam — dropped server-side ignores unknown keys.

## Files

- **Edit** `src/pages/Landing.tsx`
  - In `FinalCta`, remove the `<img src={closeHandshakeIllo} …>` element.
  - Render a new local component `<FinalCtaQuickApply isFull={isFull} />` in its place.
  - Keep `mailboxFlagIllo` below the form (smaller, opacity-80, as today).
  - Remove the now-unused `closeHandshakeIllo` import (and let the existing `landing-tokens` test confirm no orphaned import).
- **Add** the `FinalCtaQuickApply` function in the same file (kept colocated like other landing subcomponents). Uses `supabase.functions.invoke("waitlist-submit", { body })`.
- **Update** `src/test/landing-visual-contract.test.ts`:
  - Drop the assertion that `close-handshake.png` appears in the Final CTA.
  - Add an assertion that the Final CTA contains a `<form>` with `name`, `email`, and a submit button labeled "Send my application" / "Join the waitlist".

No DB migration, no new edge function, no new assets, no copy changes outside the form itself.

## Out of scope

- The existing full agent at `#apply` is untouched.
- No changes to the left column copy, headline, CTAs, or other sections.
- `close-handshake.png` file is left on disk (still referenced by tests-of-record and may be re-used later).
