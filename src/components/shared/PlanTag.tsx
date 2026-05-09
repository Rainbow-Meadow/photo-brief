import { cn } from "@/lib/utils";
import { getPlanLimit } from "@/config/planLimits";
import type { Plan } from "@/types/photobrief";

interface PlanTagProps {
  plan: Plan;
  alignRight?: boolean;
  className?: string;
}

/**
 * Editorial plan tag — sharp square chip, mono uppercase, kinetic accent.
 */
export function PlanTag({ plan, alignRight, className }: PlanTagProps) {
  const name = getPlanLimit(plan).name;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[0.2rem] border border-[hsl(var(--accent-kinetic)/0.4)] bg-[hsl(var(--accent-kinetic)/0.08)] px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]",
        alignRight && "ml-auto",
        className,
      )}
    >
      {name}
    </span>
  );
}
