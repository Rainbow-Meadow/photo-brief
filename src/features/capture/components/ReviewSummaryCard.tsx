import { Send, ImageIcon, MessageCircleQuestion, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { microcopy } from "@/config/microcopy";
import type { CapturedPhoto, AnsweredQuestion } from "@/types/chat";
import type { PhotoGuide } from "@/types/photobrief";

interface ReviewSummaryCardProps {
  guide: PhotoGuide;
  photos: CapturedPhoto[];
  answers: AnsweredQuestion[];
  onSubmit: () => void;
  submitting?: boolean;
}

export function ReviewSummaryCard({ guide, photos, answers, onSubmit, submitting }: ReviewSummaryCardProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {microcopy.recipient.reviewTitle}
        </h2>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Check everything once, then send it over.
        </p>
      </div>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" /> Photos
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {photos.length}
          </span>
        </header>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((p, i) => {
            const step = guide.steps.find((s) => s.id === p.stepId);
            return (
              <div key={`${p.stepId}-${i}`} className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/60">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.previewUrl}
                    alt={step?.title ?? "Photo"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="line-clamp-2 px-2.5 py-2 text-xs leading-tight text-muted-foreground">
                  {step?.title ?? "Photo"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {answers.length > 0 ? (
        <section className="space-y-3">
          <header className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> Answers
          </header>
          <ul className="space-y-2">
            {answers.map((a) => (
              <li key={a.questionId} className="rounded-2xl border bg-background/70 p-4 text-[15px]">
                <p className="font-medium text-foreground">{a.prompt}</p>
                <p className="mt-1.5 text-foreground/80">{a.answer}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Button size="lg" className="h-14 w-full rounded-2xl text-base shadow-glow" onClick={onSubmit} disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
        {submitting ? "Sending…" : microcopy.recipient.submit}
      </Button>
    </div>
  );
}
