import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BetaFeedbackCardProps {
  workspaceId: string;
  requestId: string;
  submissionId: string;
}

export function BetaFeedbackCard({ workspaceId, requestId, submissionId }: BetaFeedbackCardProps) {
  const [phase, setPhase] = useState<"ask" | "text" | "done">("ask");
  const [wasUseful, setWasUseful] = useState<boolean | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(useful: boolean, text?: string) {
    setSaving(true);
    const { error } = await supabase.from("beta_feedback").insert({
      workspace_id: workspaceId,
      request_id: requestId,
      submission_id: submissionId,
      was_useful: useful,
      rating: useful ? 5 : 2,
      feedback_text: text || null,
      source: "brief_review",
    } as any);
    setSaving(false);

    if (error) {
      console.error("beta feedback insert failed", error);
      toast.error("Couldn't save feedback");
      return;
    }
    setPhase("done");
  }

  function handleChoice(useful: boolean) {
    setWasUseful(useful);
    if (useful) {
      // Save immediately for "Yes", offer optional text
      submit(useful);
    } else {
      // Show text box for "Not quite"
      setPhase("text");
    }
  }

  async function handleSubmitText() {
    if (wasUseful === null) return;
    await submit(wasUseful, feedbackText);
  }

  if (phase === "done") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        <p className="text-xs text-muted-foreground">Thanks for the feedback!</p>
      </div>
    );
  }

  if (phase === "text") {
    return (
      <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3 space-y-2.5">
        <p className="text-xs font-medium text-foreground">What would have made this better?</p>
        <Textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows={2}
          placeholder="e.g. better lighting guidance, clearer instructions…"
          className="text-xs"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="default" disabled={saving} onClick={handleSubmitText}>
            Send
          </Button>
          <Button size="sm" variant="ghost" disabled={saving} onClick={() => submit(false)}>
            Skip
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground">Was this brief useful?</span>
      <div className="flex gap-1.5 ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          disabled={saving}
          onClick={() => handleChoice(true)}
        >
          <ThumbsUp className="h-3 w-3" /> Yes
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1 text-xs"
          disabled={saving}
          onClick={() => handleChoice(false)}
        >
          <ThumbsDown className="h-3 w-3" /> Not quite
        </Button>
      </div>
    </div>
  );
}
