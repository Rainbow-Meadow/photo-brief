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
 * MetricCard — platform-aware.
 * Desktop: hover lift, richer spacing (p-5), larger value text.
 * Mobile: no hover, tighter spacing (p-3.5), tap feedback.
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
        "transition duration-200",
        /* Platform-aware spacing */
        isMobile ? "p-3.5" : "p-4 sm:p-5",
        /* Platform-aware hover/tap */
        isMobile
          ? "surface-card active:scale-[0.98] active:opacity-90"
          : cn(
              "hover:-translate-y-0.5",
              quiet ? "surface-card hover:shadow-elev-sm" : "surface-card hover:shadow-elev-md",
            ),
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className={cn(
            "mt-2 font-semibold tracking-tight text-foreground tabular-nums",
            isMobile ? "text-2xl" : "text-3xl sm:text-[2rem] sm:leading-[1.1]",
          )}>
            {value}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "rounded-2xl p-2.5",
              quiet ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      {subStat ? (
        <p
          className={cn(
            "mt-4 surface-divider pt-3 text-xs",
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
