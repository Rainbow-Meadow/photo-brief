import { Camera, MessageCircleQuestion, Save, Link as LinkIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GeneratedStepEditor } from "./GeneratedStepEditor";
import { GeneratedQuestionEditor } from "./GeneratedQuestionEditor";
import type { RequestDraft } from "@/types/requestDraft";

interface RequestDraftPreviewProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onCreate: () => void;
  onSaveAsGuide: () => void;
  isSaving?: boolean;
}

/** Simple editable review surface before sending/saving a request. */
export function RequestDraftPreview({
  draft,
  onChange,
  onCreate,
  onSaveAsGuide,
  isSaving,
}: RequestDraftPreviewProps) {
  const set = <K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) =>
    onChange({ ...draft, [key]: value });

  const canCreate = draft.recipientName.trim() && draft.recipientContact.trim();

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-[0_24px_70px_-45px_hsl(222_47%_11%/0.5)] backdrop-blur sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ready to edit</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{draft.title || "Photo request"}</h2>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {draft.steps.length} photo{draft.steps.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">Request name</Label>
            <Input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              className="h-12 rounded-2xl bg-background/80 text-base font-medium"
              placeholder="e.g. Junk removal quote"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Customer name</Label>
              <Input
                value={draft.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                placeholder="e.g. Maria Alvarez"
                className="h-12 rounded-2xl bg-background/80"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Email or phone</Label>
              <Input
                value={draft.recipientContact}
                onChange={(e) => set("recipientContact", e.target.value)}
                placeholder="email@example.com or 555-0142"
                className="h-12 rounded-2xl bg-background/80"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <Camera className="h-5 w-5 text-primary" /> Photos to collect
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Each item becomes one simple customer step.</p>
          </div>
        </div>
        <GeneratedStepEditor
          steps={draft.steps}
          onChange={(steps) => set("steps", steps)}
        />
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <MessageCircleQuestion className="h-5 w-5 text-primary" /> Questions
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">Only ask what photos can’t answer.</p>
          </div>
        </div>
        <GeneratedQuestionEditor
          questions={draft.questions}
          onChange={(questions) => set("questions", questions)}
        />
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Opening message</Label>
          <Textarea
            value={draft.introMessage}
            onChange={(e) => set("introMessage", e.target.value)}
            rows={3}
            className="rounded-2xl bg-background/80 text-sm"
          />
        </div>
        <div className="mt-3 space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Done message</Label>
          <Textarea
            value={draft.completionMessage}
            onChange={(e) => set("completionMessage", e.target.value)}
            rows={2}
            className="rounded-2xl bg-background/80 text-sm"
          />
        </div>
      </section>

      <div className="sticky bottom-4 z-20 rounded-[1.5rem] border border-border/70 bg-background/85 p-3 shadow-[0_20px_70px_-35px_hsl(222_47%_11%/0.6)] backdrop-blur-xl">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <Button
            size="lg"
            className="h-13 rounded-2xl text-base shadow-glow"
            onClick={onCreate}
            disabled={!canCreate || isSaving}
          >
            <Send className="mr-2 h-5 w-5" />
            {isSaving ? "Creating…" : "Create request"}
          </Button>
          <Button variant="outline" size="lg" className="h-13 rounded-2xl bg-background/70" onClick={onSaveAsGuide}>
            <Save className="mr-2 h-4 w-4" /> Save template
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="h-13 rounded-2xl"
            onClick={() => {
              document.getElementById("draft-preview-top")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <LinkIcon className="mr-2 h-4 w-4" /> Top
          </Button>
        </div>
        {!canCreate && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Add a customer name and email/phone to create the request.
          </p>
        )}
      </div>
    </div>
  );
}
