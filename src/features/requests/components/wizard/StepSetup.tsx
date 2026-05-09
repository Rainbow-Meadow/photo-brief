import { TemplatePicker } from "@/features/requests/components/TemplatePicker";
import { AIRequestBuilderChat, type AiBuilderMessage } from "@/features/requests/components/AIRequestBuilderChat";
import { UpgradePromptCard } from "@/components/shared/UpgradePromptCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { BuildChoice } from "./StepHow";
import type { PhotoGuide } from "@/types/photobrief";
import type { RequestDraft } from "@/types/requestDraft";

interface StepSetupProps {
  choice: BuildChoice;
  aiUnlocked: boolean;
  savedTemplates: PhotoGuide[];
  draft: RequestDraft | null;
  chatMessages: AiBuilderMessage[];
  isGenerating: boolean;
  onSelectTemplate: (guide: PhotoGuide) => void;
  onAiPrompt: (prompt: string) => void;
  onNext: () => void;
}

export function StepSetup({
  choice,
  aiUnlocked,
  savedTemplates,
  draft,
  chatMessages,
  isGenerating,
  onSelectTemplate,
  onAiPrompt,
  onNext,
}: StepSetupProps) {
  if (choice === "template") {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Pick a template</h2>
        <p className="text-sm text-muted-foreground">Select one to pre-fill your request.</p>
        <TemplatePicker
          guides={savedTemplates}
          selectedGuideId={draft?.source === "template" ? draft.baseGuideId : undefined}
          onSelect={(g) => {
            onSelectTemplate(g);
            setTimeout(onNext, 150);
          }}
        />
      </div>
    );
  }

  if (choice === "ai") {
    return (
      <div className="space-y-4">
        {aiUnlocked ? (
          <>
            <AIRequestBuilderChat
              messages={chatMessages}
              isGenerating={isGenerating}
              onSubmit={onAiPrompt}
            />
            {draft && (
              <Button
                size="lg"
                className="h-14 w-full rounded-[0.25rem] text-base"
                onClick={onNext}
              >
                Continue with this draft <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </>
        ) : (
          <UpgradePromptCard feature="ai_request_builder" />
        )}
      </div>
    );
  }

  return null;
}
