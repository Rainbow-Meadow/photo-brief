import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "warning" | "success" | "muted" | "destructive";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  info: "bg-accent text-accent-foreground",
  warning: "bg-warning/15 text-warning-foreground border border-warning/20",
  success: "bg-success/15 text-success border border-success/20",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/15 text-destructive border border-destructive/20",
};

const dotClasses: Record<Tone, string> = {
  neutral: "bg-secondary-foreground/40",
  info: "bg-accent-foreground",
  warning: "bg-warning",
  success: "bg-success",
  muted: "bg-muted-foreground/40",
  destructive: "bg-destructive",
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
  /** Show a colored dot before the label (aids color-blind users). Default true for semantic tones. */
  dot?: boolean;
}

export function StatusBadge({ label, tone = "neutral", className, dot }: StatusBadgeProps) {
  const showDot = dot ?? (tone !== "neutral" && tone !== "muted");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} aria-hidden />
      )}
      {label}
    </span>
  );
}
