
# Branded Transactional Email Overhaul

## Current State

The project already has Lovable's internal email system fully operational:
- `send-transactional-email` Edge Function with queue, suppression, and unsubscribe infrastructure
- `send-recipient-message` orchestrator for customer-facing emails
- `notify-event` dispatcher for server-triggered emails (signup welcome, submission notifications)
- 6 transactional templates + 6 auth email templates

All templates currently use blue (#0A6BFF) branding. This plan rebrands everything to the requested purple palette and adds missing templates.

## Template Mapping

| Requested Flow | Current Template | Action |
|---|---|---|
| A. Customer photo request | `recipient-request-link` | Rebrand |
| B. Customer reminder | `recipient-reminder` | Rebrand |
| C. Submission received (customer) | *none* | **Create new** |
| D. Business: new submission | `submission-received` | Rebrand |
| E. Business: request ready to send | *none* | **Create new** |
| F. Team invite | `invite.tsx` (auth email) | Rebrand |
| G. Founding Partner Beta welcome | *none* | **Create new** |

Also rebranding: `workspace-welcome`, `waitlist-confirmation`, `waitlist-admin-notification`, and all 6 auth email templates (`signup`, `recovery`, `magic-link`, `invite`, `email-change`, `reauthentication`).

## What Changes

### 1. Create a shared style constants file
New file: `supabase/functions/_shared/transactional-email-templates/brand-styles.ts`

Centralizes the new palette so all templates import from one place:
- CTA: #7C3AED, hover fallback: #6D28D9
- Primary text: #111014, secondary: #625F68
- Card surface: #FFFFFF, background: #F8F7FA
- Border: #E1DEE7, lilac accent: #A78BFA
- Font stack, container width, button radius, spacing

Also exports a reusable `BrandHeader` component (text wordmark "PhotoBrief.ai" in brand purple, since SVG in emails is unreliable) and a `BrandFooter` component.

### 2. Rebrand all 6 existing transactional templates
Update each `.tsx` to import shared styles and use the new palette. Key changes per template:
- Replace #0A6BFF → #7C3AED for buttons/accents
- Use #F8F7FA body background, #FFFFFF card surface
- Add PhotoBrief.ai text wordmark header
- Add clean footer with business context
- Update copy tone per the brief

### 3. Create 3 new transactional templates

**C. `customer-submission-confirmation.tsx`** -- Sent to customer after submitting photos. Confirms receipt, mentions the business can now review. Clean, short, no marketing.

**E. `business-request-ready.tsx`** -- Sent to business user when a request is created/ready. Includes the customer-facing link and recommended SMS copy block. CTA: "View request."

**G. `founding-partner-welcome.tsx`** -- Premium early-access welcome. Mentions hands-on setup, direct support, shaping the product. CTA: "Open PhotoBrief.ai."

### 4. Update registry
Add all 3 new templates to `registry.ts` with imports and TEMPLATES entries.

### 5. Rebrand all 6 auth email templates
Update `_shared/email-templates/*.tsx` (signup, recovery, magic-link, invite, email-change, reauthentication) to use the same purple palette and PhotoBrief.ai wordmark header.

### 6. Wire new templates into the app

- **Customer submission confirmation (C):** Add a `send-transactional-email` call in `notify-event/index.ts` for the `submission_received` event -- after notifying workspace members, also email the submitter if their email is available on the request.

- **Business request-ready (E):** Add a `send-transactional-email` call in `send-recipient-message/index.ts` when `kind === "initial"` -- after the initial message is sent to the customer, also send the "request ready" summary to the business user who triggered it.

- **Founding partner welcome (G):** Will be available as `founding-partner-welcome` template in the registry for manual invocation. No auto-trigger wired (it's a special case).

### 7. Deploy Edge Functions
Deploy: `send-transactional-email`, `auth-email-hook`, `notify-event`, `send-recipient-message`, `preview-transactional-email`.

## Files Changed

- `supabase/functions/_shared/transactional-email-templates/brand-styles.ts` (new)
- `supabase/functions/_shared/transactional-email-templates/recipient-request-link.tsx` (rebrand)
- `supabase/functions/_shared/transactional-email-templates/recipient-reminder.tsx` (rebrand)
- `supabase/functions/_shared/transactional-email-templates/submission-received.tsx` (rebrand)
- `supabase/functions/_shared/transactional-email-templates/workspace-welcome.tsx` (rebrand)
- `supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx` (rebrand)
- `supabase/functions/_shared/transactional-email-templates/waitlist-admin-notification.tsx` (rebrand)
- `supabase/functions/_shared/transactional-email-templates/customer-submission-confirmation.tsx` (new)
- `supabase/functions/_shared/transactional-email-templates/business-request-ready.tsx` (new)
- `supabase/functions/_shared/transactional-email-templates/founding-partner-welcome.tsx` (new)
- `supabase/functions/_shared/transactional-email-templates/registry.ts` (add 3 new templates)
- `supabase/functions/_shared/email-templates/signup.tsx` (rebrand)
- `supabase/functions/_shared/email-templates/recovery.tsx` (rebrand)
- `supabase/functions/_shared/email-templates/magic-link.tsx` (rebrand)
- `supabase/functions/_shared/email-templates/invite.tsx` (rebrand)
- `supabase/functions/_shared/email-templates/email-change.tsx` (rebrand)
- `supabase/functions/_shared/email-templates/reauthentication.tsx` (rebrand)
- `supabase/functions/notify-event/index.ts` (wire customer confirmation)
- `supabase/functions/send-recipient-message/index.ts` (wire business request-ready)

No database changes. No new routes. No changes to existing app UI, auth flow, or request flows.

## How to Test

Use the existing `/admin/email-preview` route or invoke the `preview-transactional-email` Edge Function to render all templates with their preview data and visually verify the new branding.
