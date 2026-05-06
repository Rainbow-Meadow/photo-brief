import { Zap, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import {
  BETA_DURATION_DAYS,
  BETA_SETUP_BUFFER_DAYS,
  BETA_TOTAL_PARTNERS,
  MAX_DISCOUNT_LABEL,
} from "@/config/betaProgram";
import { useBetaSeats } from "@/hooks/useBetaSeats";

export function FoundingCustomerBanner() {
  const { seatsRemaining, isFull } = useBetaSeats();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isFull
                ? "All seats filled — join the waitlist"
                : `Accepting beta applications — ${seatsRemaining} of ${BETA_TOTAL_PARTNERS} seats remaining`}
            </p>
             <p className="mt-0.5 text-sm text-muted-foreground">
               Accepted partners get <span className="font-semibold text-foreground">{BETA_DURATION_DAYS} days free (clock starts {BETA_SETUP_BUFFER_DAYS} days after all seats fill), concierge setup, direct input, and tiered post-launch rewards</span>. {MAX_DISCOUNT_LABEL}.
             </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 rounded-full"
        >
          <NavLink
            to="/#apply?interest=founding-partner"
            onClick={() => trackEvent("cta_click", { location: "founding_banner", label: "apply_founding_partner" })}
          >
            {isFull ? "Join waitlist" : "Apply now"} <ArrowRight className="ml-1 h-4 w-4" />
          </NavLink>
        </Button>
      </div>
    </div>
  );
}
