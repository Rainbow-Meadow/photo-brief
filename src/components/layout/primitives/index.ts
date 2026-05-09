/**
 * Layout primitives — the standard schema for app + marketing pages.
 *
 * App pages: PageShell > PageStack > (PageSection | Surface | ResponsiveGrid)
 * Marketing pages: MarketingHero / MarketingSection
 * Setup flows: WizardLayout
 *
 * See docs/layout-system.md for usage rules.
 */

export { PageShell } from "./PageShell";
export { PageStack } from "./PageStack";
export { PageSection } from "./PageSection";
export { Surface } from "./Surface";
export type { SurfaceProps } from "./Surface";
export { ResponsiveGrid } from "./ResponsiveGrid";
export { MarketingSection } from "./MarketingSection";
export { MarketingHero } from "./MarketingHero";
export { WizardLayout } from "./WizardLayout";
export type { WizardStep } from "./WizardLayout";
