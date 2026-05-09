import { ArrowRight, MessageCircleQuestion, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneratedQuestionEditor } from "@/features/requests/components/GeneratedQuestionEditor";
import type { RequestDraft } from "@/types/requestDraft";

interface StepQuestionsProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onNext: () => void;
}

export function StepQuestions({ draft, onChange, onNext }: StepQuestionsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <MessageCircleQuestion className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Questions</h2>
          <p className="text-sm text-muted-foreground">Only ask what photos can't answer.</p>
        </div>
      </div>

      <GeneratedQuestionEditor
        questions={draft.questions}
        onChange={(questions) => onChange({ ...draft, questions })}
      />

      <Button
        size="lg"
        className="h-14 w-full rounded-[0.25rem] text-base"
        onClick={onNext}
      >
        {draft.questions.length === 0 ? (
          <>
            Skip questions <SkipForward className="ml-2 h-5 w-5" />
          </>
        ) : (
          <>
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
    </div>
  );
}
