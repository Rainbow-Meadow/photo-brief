# PhotoBrief Founding Partner Beta — Email Copy Templates

Internal reference for beta program communications. Each email is sent to one person in response to a specific event. Tone: direct, warm, practical. No startup jargon.

**Terminology rules:**
- Say **"founding beta partner"** — never "tester" or "beta user"
- Say **"real workflows"** — never "play around" or "test it out"
- These are business owners, not college students — be direct

---

## 1. Application Received

**Template name:** `waitlist-confirmation` (existing)
**Trigger:** Someone submits a beta application via `/betalist`
**Subject:** Thanks for joining PhotoBrief — here's what happens next.

Already live. Confirms receipt, sets expectations on review timeline.

---

## 2. Accepted Into Beta

**Template name:** `founding-partner-welcome` (existing)
**Trigger:** Admin marks application as `accepted` and sends invite
**Subject:** Welcome to the PhotoBrief.ai Founding Partner Beta

Already live. Covers what they get (free access, real setup, direct line, founding partner pricing), includes dashboard CTA.

---

## 3. First Request Nudge

**Template name:** `beta-first-request-nudge`
**Trigger:** Workspace created but no requests sent after 3 days
**Subject:** Ready to send your first PhotoBrief?

**Variables:** `name`, `dashboardUrl`

**Copy direction:**
- Acknowledge they set up the account
- Give a 4-step quickstart (new request → pick template → enter customer info → send)
- Emphasize trying it with a real job — "that's where the value clicks"
- Offer help if stuck

---

## 4. Two-Week Feedback Check-In

**Template name:** `beta-feedback-checkin`
**Trigger:** 14 days after first request sent
**Subject:** Quick check-in — how's PhotoBrief working?

**Variables:** `name`

**Copy direction:**
- Ask about completion rates, AI feedback usefulness, missing features
- "Reply to this email — it goes to a real person, not a form"
- "If you've hit a wall, we especially want to hear about that. Beta is when we fix things."

---

## 5. Stalled User Check-In

**Template name:** `beta-stalled-checkin`
**Trigger:** No requests created in 14+ days for an active beta workspace
**Subject:** Checking in on your PhotoBrief account

**Variables:** `name`

**Copy direction:**
- No pressure — "we know things get busy"
- Three possibilities: hit a snag (let us know), timing (account isn't going anywhere), need a different template (we can help)
- "If PhotoBrief isn't the right fit, that's useful feedback too"

---

## 6. Testimonial Request

**Template name:** `beta-testimonial-request`
**Trigger:** Workspace has 10+ completed submissions and positive feedback scores
**Subject:** Would you share a quick word about PhotoBrief?

**Variables:** `name`

**Copy direction:**
- Acknowledge they've been using it on real workflows
- Ask for 1-2 sentences: what problem it solved, how it compared to before
- Provide an example quote
- Offer to draft something they can approve
- Mention optional business name feature at launch

---

## 7. Graduation / Launch Pricing

**Template name:** `beta-graduation`
**Trigger:** Beta period ending; sent before workspace transitions to paid plan
**Subject:** Beta's wrapping up — here's your founding partner pricing

**Variables:** `name`, `discount`, `discountDuration` (`perpetuity` | `first-year` | `free-pro`), `requestsCreated`, `submissionsCompleted`, `templatesCreated`, `transitionDate`, `billingUrl`

**Copy direction:**
- Thank them — "your input has been a real part of shaping this product"
- Founding partner pricing: personalized per tier based on feedback quality
  - **Free Pro:** "You've earned free Pro for life — no strings attached"
  - **Perpetuity discount:** "X% off — locked in permanently, for as long as you stay on a paid plan"
  - **First-year discount:** "X% off your first year post-launch"
- Show usage stats (requests created, submissions received, templates built)
- Transition date and billing CTA
- "Reply here and we'll walk through which plan makes sense"

### Reward tiers (for admin reference)

| Tier | Count | Reward | `discount` | `discountDuration` |
|---|---|---|---|---|
| Top 2 | 2 | Free Pro for life | — | `free-pro` |
| Elite | 4 | 75% off in perpetuity | `75` | `perpetuity` |
| Strong | 4 | 50% off in perpetuity | `50` | `perpetuity` |
| Solid | 10 | 75% off first year | `75` | `first-year` |
| Participating | 10 | 50% off first year | `50` | `first-year` |

---

## Implementation Notes

- Templates 1-2 are already deployed and in use.
- Templates 3-7 are registered in the transactional email registry and deployed.
- **Variables** in templates map to `templateData` props passed to `send-transactional-email`.
- **Do not batch-send.** Each email is triggered by a specific event for a specific person.
- Templates 3-6 are designed to be triggered from admin actions on `/admin/beta` or lightweight activity checks — not bulk campaigns.
- All templates use the shared brand system (`brand-styles.ts`) for consistent dark navy + purple/lavender styling.
