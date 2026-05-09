
# Email Pipeline Redesign — Field Manual + RMBC

Translate the editorial system used across the app into an inbox-safe email language, and rewrite every template's copy into RMBC-aligned sections (Research → Mechanism → Brief → Close). Pipeline plumbing (queue, suppression, idempotency, registry contract) stays intact — only presentation, brand tokens, and content change.

## 1. New email design system (`brand-styles.ts`)

Replace the cream/rounded-card system with a white-canvas Field Manual variant:

- **Canvas**: `#FFFFFF` body, no outer cream wash, single 1px hairline frame in `rgba(20,20,18,0.12)`. No border-radius (or `2px` max), no box-shadow.
- **Type**: body in the existing system stack, **labels/eyebrows/plate codes in `ui-monospace, "SF Mono", Menlo, Consolas, monospace`** at 11px, `letter-spacing: 0.18em`, uppercase.
- **Color tokens**:
  - `ink` `#141412` (body headings)
  - `body` `#3A3A36` (paragraph)
  - `muted` `#7A7A72` (meta)
  - `rule` `rgba(20,20,18,0.12)` (hairlines)
  - `accent` `#F2A33A` (the only color accent — used for plate codes, CTA fill, focus underlines)
  - `accentInk` `#1A1208` (text on amber CTA)
- **Header**: hairline-bottom band; two-tone `Photo` (ink) + `Brief` (amber) wordmark rendered as styled text (no logo image required, but keep `Img` fallback). Tagline `GUIDE · CAPTURE · CLOSE` in mono 10px under it.
- **Components exported from `brand-styles.ts`**:
  - `BrandHeader` — wordmark + tagline + hairline rule
  - `BrandFooter` — mono meta line + tagline
  - `PlateCode({ code, label })` → `[ 02 ] RESEARCH` style mono row used to open every RMBC block
  - `RuleBlock({ code, label, children })` — wraps a section with a top hairline, plate code, then content
  - `Eyebrow`, `H1`, `Body`, `Meta`, `MonoLink`, `CTAButton` (squared 2px, amber fill)
  - `Divider` (1px hairline, 24px vertical margin)
- Style objects renamed and re-exported as `s` so existing template imports keep working; legacy keys aliased so build doesn't break mid-migration.

## 2. RMBC content model

Each template gets restructured into the subset of RMBC blocks that fit its purpose. Block names map to plate codes:

```text
[ 01 ] RESEARCH    — context / what triggered this email
[ 02 ] MECHANISM   — what the system / business is doing now
[ 03 ] BRIEF       — what the recipient needs to do (or knows next)
[ 04 ] CLOSE       — signoff, expectations, escape hatch
```

Templates that are pure acknowledgements (e.g. waitlist confirmation) may use only RESEARCH + CLOSE. Operational ones (request link, reminder) use BRIEF as the dominant block with the CTA inside it. Voice: declarative, present-tense, no exclamation marks, no emojis, sentence case in body, all-caps mono only in plate codes/labels.

## 3. Per-template rewrites

All 14 transactional + 6 auth templates are rewritten. Each retains its current `template` export shape, props interface, `displayName`, and `previewData` keys (no registry or send-function changes required).

**Transactional**
1. `customer-submission-confirmation` — RESEARCH (photos received for "{requestTitle}") · CLOSE (no action needed, business will follow up).
2. `submission-received` (business-side) — RESEARCH (new submission from {customer}) · BRIEF (review link CTA) · CLOSE.
3. `business-request-ready` — MECHANISM (request packaged) · BRIEF (open brief CTA) · CLOSE.
4. `recipient-request-link` — RESEARCH (who/what) · BRIEF (open link CTA, expiry meta) · CLOSE.
5. `recipient-reminder` — RESEARCH (still waiting on…) · BRIEF (CTA + expiry).
6. `workspace-welcome` — RESEARCH (workspace ready) · MECHANISM (3 mono numbered next-steps) · BRIEF (open dashboard) · CLOSE.
7. `founding-partner-welcome` — RESEARCH · MECHANISM (what founding tier includes) · BRIEF · CLOSE.
8. `waitlist-confirmation` — RESEARCH · CLOSE.
9. `waitlist-admin-notification` — RESEARCH (new entry) · MECHANISM (queue position) · CLOSE.
10. `beta-first-request-nudge` — RESEARCH (no first request yet) · BRIEF (CTA).
11. `beta-stalled-checkin` — RESEARCH · BRIEF (async reply CTA).
12. `beta-feedback-checkin` — RESEARCH · BRIEF (3 mono prompt questions, reply via email).
13. `beta-testimonial-request` — RESEARCH · BRIEF (link + reply).
14. `beta-graduation` — RESEARCH (60-day clock complete) · MECHANISM (what changes) · BRIEF (next step) · CLOSE.

**Auth (`_shared/email-templates/`)** — `signup`, `magic-link`, `recovery`, `invite`, `email-change`, `reauthentication` get the same shell, RESEARCH (one line of context) + BRIEF (CTA + raw URL fallback in mono) + CLOSE (ignore-if-not-you line). Each adopts `brand-styles.ts` instead of inline style constants.

## 4. Pipeline touch-ups (presentation only)

- `auth-email-hook/index.ts`: no logic change. Only update the import surface so auth templates use `brand-styles.ts` consistently. JWT, queue, retry, idempotency untouched.
- `send-transactional-email/index.ts`: unchanged. Subjects can be tightened in each template's `subject` field (sentence case, no emoji). Suppression check, system unsubscribe footer injection, queue enqueue all preserved.
- `registry.ts`: unchanged structure; `previewData` updated to RMBC-friendly samples.

## 5. Out of scope

- No DB, RLS, queue, cron, or webhook changes.
- No new templates, no marketing emails.
- No changes to send-side logic, idempotency keys, suppression, or unsubscribe flow.
- The system unsubscribe footer remains system-managed.

## 6. Verification

- `bun run build` clean.
- Render every template via the existing preview path (`previewData`) and visually inspect each at 600px and 360px widths — confirm hairlines, mono plate codes, amber-only accent, white canvas, no rounded cards, no emoji.
- Deploy `auth-email-hook`, `send-transactional-email`, `process-email-queue` after edits.
- Spot-send one transactional (`customer-submission-confirmation`) and one auth (`signup`) to a test inbox via existing flows; confirm `email_send_log` row + rendered output.

## Technical notes

- All color values stay literal hex/rgba in inline styles (email clients ignore CSS vars).
- Body background MUST remain `#FFFFFF` per Lovable email rule.
- Wordmark rendered as styled `<Text>` spans inside the header `Section`; logo `Img` kept as a 28px mark to the left for clients that strip styles.
- Plate code component renders as `<Text style={mono}>[ 02 ]&nbsp;&nbsp;RESEARCH</Text>` followed by a 1px top-rule on the wrapping section — Outlook-safe (no flex, no grid).
- Buttons: `border-radius: 2px`, amber fill, dark ink text, 14px mono uppercase label, full width on mobile via `min-width: 200px`.
