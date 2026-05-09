import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Mono uppercase eyebrow above the title. Pass a `[ 0X ]` numeral for the editorial cadence. */
  eyebrow?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
  /** Renders a small back arrow + label above the title. */
  backTo?: { label: string; href: string; mobileOnly?: boolean };
}

/**
 * In-app page header — editorial cadence (mono eyebrow, display title,
 * hairline rule). Used across every DashboardLayout page.
 */
export function PageHeader({ title, description, eyebrow, actions, bordered = true, className, backTo }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        bordered ? "border-b border-border pb-6" : "pb-1",
        className,
      )}
    >
      <div className="min-w-0">
        {backTo ? (
          <NavLink
            to={backTo.href}
            className={cn(
              "mb-3 inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground transition hover:text-foreground",
              backTo.mobileOnly && "lg:hidden",
            )}
          >
            <ArrowLeft className="h-3 w-3" />
            {backTo.label}
          </NavLink>
        ) : null}
        {eyebrow ? (
          <p className="mb-3 inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span>{eyebrow}</span>
          </p>
        ) : null}
        <h1 className="text-[clamp(1.55rem,2.6vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
