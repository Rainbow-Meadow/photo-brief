# GA4 conversion tracking

PhotoBrief uses GA4 through `src/lib/analytics.ts`.

## Measurement ID

Set this in Lovable/deploy environment variables:

```text
VITE_GA4_MEASUREMENT_ID=535045746
```

The app currently falls back to `535045746` if the variable is absent. Prefer setting the env var so the ID can be changed without a code deploy.

If Google Analytics provides a stream measurement ID in the `G-XXXXXXXXXX` format, use that value for `VITE_GA4_MEASUREMENT_ID` instead.

To disable analytics for a deployment:

```text
VITE_DISABLE_GA4=true
```

## Loading behavior

The Google tag is loaded by the app runtime, not hardcoded in `index.html`.

The loader:

- initializes `dataLayer` safely
- disables automatic page views
- sends sanitized SPA page views from `RouteTracker`
- defers loading the remote Google script until first user interaction or idle fallback
- no-ops safely if blocked by ad blockers or privacy tooling

## Privacy / URL sanitization

`sanitizePath()` replaces tokenized and UUID routes before sending page views:

```text
/r/:token
/r/:token/done
/invite/:token
/beta-invite/:token
/:id
```

Do not send raw recipient tokens, invite tokens, emails, phone numbers, or customer names to GA4.

## Conversion events

The app currently sends these conversion-oriented events:

| Event | Trigger |
| --- | --- |
| `generate_lead` | Waitlist form submitted successfully |
| `select_item` | Pricing plan selected |
| `begin_checkout` | Subscription checkout or credit top-up checkout opened |
| `request_created` | Authenticated business creates a PhotoBrief request |
| `recipient_submission_completed` | Public recipient completes a submission |
| `sign_up_started` | Reserved helper for signup flow |
| `sign_up` | Reserved helper for completed signup |
| `onboarding_completed` | Reserved helper for onboarding completion |

In GA4 Admin, mark the events you care about as Key Events / conversions. Recommended first set:

- `generate_lead`
- `begin_checkout`
- `request_created`
- `recipient_submission_completed`

## Notes

`trackEvent()` is for general analytics. `trackConversion()` and the `conversions` helpers are for funnel events that may become GA4 conversions.
