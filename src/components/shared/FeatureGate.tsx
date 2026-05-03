import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { featureCatalog, getPlanLimit, minPlanFor, type FeatureKey } from "@/config/planLimits";
import { usePlan } from "@/hooks/usePlan";

type FeatureGateProps = {
  feature: FeatureKey;
  children: React.ReactNode;
  title?: string;
  description?: string;
  bullets?: string[];
};

export function FeatureGate({ feature, children, title, description, bullets = [] }: FeatureGateProps) {
  const { can, loading } = usePlan();
  const requiredPlan = minPlanFor(feature);
  const requiredPlanName = requiredPlan ? getPlanLimit(requiredPlan).name : "a higher plan";
  const meta = featureCatalog[feature];

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl rounded-[2rem] border bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-muted" />
        <p className="mt-4 text-sm text-muted-foreground">Checking plan access…</p>
      </div>
    );
  }

  if (can(feature)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-primary/20 bg-card/90 p-6 shadow-[0_30px_90px_-55px_hsl(217_91%_60%/0.55)] backdrop-blur sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 -z-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Lock className="h-3.5 w-3.5 text-primary" /> {requiredPlanName} feature
        </span>
        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title ?? `${meta.label} unlocks on ${requiredPlanName}.`}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              {description ?? meta.description}
            </p>
          </div>
          <div className="rounded-[1.5rem] border bg-background/70 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" /> Why this is Pro
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Free and Starter are built for manual PhotoBrief links. Pro adds the automation layer that turns website leads into requests.
            </p>
          </div>
        </div>

        {bullets.length > 0 ? (
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {bullets.map((bullet) => (
              <div key={bullet} className="flex gap-2 rounded-2xl bg-muted/45 p-3 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Button asChild size="lg" className="rounded-2xl">
            <NavLink to="/settings/billing?plan=pro">
              Upgrade to {requiredPlanName} <ArrowRight className="ml-1 h-4 w-4" />
            </NavLink>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-2xl bg-background/70">
            <NavLink to="/requests/new">Create a manual PhotoBrief link</NavLink>
          </Button>
        </div>
      </section>
    </div>
  );
}
