import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant = "panel" | "elevated" | "muted" | "outline";
type SurfaceRadius = "default" | "lg" | "pill";
type SurfacePadding = "none" | "sm" | "md" | "lg";

const variantClasses: Record<SurfaceVariant, string> = {
  panel: "surface-card",
  elevated: "surface-card-elevated",
  muted: "border bg-muted/40",
  outline: "border bg-transparent",
};

const radiusClasses: Record<SurfaceRadius, string> = {
  default: "rounded-2xl",
  lg: "rounded-3xl",
  pill: "rounded-full",
};

const paddingClasses: Record<SurfacePadding, string> = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-5 sm:p-8",
};

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
  radius?: SurfaceRadius;
  padding?: SurfacePadding;
  children?: ReactNode;
}

/**
 * Surface — standard card/panel primitive. Replaces ad-hoc combos like
 * `rounded-[2rem] bg-card/85 border border-border/70 shadow-[…] backdrop-blur`.
 */
export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    { variant = "panel", radius = "default", padding = "md", className, children, ...rest },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          radiusClasses[radius],
          paddingClasses[padding],
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Surface.displayName = "Surface";
