import { RefreshCw, ArrowRight, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CapturedPhoto } from "@/types/chat";
import type { GuideStep } from "@/types/photobrief";

interface RetakeDecisionCardProps {
  photo: CapturedPhoto;
  step: GuideStep;
  onRetake: () => void;
  onUseAnyway: (photo: CapturedPhoto) => void;
}

function hasFailure(photo: CapturedPhoto) {
  return photo.checks.some((c) => c.severity === "fail");
}

/** Shown after a warn/fail verdict. Recipient chooses retake or use-anyway. */
export function RetakeDecisionCard({ photo, step, onRetake, onUseAnyway }: RetakeDecisionCardProps) {
  const serious = hasFailure(photo);
  const Icon = serious ? XCircle : AlertTriangle;

  return (
    <div className="space-y-4 rounded-2xl border bg-background/70 p-4">
      <div className="flex gap-3">
        <span className={serious ? "text-destructive" : "text-warning"}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {serious ? "A retake is recommended" : "A retake could help"}
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {serious
              ? "This photo may not give the business enough to work with. Retaking it is the safest choice."
              : "This photo may still be usable. A clearer one would just make things easier for the business."}
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            For: {step.title}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button size="lg" className="h-12 gap-1.5 rounded-2xl" onClick={onRetake}>
          <RefreshCw className="h-4 w-4" />
          {serious ? "Retake photo" : "Take a clearer photo"}
        </Button>
        <Button
          size="lg"
          variant={serious ? "outline" : "secondary"}
          className="h-12 gap-1.5 rounded-2xl"
          onClick={() => onUseAnyway(photo)}
        >
          {serious ? "Use it anyway" : "Keep this photo"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
