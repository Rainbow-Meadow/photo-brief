import { test } from "@playwright/test";
import { snapshot } from "./helpers";

/**
 * Authenticated dashboard surfaces. Uses the business-tier seed workspace
 * (broadest plan gating). Detail routes that need real ids are skipped here —
 * see wizards.spec.ts for multi-step flows that mount on static routes.
 */
const AUTHED_ROUTES: Array<{ name: string; path: string }> = [
  { name: "dashboard", path: "/dashboard" },
  { name: "requests-inbox", path: "/requests" },
  { name: "guides-library", path: "/guides" },
  { name: "guides-new", path: "/guides/new" },
  { name: "customers", path: "/customers" },
  { name: "intake", path: "/intake" },
  { name: "settings-brand", path: "/settings/brand" },
  { name: "settings-team", path: "/settings/team" },
  { name: "settings-templates", path: "/settings/templates" },
  { name: "settings-sms", path: "/settings/sms" },
  { name: "settings-integrations", path: "/settings/integrations" },
  { name: "settings-billing", path: "/settings/billing" },
  { name: "app-help", path: "/app/help" },
  { name: "support", path: "/support" },
  { name: "admin-command", path: "/admin/command" },
  { name: "admin-beta", path: "/admin/beta" },
  { name: "admin-invites", path: "/admin/invites" },
  { name: "admin-ai-rerun", path: "/admin/ai-rerun" },
  { name: "admin-website-intelligence", path: "/admin/website-intelligence" },
];

for (const route of AUTHED_ROUTES) {
  test(`authed — ${route.name}`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await snapshot(page, route.name);
  });
}
