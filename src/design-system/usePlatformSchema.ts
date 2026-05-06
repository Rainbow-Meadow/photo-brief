/**
 * Platform schema resolver hook.
 *
 * Returns the correct token set (desktop or mobile) based on viewport.
 * Components use this to apply platform-appropriate spacing, motion,
 * shadows, and interaction behavior without inline conditionals.
 */

import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DESKTOP } from "./desktop/desktop.tokens";
import { MOBILE } from "./mobile/mobile.tokens";

export type Platform = "desktop" | "mobile";
export type PlatformSchema = typeof DESKTOP | typeof MOBILE;

/** Imperative resolver — for use outside React or in utilities. */
export function getPlatformSchema(platform: Platform): PlatformSchema {
  return platform === "mobile" ? MOBILE : DESKTOP;
}

/**
 * React hook — selects desktop or mobile schema based on current viewport.
 *
 * @example
 * const { schema, isDesktop, isMobile } = usePlatformSchema();
 * // schema.spacing.lg → "1.5rem" (desktop) or "1rem" (mobile)
 * // schema.motion.transitionDuration → "200ms" (desktop) or "150ms" (mobile)
 */
export function usePlatformSchema() {
  const isMobile = useIsMobile();
  const platform: Platform = isMobile ? "mobile" : "desktop";

  const schema = useMemo(
    () => getPlatformSchema(platform),
    [platform],
  );

  return {
    platform,
    schema,
    isDesktop: platform === "desktop",
    isMobile: platform === "mobile",
  } as const;
}
