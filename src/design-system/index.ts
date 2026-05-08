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

export {
  APPLE_SYSTEM_COLORS,
  APPLE_LABEL_OPACITY,
  APPLE_MATERIALS,
  APPLE_TYPE,
  APPLE_MOTION,
  APPLE_FONT_STACK,
  APPLE_FONT_ROUNDED,
  APPLE_FONT_MONO,
  APPLE_MIN_TOUCH,
} from "./shared/apple.tokens";
export { DESKTOP } from "./desktop/desktop.tokens";
export { MOBILE } from "./mobile/mobile.tokens";
export { usePlatformSchema, getPlatformSchema } from "./usePlatformSchema";
export type { Platform, PlatformSchema } from "./usePlatformSchema";
