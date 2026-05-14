## Goal

Tear out the existing half-wired Stripe integration completely (frontend, edge functions, DB columns/tables, secrets, deps), then re-enable payments cleanly via Lovable's built-in payments flow with fresh products. Pricing marketing page stays as-is; checkout CTAs get neutered until the new provider is wired.

## Phase 1 — Rip out

### Frontend (delete)
- `src/components/billing/PaymentTestModeBanner.tsx`
- `src/components/billing/StripeEmbeddedCheckout.tsx`
- `src/components/billing/StripeTopupCheckout.tsx`
- `src/components/billing/TopupPackCards.tsx`
- `src/config/topupPacks.ts`
- `src/hooks/useTopupBalance.ts`
- `src/lib/stripe.ts`
- `src/features/billing/pages/BillingSettingsPage.tsx` → replace with a minimal stub page ("Billing is being rebuilt") so the `/settings/billing` route still mounts.

### Frontend (edit)
- `src/hooks/useUsage.ts` — drop `useTopupBalance` import + topup field; report only plan allowance + usage.
- `src/pages/Pricing.tsx` — keep page; replace any "Start checkout" / "Upgrade" handlers with a no-op (`mailto:hello@photobrief.ai` or "Coming soon" toast). FoundingPro counter stays.
- Any `<Link to="/settings/billing">` upgrade CTAs keep working (route still exists, shows stub).

### Dependencies
- `bun remove @stripe/react-stripe-js @stripe/stripe-js`

### Edge functions (delete code + call `delete_edge_functions`)
- `create-checkout`
- `create-topup-checkout`
- `customer-portal`
- `payments-webhook`
- `supabase/functions/_shared/stripe.ts`
- Remove related blocks from `supabase/config.toml` if any (none currently set).

### Secrets (delete via `delete_secret`)
- `STRIPE_SANDBOX_API_KEY`, `STRIPE_LIVE_API_KEY`
- `PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `PAYMENTS_LIVE_WEBHOOK_SECRET`
- `VITE_PAYMENTS_CLIENT_TOKEN`
- (Skip `LOVABLE_API_KEY` and any connector-managed secrets.)

### Database migration
Single migration that:
1. Drops `request_credit_packs` table (cascades to `idx_topup_packs_*`).
2. Updates `current_topup_credits()`, `current_topup_balance()`, `current_credit_balance()` to return zero topup constants (no table read), or just return plan-only balance.
3. Updates `enforce_request_limit()` trigger to skip the topup fallback branch — when cap is hit, raise `PLAN_LIMIT_REACHED` directly.
4. Strips Stripe-specific columns from `subscriptions`: `stripe_customer_id`, `stripe_subscription_id`, `price_id`, `environment`. Drops indexes that reference them. Keeps `plan_tier`, `status`, `trial_ends_at`, `current_period_*`, `cancel_at_period_end`, `is_founding_pro`, `billing_interval` (still used for trial + plan accounting).
5. Leaves `credit_ledger`, `usage_events`, `subscriptions` schema otherwise intact so `handle_new_user`, plan gates, and credit accounting keep working.

### Cleanup verification
- `rg "stripe|Stripe|@stripe|topup|Topup|VITE_PAYMENTS" src/ supabase/ workers/` should only return: this plan, `docs/`, agent-shim cost mirroring (unrelated AE telemetry), and any historical migrations.
- App builds, `/settings/billing` shows stub, `/pricing` renders.

## Phase 2 — Re-enable Lovable Payments fresh

After Phase 1 is in and verified:

1. Run `payments--recommend_payment_provider` — classifies PhotoBrief (B2B SaaS, digital service, US-friendly) and recommends Stripe or Paddle.
2. Present the recommendation, confirm with you.
3. Call the chosen `enable_*_payments` tool. New (sandbox) keys are wired automatically.
4. (Stripe only) Ask which tax-handling mode you want per the seamless Stripe options.
5. Define products with `batch_create_product`:
   - `intake_monthly` — $79/mo  (founding $59)
   - `intake_annual` — $790/yr  (founding $590)
   - `intake_team_monthly` — $199/mo  (founding $149)
   - `intake_team_annual` — $1990/yr  (founding $1490)
   - Top-up credit packs — pricing/sizes you confirm at that step.
6. Implement fresh checkout: new edge function(s) using the Lovable-managed payments knowledge, new `BillingSettingsPage` showing plan + invoices + portal link, new pricing-page CTAs that hit checkout. New webhook to update `subscriptions.plan_tier` / `status` / `trial_ends_at`.
7. New schema, if needed, will be added at that point (e.g. fresh `topups` table) — designed against the new provider's events instead of inheriting the old shape.

## Risk notes

- **`handle_new_user` trigger** inserts a `subscriptions` row with `plan_tier='intake'`, `status='trialing'`. Migration keeps that working — no signup regression.
- **Founding Pro** logic (`founding_pro_remaining`, `founding_pro_cache`) is independent of Stripe and stays intact.
- **Plan gates** (`usePlan`, `enforce_seat_cap`, `enforce_request_limit`, `plan_credit_allowance`) keep working off `business_workspaces.plan_tier` — nothing here touches Stripe.
- **`webhook_subscriptions`** table is unrelated (outbound submission webhooks for customers). Untouched.
- After Phase 1, no one can pay — workspaces are effectively frozen on whatever `plan_tier` they currently have. Fine because this is pre-launch.
