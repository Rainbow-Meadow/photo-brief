import { NavLink, useNavigate } from "react-router-dom";
import { Camera, Clock, MessageCircleQuestion, ArrowRight, Sparkles, BookOpen } from "lucide-react";
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
    <section className="surface-card relative isolate overflow-hidden p-6 sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-ambient-sky opacity-70"
      />
      <div className="mx-auto max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/80">
          <Sparkles className="h-3 w-3 text-primary" /> Recommended for your business
        </span>

        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {starter.starterTitle}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {starter.starterDescription}
        </p>

        <dl className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
            <Camera className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{stepCount} photo{stepCount === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
            <MessageCircleQuestion className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{questionCount} question{questionCount === 1 ? "" : "s"}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2">
            <Clock className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">~{minutes} min for recipient</span>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Button size="lg" className="gap-1.5" onClick={handleUse}>
            Use this starter request <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-1.5">
            <NavLink to="/guides">
              <BookOpen className="h-4 w-4" /> Browse all guides
            </NavLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
