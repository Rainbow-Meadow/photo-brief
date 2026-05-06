
## Add back navigation to nested pages

### Problem
Several detail and sub-pages lack a back button, making navigation difficult especially on mobile where the browser back button is less accessible.

### Approach
Add a `backTo` prop to the shared `PageHeader` component that renders a small back arrow + label above the title. This keeps the pattern consistent across the app without touching every page's layout individually.

### Changes

**1. Update `PageHeader` component**
Add optional `backTo` prop (`{ label: string; href: string }`) that renders a back link (ArrowLeft icon + label) above the eyebrow/title area using `NavLink`.

**2. Add back links to detail pages**
- `RequestDetailPage` — back to "Requests" (`/requests`)
- `GuideDetailPage` — back to "Templates" (`/guides`)
- `SubmissionReviewPage` — already has one, no change needed
- `CustomerDetailPage` — already has one, no change needed
- `GuideBuilderPage` — already has one, no change needed

**3. Add back links to settings sub-pages (mobile-friendly)**
These are accessed from the MobileSettingsSheet on small screens and have no inherent "back" affordance:
- `BrandSettingsPage` — back to "Settings" (`/dashboard`)
- `TeamSettingsPage` — same
- `MessageTemplatesPage` — same
- `SmsSettingsPage` — same
- `IntegrationsPage` — same
- `BillingSettingsPage` — same

The back link will use `lg:hidden` so it only appears on mobile/tablet where the sidebar isn't visible.

### Technical details
- The `backTo` prop renders a `NavLink` with `ArrowLeft` icon, styled as a small muted link above the page title
- For settings pages, the back link wrapper gets `lg:hidden` to avoid redundancy with the always-visible desktop sidebar
- No new components needed — just extending `PageHeader`
