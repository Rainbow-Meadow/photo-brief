/**
 * Navigation link integrity check.
 *
 * Validates that every link in the marketing nav config, sidebar, mobile tab bar,
 * and settings sheet points to a route defined in `@/config/routePaths`.
 *
 * The route list is the same one App.tsx uses, so this test stays in sync
 * with the router automatically — no manual duplication.
 *
 * Run: `npx vitest run src/test/nav-links.test.ts`
 */
import { describe, it, expect } from "vitest";
import {
  marketingLinks,
  legalLinks,
  footerOnlyLinks,
} from "@/config/marketingNav";
import { routePaths, routePathSet } from "@/config/routePaths";

// ── Route matching ─────────────────────────────────────────────────────

/** Strip hash fragment and query string, returning just the pathname. */
function toPathname(link: string): string {
  const url = new URL(link, "http://localhost");
  return url.pathname;
}

/** Check if a pathname matches any defined route (exact or pattern). */
function routeExists(pathname: string): boolean {
  if (routePathSet.has(pathname)) return true;

  // Check dynamic patterns: replace :param segments with the actual value
  for (const route of routePaths) {
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

// ── Navigation sources (mirrored from their respective components) ─────
// These arrays mirror the `url`/`to` fields from sidebar, tab bar, and
// settings sheet. If a component adds a new link, add it here too — the
// test will catch the mismatch immediately.

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

const mobileTabLinks = [
  "/dashboard",
  "/requests",
  "/guides",
  "/requests/new",
];

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

  it("routePaths has no duplicates", () => {
    expect(routePaths.length).toBe(routePathSet.size);
  });
});
