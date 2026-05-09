import { cn } from "@/lib/utils";

type Tone = "neutral" | "info" | "warning" | "success" | "muted" | "destructive";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border bg-secondary/50 text-secondary-foreground",
  info: "border-[hsl(var(--accent-sage)/0.4)] bg-[hsl(var(--accent-sage)/0.1)] text-[hsl(var(--accent-sage))]",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-success/30 bg-success/10 text-success",
  muted: "border-border bg-muted/40 text-muted-foreground",
  destructive: "border-destructive/30 bg-destructive/10 text-destructive",
};

const dotClasses: Record<Tone, string> = {
  neutral: "bg-secondary-foreground/40",
  info: "bg-[hsl(var(--accent-sage))]",
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

/**
 * Editorial status badge — sharp 1px square chip, mono uppercase label, tonal dot.
 */
export function StatusBadge({ label, tone = "neutral", className, dot }: StatusBadgeProps) {
  const showDot = dot ?? (tone !== "neutral" && tone !== "muted");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[0.25rem] border px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em]",
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
