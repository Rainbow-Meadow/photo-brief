import { Camera, CheckCircle2, MessageCircleQuestion, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { RequestDraft } from "@/types/requestDraft";

interface StepReviewProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onCreate: () => void;
  onSaveAsGuide: () => void;
  isSaving: boolean;
}

export function StepReview({ draft, onChange, onCreate, onSaveAsGuide, isSaving }: StepReviewProps) {
  const set = <K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) =>
    onChange({ ...draft, [key]: value });

  const canCreate = draft.recipientName.trim() && draft.recipientContact.trim();

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[0.25rem] bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">Review & send</h2>
        <p className="mt-1 text-sm text-muted-foreground">Make any final edits, then send the request.</p>
      </div>

      {/* Summary cards */}
      <div className="rounded-[0.25rem] border bg-card p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Request name</Label>
          <Input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            className="h-12 rounded-[0.25rem] bg-background text-base font-medium"
          />
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm">
          <Camera className="h-4 w-4 shrink-0 text-primary" />
          <span className="text-foreground font-medium">
            {draft.steps.length} photo{draft.steps.length === 1 ? "" : "s"}
          </span>
          {draft.questions.length > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <MessageCircleQuestion className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-foreground font-medium">
                {draft.questions.length} question{draft.questions.length === 1 ? "" : "s"}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm">
          <span className="text-foreground font-medium">{draft.recipientName || "—"}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground truncate">{draft.recipientContact || "—"}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-[0.25rem] border bg-card p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Opening message</Label>
          <Textarea
            value={draft.introMessage}
            onChange={(e) => set("introMessage", e.target.value)}
            rows={3}
            className="rounded-[0.25rem] bg-background text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Done message</Label>
          <Textarea
            value={draft.completionMessage}
            onChange={(e) => set("completionMessage", e.target.value)}
            rows={2}
            className="rounded-[0.25rem] bg-background text-sm"
          />
        </div>
      </div>

      {/* Sticky send bar */}
      <div className="sticky bottom-4 z-20 rounded-[0.25rem] border bg-background/90 p-3 shadow-[0_20px_70px_-35px_hsl(222_47%_11%/0.6)] touch-blur-reduce backdrop-blur-md space-y-2">
        <Button
          size="lg"
          className="h-14 w-full rounded-[0.25rem] text-base"
          onClick={onCreate}
          disabled={!canCreate || isSaving}
        >
          <Send className="mr-2 h-5 w-5" />
          {isSaving ? "Creating…" : "Send request"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-[0.25rem] bg-background"
          onClick={onSaveAsGuide}
        >
          <Save className="mr-2 h-4 w-4" /> Save as template
        </Button>
      </div>
    </div>
  );
}
