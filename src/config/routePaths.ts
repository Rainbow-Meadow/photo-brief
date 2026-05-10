/**
 * Route paths — single source of truth for every path registered in the router.
 *
 * App.tsx imports this to build `<Route>` elements.
 * Tests import this to validate that navigation links resolve.
 *
 * Layout-only wrapper routes (no `path`) are intentionally excluded —
 * only leaf routes with a `path` prop belong here.
 */

export const routePaths = [
  // Marketing + auth (MarketingLayout)
  "/",
  "/pricing",
  "/for-ai-agents",
  "/privacy",
  "/terms",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe",
  "/help",
  "/demo",
  "/beta",
  "/signup",
  "/beta-invite/:token",
  "/welcome",

  // Standalone public
  "/badge/intake",

  // Onboarding + invite acceptance (MarketingLayout, auth-gated)
  "/onboarding",
  "/invite/:token",

  // Authenticated app (DashboardLayout)
  "/dashboard",
  "/requests",
  "/requests/new",
  "/requests/:id",
  "/submissions/:id",
  "/guides",
  "/guides/new",
  "/guides/:id",
  "/customers",
  "/customers/:id",
  "/intake",
  "/settings/brand",
  "/settings/team",
  "/settings/templates",
  "/settings/sms",
  "/settings/integrations",
  "/settings/billing",
  "/app/help",
  "/support",
  "/admin/invites",
  "/admin/ai-rerun",
  "/admin/command",
  "/admin/beta",
  "/admin/website-intelligence",

  // Public intake + recipient capture
  "/i/:token",
  "/r/:token",
  "/r/:token/done",
] as const;

export type RoutePath = (typeof routePaths)[number];

/** Set for O(1) lookup */
export const routePathSet = new Set<string>(routePaths);
