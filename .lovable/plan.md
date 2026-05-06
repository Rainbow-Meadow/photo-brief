
## Two changes applied everywhere

### 1. Beta timing clarification
The 60-day beta clock starts **2 weeks after the final seat is filled**, not from each partner's acceptance date. This 2-week buffer allows concierge setup for every account before the clock begins.

**Where this affects copy/config:**
- `src/config/betaProgram.ts` — add a new constant (e.g. `BETA_SETUP_BUFFER_DAYS = 14`) and update `CONFIRMATION_SUMMARY`, `FREE_PRO_FINE_PRINT`, and any "60 days" copy to clarify the start trigger
- `src/pages/BetaList.tsx` — update any timeline/duration references
- `src/pages/Landing.tsx` — update beta offer section
- `src/pages/BetaWelcome.tsx` — update the post-signup messaging to explain the setup window
- `src/components/marketing/FoundingCustomerBanner.tsx` — if duration is mentioned
- `src/features/help/content/faq.tsx` — if beta duration is referenced
- `docs/founding-partner-beta-plan.md` — update the plan doc to reflect the new timing

### 2. Async feedback preference
Replace all references to scheduled calls, "hop on a call", "15-minute walkthrough", "schedule a call", phone calls, etc. with async-first language: chat, email, in-app feedback, web-based channels.

**Specific changes in `src/config/betaProgram.ts`:**
- `SCORING_RUBRIC` "Collaboration" dimension: replace "hop on a quick call" / "15-minute process walkthrough" with async equivalents (e.g. "respond to a follow-up via chat or email", "share a short async walkthrough")
- `FREE_PRO_QUALIFIES`: replace "willingness to walk us through your process" with async phrasing
- `DETAILED_EXPECTATIONS`: update the check-in expectation to reference async channels
- `REWARD_CRITERIA`: "Willingness to participate in check-ins" — keep but clarify these are async

**Other surfaces:**
- `src/pages/BetaWelcome.tsx` — replace "schedule a call" / "concierge call" language with "concierge setup via chat/email", remove "preferred call times" from the notes placeholder
- `src/pages/BetaList.tsx` — replace "concierge call" with "concierge setup"
- Email templates in `supabase/functions/_shared/transactional-email-templates/` — update any call-scheduling language in `founding-partner-welcome.tsx`, `beta-feedback-checkin.tsx`, `beta-stalled-checkin.tsx`
- `docs/founding-partner-beta-plan.md` — align the plan doc

### Technical details
All copy changes are in string literals and config constants. No schema, migration, or component structure changes needed.
