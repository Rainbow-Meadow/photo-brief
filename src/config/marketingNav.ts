/**
 * Marketing navigation — single source of truth for header, footer, and mobile sheet.
 *
 * Add or remove links here and they propagate everywhere automatically.
 * Each entry can be scoped to specific placements via the `show` array.
 */

export interface MarketingNavLink {
  to: string;
  label: string;
  /** Where this link appears. Defaults to all three if omitted. */
  show?: Array<"header" | "footer" | "mobile">;
}

/** Primary marketing links (Pricing, Help, etc.) */
export const marketingLinks: MarketingNavLink[] = [
  { to: "/beta-onboarding", label: "Beta agent" },
  { to: "/pricing", label: "Pricing" },
  { to: "/help", label: "Help" },
];

/** Legal / secondary links */
export const legalLinks: MarketingNavLink[] = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

/** Footer-only utility links */
export const footerOnlyLinks: MarketingNavLink[] = [
  { to: "/for-ai-agents", label: "For AI agents", show: ["footer"] },
];

/** All links combined, for the footer */
export const allFooterLinks: MarketingNavLink[] = [
  ...marketingLinks,
  ...footerOnlyLinks,
  ...legalLinks,
];

/** Helper: filter links for a specific placement */
export function linksFor(
  links: MarketingNavLink[],
  placement: "header" | "footer" | "mobile",
): MarketingNavLink[] {
  return links.filter((l) => !l.show || l.show.includes(placement));
}
