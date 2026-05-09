import { cn } from "@/lib/utils";
import { usePlatformSchema } from "@/design-system";
import type { LucideIcon } from "lucide-react";

interface MetricSubStat {
  label: string;
  tone?: "default" | "success" | "muted";
}

interface MetricFootnote {
  label: string;
  tooltip?: string;
  tone?: "default" | "success" | "muted" | "primary";
}

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
  subStat?: MetricSubStat;
  footnote?: MetricFootnote;
  variant?: "default" | "quiet";
}

/**
 * MetricCard — editorial: sharp 1px border, mono uppercase label, tabular display value.
 * Touch-aware (no hover lift on touch per memory rule).
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  subStat,
  footnote,
  variant = "default",
}: MetricCardProps) {
  const quiet = variant === "quiet";
  const { isMobile } = usePlatformSchema();

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[0.25rem] border border-border bg-card transition-colors duration-200",
        isMobile ? "p-4" : "p-5",
        !isMobile && "hover:border-[hsl(var(--accent-kinetic)/0.45)]",
        isMobile && "active:opacity-90",
        quiet && "bg-card/60",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "mt-3 font-semibold tracking-tight tabular-nums text-foreground",
              isMobile ? "text-2xl" : "text-[2rem] leading-[1.05]",
            )}
          >
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.25rem] border border-border",
              quiet ? "bg-muted text-muted-foreground" : "bg-background text-[hsl(var(--accent-kinetic))]",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-3 text-xs text-muted-foreground">{hint}</p> : null}
      {subStat ? (
        <p
          className={cn(
            "mt-4 border-t border-border pt-3 text-xs",
            subStat.tone === "success" && "text-success",
            subStat.tone === "muted" && "text-muted-foreground",
            (!subStat.tone || subStat.tone === "default") && "text-foreground",
          )}
        >
          {subStat.label}
        </p>
      ) : null}
      {footnote ? (
        <p
          title={footnote.tooltip}
          className={cn(
            "mt-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em]",
            footnote.tone === "success" && "text-success",
            footnote.tone === "primary" && "text-[hsl(var(--accent-kinetic))]",
            footnote.tone === "muted" && "text-muted-foreground",
            (!footnote.tone || footnote.tone === "default") && "text-foreground",
          )}
        >
          {footnote.label}
        </p>
      ) : null}
    </div>
  );
}
