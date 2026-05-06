import * as React from "react";
import { cn } from "@/lib/utils";
import { usePlatformSchema } from "@/design-system";

type GlassVariant = "card" | "nav" | "modal" | "widget" | "chat" | "hero";
type GlassTone = "light" | "dark" | "auto";
type GlassElevation = "flat" | "sm" | "md" | "lg";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassVariant;
  tone?: GlassTone;
  elevation?: GlassElevation;
  /** Adds hover lift + soft scale on desktop only. No-op on mobile. */
  interactive?: boolean;
  asChild?: boolean;
}

const variantClass: Record<GlassVariant, string> = {
  card: "rounded-2xl glass",
  widget: "rounded-2xl glass",
  nav: "rounded-full glass-nav",
  modal: "rounded-3xl glass-strong",
  chat: "rounded-2xl glass",
  hero: "rounded-3xl glass-strong",
};

const elevationClass: Record<GlassElevation, string> = {
  flat: "",
  sm: "shadow-elev-sm",
  md: "shadow-glass",
  lg: "shadow-glass-lg",
};

/**
 * Apple-inspired glass surface primitive.
 *
 * Platform-aware:
 * - Desktop: full blur, rich shadows, hover lift when interactive.
 * - Mobile: reduced blur via CSS overrides, simpler shadows, tap feedback instead of hover.
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel(
    { className, variant = "card", tone = "auto", elevation = "md", interactive, ...rest },
    ref,
  ) {
    const { isMobile } = usePlatformSchema();

    /* On mobile, cap elevation at "md" and skip hover lift */
    const effectiveElevation = isMobile && elevation === "lg" ? "md" : elevation;

    return (
      <div
        ref={ref}
        className={cn(
          variantClass[variant],
          elevationClass[effectiveElevation],
          tone === "dark" && "glass-onDark",
          /* Desktop: hover lift + shadow upgrade */
          interactive && !isMobile && "lift-on-hover hover:shadow-glass-lg",
          /* Mobile: tap press feedback */
          interactive && isMobile && "active:scale-[0.98] active:opacity-90 transition-transform duration-150",
          className,
        )}
        {...rest}
      />
    );
  },
);
