/**
 * Editorial design system — promoted from the landing schema.
 * The implementation lives in `src/pages/landing/schema.{tsx,css}` so the
 * landing page keeps its existing imports; this barrel makes the same
 * primitives importable app-wide as `@/components/editorial`.
 *
 * Compose these for any new surface (marketing, app, admin) instead of
 * shadcn rounded-soft cards.
 */
export {
  Section,
  Container,
  Eyebrow,
  Title,
  Subtitle,
  Body,
  Card,
  Grid,
  CTA,
  CTAGroup,
  type CTAProps,
} from "@/design-system/schema";
