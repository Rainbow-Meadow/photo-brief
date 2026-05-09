import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  illustration?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
  size?: "default" | "lg";
  /** @deprecated kept for backward compat. */
  compact?: boolean;
}

/**
 * Editorial empty / zero-state — sharp 1px frame, mono numeral, kinetic accent.
 */
export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "default",
  compact,
}: EmptyStateProps) {
  const eff = compact ? "default" : size;
  return (
    <div
      className={cn(
        "relative isolate flex flex-col items-center rounded-[0.25rem] border border-border bg-card text-center",
        compact ? "px-4 py-8" : eff === "lg" ? "px-6 py-16" : "px-6 py-12",
        className,
      )}
    >
      <p className="mb-6 font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        <span className="text-[hsl(var(--accent-kinetic))]">·</span> Nothing here yet
      </p>

      {illustration ? (
        <img
          src={illustration}
          alt=""
          aria-hidden
          loading="lazy"
          width={512}
          height={512}
          className={cn(
            "select-none opacity-90",
            eff === "lg" ? "h-32 w-32" : "h-24 w-24",
          )}
          draggable={false}
        />
      ) : null}

      {Icon ? (
        <span
          className={cn(
            "flex items-center justify-center rounded-[0.25rem] border border-border bg-background text-[hsl(var(--accent-kinetic))]",
            eff === "lg" ? "h-14 w-14" : "h-12 w-12",
            illustration && "mt-3",
          )}
          aria-hidden
        >
          <Icon className={cn(eff === "lg" ? "h-6 w-6" : "h-5 w-5")} />
        </span>
      ) : null}

      <h3
        className={cn(
          "mt-5 font-semibold tracking-tight text-foreground",
          eff === "lg" ? "text-xl" : "text-base",
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            "mx-auto mt-2 max-w-md text-muted-foreground",
            eff === "lg" ? "text-sm" : "text-xs",
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action}
        </div>
      ) : null}
      {secondaryAction ? (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
