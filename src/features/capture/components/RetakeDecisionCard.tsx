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

export function RetakeDecisionCard({ photo, step, onRetake, onUseAnyway }: RetakeDecisionCardProps) {
  const serious = hasFailure(photo);
  const Icon = serious ? XCircle : AlertTriangle;

  return (
    <div className="space-y-5 rounded-[0.25rem] border bg-background p-5">
      <div className="flex gap-3">
        <span className={serious ? "text-destructive" : "text-warning"}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            {serious ? "A retake is recommended" : "A retake could help"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {serious
              ? "This photo may not give the business enough to work with. Retaking it is the safest choice."
              : "This photo may still be usable. A clearer one would just make things easier for the business."}
          </p>
          <p className="mt-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            For: {step.title}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        <Button size="lg" className="h-12 gap-1.5 rounded-[0.25rem] text-base" onClick={onRetake}>
          <RefreshCw className="h-4 w-4" />
          {serious ? "Retake photo" : "Take a clearer photo"}
        </Button>
        <Button
          size="lg"
          variant={serious ? "outline" : "secondary"}
          className="h-12 gap-1.5 rounded-[0.25rem] text-base"
          onClick={() => onUseAnyway(photo)}
        >
          {serious ? "Use it anyway" : "Keep this photo"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
