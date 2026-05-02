import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricSubStat {
  label: string;
  tone?: "default" | "success" | "muted";
}

interface MetricFootnote {
  label: string;
  /** Native tooltip shown on hover — keep it short. */
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
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  className,
  subStat,
  footnote,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "surface-card p-4 transition-shadow hover:shadow-elev-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {Icon ? (
          <span className="rounded-lg bg-accent p-2 text-accent-foreground">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-[2rem] sm:leading-[1.1]">
        {value}
      </p>
      <p className="mt-1.5 text-xs font-medium text-foreground/80">{label}</p>
      {hint ? <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p> : null}
      {subStat ? (
        <p
          className={cn(
            "mt-3 border-t pt-2.5 text-xs",
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
            "mt-1.5 text-xs font-medium",
            footnote.tone === "success" && "text-success",
            footnote.tone === "primary" && "text-primary",
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
