/**
 * Navigation link integrity check.
 *
 * Validates that every link in the marketing nav config, sidebar, mobile tab bar,
 * and settings sheet points to a route that exists in App.tsx.
 *
 * Run: `npx vitest run src/test/nav-links.test.ts`
 */
import { describe, it, expect } from "vitest";
import {
  marketingLinks,
  legalLinks,
  footerOnlyLinks,
} from "@/config/marketingNav";

// ── Route table ────────────────────────────────────────────────────────
// Keep this in sync with App.tsx. Static paths only — dynamic segments
// (e.g. /requests/:id) are listed as patterns. Hash anchors are stripped
// before matching.
const definedRoutes = new Set([
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
  "/signup",
  "/beta-invite/:token",
  "/welcome",
  "/badge/intake",
  "/onboarding",
  "/invite/:token",
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
  "/i/:token",
  "/r/:token",
  "/r/:token/done",
]);

/** Strip hash fragment and query string, returning just the pathname. */
function toPathname(link: string): string {
  const url = new URL(link, "http://localhost");
  return url.pathname;
}

/** Check if a pathname matches any defined route (exact or pattern). */
function routeExists(pathname: string): boolean {
  if (definedRoutes.has(pathname)) return true;
  // Check dynamic patterns: replace :param segments with the actual value
  for (const route of definedRoutes) {
    if (!route.includes(":")) continue;
    const routeParts = route.split("/");
    const pathParts = pathname.split("/");
    if (routeParts.length !== pathParts.length) continue;
    const match = routeParts.every(
      (seg, i) => seg.startsWith(":") || seg === pathParts[i],
    );
    if (match) return true;
  }
  return false;
}

// ── Sidebar items (mirrored from AppSidebar.tsx) ───────────────────────
const sidebarLinks = [
  "/dashboard",
  "/requests",
  "/customers",
  "/guides",
  "/intake",
  "/settings/brand",
  "/settings/team",
  "/settings/templates",
  "/settings/sms",
  "/settings/integrations",
  "/settings/billing",
  "/support",
  "/app/help",
];

// ── Mobile tab bar items (mirrored from MobileTabBar.tsx) ──────────────
const mobileTabLinks = [
  "/dashboard",
  "/requests",
  "/guides",
  "/requests/new",
];

// ── Mobile settings sheet (mirrored from MobileSettingsSheet.tsx) ──────
const mobileSettingsLinks = [
  "/settings/brand",
  "/settings/team",
  "/settings/templates",
  "/settings/sms",
  "/settings/integrations",
  "/settings/billing",
];

// ── Tests ──────────────────────────────────────────────────────────────

describe("Navigation link integrity", () => {
  it("all marketingLinks resolve to defined routes", () => {
    for (const link of marketingLinks) {
      const path = toPathname(link.to);
      expect(routeExists(path), `marketingLinks: "${link.to}" has no matching route`).toBe(true);
    }
  });

  it("all legalLinks resolve to defined routes", () => {
    for (const link of legalLinks) {
      const path = toPathname(link.to);
      expect(routeExists(path), `legalLinks: "${link.to}" has no matching route`).toBe(true);
    }
  });

  it("all footerOnlyLinks resolve to defined routes", () => {
    for (const link of footerOnlyLinks) {
      const path = toPathname(link.to);
      expect(routeExists(path), `footerOnlyLinks: "${link.to}" has no matching route`).toBe(true);
    }
  });

  it("all sidebar links resolve to defined routes", () => {
    for (const link of sidebarLinks) {
      expect(routeExists(link), `sidebar: "${link}" has no matching route`).toBe(true);
    }
  });

  it("all mobile tab bar links resolve to defined routes", () => {
    for (const link of mobileTabLinks) {
      expect(routeExists(link), `mobileTabBar: "${link}" has no matching route`).toBe(true);
    }
  });

  it("all mobile settings sheet links resolve to defined routes", () => {
    for (const link of mobileSettingsLinks) {
      expect(routeExists(link), `mobileSettings: "${link}" has no matching route`).toBe(true);
    }
  });

  it("no duplicate links in marketing nav arrays", () => {
    const all = [...marketingLinks, ...legalLinks, ...footerOnlyLinks];
    const paths = all.map((l) => l.to);
    const unique = new Set(paths);
    expect(paths.length).toBe(unique.size);
  });
});
