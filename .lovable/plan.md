# Remove all beta framing — go direct to launch

## Decisions locked in from your answers
- **Signup**: fully open. Anyone can create an account → 14-day trial of `intake`.
- **Pricing**: $59/mo (intake) and $149/mo (intake_team) become the **standard** published prices. The $79/$199 "regular" prices are retired entirely.
- **Coupons**: existing Paddle discount codes stay alive as silent early-signup bonuses (no UI surfacing). You can hand them out manually.
- **Beta surfaces**: delete public-facing beta pages and the invite acceptance flow. Keep admin tooling and DB markers for grandfathering existing beta users.

## What changes

### 1. Access config — flip the switch
`src/config/access.ts`
- `PUBLIC_SIGNUP_ENABLED = true`
- `INVITE_ONLY_BETA = false`
- All CTAs now route to `/auth?mode=signup` (or `?plan=...`) instead of `/#apply`.
- Labels become: "Start free trial" / "Get started" instead of "Apply".
- Update `src/test/access-cta.test.ts` to lock in the open-signup behavior.

### 2. Pricing — collapse to one price per tier
`src/config/planLimits.ts` and any pricing source of truth:
- `intake`: $59/mo (drop $79)
- `intake_team`: $149/mo (drop $199)
- Remove "founding" / "was $79" / strike-through markup from `PricingCardGrid.tsx`.
- Delete `src/components/pricing/FoundingProBadge.tsx` and all its imports.
- Update Paddle product/price wiring so checkout opens against the $59/$149 prices as the default (no coupon required).

### 3. Delete public beta pages and routes
Files to **delete**:
- `src/pages/Beta.tsx`
- `src/pages/BetaInvite.tsx`
- `src/pages/BetaWelcome.tsx`
- `src/components/auth/InviteAcceptanceGuard.tsx`
- `src/components/marketing/BetaQuickApplyForm.tsx`
- `src/components/marketing/BetaOnboardingAgentExperience.tsx`
- `src/components/marketing/FoundingCustomerBanner.tsx`
- `src/components/marketing/BetaSeatTracker.tsx`
- `src/hooks/useBetaSeats.ts`
- `src/config/betaProgram.ts`

Routing/config to update:
- `src/App.tsx` — remove `/beta`, `/beta/invite/:token`, `/beta/welcome` routes; remove `<InviteAcceptanceGuard>` wrapper.
- `src/config/routePaths.ts` and `src/config/marketingNav.ts` — drop beta entries.
- `src/test/route-contract.test.ts`, `src/test/nav-links.test.ts`, `src/test/analytics-sanitize-path.test.ts` — remove beta assertions.
- `public/sitemap.xml` — drop `/beta`.
- `public/_redirects` — drop `/beta` entries.
- `public/llms.txt`, `public/robots.txt`, `docs/seo-llm-discovery.md` — drop beta references.
- `scripts/smoke-public-endpoints.mjs` — drop `/beta`.
- `workers/router/src/index.ts` `MARKETING_PATHS` — drop `/beta`.

### 4. Rewrite landing + pricing copy
`src/pages/Landing.tsx`, `src/pages/Pricing.tsx`, `src/pages/Demo.tsx`, `src/pages/Signup.tsx`:
- Strip "Founding Partner Beta", "limited spots", "X of 25 seats", "60-day clock", apply-to-join CTAs, waitlist messaging.
- Replace headline frame (Kyle Milligan voice, since you didn't specify): lead with the operator pain ("Quoting jobs from a wall of texts and half-finished form submissions?"), CTA "Start my 14-day trial" → `/auth?mode=signup`. No "free forever," no hype.
- Keep tagline "Guide · Capture · Close" and the dark/amber brand system untouched.

### 5. Email templates — keep the lifecycle, drop the "beta" word
Rename and rewrite the four `beta-*` templates in `supabase/functions/_shared/transactional-email-templates/` to be generic onboarding/lifecycle emails:
- `beta-first-request-nudge` → `first-request-nudge`
- `beta-feedback-checkin` → `two-week-checkin`
- `beta-stalled-checkin` → `stalled-checkin`
- `beta-testimonial-request` → `testimonial-request`

Update `registry.ts` and any send-sites accordingly. Strip "founding partner" / "beta" copy; keep the structure and Kyle Milligan voice.

### 6. Help / FAQ / billing surfaces
- `src/features/help/content/faq.tsx` — remove beta Q&As.
- `src/features/help/pages/BetaGuidePage.tsx` — delete the page + its route.
- `src/features/billing/components/SubscriptionStatusBanner.tsx` — drop "founding price locked in" badge.
- `src/features/billing/pages/BillingSettingsPage.tsx` — drop beta-partner upsell block.
- `src/features/submissions/components/BetaFeedbackCard.tsx` — delete (or rename to generic feedback card if used outside beta context — I'll check on implementation).
- `src/components/shell/CommandMenu.tsx`, `src/components/layout/AppSidebar.tsx` — remove "Beta program" / "Apply" entries.
- `src/components/marketing/FreeProEligibilityModal.tsx` — delete (legacy free→pro modal tied to old tiers).

### 7. Keep, untouched (your call)
- `src/pages/AdminBeta.tsx`, `src/pages/AdminInvites.tsx` — internal-only admin tools, useful for ops.
- `beta_workspace_profiles` table + `src/hooks/useIsBetaPartner.ts` — DB marker for existing founding users so we can grandfather them.
- `src/hooks/useFlag.ts` beta entries — generic feature flag system, harmless.
- All Paddle discount codes stay live in Paddle; just no longer surfaced in the UI.

### 8. Memory + docs cleanup
- Update `mem://index.md` Core to drop the beta clock and replace plan-tiers line: prices are now $59 / $149 standard.
- Delete `mem://features/beta-timing-and-feedback`.
- Update `docs/founding-partner-beta-plan.md` → mark as historical (or delete).
- Update `docs/beta-program-emails.md` → rename to `docs/lifecycle-emails.md` with rewritten copy.
- Update `README.md` if it mentions beta.

## Out of scope (call out so nothing surprises you)
- No DB migration for `beta_workspace_profiles` — kept for grandfathering.
- No Paddle product/price ID changes — same prices, just relabeling $59/$149 as the canonical sticker price.
- No changes to capture, intake, agents, or recipient flows.
- No analytics event renames (event names stay; just the surfaces firing them change).

## Verification
- `bun run lint` clean.
- Vitest: `access-cta`, `route-contract`, `nav-links`, `brand-mark-contract` all green.
- Manual: `/`, `/pricing`, `/demo`, `/auth` show no "beta," "founding," or "apply" copy. Signup creates an account end-to-end.
- `curl -I` on `/beta` returns 404 (or redirects to `/`).
- Sitemap + smoke script don't reference `/beta`.

## Risk notes
- Existing users with bookmarks to `/beta`, `/beta/invite/:token`, `/beta/welcome` will hit 404. I'll add a single `/beta → /` redirect in `public/_redirects` to soften it. Live invite tokens (if any are unredeemed) will stop working — you may want to email those people first.
- Anything in customer-facing email already sent that links to `/beta/welcome` will 404. Acceptable since the cohort is small.
