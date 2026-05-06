
# BetaList Landing Page Overhaul

## What changes

### 1. Hero visual — "messy photos → clean brief" illustration
Add a custom inline SVG/CSS illustration directly in the hero section showing the core transformation:
- Left side: tilted, overlapping photo thumbnails with issue chips ("Blurry", "Too dark", "Wrong angle") — representing the chaos
- Arrow/transition indicator
- Right side: a clean brief card with organized photo grid, green check status chips ("Verified"), and structured layout

This is a pure CSS/React component (no external images needed), using the existing `--pb-*` design tokens. It sits between the subheadline and the CTAs, making the product mechanism instantly visible above the fold.

### 2. Form moved immediately after hero
Move the beta application form from deep in the page to directly below the hero section. BetaList favors front-and-center signup. The form stays short: work email, business name, website, business type, use case, and monthly request estimate. The form panel gets a slightly more prominent treatment.

### 3. Updated section order
```text
1. Hero (headline + visual + CTAs)
2. Beta application form (immediately visible on scroll)
3. Product workflow ("One link → guided photos → AI checks → clean brief")
4. "Built for moments when photos decide the next step" — use cases expanded
5. Old way vs PhotoBrief
6. Founding Partner Beta offer (updated to 60-90 days, added "early access to future tools")
7. Trust notes (updated: secure upload links, business-owned requests, no spammy customer experience, privacy)
8. Final CTA
```

### 4. Use cases expanded
Add two more use cases beyond the current four:
- Returns/warranty documentation
- Review/documentation workflows

Update the section header to: "Built for moments when photos decide the next step."

### 5. Trust notes updated
Replace current trust cards with BetaList-appropriate messaging:
- "Secure, expiring upload links" — customers never see your dashboard
- "Business-owned requests" — you control every brief and its data
- "No spammy customer experience" — clean mobile capture, no app install, no account required
- "Your data stays yours" — photos and briefs are never shared or used for training

### 6. Partner benefits updated
- Change "90 days" to "60–90 days free access"
- Add "Early access to future tools"
- Keep: concierge setup, feedback sessions, 50% off first year, founding partner recognition

### 7. Route alias
Add `/founding-partner-beta` as an additional route pointing to the same BetaListPage component. The page reads `?ref=` from the URL and includes it in the analytics source tag so BetaList referral traffic is trackable.

### Files changed

| File | Change |
|------|--------|
| `src/pages/BetaList.tsx` | Full rewrite: hero visual component, form moved up, sections reordered, copy updates, ref tracking |
| `src/App.tsx` | Add `/founding-partner-beta` route alias pointing to BetaListPage |

No new dependencies. No database changes. No edge function changes. The existing `waitlist-submit` edge function handles submissions as-is.
