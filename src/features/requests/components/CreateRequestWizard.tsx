import { useState, useEffect } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StepHow, type BuildChoice } from "./wizard/StepHow";
import { StepSetup } from "./wizard/StepSetup";
import { StepRecipient } from "./wizard/StepRecipient";
import { StepPhotos } from "./wizard/StepPhotos";
import { StepQuestions } from "./wizard/StepQuestions";
import { StepReview } from "./wizard/StepReview";
import type { RequestDraft } from "@/types/requestDraft";
import type { PhotoGuide } from "@/types/photobrief";
import type { AiBuilderMessage } from "./AIRequestBuilderChat";

interface CreateRequestWizardProps {
  draft: RequestDraft | null;
  onDraftChange: (draft: RequestDraft) => void;
  aiUnlocked: boolean;
  savedTemplates: PhotoGuide[];
  chatMessages: AiBuilderMessage[];
  isGenerating: boolean;
  isCreating: boolean;
  onSelectTemplate: (guide: PhotoGuide) => void;
  onAiPrompt: (prompt: string) => void;
  onBlankDraft: () => void;
  onCreate: () => void;
  onSaveAsGuide: () => void;
  /** If a guide param was provided, skip directly to recipient step */
  initialStep?: number;
}

const STEP_LABELS = ["Method", "Setup", "Recipient", "Photos", "Questions", "Review"];
const TOTAL_STEPS = STEP_LABELS.length;

export function CreateRequestWizard({
  draft,
  onDraftChange,
  aiUnlocked,
  savedTemplates,
  chatMessages,
  isGenerating,
  isCreating,
  onSelectTemplate,
  onAiPrompt,
  onBlankDraft,
  onCreate,
  onSaveAsGuide,
  initialStep = 0,
}: CreateRequestWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialStep);
  const [buildChoice, setBuildChoice] = useState<BuildChoice | null>(
    initialStep > 0 ? "template" : null,
  );

  // When draft arrives via AI generation, auto-advance from setup to recipient
  useEffect(() => {
    if (draft && step === 1 && buildChoice === "ai" && !isGenerating) {
      // AI just finished generating
    }
  }, [draft, step, buildChoice, isGenerating]);

  const progressValue = ((step + 1) / TOTAL_STEPS) * 100;

  const handleHow = (choice: BuildChoice) => {
    setBuildChoice(choice);
    if (choice === "blank") {
      onBlankDraft();
      setStep(2); // skip setup, go to recipient
    } else {
      setStep(1);
    }
  };

  const goBack = () => {
    if (step === 0) {
      navigate(-1);
    } else if (step === 2 && buildChoice === "blank") {
      setStep(0); // go back to How
    } else {
      setStep((s) => s - 1);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar: back + progress + close */}
      <div className="flex items-center gap-3 px-4 pt-safe pb-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={goBack}
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <Progress value={progressValue} className="h-1 rounded-full" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={() => navigate(-1)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <p className="px-4 text-[11px] font-medium text-muted-foreground">
        Step {step + 1} of {TOTAL_STEPS} — {STEP_LABELS[step]}
      </p>

      {/* Scrollable step content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto w-full max-w-lg">
          <div key={step} className="animate-in fade-in duration-200">
            {step === 0 && (
              <StepHow aiUnlocked={aiUnlocked} onChoose={handleHow} />
            )}

            {step === 1 && buildChoice && (
              <StepSetup
                choice={buildChoice}
                aiUnlocked={aiUnlocked}
                savedTemplates={savedTemplates}
                draft={draft}
                chatMessages={chatMessages}
                isGenerating={isGenerating}
                onSelectTemplate={onSelectTemplate}
                onAiPrompt={onAiPrompt}
                onNext={goNext}
              />
            )}

            {step === 2 && draft && (
              <StepRecipient draft={draft} onChange={onDraftChange} onNext={goNext} />
            )}

            {step === 3 && draft && (
              <StepPhotos draft={draft} onChange={onDraftChange} onNext={goNext} />
            )}

            {step === 4 && draft && (
              <StepQuestions draft={draft} onChange={onDraftChange} onNext={goNext} />
            )}

            {step === 5 && draft && (
              <StepReview
                draft={draft}
                onChange={onDraftChange}
                onCreate={onCreate}
                onSaveAsGuide={onSaveAsGuide}
                isSaving={isCreating}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
