import { test } from "@playwright/test";
import { snapshot } from "./helpers";

/**
 * Routes that render without authentication. Token-bearing public routes
 * (/i/:token, /r/:token, /badge/intake) are captured with a placeholder token
 * — they should render their not-found / loading editorial state cleanly,
 * which is itself worth regression-testing.
 */
const PUBLIC_ROUTES: Array<{ name: string; path: string }> = [
  { name: "landing", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "for-ai-agents", path: "/for-ai-agents" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "auth", path: "/auth" },
  { name: "signup", path: "/signup" },
  { name: "forgot-password", path: "/forgot-password" },
  { name: "reset-password", path: "/reset-password" },
  { name: "unsubscribe", path: "/unsubscribe" },
  { name: "help", path: "/help" },
  { name: "welcome", path: "/welcome" },
  { name: "not-found", path: "/this-route-does-not-exist" },
  // Token routes — placeholder token exercises the not-found / empty editorial state.
  { name: "public-intake-token", path: "/i/visual-regression-placeholder" },
  { name: "public-recipient-token", path: "/r/visual-regression-placeholder" },
  { name: "public-recipient-done", path: "/r/visual-regression-placeholder/done" },
  { name: "intake-badge", path: "/badge/intake" },
];

for (const route of PUBLIC_ROUTES) {
  test(`public — ${route.name}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await snapshot(page, route.name);
  });
}
