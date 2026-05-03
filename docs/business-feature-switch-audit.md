# Business feature switch audit

Date: 2026-05-03

## Pricing boundary

PhotoBrief should have two clear buying modes:

1. **Manual links** — Free and Starter
   - Create a PhotoBrief request.
   - Send or copy a clickable request link.
   - Customer completes the mobile capture flow.
   - Business receives organized photos, answers, and AI summary.

2. **Automated intake** — Pro and above
   - Put a hosted Website Intake link behind the business website CTA.
   - Connect existing website forms through webhook/Zapier/Make when needed.
   - Route request types/messages to saved templates.
   - Auto-create customers and PhotoBrief requests from website leads.

This split keeps the entry path easy while preserving the strongest automation value for Pro.

## Why this lowers barriers to entry

Small businesses do not switch tools because a product has more features. They switch when the first useful outcome is obvious and low-risk.

The low-risk first outcome is:

> Send one PhotoBrief link instead of asking for photos over email.

That should remain available on Free and Starter.

The higher-value operating-system outcome is:

> Website leads automatically become photo-ready job briefs.

That belongs in Pro because it replaces part of the business intake workflow.

## Features businesses need for PhotoBrief to work

### Must be available before Pro

These reduce friction and help a business prove the workflow:

- Manual PhotoBrief links
- Mobile customer capture
- Simple AI photo checks
- AI submission summary
- Customer profiles
- Basic saved templates on Starter
- Basic branding on Starter
- Clear PDF/export path on Starter

### Pro unlocks

These are automation and operational leverage features:

- Website Intake
- Hosted intake form
- Guided setup for common website tools
- Request-type/template routing
- Webhook and Zapier/Make-style integrations
- Auto-send request link from website lead
- AI request/template drafting
- Missing-shot follow-up and reminders
- Internal notes and assignments
- White-label customer experience

### Team and Business unlocks

These scale a proven workflow:

- Larger photo pools
- Team inbox
- More users
- Bulk actions
- Longer storage
- Custom domains
- Multi-workspace/location management
- Priority support

## Barriers to remove or avoid

### Do not force integration setup too early

A business should be able to succeed without touching Website Intake. The path should be:

1. Create one request.
2. Send one clickable PhotoBrief link.
3. Review one completed brief.
4. Save that request as a template.
5. Upgrade to Pro when they want website leads to trigger the process automatically.

### Do not make Pro feel like “more settings”

Pro should feel like:

> Turn this on once, and website leads stop becoming email back-and-forth.

That is why Website Intake setup is a single guided flow instead of scattered configuration panels.

### Do not make webhooks the default

Webhook setup is powerful, but it is not the business-owner default. The default Pro path should be:

1. Copy hosted Website Intake link.
2. Paste it into the main website CTA.
3. Test one lead.

Webhook/Zapier/Make should stay available for businesses that already have a form they must keep.

### Do not hide manual fallback paths

Even Pro businesses need manual requests for one-offs. Manual links should remain a first-class action across all plans.

## Current implementation decisions

- `manual_links` and `clickable_links` are available on Free, Starter, Pro, Team, and Business.
- `website_intake`, `hosted_intake_form`, `intake_routing`, and `api_webhooks` start at Pro.
- The authenticated `/intake` route is gated through `FeatureGate`.
- The public `website-intake` Edge Function also rejects Free/Starter workspaces.
- Pricing copy now explains manual links versus Website Intake automation.
- Sidebar navigation shows Website Intake as a Pro feature for lower plans.

## Product principle

Free and Starter should make PhotoBrief easy to try.

Pro should make PhotoBrief hard to leave.
