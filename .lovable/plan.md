
# Brand Voice and Copy Consistency Pass

## Problems found

### 1. Stale beta duration and discount numbers
The centralized config says **60 days** and **tiered rewards (up to 75% off / free Pro for life)**, but multiple surfaces still say "90 days" and "50% off first year":

| File | Stale copy |
|------|-----------|
| `Landing.tsx` lines 158, 161 | "90-day free founding beta access", "50% off the first year" |
| `Pricing.tsx` lines 36, 39, 50, 63 | "90-day beta access", "50% off first year", SEO description |
| `BetaWelcome.tsx` lines 49, 53 | "60–90 days free beta access", "50% off your first year" |
| `FoundingCustomerBanner.tsx` line 19 | "90 days free… 50% off the first year" |
| `faq.tsx` line 10 | "90 days of free beta access… 50% off their first year" |
| `founding-partner-welcome.tsx` line 49 | "Locked-in Founding Partner pricing — permanently" (vague, doesn't match tiered structure) |

### 2. Copy not sourced from betaProgram config
Landing.tsx, Pricing.tsx, and BetaWelcome.tsx all hardcode their own benefit/ask lists instead of importing from `betaProgram.ts`. This guarantees drift.

### 3. Minor voice inconsistencies
- Auth.tsx still shows a "First-pass guarantee" callout during signup mode — which is unreachable since public signup is disabled. Dead UI element.
- BetaWelcome.tsx benefits list has a different structure/order than the centralized config.
- Pricing.tsx SEO meta description is stale.

---

## Plan

### A. Fix Landing.tsx beta section
- Replace hardcoded `betaBenefits` and `betaAsks` arrays with imports from `betaProgram.ts` (`PARTNER_BENEFITS`, `PARTNER_EXPECTATIONS`).
- This automatically picks up the correct 60-day duration and tiered reward language.

### B. Fix Pricing.tsx
- Replace hardcoded `betaOffer` array with config-driven values: `BETA_DURATION_DAYS`-day beta access, concierge setup, direct influence, and `MAX_DISCOUNT_LABEL`.
- Update the hero copy and SEO meta description to reference 60 days and tiered rewards instead of "90 days" and "50% off."

### C. Fix BetaWelcome.tsx
- Replace hardcoded `benefits` array with config-driven values sourced from `PARTNER_BENEFITS`.
- Remove the conflicting "60–90 days" and "50% off" strings.

### D. Fix FoundingCustomerBanner.tsx
- Import `BETA_DURATION_DAYS` and `MAX_DISCOUNT_LABEL` from config.
- Replace hardcoded "90 days free… 50% off" string.

### E. Fix FAQ
- Update the founding-beta FAQ answer to reference 60 days and tiered rewards using config constants.

### F. Fix founding-partner-welcome email template
- Update the "What you get" card to mention tiered rewards and 60-day access instead of the vague "permanently" line.

### G. Remove dead signup-mode UI in Auth.tsx
- Remove the "First-pass guarantee" callout that only renders during `mode === "signup"`, which is currently unreachable (public signup is disabled).

### H. Redeploy email edge function
- Deploy `send-transactional-email` to activate the updated founding-partner-welcome template.

---

## What stays unchanged
- BetaList.tsx — already sources from `betaProgram.ts`, copy is correct.
- All other email templates — already reviewed, voice is consistent.
- In-app dashboard, onboarding, help, support pages — copy is correct and consistent.
- microcopy.ts, access.ts — already correct.
- Privacy, Terms, NotFound, ResetPassword, ForgotPassword, Unsubscribe — all consistent.
- ComparisonTable, QuotableFacts, InteractiveHeroBriefAssembly, HowItWorksSteps — all correct.
