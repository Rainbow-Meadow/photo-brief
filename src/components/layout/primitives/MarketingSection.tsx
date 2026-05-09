import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "default" | "narrow";
type Spacing = "default" | "tight";
type Tone = "paper" | "alt" | "dark";
type Align = "start" | "center";

interface MarketingSectionProps extends HTMLAttributes<HTMLElement> {
  width?: Width;
  spacing?: Spacing;
  tone?: Tone;
  align?: Align;
  /** Optional eyebrow/title/subtitle heading block rendered above children. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

/**
 * MarketingSection — standard public-page section wrapper.
 * Composes the existing pb-section / pb-container / pb-eyebrow primitives.
 */
export function MarketingSection({
  width = "default",
  spacing = "default",
  tone = "paper",
  align = "start",
  eyebrow,
  title,
  subtitle,
  className,
  children,
  id,
  ...rest
}: MarketingSectionProps) {
  const sectionTone =
    tone === "alt" ? "pb-section-alt" : tone === "dark" ? "pb-on-dark" : "";
  const spacingClass = spacing === "tight" ? "pb-section-tight" : "pb-section";
  const containerClass = width === "narrow" ? "pb-container-narrow" : "pb-container";

  return (
    <section id={id} className={cn(spacingClass, sectionTone, className)} {...rest}>
      <div className={containerClass}>
        {(eyebrow || title || subtitle) && (
          <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
            {eyebrow ? <span className="pb-eyebrow">{eyebrow}</span> : null}
            {title ? (
              <h2 className={cn("pb-section-title", eyebrow ? "mt-4" : "")}>{title}</h2>
            ) : null}
            {subtitle ? <p className="pb-copy mt-4 text-base sm:text-lg">{subtitle}</p> : null}
          </div>
        )}
        {(eyebrow || title || subtitle) && children ? <div className="mt-10">{children}</div> : children}
      </div>
    </section>
  );
}
