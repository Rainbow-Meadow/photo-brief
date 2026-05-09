import { Lock, Users } from "lucide-react";
import { BETA_TOTAL_PARTNERS } from "@/config/betaProgram";
import { useBetaSeats } from "@/hooks/useBetaSeats";

interface BetaSeatTrackerProps {
  /** "compact" hides the subtext for inline usage */
  variant?: "default" | "compact";
  className?: string;
}

export function BetaSeatTracker({ variant = "default", className = "" }: BetaSeatTrackerProps) {
  const { seatsFilled, seatsRemaining, isFull } = useBetaSeats();

  if (isFull) {
    return (
      <div className={`rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-center ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <Lock className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-bold text-amber-300">
            All {BETA_TOTAL_PARTNERS} seats filled
          </span>
        </div>
        {variant === "default" && (
          <p className="mt-1.5 text-xs text-amber-300/70">
            Join the waitlist to be notified when a seat opens or a future cohort is announced.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Seat count headline */}
      <div className="flex items-center gap-2">
        <Users className="h-3.5 w-3.5 text-[hsl(var(--pb-lavender))]" />
        <span className="text-xs font-bold tracking-wide text-white/90">
          <span className="text-[hsl(var(--pb-lavender))]">{seatsRemaining}</span> of {BETA_TOTAL_PARTNERS} seats remaining
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="mt-2.5 flex w-full max-w-xs gap-[3px]" role="img" aria-label={`${seatsFilled} of ${BETA_TOTAL_PARTNERS} seats filled`}>
        {Array.from({ length: BETA_TOTAL_PARTNERS }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < seatsFilled
                ? "bg-[hsl(var(--pb-lavender))] shadow-[0_0_6px_hsl(var(--pb-lavender)/0.4)]"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Subtext */}
      {variant === "default" && (
        <p className="mt-2 text-[11px] font-medium text-white/45">
          Each application is reviewed for workflow fit before acceptance
        </p>
      )}
    </div>
  );
}
