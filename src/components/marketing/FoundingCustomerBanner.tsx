import { Zap, ArrowRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export function FoundingCustomerBanner() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Founding Partner Beta — Limited spots available
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Accepted partners get <span className="font-semibold text-foreground">90 days free, concierge setup, direct input, and 50% off the first year after launch</span>.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 rounded-full"
        >
          <NavLink
            to="/waitlist?interest=founding-partner"
            onClick={() => trackEvent("cta_click", { location: "founding_banner", label: "apply_founding_partner" })}
          >
            Apply for beta <ArrowRight className="ml-1 h-4 w-4" />
          </NavLink>
        </Button>
      </div>
    </div>
  );
}
