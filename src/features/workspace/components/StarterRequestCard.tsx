import { NavLink, useNavigate } from "react-router-dom";
import { Camera, Clock, MessageCircleQuestion, ArrowRight, Sparkles, Plus } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { getStarterForIndustry } from "@/config/industryGuideMap";
import { guideTemplates } from "@/config/guideTemplates";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";

interface Props {
  industry: string | null | undefined;
}

export function StarterRequestCard({ industry }: Props) {
  const navigate = useNavigate();
  const starter = getStarterForIndustry(industry);
  const guide = guideTemplates.find((g) => g.id === starter.guideId);

  const stepCount = guide?.steps.length ?? 4;
  const questionCount = guide?.questions.length ?? 3;
  const minutes = guide?.estimatedMinutes ?? 4;

  function handleUse() {
    trackEvent("starter_guide_used", {
      guide_id: starter.guideId,
      industry: industry ?? "unknown",
    });
    toast.success(`Starting a new request from "${starter.starterTitle}"`);
    navigate(`/requests/new?guide=${starter.guideId}`);
  }

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-[0_30px_80px_-45px_hsl(222_47%_11%/0.45)] backdrop-blur sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-ambient-sky opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-border/70">
            <BrandMark variant="mark" tone="color" size={34} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3 w-3 text-primary" /> Start here
          </span>

          <h2 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Send your first photo request in under a minute.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Use a simple starter tailored to your business, or build a custom request from one photo prompt.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-1.5 rounded-full px-6" onClick={handleUse}>
              Use starter request <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5 rounded-full px-6 bg-background/60">
              <NavLink to="/requests/new">
                <Plus className="h-4 w-4" /> Start from scratch
              </NavLink>
            </Button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Suggested starter
          </p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{starter.starterTitle}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{starter.starterDescription}</p>

          <dl className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2.5">
              <Camera className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{stepCount} photo{stepCount === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2.5">
              <MessageCircleQuestion className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{questionCount} question{questionCount === 1 ? "" : "s"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2.5">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">~{minutes} min</span>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
