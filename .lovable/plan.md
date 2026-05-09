## What I got wrong

Last turn I changed almost every BrandMark to `tone="light"` (navy ink). But the app is actually a **dark theme at the token level**:

- `:root` declares `color-scheme: dark`, `--background: 60 8% 5%` (warm off-black), `--foreground: 42 32% 94%` (cream), `--card: 60 6% 8%`.
- `--pb-paper: 60 8% 5%` is also dark — the token name implies cream but the value is off-black.
- Marketing pages use `.pb-landing` which is a navy/amber gradient, not cream.
- The `mem://core` note "cream bg #FAF7F2" is stale and doesn't reflect what `src/index.css` ships today.

So `tone="light"` (navy mark + navy wordmark) renders **navy on near-black** — exactly the legibility bug you saw. The correct lockup almost everywhere in this app is `tone="dark"` (cream mark + cream/amber wordmark).

## Goal

Use the **light brandmark on dark backgrounds** consistently — i.e. `tone="dark"` is the de-facto default for this app. Only the rare genuinely-light surface (a deliberately white card or an embed served onto a light host page) keeps `tone="light"`.

## Surface audit (call sites → correct tone)

| File:line | Surrounding bg | Last turn (wrong) | Correct |
|---|---|---|---|
| `pages/Landing.tsx:202` | Hero card on `.pb-landing` (dark) | `light` | **`dark`** (revert) |
| `pages/Signup.tsx:186` | `bg-background` + `bg-ambient-sky` (dark) | `light` | **`dark`** |
| `pages/BetaWelcome.tsx:158` | `.pb-landing` dark | `light` | **`dark`** |
| `components/layout/MarketingLayout.tsx:63-64` | Floating header pill on `.pb-landing` dark | `light` | **`dark`** |
| `components/layout/MarketingLayout.tsx:89` | Mobile menu trigger inside same dark pill | `light` | **`dark`** |
| `components/layout/MarketingLayout.tsx:125` | Mobile sheet (`SheetContent` → `bg-background` dark) | `light` | **`dark`** |
| `components/layout/MarketingLayout.tsx:171` | Footer (`pb-footer-dark` on landing, otherwise still on dark `.pb-landing`) | `isLanding ? "dark" : "light"` | Always **`dark`** |
| `components/layout/DashboardLayout.tsx:55` | Header `bg-card` dark | `light` | **`dark`** |
| `components/layout/AppSidebar.tsx:88-91` | `--app-sidebar-bg: 60 8% 3%` near-black | `light` | **`dark`** |
| `components/layout/PublicRequestLayout.tsx:26` | Header `material-chrome` over dark recipient shell | `light` | **`dark`** |
| `components/editorial/EditorialAuthShell.tsx:41` | `bg-background` dark | `light` | **`dark`** |
| `components/shared/PoweredByBadge.tsx:26` | Used in PublicRequestLayout footer (dark) | `light` (default prop) | Default **`dark`** |
| `features/workspace/components/StarterRequestCard.tsx:24` | Mark sits in a `bg-background` chip (dark) | `light` | **`dark`** |
| `features/integrations/components/ConnectorLogo.tsx:62` | Connector chip on dark dashboard | `light` | **`dark`** |
| `pages/IntakeBadge.tsx:53` | Embeddable; `forceDark` = host bg is dark | `forceDark ? "dark" : "light"` | Keep as-is (only spot where light surface exists, host-controlled) |

## Plan

### 1. Flip the defaults

- `BrandMark` default tone: `"dark"` (cream lockup) — matches the dark app shell.
- `PoweredByBadge` default tone: `"dark"`.

### 2. Update every dark-surface call site to `tone="dark"`

Apply the table above. Each edit is a one-token change in the JSX.

### 3. `MarketingLayout` footer simplification

Remove the `isLanding ? "dark" : "light"` ternary on line 171 — the footer is on a dark surface on every marketing route, so always `tone="dark"`. Keep the `pb-footer-dark` class flip on line 169 (that's a separate, deliberately-darker footer band on landing only).

### 4. Re-flip the contract test

`src/test/brand-mark-contract.test.ts` last turn enforced an allowlist for `"dark"`. Replace it with the inverse:

- Disallow the deprecated `"auto"` / `"color"` tones (keep this assertion — it's still correct).
- Disallow `tone="light"` outside an explicit allowlist. The allowlist is just `pages/IntakeBadge.tsx` (host-controlled light embed). Any other file using `tone="light"` would render navy on the dark app shell — fail loudly.
- Keep the "no raw `mark-on-dark.*` outside `BrandMark.tsx`" assertion.

### 5. Update `landing-visual-contract.test.ts`

Replace the assertion I added last turn ("BrandMark must be `tone="light"`") with the correct one: every `BrandMark` in `Landing.tsx` must use `tone="dark"`. The FinalCta dark Section still has no logo; only the hero mark needs to be locked, and it must be the cream lockup.

### 6. QA

- `bun run test` — 8 suites must stay green with the inverted contract.
- Browser walk at 390 + 1280: `/`, `/pricing`, `/auth`, `/signup`, `/dashboard`, `/dashboard` sidebar (lg), `/r/<token>`, `/badge/intake?theme=light`, `/badge/intake?theme=dark`. Confirm the cream wordmark + cream/amber mark are visible everywhere except `IntakeBadge` light mode.
- Update any Playwright baselines that change.

### 7. Memory housekeeping

After the QA passes, update `mem://design/color-system` (and the Core line in `mem://index.md`) to reflect that the live tokens are dark-themed (`--background: 60 8% 5%`, color-scheme: dark). The current memory note about cream `#FAF7F2` is misleading and led directly to last turn's mistake. I'll save this as a memory edit at the end so future turns don't repeat the error.

## Out of scope

- No changes to BrandMark assets or wordmark colors.
- No changes to surface tokens in `src/index.css` — only flipping the lockup tone to match what the tokens already are.
- No new component variants.
