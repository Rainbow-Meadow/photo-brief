import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  bordered?: boolean;
  className?: string;
  /** Renders a small back arrow + label above the title. */
  backTo?: { label: string; href: string; mobileOnly?: boolean };
}

export function PageHeader({ title, description, eyebrow, actions, bordered = true, className, backTo }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        bordered ? "hairline-apple-b pb-5" : "pb-1",
        className,
      )}
    >
      <div className="min-w-0">
        {backTo ? (
          <NavLink
            to={backTo.href}
            className={cn(
              "mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-foreground",
              backTo.mobileOnly && "lg:hidden",
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backTo.label}
          </NavLink>
        ) : null}
        {eyebrow ? <p className="text-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
