import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, CheckCircle2, HardDrive, Image, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { planLimits, FOUNDING_PRO, FOUNDING_TEAM_PRICE, type PlanLimit } from "@/config/planLimits";
import type { Plan } from "@/types/photobrief";
import { FoundingProBadge } from "./FoundingProBadge";
import { FoundingCustomerBanner } from "@/components/marketing/FoundingCustomerBanner";
import { conversions, trackEvent } from "@/lib/analytics";
import { INVITE_ONLY_BETA } from "@/config/access";

interface Props {
  ctaTarget?: "signup" | "billing";
  currentPlan?: Plan;
  compact?: boolean;
  variant?: "default" | "onDark";
  onSelectPlan?: (plan: Plan, interval: "monthly") => void;
  pendingPlan?: Plan | null;
  className?: string;
  heading?: string;
  subheading?: string;
  showFoundingBanner?: boolean;
}

const ctaLabelByPlan: Record<Plan, string> = {
  intake: "Replace My Form",
  intake_team: "Run Intake as a Team",
};

function ctaLabel(plan: PlanLimit, currentPlan?: Plan, pending?: boolean, target?: "signup" | "billing"): string {
  if (pending) return "Opening…";
  if (currentPlan && currentPlan === plan.id) return "Current plan";
  if (INVITE_ONLY_BETA && target !== "billing") return "Apply for founding access";
  return ctaLabelByPlan[plan.id];
}

function ctaTo(plan: PlanLimit, target: "signup" | "billing"): string {
  if (target === "billing") return `/settings/billing?plan=${plan.id}`;
  if (INVITE_ONLY_BETA) return `/#apply?interest=${plan.id}`;
  return `/auth?mode=signup&plan=${plan.id}`;
}

function trackPlanSelection(plan: PlanLimit, surface: "signup" | "billing") {
  trackEvent("plan_upgrade_clicked", { plan: plan.id, interval: "monthly", surface });
  conversions.pricingPlanSelected({
    item_id: plan.id,
    item_name: plan.name,
    billing_interval: "monthly",
    surface,
    value: plan.priceMonthly,
  });
}

function AxisRow({
  icon: Icon,
  label,
  value,
  onDark,
}: {
  icon: typeof Image;
  label: string;
  value: string;
  onDark: boolean;
}) {
  return (
    <li className="flex gap-2 rounded-xl bg-background/55 p-2.5 text-xs">
      <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", onDark ? "text-primary-glow" : "text-primary")} />
      <span>
        <span className={cn("block font-medium", onDark ? "text-white" : "text-foreground")}>{label}</span>
        <span className={onDark ? "text-white/70" : "text-muted-foreground"}>{value}</span>
      </span>
    </li>
  );
}

function priceFor(plan: PlanLimit): { price: number; foundingNote: string; publicNote: string } {
  if (plan.id === "intake") {
    return {
      price: FOUNDING_PRO.monthlyPrice,
      foundingNote: `$${FOUNDING_PRO.monthlyPrice}/mo founding price`,
      publicNote: `$${plan.priceMonthly}/mo public · billed monthly`,
    };
  }
  return {
    price: FOUNDING_TEAM_PRICE,
    foundingNote: `$${FOUNDING_TEAM_PRICE}/mo founding price`,
    publicNote: `$${plan.priceMonthly}/mo public · billed monthly`,
  };
}

export function PricingCardGrid({
  ctaTarget = "signup",
  currentPlan,
  compact = false,
  variant = "default",
  onSelectPlan,
  pendingPlan,
  className,
  heading,
  subheading,
  showFoundingBanner = true,
}: Props) {
  const onDark = variant === "onDark";

  return (
    <section className={cn("mx-auto max-w-5xl", className)}>
      {(heading || subheading) && (
        <div className="mx-auto max-w-2xl text-center">
          {heading ? (
            <h2 className={cn("text-3xl font-semibold tracking-tight sm:text-4xl", onDark ? "text-white" : "text-foreground")}>
              {heading}
            </h2>
          ) : null}
          {subheading ? (
            <p className={cn("mt-3", onDark ? "text-white/75" : "text-muted-foreground")}>{subheading}</p>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3">
        <FoundingProBadge variant={onDark ? "onDark" : "default"} />
      </div>

      {!onDark && showFoundingBanner ? (
        <div className="mt-8">
          <FoundingCustomerBanner />
        </div>
      ) : null}

      <div className={cn("mt-10 grid grid-cols-1 gap-5 md:grid-cols-2", compact && "mt-6 gap-4")}>
        {planLimits.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const showHighlight = plan.highlight && !isCurrent;
          const { price, foundingNote, publicNote } = priceFor(plan);

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl p-6 transition lift-on-hover",
                onDark ? "glass-onDark text-white" : "glass-strong",
                showHighlight && (onDark ? "ring-1 ring-primary-glow/60 shadow-glow" : "ring-1 ring-primary/40 shadow-glow"),
                isCurrent && !onDark && "ring-1 ring-success/40",
              )}
            >
              {showHighlight ? (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-elev-md">
                  <Sparkles className="h-3 w-3" /> For teams
                </span>
              ) : null}
              {isCurrent ? (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 rounded-full bg-success px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-success-foreground">
                  Current
                </span>
              ) : null}

              <header>
                <h3 className={cn("text-lg font-semibold", onDark ? "text-white" : "text-foreground")}>{plan.name}</h3>
                <p className={cn("mt-1 text-sm", onDark ? "text-white/70" : "text-muted-foreground")}>{plan.tagline}</p>
              </header>

              <div className="mt-5 flex items-baseline gap-1">
                <span className={cn("text-4xl font-semibold tracking-tight", onDark ? "text-white" : "text-foreground")}>
                  ${price}
                </span>
                <span className={cn("text-sm", onDark ? "text-white/60" : "text-muted-foreground")}>/mo</span>
              </div>
              <p className={cn("mt-1 text-xs", onDark ? "text-white/60" : "text-muted-foreground")}>{foundingNote}</p>
              <p className={cn("text-xs", onDark ? "text-white/40" : "text-muted-foreground/70")}>{publicNote}</p>

              <ul className="mt-5 grid gap-2">
                <AxisRow icon={Image} label="Photos" value={plan.pricingAxes.photos} onDark={onDark} />
                <AxisRow icon={BadgeCheck} label="Branding" value={plan.pricingAxes.customerBranding} onDark={onDark} />
                <AxisRow icon={HardDrive} label="Storage" value={plan.pricingAxes.storage} onDark={onDark} />
                <AxisRow icon={Users} label="Team" value={plan.pricingAxes.team} onDark={onDark} />
              </ul>

              {onSelectPlan ? (
                <Button
                  size="default"
                  disabled={isCurrent || pendingPlan === plan.id}
                  onClick={() => {
                    trackPlanSelection(plan, "billing");
                    onSelectPlan(plan.id, "monthly");
                  }}
                  variant={showHighlight ? "default" : "outline"}
                  className={cn("mt-5 w-full justify-center", onDark && !showHighlight && "border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white")}
                >
                  {ctaLabel(plan, currentPlan, pendingPlan === plan.id, "billing")}
                  {!isCurrent ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
                </Button>
              ) : (
                <Button
                  asChild
                  size="default"
                  disabled={isCurrent}
                  variant={showHighlight ? "default" : "outline"}
                  className={cn("mt-5 w-full justify-center", onDark && !showHighlight && "border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white")}
                >
                  <NavLink to={ctaTo(plan, ctaTarget)} onClick={() => trackPlanSelection(plan, ctaTarget)}>
                    {ctaLabel(plan, currentPlan, false, ctaTarget)}
                    {!isCurrent ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
                  </NavLink>
                </Button>
              )}

              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.slice(0, compact ? 6 : 12).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", onDark ? "text-[hsl(var(--accent-kinetic))]" : "text-primary")} />
                    <span className={onDark ? "text-white/85" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <p className={cn("mt-8 text-center text-sm font-medium", onDark ? "text-white/85" : "text-foreground")}>
        ✓ <span className="font-semibold">First-pass guarantee on every plan.</span>{" "}
        <span className={onDark ? "text-white/65" : "text-muted-foreground"}>
          If PhotoBrief asks for follow-up photos, those photos do not consume credits.
        </span>
      </p>
      <p className={cn("mt-3 text-center text-xs", onDark ? "text-white/55" : "text-muted-foreground")}>
        Prices in USD. Cancel anytime. New accounts get a 14-day free trial of Smart Intake.
      </p>
    </section>
  );
}
