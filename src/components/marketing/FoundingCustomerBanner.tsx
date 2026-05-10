import { Zap, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Container, Card } from "@/design-system/schema";
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
    <Container>
      <Card variant="outline" padding="md">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isFull
                  ? "Room's full — get on the waitlist"
                  : `Founding partner seats open — ${seatsRemaining} of ${BETA_TOTAL_PARTNERS} left`}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                You get <span className="font-semibold text-foreground">{BETA_DURATION_DAYS} days free (clock starts {BETA_SETUP_BUFFER_DAYS} days after the last seat fills), concierge setup, a direct line to the team, and a tiered post-launch reward</span>. {MAX_DISCOUNT_LABEL}. Top two never pay again.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full">
            <NavLink
              to="/#apply?interest=founding-partner"
              onClick={() => trackEvent("cta_click", { location: "founding_banner", label: "apply_founding_partner" })}
            >
              {isFull ? "Join waitlist" : "Claim a seat"} <ArrowRight className="ml-1 h-4 w-4" />
            </NavLink>
          </Button>
        </div>
      </Card>
    </Container>
  );
}
