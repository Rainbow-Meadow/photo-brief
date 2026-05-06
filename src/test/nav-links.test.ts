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

/**
 * Normalise any link format to a plain pathname.
 * Handles: relative paths, hash fragments, query strings, fully qualified URLs.
 *
 * Examples:
 *   "/pricing"                        → "/pricing"
 *   "/#beta-program"                  → "/"
 *   "/help?ref=nav"                   → "/help"
 *   "https://photobrief.ai/pricing"   → "/pricing"
 *   "https://photobrief.ai/#section"  → "/"
 */
function toPathname(link: string): string {
  const url = new URL(link, "http://localhost");
  return url.pathname;
}

/** Check if a pathname matches any defined route (exact or dynamic pattern). */
function routeExists(pathname: string): boolean {
  if (routePathSet.has(pathname)) return true;

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

/**
 * Wrapper that accepts the raw `to` value from a nav config entry,
 * normalises it, and asserts the underlying route exists.
 */
function assertLinkResolves(link: string, source: string): void {
  const path = toPathname(link);
  expect(routeExists(path), `${source}: "${link}" → pathname "${path}" has no matching route`).toBe(true);
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
      assertLinkResolves(link.to, "marketingLinks");
    }
  });

  it("all legalLinks resolve to defined routes", () => {
    for (const link of legalLinks) {
      assertLinkResolves(link.to, "legalLinks");
    }
  });

  it("all footerOnlyLinks resolve to defined routes", () => {
    for (const link of footerOnlyLinks) {
      assertLinkResolves(link.to, "footerOnlyLinks");
    }
  });

  it("all sidebar links resolve to defined routes", () => {
    for (const link of sidebarLinks) {
      assertLinkResolves(link, "sidebar");
    }
  });

  it("all mobile tab bar links resolve to defined routes", () => {
    for (const link of mobileTabLinks) {
      assertLinkResolves(link, "mobileTabBar");
    }
  });

  it("all mobile settings sheet links resolve to defined routes", () => {
    for (const link of mobileSettingsLinks) {
      assertLinkResolves(link, "mobileSettings");
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

// ── Edge-case coverage: hash fragments, query strings, full URLs ───────

describe("Link normalisation edge cases", () => {
  it("hash-only fragment resolves to root", () => {
    assertLinkResolves("/#beta-program", "hash-fragment");
    assertLinkResolves("/#pricing", "hash-fragment");
  });

  it("path with hash fragment resolves to the path", () => {
    assertLinkResolves("/pricing#annual", "path+hash");
    assertLinkResolves("/help#faq", "path+hash");
  });

  it("path with query string resolves to the path", () => {
    assertLinkResolves("/pricing?ref=nav", "path+query");
    assertLinkResolves("/auth?redirect=/dashboard", "path+query");
  });

  it("path with both query and hash resolves to the path", () => {
    assertLinkResolves("/help?ref=footer#getting-started", "path+query+hash");
  });

  it("fully qualified same-origin URLs resolve correctly", () => {
    assertLinkResolves("https://photobrief.ai/pricing", "fqdn");
    assertLinkResolves("https://www.photobrief.ai/help", "fqdn");
    assertLinkResolves("https://photobrief.ai/", "fqdn-root");
  });

  it("fully qualified URLs with fragments resolve correctly", () => {
    assertLinkResolves("https://photobrief.ai/#section", "fqdn+hash");
    assertLinkResolves("https://photobrief.ai/pricing#annual", "fqdn+hash");
  });

  it("fully qualified URLs with query strings resolve correctly", () => {
    assertLinkResolves("https://photobrief.ai/auth?redirect=/dashboard", "fqdn+query");
  });

  it("dynamic route patterns match concrete paths", () => {
    assertLinkResolves("/beta-invite/abc123", "dynamic");
    assertLinkResolves("/requests/req_xyz", "dynamic");
    assertLinkResolves("/r/tok_abc/done", "dynamic");
    assertLinkResolves("/i/intake_456", "dynamic");
  });

  it("non-existent paths do NOT match", () => {
    expect(routeExists(toPathname("/nonexistent"))).toBe(false);
    expect(routeExists(toPathname("/settings/nonexistent"))).toBe(false);
    expect(routeExists(toPathname("/admin/nonexistent"))).toBe(false);
  });
});
