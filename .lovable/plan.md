## Goal

Collapse pricing from 5 tiers (`free` / `starter` / `pro` / `team` / `business`) to 2 (`intake` / `intake_team`), add a 14-day trial of `intake` for new accounts, and rewrite the public pricing/landing/beta copy to match the new positioning. Beta program structure stays the same — only copy changes.

---

## New tier definitions

**Smart Intake — `intake`**
- $79/mo public · $59/mo founding
- Caps: 500 photos/mo, 1 user, 12-month storage
- Promise: "Replace your website form with a guided intake flow."
- CTA: "Replace My Form"
- Includes: 1 public Smart Intake link, website scan/setup assistant, route-based questions, conditional photos, basic branding, email notifications, required-photo handoff.

**Smart Intake Team — `intake_team`**
- $149/mo founding (early) · $199/mo public (later)
- Caps: unlimited photos, up to 10 users, 24-month storage
- Promise: "Turn messy website leads into a shared intake queue your team can quote, assign, and act on."
- CTA: "Run Intake as a Team"
- Includes everything in `intake`, plus: multi-user, multiple intake links, team inbox, assignments, internal notes, advanced notifications, webhooks/Zapier/Make, priority support, longer storage, concierge route review.

**Trial**
- New signups get a 14-day trial of `intake` (full feature set, capped volume). Tracked via `workspaces.trial_ends_at`. After expiry: read-only + upgrade prompt.

---

## Implementation plan

### 1. Types & config (frontend)
- `src/types/photobrief.ts` — `Plan = "intake" | "intake_team"` (drop old union). Add `trial_ends_at` to workspace type if missing.
- `src/config/planLimits.ts` — replace the `planLimits` array with two entries; keep `FeatureKey` set but prune unused ones (`white_label`, `custom_domain`, `multi_workspace` likely retired). Both tiers get website intake / routing / branding; only `intake_team` gets `team_members`, `team_inbox`, `assignments`, `internal_notes`, `bulk_actions`, `api_webhooks`, `priority_support`, multi-link.
- `src/config/access.ts` — update `planCtaLabel` / `planCtaTarget` for new IDs.
- `src/config/betaProgram.ts` — keep beta constants; update `MAX_DISCOUNT_LABEL` copy if needed.

### 2. Pricing UI
- `src/components/pricing/PricingCardGrid.tsx` — 2-card grid (was 5). Show monthly + founding price. Per-tier CTA labels ("Replace My Form" / "Run Intake as a Team"). Drop billing-interval toggle if annual is gone, OR keep monthly/annual toggle (decide: keep — annual stays).
- `src/pages/Pricing.tsx` — rewrite hero + section copy around the new 2-tier story.
- `src/components/pricing/FoundingProBadge.tsx` — copy may need a tweak; structure unchanged.

### 3. Database migration (rip-and-replace enum)
- Drop dependent defaults/checks, then:
  - `ALTER TYPE` strategy: Postgres can't drop enum values cleanly → create new enum `plan_tier_v2` (`intake`, `intake_team`), add `plan_v2` column, backfill (`free`/`starter`/`pro` → `intake`; `team`/`business` → `intake_team`), swap, drop old.
  - Add `workspaces.trial_ends_at timestamptz`, `workspaces.trial_plan plan_tier_v2`.
  - Update plan-gate triggers/functions referencing old enum literals.
- Update `src/integrations/supabase/types.ts` regenerates automatically post-migration.

### 4. Stripe / checkout
- `supabase/functions/create-checkout/index.ts` — new `PLAN_PRICE_IDS`: `intake_monthly`, `intake_annual`, `intake_team_monthly`, `intake_team_annual`. User will create matching Stripe prices (lookup keys) post-migration. Note this in the closing message — do not auto-create.
- `supabase/functions/stripe-webhook` (and any other handlers) — map new lookup keys → plan IDs.

### 5. Beta program (copy only — structure unchanged)
- `src/pages/Beta.tsx` — update tier mentions: founding partners get `intake_team` features at $59/mo founding (or whichever you choose) for life. Keep 30-seat / 60-day mechanics, async feedback, white-glove setup.
- `docs/founding-partner-beta-plan.md`, `docs/beta-program-emails.md` — refresh tier names.

### 6. Marketing surfaces
- `src/pages/Landing.tsx` — pricing teaser cards, FAQs, CTA copy reflect 2 tiers + trial.
- `src/pages/Demo.tsx` — final CTA references "Start 14-day trial" / "Apply for beta".
- `src/components/marketing/*` — any `MechanismGrid`, mention of "Pro/Team/Business" → updated.
- FAQ content (`src/features/help/content/faq.tsx`) — tier-specific Q&A rewritten.

### 7. Trial enforcement
- `usePlan()` returns `{ plan, trialActive, trialEndsAt, daysLeft }`.
- New signup flow (`Auth.tsx` / `ensure-workspace` edge function): set `trial_ends_at = now() + 14 days`, `trial_plan = 'intake'`.
- Banner component on dashboard when trial active or expired (upgrade CTA → checkout for `intake`).
- Plan gates: during trial, treat workspace as if on `intake`; after expiry, downgrade to read-only state (no creating new requests).

### 8. Tests & seed data
- `mem://seed-users` — collapse from 5 test users to 3 (intake, intake_team, trial). Update seed script.
- `src/test/access-cta.test.ts`, `recipient-copy.test.ts`, any tier-specific tests — rewrite expectations.
- Visual regression baselines for `/pricing`, `/`, `/beta` will drift — regenerate snapshots.

### 9. Docs & memory
- Update `mem://index.md` Core line: `Plan tiers: intake/intake_team (+ 14-day trial of intake).`
- Add `mem://features/pricing-tiers` with full new structure.

---

## Order of operations

1. DB migration (enum swap + trial columns + trigger updates) — single migration call, awaits user approval.
2. Once approved & types regenerate: update `Plan` type, `planLimits`, `access.ts`, `usePlan`.
3. Update Pricing UI + Landing/Beta/Demo copy.
4. Update edge functions (`create-checkout`, webhook, `ensure-workspace` for trial).
5. Update tests + memory + docs.
6. Note Stripe price-key creation as a manual follow-up for the user.

---

## Open follow-ups (post-build)

- User must create Stripe products/prices with lookup keys: `intake_monthly`, `intake_annual`, `intake_team_monthly`, `intake_team_annual` (test + live).
- Decide whether annual billing stays (assumed yes, ~20% off — confirm if you want to drop it).
- Confirm trial-expiry behavior: read-only inbox vs full lockout.
