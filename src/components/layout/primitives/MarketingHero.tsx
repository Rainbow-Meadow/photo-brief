import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarketingHeroProps extends HTMLAttributes<HTMLElement> {
  width?: "default" | "narrow" | "full";
  align?: "start" | "center";
  children?: ReactNode;
}

/**
 * MarketingHero — standardizes hero spacing + container width.
 * Hero content (copy, illustration, CTAs) is provided as children.
 */
export function MarketingHero({
  width = "default",
  align = "start",
  className,
  children,
  ...rest
}: MarketingHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden -mt-[4rem] pt-[4.75rem] sm:-mt-[4.5rem] sm:pt-[5.25rem] bg-[hsl(var(--pb-tier-0))]",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          width === "full"
            ? "w-full pl-[84px]"
            : width === "narrow"
              ? "pb-container-narrow"
              : "pb-container",
          "pb-section",
          align === "center" && "text-center",
        )}
      >
        {children}
      </div>
    </section>
  );
}
