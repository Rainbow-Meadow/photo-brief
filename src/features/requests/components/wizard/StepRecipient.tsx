import { ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RequestDraft } from "@/types/requestDraft";

interface StepRecipientProps {
  draft: RequestDraft;
  onChange: (draft: RequestDraft) => void;
  onNext: () => void;
}

export function StepRecipient({ draft, onChange, onNext }: StepRecipientProps) {
  const set = <K extends keyof RequestDraft>(key: K, value: RequestDraft[K]) =>
    onChange({ ...draft, [key]: value });

  const canContinue = draft.recipientName.trim() && draft.recipientContact.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <User className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Who is this for?</h2>
          <p className="text-sm text-muted-foreground">Your customer's contact info.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Customer name</Label>
          <Input
            value={draft.recipientName}
            onChange={(e) => set("recipientName", e.target.value)}
            placeholder="e.g. Maria Alvarez"
            className="h-12 rounded-2xl bg-background/80 text-base"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Email or phone</Label>
          <Input
            value={draft.recipientContact}
            onChange={(e) => set("recipientContact", e.target.value)}
            placeholder="email@example.com or 555-0142"
            className="h-12 rounded-2xl bg-background/80 text-base"
          />
          <p className="text-xs text-muted-foreground">
            If you enter an email, we'll send the request automatically.
          </p>
        </div>
      </div>

      <Button
        size="lg"
        className="h-14 w-full rounded-2xl text-base shadow-glow"
        disabled={!canContinue}
        onClick={onNext}
      >
        Continue <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}
