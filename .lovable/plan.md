
# Backend Congruency Audit — Findings and Fixes

## Audit Summary

Inspected: all 45 edge functions, all 37 frontend routes, all sidebar/nav links, all Supabase table references, all `functions.invoke` calls, and all internal `NavLink`/`href` destinations.

**Healthy (no action needed):**
- All 23 edge functions called from the frontend exist on disk
- All 22 backend-only edge functions (webhooks, cron, OAuth callbacks, email hooks) are correctly not called from the frontend
- All 11 sidebar URLs match defined routes in App.tsx
- All route definitions have corresponding page components
- `openapi.json` exists at `public/openapi.json`
- Storage buckets (`brand-assets`, `submission-media`, `marketing-assets`) are referenced correctly
- All RLS policies reference valid functions and columns

---

## Issues Found

### 1. Dead navigation paths (3 files)

Three components use `/app/settings/billing` but the actual route is `/settings/billing`:

| File | Line | Current | Fix |
|------|------|---------|-----|
| `StripeEmbeddedCheckout.tsx` | 31 | `/app/settings/billing?checkout=success...` | `/settings/billing?checkout=success...` |
| `StripeTopupCheckout.tsx` | 33 | `/app/settings/billing?topup=success...` | `/settings/billing?topup=success...` |
| `UpgradePrompt.tsx` | 134 | `/app/settings/billing?plan=...` | `/settings/billing?plan=...` |

**Impact:** After Stripe checkout completes, the redirect lands on a 404. Upgrade prompts throughout the app also link to a 404.

### 2. Missing database tables (6 tables)

Six tables are queried by frontend services but do not exist in the database:

| Table | Queried by | Purpose |
|-------|-----------|---------|
| `intake_sources` | `websiteIntakeService.ts` | Website intake source configs |
| `intake_template_rules` | `websiteIntakeService.ts` | Template routing for intake |
| `intake_field_mappings` | `websiteIntakeService.ts` | Field mapping for intake forms |
| `intake_events` | `websiteIntakeService.ts` | Intake event log |
| `integration_connections` | `integrationService.ts` | OAuth/webhook connector state |
| `submission_answers` | `submissionsService.ts` | Context question responses |

**Impact:** These features silently fail — queries return empty or error. The Website Intake page, Integrations page, and submission context answers all depend on these tables.

---

## Plan

### Step 1 — Fix dead paths (3 edits)
Replace `/app/settings/billing` with `/settings/billing` in all three files.

### Step 2 — Create missing tables (1 migration)
Create the 6 missing tables with appropriate columns, RLS policies, and workspace-member access patterns matching the existing codebase conventions. Column definitions will be inferred from the service files that query them.

### Step 3 — Verify
- TypeScript build passes
- Confirm tables exist with a read query
- Spot-check that no other orphaned references remain
