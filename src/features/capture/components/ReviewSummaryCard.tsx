import { Send, ImageIcon, MessageCircleQuestion, Loader2, CheckCircle2, AlertTriangle, RotateCw } from "lucide-react";
import { microcopy } from "@/config/microcopy";
import type { CapturedPhoto, AnsweredQuestion } from "@/types/chat";
import type { PhotoGuide } from "@/types/photobrief";
import type { RecipientErrorDescriptor } from "@/lib/errorCodes";

interface ReviewSummaryCardProps {
  guide: PhotoGuide;
  photos: CapturedPhoto[];
  answers: AnsweredQuestion[];
  onSubmit: () => void;
  submitting?: boolean;
  submitError?: RecipientErrorDescriptor | null;
}

export function ReviewSummaryCard({ guide, photos, answers, onSubmit, submitting, submitError }: ReviewSummaryCardProps) {
  return (
    <div className="space-y-6">
      <div className="border border-border bg-card p-6 text-center">
        <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
          <span className="text-[hsl(var(--accent-kinetic))]">[ 03 ]</span>
          <span>Final review</span>
        </p>
        <span className="mx-auto mt-5 flex h-12 w-12 items-center justify-center border border-[hsl(var(--accent-kinetic))] text-[hsl(var(--accent-kinetic))]">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-[Geist,Inter,system-ui,sans-serif] text-2xl font-semibold tracking-tight text-foreground">
          {microcopy.recipient.reviewTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Check everything once, then send it over.
        </p>
      </div>

      <section className="space-y-3">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" /> Photos
          </div>
          <span className="font-mono text-[0.7rem] tabular-nums uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
            [ {String(photos.length).padStart(2, "0")} ]
          </span>
        </header>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((p, i) => {
            const step = guide.steps.find((s) => s.id === p.stepId);
            return (
              <div key={`${p.stepId}-${i}`} className="overflow-hidden border border-border bg-background">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.previewUrl}
                    alt={step?.title ?? "Photo"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="line-clamp-2 px-2.5 py-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {step?.title ?? "Photo"}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {answers.length > 0 ? (
        <section className="space-y-3">
          <header className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            <MessageCircleQuestion className="h-3.5 w-3.5" /> Answers
          </header>
          <ul className="space-y-2">
            {answers.map((a) => (
              <li key={a.questionId} className="border border-border bg-card p-4">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{a.prompt}</p>
                <p className="mt-1.5 text-[15px] text-foreground">{a.answer}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {submitError ? (
        <div
          role="alert"
          aria-live="assertive"
          className="border border-destructive/40 bg-destructive/10 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-destructive">
                <span>[ {submitError.code} ]</span>
                <span className="text-muted-foreground">{submitError.tag}</span>
              </p>
              <p className="mt-1.5 text-[15px] font-semibold text-foreground">{submitError.headline}</p>
              <p className="mt-1 text-sm text-muted-foreground">{submitError.body}</p>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        aria-busy={submitting}
        className="inline-flex h-14 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-6 font-[Geist,Inter,system-ui,sans-serif] text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : submitError ? (
          <RotateCw className="h-5 w-5" />
        ) : (
          <Send className="h-5 w-5" />
        )}
        {submitting ? "Sending…" : submitError ? "Try again" : microcopy.recipient.submit}
      </button>
    </div>
  );
}
