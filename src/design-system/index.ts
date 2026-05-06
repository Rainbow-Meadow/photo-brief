/**
 * Design System — Platform-aware schema resolver.
 *
 * Provides `usePlatformSchema()` to select the correct visual token set
 * based on viewport width, using the existing `useIsMobile()` hook.
 *
 * Usage:
 *   const { platform, schema, isDesktop, isMobile } = usePlatformSchema();
 *   // schema.spacing.lg, schema.motion.transitionDuration, etc.
 */

export { BRAND } from "./shared/brand.tokens";
export { SEMANTIC_COLORS } from "./shared/color.tokens";
export { DESKTOP } from "./desktop/desktop.tokens";
export { MOBILE } from "./mobile/mobile.tokens";
export { usePlatformSchema, getPlatformSchema } from "./usePlatformSchema";
export type { Platform, PlatformSchema } from "./usePlatformSchema";
