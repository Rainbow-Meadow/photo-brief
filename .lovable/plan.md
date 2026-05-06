
## Transactional Email Audit Report

### Templates (9 registered)

| Template | Trigger | Wired? | Voice OK? | Issue |
|----------|---------|--------|-----------|-------|
| `waitlist-confirmation` | waitlist-submit edge fn | Yes | Yes | -- |
| `waitlist-admin-notification` | waitlist-submit edge fn | Yes | Yes | -- |
| `recipient-request-link` | send-recipient-message edge fn | Yes | Fix needed | CTA says "Open PhotoBrief" -- recipients don't know what that is |
| `recipient-reminder` | send-recipient-message edge fn | Yes | Yes | -- |
| `submission-received` | notify-event edge fn | Partial | Yes | notify-event exists but no DB trigger fires it |
| `customer-submission-confirmation` | notify-event edge fn | Partial | Yes | Same -- no DB trigger fires notify-event |
| `business-request-ready` | send-recipient-message edge fn | Yes | Yes | -- |
| `workspace-welcome` | notify-event (user_signup) | Dead | Yes | No DB trigger fires `user_signup` event |
| `founding-partner-welcome` | None | Dead | Yes | Never invoked anywhere |

### Auth Templates (6)
All wired correctly via `auth-email-hook`. Brand voice is consistent. No issues.

### Fixes

#### 1. Recipient CTA button text
Change "Open PhotoBrief" to "Take your photos" on `recipient-request-link`. Matches the action-oriented tone used in `recipient-reminder` ("Send your photos") and the microcopy ("I'll walk you through a few quick photos").

#### 2. Wire `submission-received` and `customer-submission-confirmation` via DB trigger
Create a DB trigger on `submissions` INSERT that calls `notify-event` with `{ event: 'submission_received', submission_id }` via `pg_net`. This makes both the business notification and customer confirmation emails fire automatically when a submission is created -- no client-side invocation needed.

#### 3. Wire `workspace-welcome` via DB trigger
Create a DB trigger on `profiles` INSERT that calls `notify-event` with `{ event: 'user_signup', user_id }` via `pg_net`. This sends the welcome email automatically when a new user signs up.

#### 4. Wire `founding-partner-welcome`
Add a `founding_partner_accepted` event to `notify-event`. Create a DB trigger on `workspace_subscriptions` when `is_founding_pro` is set to true, firing the founding partner welcome email. If the founding partner flow is handled manually (admin-driven), add the invocation to the admin acceptance flow instead.

#### 5. Stub in `notificationService.ts`
The TODO on line 155 (`// TODO(Phase 10): invoke send-transactional-email edge fn.`) indicates planned but unwired notification emails. This is a known gap -- not blocking, but noted for future work.

### Pipeline Health Summary

- **Fully wired and sending**: 5 of 9 templates (waitlist pair, recipient pair, business-request-ready)
- **Template exists, trigger exists, but no DB hook**: 3 templates (submission-received, customer-submission-confirmation, workspace-welcome) -- the notify-event edge function handles them, but nothing calls it
- **Dead (no trigger at all)**: 1 template (founding-partner-welcome)
- **Auth emails**: All 6 fully wired
- **Brand voice**: Consistent across all templates except one CTA button

### Files to modify

- `supabase/functions/_shared/transactional-email-templates/recipient-request-link.tsx` -- CTA text fix
- New migration: DB triggers for `submissions` INSERT and `profiles` INSERT to call `notify-event` via `pg_net`
- `supabase/functions/notify-event/index.ts` -- Add `founding_partner_accepted` event handler
- New migration: DB trigger on `workspace_subscriptions` for founding partner welcome
- Deploy: `notify-event`, `send-transactional-email`, `preview-transactional-email`
