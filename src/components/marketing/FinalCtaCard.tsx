import { NavLink } from "react-router-dom";
import { ArrowRight, Link2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { signupCtaTarget, signupCtaLabel, INVITE_ONLY_BETA } from "@/config/access";

export function FinalCtaCard() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future" />
      <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-8 text-center shadow-glass-lg sm:p-14">
          <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/35 blur-xl" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-primary text-primary-foreground shadow-glow">
            <Link2 className="h-7 w-7" />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Send the next customer one better link.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Start with one manual PhotoBrief request. When it saves the back-and-forth, Pro turns your website into the same guided intake flow automatically.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="xl" className="rounded-full">
              <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "final_card", label: "primary" })}>
                {INVITE_ONLY_BETA ? signupCtaLabel() : "Create your free account"} <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
            <Button asChild size="xl" variant="glass" className="rounded-full">
              <a href="#how-it-works" onClick={() => trackEvent("cta_click", { location: "final_card", label: "how_it_works" })}>
                <Zap className="mr-1 h-4 w-4" /> See the flow
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {INVITE_ONLY_BETA ? "Invite-only beta · Built for small businesses that depend on customer photos" : "Free plan · No credit card · Takes 2 minutes"}
          </p>
        </div>
      </div>
    </section>
  );
}
