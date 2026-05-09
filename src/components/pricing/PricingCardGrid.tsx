import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, CheckCircle2, HardDrive, Image, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { planLimits, type PlanLimit } from "@/config/planLimits";
import type { BillingInterval, Plan } from "@/types/photobrief";
import { BillingIntervalToggle } from "./BillingIntervalToggle";
import { FoundingProBadge } from "./FoundingProBadge";
import { FoundingCustomerBanner } from "@/components/marketing/FoundingCustomerBanner";
import { conversions, trackEvent } from "@/lib/analytics";
import { INVITE_ONLY_BETA } from "@/config/access";

interface Props {
  /** Where the per-card primary button should send the user. */
  ctaTarget?: "signup" | "billing";
  /** When set, hides Free + dims the user's current plan. */
  currentPlan?: Plan;
  /** Compact spacing for in-app billing page. */
  compact?: boolean;
  /** Surface variant — used on the dark hero band. */
  variant?: "default" | "onDark";
  /** Optional initial billing interval. Defaults to annual to highlight savings. */
  defaultInterval?: BillingInterval;
  /** When provided, intercepts the primary CTA (used for in-app checkout). */
  onSelectPlan?: (plan: Plan, interval: BillingInterval) => void;
  /** Disables a specific plan card (e.g. while opening checkout). */
  pendingPlan?: Plan | null;
  className?: string;
  heading?: string;
  subheading?: string;
  /** Hide the founding-customer banner (only meaningful on the public marketing surface). */
  showFoundingBanner?: boolean;
}

function ctaLabel(plan: PlanLimit, currentPlan?: Plan, pending?: boolean, target?: "signup" | "billing"): string {
  if (pending) return "Opening…";
  if (currentPlan && currentPlan === plan.id) return "Current plan";
  if (plan.id === "business") return "Talk to us";
  if (INVITE_ONLY_BETA && target !== "billing") {
    return plan.id === "free" ? "Apply for beta" : "Request founding access";
  }
  if (plan.id === "free") return "Start free";
  return `Choose ${plan.name}`;
}

function ctaTo(plan: PlanLimit, target: "signup" | "billing"): string {
  if (plan.id === "business") return "mailto:hello@photobrief.ai?subject=Business%20plan";
  if (target === "billing") return `/settings/billing?plan=${plan.id}`;
  if (INVITE_ONLY_BETA) return `/#apply?interest=${plan.id}`;
  return `/auth?mode=signup&plan=${plan.id}`;
}

function trackPlanSelection(plan: PlanLimit, interval: BillingInterval, surface: "signup" | "billing") {
  const value = interval === "annual" ? plan.priceAnnualMonthly * 12 : plan.priceMonthly;
  trackEvent("plan_upgrade_clicked", { plan: plan.id, interval, surface });
  conversions.pricingPlanSelected({
    item_id: plan.id,
    item_name: plan.name,
    billing_interval: interval,
    surface,
    value,
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

export function PricingCardGrid({
  ctaTarget = "signup",
  currentPlan,
  compact = false,
  variant = "default",
  defaultInterval = "annual",
  onSelectPlan,
  pendingPlan,
  className,
  heading,
  subheading,
  showFoundingBanner = true,
}: Props) {
  const [interval, setInterval] = useState<BillingInterval>(defaultInterval);
  const onDark = variant === "onDark";

  // Hide Free in-app once a user is paying — keep on landing.
  const visiblePlans = planLimits.filter((p) => {
    if (currentPlan && currentPlan !== "free" && p.id === "free") return false;
    return true;
  });

  return (
    <section className={cn("mx-auto max-w-7xl", className)}>
      {(heading || subheading) && (
        <div className="mx-auto max-w-2xl text-center">
          {heading ? (
            <h2
              className={cn(
                "text-3xl font-semibold tracking-tight sm:text-4xl",
                onDark ? "text-white" : "text-foreground",
              )}
            >
              {heading}
            </h2>
          ) : null}
          {subheading ? (
            <p className={cn("mt-3", onDark ? "text-white/75" : "text-muted-foreground")}>
              {subheading}
            </p>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center justify-center gap-3">
        <BillingIntervalToggle value={interval} onChange={setInterval} variant={variant} />
        <FoundingProBadge variant={onDark ? "onDark" : "default"} />
      </div>

      {!onDark && showFoundingBanner ? (
        <div className="mt-8">
          <FoundingCustomerBanner />
        </div>
      ) : null}

      <div className={cn("mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2", compact && "mt-6 gap-4")}>
        {visiblePlans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const price =
            interval === "annual" ? plan.priceAnnualMonthly : plan.priceMonthly;
          const annualTotal = Math.round(plan.priceAnnualMonthly * 12);
          const showHighlight = plan.highlight && !isCurrent;

          return (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl p-6 transition lift-on-hover",
                onDark
                  ? "glass-onDark text-white"
                  : "glass-strong",
                showHighlight &&
                  (onDark
                    ? "ring-1 ring-primary-glow/60 shadow-glow sm:col-span-2"
                    : "ring-1 ring-primary/40 shadow-glow sm:col-span-2"),
                isCurrent && !onDark && "ring-1 ring-success/40",
              )}
            >
              {showHighlight ? (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground shadow-elev-md">
                  <Sparkles className="h-3 w-3" /> Most popular
                </span>
              ) : null}
              {isCurrent ? (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 rounded-full bg-success px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-success-foreground">
                  Current
                </span>
              ) : null}

              <header>
                <h3 className={cn("text-lg font-semibold", onDark ? "text-white" : "text-foreground")}>
                  {plan.name}
                </h3>
                <p className={cn("mt-1 text-sm", onDark ? "text-white/70" : "text-muted-foreground")}>
                  {plan.tagline}
                </p>
              </header>

              <div className="mt-5 flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-4xl font-semibold tracking-tight",
                    onDark ? "text-white" : "text-foreground",
                  )}
                >
                  ${price}
                </span>
                <span className={cn("text-sm", onDark ? "text-white/60" : "text-muted-foreground")}>
                  {plan.priceMonthly === 0 ? "" : "/mo"}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 min-h-[1.25rem] text-xs",
                  onDark ? "text-white/60" : "text-muted-foreground",
                )}
              >
                {plan.priceMonthly === 0
                  ? "Forever free"
                  : interval === "annual"
                    ? `Billed $${annualTotal}/yr · save ${Math.round((1 - plan.priceAnnualMonthly / plan.priceMonthly) * 100)}%`
                    : "Billed monthly"}
              </p>

              <ul className="mt-5 grid gap-2">
                <AxisRow icon={Image} label="Photos" value={plan.pricingAxes.photos} onDark={onDark} />
                <AxisRow icon={BadgeCheck} label="Your branding" value={plan.pricingAxes.customerBranding} onDark={onDark} />
                <AxisRow icon={Sparkles} label="PhotoBrief branding" value={plan.pricingAxes.photobriefBranding} onDark={onDark} />
                <AxisRow icon={HardDrive} label="Storage" value={plan.pricingAxes.storage} onDark={onDark} />
                <AxisRow icon={Users} label="Team" value={plan.pricingAxes.team} onDark={onDark} />
              </ul>

              {onSelectPlan && plan.id !== "free" && plan.id !== "business" ? (
                <Button
                  size="default"
                  disabled={isCurrent || pendingPlan === plan.id}
                  onClick={() => {
                    trackPlanSelection(plan, interval, "billing");
                    onSelectPlan(plan.id, interval);
                  }}
                  variant={showHighlight ? "default" : "outline"}
                  className={cn(
                    "mt-5 w-full justify-center",
                    onDark &&
                      !showHighlight &&
                      "border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white",
                  )}
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
                  className={cn(
                    "mt-5 w-full justify-center",
                    onDark &&
                      !showHighlight &&
                      "border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white",
                  )}
                >
                  {plan.id === "business" ? (
                    <a
                      href={ctaTo(plan, ctaTarget)}
                      onClick={() => trackPlanSelection(plan, interval, ctaTarget)}
                    >
                      {ctaLabel(plan, currentPlan, false, ctaTarget)}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  ) : (
                    <NavLink
                      to={ctaTo(plan, ctaTarget)}
                      onClick={() => trackPlanSelection(plan, interval, ctaTarget)}
                    >
                      {ctaLabel(plan, currentPlan, false, ctaTarget)}
                      {!isCurrent && plan.id !== "free" ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
                    </NavLink>
                  )}
                </Button>
              )}

              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.slice(0, compact ? 5 : 7).map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        onDark ? "text-[hsl(var(--accent-kinetic))]" : "text-primary",
                      )}
                    />
                    <span className={onDark ? "text-white/85" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>

              {plan.features.length > (compact ? 5 : 7) ? (
                <p
                  className={cn(
                    "mt-4 text-xs",
                    onDark ? "text-white/55" : "text-muted-foreground",
                  )}
                >
                  + {plan.features.length - (compact ? 5 : 7)} more included
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <p
        className={cn(
          "mt-8 text-center text-sm font-medium",
          onDark ? "text-white/85" : "text-foreground",
        )}
      >
        ✓ <span className="font-semibold">First-pass guarantee included on every plan.</span>{" "}
        <span className={onDark ? "text-white/65" : "text-muted-foreground"}>
          If PhotoBrief asks for follow-up photos, those photos do not consume credits.
        </span>
      </p>
      <p
        className={cn(
          "mt-3 text-center text-xs",
          onDark ? "text-white/55" : "text-muted-foreground",
        )}
      >
        Prices in USD. Cancel anytime after public launch. Annual plans billed yearly. Photo credits reset each billing period.
      </p>
    </section>
  );
}
