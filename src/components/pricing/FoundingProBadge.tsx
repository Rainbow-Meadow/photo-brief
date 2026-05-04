import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  variant?: "default" | "onDark" | "inline";
  className?: string;
}

/**
 * Founding Partner Beta pill — keeps public pricing aligned with the current
 * invite-only beta offer instead of the retired lifetime Founding Pro language.
 */
export function FoundingProBadge({ variant = "default", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        variant === "onDark" && "border border-white/20 bg-white/10 text-white",
        variant === "default" &&
          "border border-primary/30 bg-primary/10 text-primary",
        variant === "inline" && "bg-primary/10 text-primary",
        className,
      )}
    >
      <Sparkles className="h-3 w-3" />
      Founding Partner Beta · limited spots
    </span>
  );
}
