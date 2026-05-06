
# Beta Welcome Page

A new page at `/welcome` for companies accepted into the Founding Partner Beta. It serves as a concierge intake — congratulatory, exclusive-feeling, and actionable. The page collects everything you need to set up their account before the concierge call.

## What the page includes

### Hero section
- Congratulatory headline ("You're in." or "Welcome to the inner circle.")
- Short paragraph reinforcing exclusivity (limited cohort, hand-picked, concierge setup)
- Founding Partner badge/eyebrow

### What's included card
- Bullet list of founding partner benefits (concierge setup, priority support, locked pricing, direct roadmap input, early features)

### Concierge intake form (multi-section)
Collects everything needed to configure their account:

1. **Business basics** — Business name, industry (dropdown from existing INDUSTRIES list), website URL, phone number
2. **Brand & identity** — Logo upload (file input), primary brand color (hex picker), tagline or short description
3. **Photo workflow details** — What they need customer photos for (textarea), typical monthly volume (dropdown), who reviews submissions (role/name), preferred customer communication channel (email/SMS/both)
4. **First template ideas** — What their first 1-2 PhotoBrief templates should cover (textarea), example scenarios or job types

### What happens next timeline
- Numbered steps: "We review your info" → "Your account is configured" → "Concierge call to walk through everything" → "You send your first real PhotoBrief"

### Contact/support footer
- Direct email link, reassurance that replies go to the team

## Technical details

### New files
- `src/pages/BetaWelcome.tsx` — The full welcome page component with the intake form. Submits to a new edge function. Uses existing brand design tokens (pb-section, pb-container, pb-card, pb-lens-field, pb-eyebrow, pb-copy, etc.) matching BetaList.tsx styling.
- `supabase/functions/beta-welcome-submit/index.ts` — Edge function that stores the concierge intake data and sends an admin notification email with all the details.

### Database
- New `beta_welcome_submissions` table with columns for all form fields plus `user_email`, `submitted_at`, `status` (default 'pending'). No RLS needed beyond service-role access from the edge function (public form, no auth required — the invite link is the gate).

### Routing
- Add `/welcome` route inside the `MarketingLayout` group in `App.tsx`
- The invite acceptance email will link to this page (future update to the email template)

### Form submission
- Calls the `beta-welcome-submit` edge function
- Stores submission in `beta_welcome_submissions`
- Triggers admin notification email with all collected info
- Shows a confirmation state after submission ("We've got everything — expect to hear from us within 48 hours")

### Design
- Matches the dark navy brand aesthetic from BetaList.tsx
- Uses existing UI components (Input, Textarea, Select, Button with pb-primary/pb-secondary variants)
- Mobile-first responsive layout
- Logo upload uses a simple file input (stores as base64 or description for now — actual logo handled in concierge call)
