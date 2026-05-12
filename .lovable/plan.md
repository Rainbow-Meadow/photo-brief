## Goal

Reframe `/dashboard` as a Linear/Vercel-style operations surface: a single **Onboarding Progress** banner up top, the existing metrics strip + dual lists below, and a global **command menu (⌘K)** + keyboard shortcuts in the shell. Tighten shell chrome (sidebar, header) to match. Other pages stay as-is.

## Scope

**In:** `src/features/workspace/pages/DashboardPage.tsx`, new `OnboardingProgressBanner`, new `CommandMenu` + provider, `DashboardLayout.tsx`, `AppSidebar.tsx`, small additions to `src/index.css` (only if needed for tokens already missing).

**Out:** Requests / Customers / Guides pages, Settings pages, design tokens (use existing), schema, business logic, copy on marketing.

---

## 1 · Onboarding Progress banner (replaces "Primary focus" hero)

A new component `src/features/workspace/components/OnboardingProgressBanner.tsx`.

**Steps tracked (4):**
1. Brand set → `workspace.brand_logo_url` or brand settings touched
2. First guide created → `guides` count > 0
3. First request sent → `requests` count > 0
4. First submission reviewed → any request with `firstPassStatus` set

**Behavior:**
- While `< 4/4`: full-width banner, left rail shows oversized progress count (e.g. `2 / 4`) in the same Geist display style used today on the focus card; right rail shows the 4 step rows with check/empty state, label, and a quiet inline link to the relevant route.
- A thin progress bar (hairline, accent-kinetic fill) sits across the top edge.
- At `4/4`: collapses to a single-line "health strip" — `✓ Workspace ready · X requests this period · plan tier · beta clock if active` with a dismiss-forever toggle stored in `localStorage` (`pb.onboarding-banner.dismissed=v1`).
- On the empty-workspace branch (`isEmpty`), banner sits above `<StarterRequestCard />` instead of replacing it.

**Visual:** Borderless top + bottom hairlines (`border-y border-border`), `bg-card`, no rounded corners (matches current app aesthetic). No accent surface — keep neutral; only the progress bar uses `--accent-kinetic`.

**Data source:** Reuse `useRequests`, `useGuides`, `useCurrentWorkspace`. No new queries unless brand-set state isn't already derivable (then read `business_workspaces.brand_logo_url` once).

---

## 2 · Below the banner (keep current structure, tighten)

Preserve the existing layout from `DashboardPage.tsx`:
- 4-up metric strip (`Ready / Waiting / In progress / This month`) — keep `MetricCard variant="quiet"`.
- Wide first-pass acceptance card with sub-stat + footnote — unchanged.
- Two-column lists (`Ready to review`, `Needs customer action`) — unchanged.

**Tighten:**
- Remove the standalone "Primary focus" section entirely (it duplicates info now surfaced via the banner + metrics + lists).
- Drop `PageHeader` title/description block (today's "Today" / "A quiet overview") — the banner is the new header. Keep the Assistant toggle button, move it to a small floating control top-right of the metrics row.
- Reduce vertical rhythm: `space-y-5 sm:space-y-6` → `space-y-4 sm:space-y-5`.

---

## 3 · Command menu (⌘K) + keyboard nav

New file `src/components/shell/CommandMenu.tsx` using existing shadcn `command.tsx` primitives wrapped in a `CommandDialog`.

**Commands grouped:**
- **Navigate:** Dashboard, Requests, Customers, Guides, Website Intake, Brand, Team, Templates, SMS, Integrations, Billing, Support, Help & Guide (filtered by plan via `usePlan().can()` for gated items).
- **Create:** New request (`/requests/new`), New guide (`/guides/new` if route exists, else open builder).
- **Account:** Reset password, Log out (reuse `useAccountActions`).
- **Admin:** Command Center, Beta Program, Invites, AI Rerun, Website Intel — only if `usePlatformAdmin().isAdmin`.

**Trigger:**
- Global `useEffect` keydown listener for `⌘K` / `Ctrl+K` opens the dialog from anywhere inside `DashboardLayout`.
- Header gets a small "Search… ⌘K" affordance (replaces nothing, sits between workspace name block and the action buttons on `sm+`, hidden on mobile).
- Single-key shortcuts inside the dialog: `g d` → dashboard, `g r` → requests, `g c` → customers, `g i` → intake, `c` → new request. Implemented as a tiny shortcut map handled inside the dialog only when open=false (Linear-style "g then x").

**Mounted once** inside `DashboardLayout.tsx` so it's available on every authed route. No mount on public/marketing routes.

---

## 4 · Shell chrome polish

`AppSidebar.tsx`:
- Group label typography → uppercase mono micro-label matching the rest of the app (`font-mono text-[0.62rem] tracking-[0.18em] text-muted-foreground/70`).
- Tighter row height (`h-8` menu buttons), 13px label, icon `h-3.5 w-3.5`.
- Active row: left 2px accent rail (`box-shadow: inset 2px 0 0 hsl(var(--accent-kinetic))`) instead of background fill.

`DashboardLayout.tsx` header:
- Insert the new ⌘K search affordance between the workspace block and the right action cluster.
- Header height stays `h-16`; reduce horizontal padding one step on `sm` to make room.

No changes to MobileTabBar, FeedbackWidget, or RequireAuth.

---

## 5 · Technical notes

- All new components live under `src/features/workspace/components/` (banner) and `src/components/shell/` (command menu).
- No new dependencies; `cmdk` is already vendored via `src/components/ui/command.tsx`.
- Use existing tokens only: `--background`, `--card`, `--border`, `--muted-foreground`, `--accent-kinetic`, `--primary-foreground`. No new CSS variables.
- Localstorage key for dismissed health strip: `pb.dashboard.health-strip.dismissed=v1`.
- Keep `isEmpty` branch with `<StarterRequestCard />` working — banner appears above it, command menu still mounts.
- After implementation: capture desktop (1366) + mobile (375) screenshots of `/dashboard` for visual confirmation. Run `bunx vitest run` to ensure the brand-mark and route contract tests still pass (no logo/route changes expected).

## Out of scope

Copy rewrites, marketing pages, Requests/Customers/Guides pages, design tokens, schema, plan gating logic, AssistantPanel internals, MobileTabBar.
