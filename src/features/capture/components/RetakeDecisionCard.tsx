import { RefreshCw, ArrowRight, AlertTriangle, XCircle } from "lucide-react";
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
  const code = serious ? "[ ER ]" : "[ !! ]";

  return (
    <div className="space-y-5 border border-border bg-card p-5">
      <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
        <span className="text-[hsl(var(--accent-kinetic))]">{code}</span>
        <span>Retake decision</span>
      </p>

      <div className="flex gap-3">
        <span className="text-[hsl(var(--accent-kinetic))]">
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
          <p className="mt-3 font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            For: <span className="text-foreground">{step.title}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-2.5">
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex h-12 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]"
        >
          <RefreshCw className="h-4 w-4" />
          {serious ? "Retake photo" : "Take a clearer photo"}
        </button>
        <button
          type="button"
          onClick={() => onUseAnyway(photo)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 border border-border bg-background px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-foreground hover:text-background"
        >
          {serious ? "Use it anyway" : "Keep this photo"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
