import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedStepEditor } from "@/features/requests/components/GeneratedStepEditor";
import type { RequestDraft } from "@/types/requestDraft";

interface StepPhotosProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onNext: () => void;
}

export function StepPhotos({ draft, onChange, onNext }: StepPhotosProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Camera className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Photos to collect</h2>
          <p className="text-sm text-muted-foreground">Each becomes one simple customer step.</p>
        </div>
      </div>

      <GeneratedStepEditor
        steps={draft.steps}
        onChange={(steps) => onChange({ ...draft, steps })}
        compact
      />

      <Button
        size="lg"
        className="h-14 w-full rounded-[0.25rem] text-base"
        onClick={onNext}
        disabled={draft.steps.length === 0}
      >
        Continue <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
