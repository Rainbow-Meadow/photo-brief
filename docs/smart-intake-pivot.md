# Smart Intake pivot

PhotoBrief is moving from a photo-request-first workflow to a smart intake layer for service businesses.

The goal is to replace basic website forms with a guided intake experience that creates a complete, actionable brief. Photos remain part of the product, but they are conditional instead of required by default.

## Route contract

`/i/:token` is the public Smart Intake route. It should collect customer answers, apply route-level photo policy, and create an intake brief.

`/r/:token` remains the public guided photo capture route. It should keep serving existing PhotoBrief requests and can be used when a Smart Intake route needs the full photo guide experience.

Authenticated setup stays under `/intake`. That page should become the business setup hub for scan, route review, question review, photo policy review, publish, and copy public link.

## Photo policy

Smart Intake uses four photo states:

- `not_needed`: do not ask for photos.
- `optional`: offer photos, but allow completion without them.
- `recommended`: explain that photos help, but allow completion without them.
- `required`: photos are needed before the business can fully act.

Avoid turning photo behavior into a simple boolean. The policy should carry enough nuance to reduce customer friction.

## Main output

The main output is an intake brief, not a photo request.

An intake brief should include the selected route, customer contact, answers, photo policy, readiness status, recommended next action, and an optional link to a guided photo request when one exists.

## Implementation principle

Use AI to help with setup and summaries, but keep the live public intake flow configuration-driven and reliable.

The first milestone is complete when `/intake` can publish Smart Intake setup, `/i/:token` can collect a no-photo or conditional-photo intake, `intake_sessions` stores the raw intake, `intake_briefs` stores the business-facing output, and `/r/:token` still works for existing guided photo requests.
