## Stray tokens to fix

The screenshot shows green check circles on the dark Pricing page — off-brand for the navy/amber/cream/kinetic-orange palette. A wider scan turned up a few more tokens that don't sit right on the dark editorial app shell. Fix only the genuine offenders; leave intentional uses of `bg-white/X` opacity (frosted glass on dark) alone.

## What's wrong + the fix

| File:line | Current | Why it's a stray | Fix |
|---|---|---|---|
| `components/pricing/PricingCardGrid.tsx:278` | `text-success` (HSL `145 50% 55%` — bright green) | Green checks on dark pricing page clash with the orange AxisRow icons directly above and the amber/orange editorial palette. | Use the brand kinetic orange: `text-[hsl(var(--accent-kinetic))]` on dark, `text-primary` on light. Brings the bottom feature list into the same visual family as the top axis icons. |
| `components/shared/PoweredByBadge.tsx:30` | `text-brand-navy/60` for the tagline | Default `tone="dark"` now means the badge sits on the dark recipient shell — navy ink at 60% opacity is invisible. | Switch to `text-current/60` (or `text-muted-foreground`) so the tagline inherits whatever surface tone the badge is on. Keeps the light embed (`tone="light"`) legible too. |
| `features/help/components/Callout.tsx:19` | `text-emerald-600` icon | Dark-600 emerald on the dark `bg-card` → poor contrast. | `text-emerald-400` (matches the brighter `bg-emerald-500/5` wrap and the AdminBeta convention). |
| `features/integrations/pages/IntegrationsPage.tsx:49,244,266` | `text-emerald-700` "Connected" badge | Same problem — emerald-700 on dark bg-emerald-500/10 is almost unreadable. | `text-emerald-300` (one shade brighter than the existing -400 in AdminBeta to read clearly inside the 10% wrap). |
| `pages/Landing.tsx` (FinalCta dark Section) | check before fixing | Confirm no `text-success`/green leaks on the FinalCta or Comparison table; if any, swap to amber/cream. | Audit-and-fix only if found. |

## Out of scope (intentional, do NOT change)

- All `bg-white/X` opacity classes on dark surfaces — those are the frosted-glass language used throughout (buttons, cards, `glass-onDark`, `BillingIntervalToggle` active pill, `UpgradePromptCard` CTA).
- `bg-white text-brand-navy` / `bg-white text-primary` on `BillingIntervalToggle` and `UpgradePromptCard` — white pill with navy/orange ink is high-contrast and intentional.
- `ConnectorLogo` `bg-white` plates — third-party brand logos legally need a white plate.
- `bg-black/80` `Dialog`/`Drawer`/`AlertDialog` overlays — modal backdrop is fine.
- `IntakeBadge` light-mode tokens — host-controlled embed.
- `AdminBeta`, `BetaFeedbackCard`, `AdminWebsiteIntelligence` `text-emerald-400` / `text-green-400` — bright-400 reads correctly on dark and these are admin status indicators, not marketing surfaces.
- `--success` token itself — still used for the "Current plan" pill on a solid `bg-success` chip (foreground inverts), so the token stays. Only the *icon-on-dark* usage is wrong.
- `BetaWelcome` form inputs (`text-white placeholder:text-white/30`) — already dark-aware.
- The `:root` comment block (`#1B2A4A`, `#FAF7F2`) — those are documentation comments, not live tokens.

## QA

- `bun run test` — must stay 47/47.
- Visual walk at 390 + 1280: `/pricing` (confirm checks are kinetic orange, not green), `/r/<token>` confirm `PoweredByBadge` tagline reads, `/integrations` confirm "Connected" badge legible, any `Callout` instance.
- No Playwright baseline updates needed unless a snapshot includes the changed icon colors — re-record those if they fail.

## Out of scope (future)

A broader sweep for `text-emerald-*`/`text-green-*` semantics across the rest of the app, and a token rename of `--success` to a kinetic-amber variant. Both are bigger design-system decisions; flag if you want them in this pass.
