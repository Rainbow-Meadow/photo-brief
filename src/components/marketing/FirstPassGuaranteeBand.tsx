import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, Camera, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { signupCtaTarget, signupCtaLabel } from "@/config/access";

export function FirstPassGuaranteeBand() {
  return (
    <section id="first-pass-guarantee" className="relative overflow-hidden" aria-labelledby="first-pass-guarantee-heading">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-70" />
      <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3 w-3" /> Built for customer reality
            </span>
            <h2 id="first-pass-guarantee-heading" className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              First-pass fixes should not feel like punishment.
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Some customers need one quick retake. That should not burn extra usage or make the experience feel hostile. If PhotoBrief asks for follow-up photos on the first pass, those photos do not consume credits.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              The product is priced around real photo volume, with breathing room for getting the brief right.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-6">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "guarantee_band", label: "primary" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-full text-foreground hover:bg-muted">
                <a href="#pricing" onClick={() => trackEvent("cta_click", { location: "guarantee_band", label: "pricing" })}>
                  See pricing
                </a>
              </Button>
            </div>
          </div>

          <div className="glass-strong magnetic-card rounded-[2rem] p-6 shadow-glass-lg sm:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">How it works</p>
            </div>

            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary"><Camera className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Photo credits stay simple</p>
                  <p className="text-sm text-muted-foreground">One submitted customer photo uses one photo credit.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-success/10 p-2 text-success"><Zap className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold text-foreground">First-pass follow-ups are free</p>
                  <p className="text-sm text-muted-foreground">If a quick retake is needed, the follow-up photo does not consume credits.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-success/10 p-2 text-success"><BadgeCheck className="h-4 w-4" /></span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Quality still matters</p>
                  <p className="text-sm text-muted-foreground">Simple AI feedback helps customers fix blur, low light, glare, unreadable labels, and missing subjects before your team reviews.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
