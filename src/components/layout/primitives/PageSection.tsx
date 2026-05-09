import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Surface } from "./Surface";

type Variant = "default" | "card" | "elevated" | "muted" | "split";

interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  /** Optional heading rendered above content. */
  heading?: ReactNode;
  /** Optional description (sub-heading). */
  description?: ReactNode;
  /** Right-aligned actions in the heading row. */
  actions?: ReactNode;
  children?: ReactNode;
}

/**
 * PageSection — section wrapper for in-app pages. Variants:
 * - default: plain section with heading + content
 * - card / elevated / muted: wraps content in a Surface
 * - split: 2-col heading | content layout on desktop
 */
export function PageSection({
  variant = "default",
  heading,
  description,
  actions,
  className,
  children,
  ...rest
}: PageSectionProps) {
  const headerBlock =
    heading || description || actions ? (
      <header
        className={cn(
          "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
          variant === "split" ? "sm:flex-col sm:items-start" : "",
        )}
      >
        <div className="min-w-0">
          {heading ? (
            <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
    ) : null;

  if (variant === "card" || variant === "elevated" || variant === "muted") {
    const surfaceVariant = variant === "card" ? "panel" : variant === "elevated" ? "elevated" : "muted";
    return (
      <section className={className} {...rest}>
        <Surface variant={surfaceVariant} padding="md">
          {headerBlock ? <div className="mb-4">{headerBlock}</div> : null}
          {children}
        </Surface>
      </section>
    );
  }

  if (variant === "split") {
    return (
      <section className={cn("grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8", className)} {...rest}>
        {headerBlock}
        <div>{children}</div>
      </section>
    );
  }

  return (
    <section className={cn("space-y-4", className)} {...rest}>
      {headerBlock}
      {children}
    </section>
  );
}
