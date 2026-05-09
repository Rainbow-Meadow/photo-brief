import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorialPageHeaderProps {
  /** Two-digit numeral or short eyebrow label. Rendered in mono uppercase. */
  numeral?: string;
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
  backTo?: { label: string; href: string; mobileOnly?: boolean };
}

/**
 * Editorial in-app page header — mono numeral + eyebrow + display title +
 * hairline rule. Drop-in replacement for the legacy <PageHeader>.
 */
export function EditorialPageHeader({
  numeral,
  eyebrow,
  title,
  description,
  actions,
  bordered = true,
  className,
  backTo,
}: EditorialPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        bordered && "border-b border-border pb-6",
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
        {(numeral || eyebrow) && (
          <p className="mb-3 inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {numeral ? (
              <>
                <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
                <span className="text-[hsl(var(--accent-kinetic))]">[ {numeral} ]</span>
              </>
            ) : null}
            {eyebrow ? <span>{eyebrow}</span> : null}
          </p>
        )}
        <h1 className="font-[Geist,Inter,system-ui,sans-serif] text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
