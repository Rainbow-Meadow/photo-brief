## Beta Lifecycle Email Templates

Two of the seven emails already exist:
- **#1 Application received** → `waitlist-confirmation` template (already live)
- **#2 Accepted into beta** → `founding-partner-welcome` template (already live)

### New templates to create (5 files)

All in `supabase/functions/_shared/transactional-email-templates/`, using the existing brand system (`brand-styles.ts`, `BrandHeader`, `BrandFooter`, shared styles).

1. **`beta-first-request-nudge.tsx`** — "Ready to send your first PhotoBrief?" Triggered when workspace has no requests after 3 days. Props: `name`, `dashboardUrl`. Direct, practical instructions on creating the first request.

2. **`beta-feedback-checkin.tsx`** — "Quick check-in — how's PhotoBrief working?" Triggered 14 days after first request sent. Props: `name`. Asks about completion rates, AI feedback usefulness, missing features. Reply-friendly.

3. **`beta-stalled-checkin.tsx`** — "Still there?" Triggered after 14+ days of inactivity. Props: `name`. No-pressure check — offers help, acknowledges timing, asks if it's not the right fit.

4. **`beta-testimonial-request.tsx`** — "Would you share a quick word?" Triggered for partners with 10+ completed submissions and positive feedback. Props: `name`. Suggests a one-liner format, offers to draft for them.

5. **`beta-graduation.tsx`** — "Beta's wrapping up — here's your founding partner pricing." Triggered before paid transition. Props: `name`, `discount`, `requestsCreated`, `submissionsCompleted`, `templatesCreated`, `transitionDate`. Shows usage stats and locked-in discount.

### Registry update

Add all 5 new templates to `registry.ts`.

### Documentation

Create `docs/beta-program-emails.md` with all 7 email copy references (including the 2 existing ones), trigger descriptions, variable mappings, and tone rules ("founding beta partner" not "tester", "real workflows" not "play around").

### Deploy

Redeploy `send-transactional-email` so the new templates are available.

### Technical details

- All templates follow the existing pattern: `React.createElement`-free JSX, `TemplateEntry` type, `brand-styles.ts` imports
- Each template has `previewData` for dashboard preview
- Subject lines are static strings (no dynamic subjects needed)
- Tone: direct, warm, practical — consistent with the existing `founding-partner-welcome` template
- Templates 3–6 are designed to be triggered by admin actions from the `/admin/beta` dashboard (not automated cron — wiring those triggers is a separate step)
