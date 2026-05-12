import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { getTokenClient } from "@/integrations/supabase/tokenClient";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, Camera, CheckCircle2, Clock3, LockKeyhole, MessageCircleQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CaptureUploadCard } from "@/features/capture/components/CaptureUploadCard";
import { AIFeedbackMessage } from "@/features/capture/components/AIFeedbackMessage";
import { RetakeDecisionCard } from "@/features/capture/components/RetakeDecisionCard";
import { QuestionCard } from "@/features/capture/components/QuestionCard";
import { ReviewSummaryCard } from "@/features/capture/components/ReviewSummaryCard";
import { SubmitConfirmationCard } from "@/features/capture/components/SubmitConfirmationCard";
import { RecipientBrandingProvider } from "@/features/capture/RecipientBrandingContext";
import { loadRecipientContext, RecipientLoadError, type RecipientContext, type RecipientLoadDiagnostics } from "@/features/capture/recipientContext";
import { resolveRecipientError } from "@/lib/errorCodes";
import { DiagnosticsPanel } from "@/components/shared/DiagnosticsPanel";
import { useChatFlow } from "@/hooks/useChatFlow";
import { r2MediaService } from "@/services/r2MediaService";
import { submissionsService } from "@/services/submissionsService";
import { conversions, trackEvent } from "@/lib/analytics";
import { pushCaptureEvent } from "@/services/captureAgentService";
import type { CapturedPhoto, ChatMessage } from "@/types/chat";
import type { ContextQuestion, GuideStep, PhotoGuide } from "@/types/photobrief";

export default function PublicRecipientPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [ctx, setCtx] = useState<RecipientContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<RecipientLoadDiagnostics | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRecipientContext(token)
      .then((c) => {
        if (!cancelled) setCtx(c);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? "PB-500");
        if (e instanceof RecipientLoadError) {
          setDiagnostics(e.diagnostics);
        } else {
          setDiagnostics({ token: token?.slice(-6) });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (error) {
    const desc = resolveRecipientError(error);
    const diag = diagnostics ?? { token: token?.slice(-6) };
    return (
      <div className="flex min-h-[60svh] items-center justify-center px-4">
        <article className="w-full max-w-md border border-border bg-card p-7 text-center">
          <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span className="text-[hsl(var(--accent-kinetic))]">[ {desc.code} ]</span>
            <span>{desc.tag}</span>
          </p>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{desc.headline}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc.body}</p>
          <div className="mx-auto mt-5 flex h-10 w-10 items-center justify-center border border-border text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
          </div>
          <div className="mt-6">
            <DiagnosticsPanel
              code={desc.code}
              fields={[
                { label: "Token", value: diag.token ?? token?.slice(-6) },
                { label: "Request ID", value: diag.requestId ?? null },
                { label: "Workspace", value: diag.workspaceName ?? diag.workspaceId ?? null },
                { label: "Guide attached", value: diag.guideIdPresent },
                { label: "Guide loaded", value: diag.guideLoaded },
                { label: "Status", value: diag.status ?? null },
              ]}
            />
          </div>
        </article>
      </div>
    );
  }
  if (!ctx) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center px-4">
        <article className="w-full max-w-md border border-border bg-card p-7 text-center">
          <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
            <span>Loading</span>
          </p>
          <div className="mx-auto mt-5 h-8 w-8 animate-pulse bg-muted" />
          <p className="mt-4 text-sm text-muted-foreground">Opening your photo request…</p>
        </article>
      </div>
    );
  }

  return <RecipientWorkflow ctx={ctx} token={token} navigate={navigate} />;
}

/* ─── Main workflow ─── */

function RecipientWorkflow({ ctx, token, navigate }: { ctx: RecipientContext; token: string | undefined; navigate: (to: string) => void }) {
  const submissionIdRef = useRef<string | null>(ctx.resubmit?.submissionId ?? null);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const uploadCapture = useCallback(
    async ({ stepId, blob, ext }: { stepId: string; blob: Blob; ext: string }) => {
      if (!token || !ctx.workspaceId || !ctx.requestId) throw new Error("No token context");
      const result = await r2MediaService.uploadOriginalForAnalysis({
        token,
        requestId: ctx.requestId,
        workspaceId: ctx.workspaceId,
        stepId,
        submissionId: submissionIdRef.current,
        recipientName: ctx.recipientName,
        file: blob,
        ext,
      });
      submissionIdRef.current = result.submissionId;
      return {
        publicUrl: result.publicUrl,
        storagePath: result.storagePath,
        capturedMediaId: result.capturedMediaId,
        submissionId: result.submissionId,
      };
    },
    [token, ctx.workspaceId, ctx.requestId, ctx.recipientName],
  );

  const promoteAcceptedCapture = useCallback(
    async (photo: CapturedPhoto) => {
      if (!token || !photo.capturedMediaId || !photo.originalFile) return;
      return r2MediaService.promoteAcceptedPhotoToWebp({
        token,
        capturedMediaId: photo.capturedMediaId,
        file: photo.originalFile,
      });
    },
    [token],
  );

  const resubmitConfig = ctx.resubmit
    ? {
        commentsByStepId: ctx.resubmit.items.reduce<Record<string, string>>((acc, it) => {
          acc[it.stepId] = it.comment;
          return acc;
        }, {}),
        summaryMessage: ctx.resubmit.summaryMessage,
      }
    : undefined;

  const flow = useChatFlow({
    guide: ctx.guide,
    businessName: ctx.businessName,
    introBody: ctx.introBody,
    requestToken: token,
    requestId: ctx.requestId,
    uploadCapture,
    promoteAcceptedCapture,
    resubmit: resubmitConfig,
  });

  const active = useMemo(() => latestAction(flow.messages), [flow.messages]);
  const latestFeedback = useMemo(() => latestOf(flow.messages, "ai_feedback"), [flow.messages]);
  const latestRetake = useMemo(() => latestOf(flow.messages, "retake_decision"), [flow.messages]);
  const currentPhotoStep = active?.kind === "capture_card" ? active.step : active?.kind === "photo_prompt" ? active.step : latestRetake?.step;
  const currentPhotoIndex = currentPhotoStep ? ctx.guide.steps.findIndex((s) => s.id === currentPhotoStep.id) + 1 : 0;
  const estimatedMinutes = Math.max(2, Math.min(5, ctx.guide.steps.length + Math.ceil(ctx.guide.questions.length / 2)));

  // Analytics
  const lastDoneRef = useRef(0);
  useEffect(() => {
    if (flow.progress.done > lastDoneRef.current) {
      trackEvent("step_completed", {
        guide_id: ctx.guide.id,
        step_index: flow.progress.done,
        total_steps: flow.progress.total,
      });
      lastDoneRef.current = flow.progress.done;
    }
  }, [flow.progress.done, flow.progress.total, ctx.guide.id]);

  // Session persistence
  useEffect(() => {
    if (!token) return;
    const key = `pb:recipient:${token}`;
    try {
      const snapshot = {
        submissionId: submissionIdRef.current,
        answers: flow.answers,
        uploadedPaths: flow.photos
          .filter((p) => !!p.storagePath)
          .map((p) => ({ stepId: p.stepId, storagePath: p.storagePath })),
        savedAt: Date.now(),
      };
      sessionStorage.setItem(key, JSON.stringify(snapshot));
    } catch {
      // sessionStorage can throw in private mode — non-fatal.
    }
  }, [token, flow.answers, flow.photos, flow.progress.done]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    flow.submitAll();
    trackEvent("submission_completed", {
      guide_id: ctx.guide.id,
      photos: flow.photos.length,
      answers: flow.answers.length,
      resubmit: !!ctx.resubmit,
    });
    if (!ctx.requestId || !ctx.workspaceId || !token) {
      setTimeout(() => navigate(`/r/${token ?? "demo"}/done`), 1200);
      return;
    }
    try {
      const submission = await submissionsService.submitFromRecipient({
        token,
        requestId: ctx.requestId,
        workspaceId: ctx.workspaceId,
        recipientName: ctx.recipientName,
        existingSubmissionId: submissionIdRef.current ?? undefined,
        photos: [],
        answers: flow.answers,
      });

      conversions.recipientSubmissionCompleted({
        guide_id: ctx.guide.id,
        request_id: ctx.requestId,
        submission_id: submission.id,
        photos: flow.photos.length,
        answers: flow.answers.length,
        resubmit: !!ctx.resubmit,
      });

      if (ctx.resubmit && ctx.resubmit.items.length > 0) {
        const client = getTokenClient(token);
        const ids = ctx.resubmit.items.map((it) => it.rejectedMediaId);
        const { error: markErr } = await client.from("captured_media").update({ status: "resubmitted" }).in("id", ids);
        if (markErr) console.warn("mark resubmitted failed", markErr);
      }

      setTimeout(() => navigate(`/r/${token}/done`), 1200);
    } catch (err) {
      console.error("Submission failed", err);
      setSubmitting(false);
      toast.error("We couldn't send your photos — please try again.");
    }
  };

  // Derive a unique key for transitions
  const stepKey = active?.id ?? flow.phase;

  return (
    <RecipientBrandingProvider
      value={{
        businessName: ctx.businessName,
        brandColor: ctx.brandColor,
        logoUrl: ctx.logoUrl,
        hidePhotobriefBranding: ctx.hidePhotobriefBranding,
      }}
    >
      <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-xl flex-col">
        {/* Slim progress bar – always visible once started */}
        {started && flow.phase !== "submitted" && (
          <ProgressBar
            title={ctx.guide.name}
            done={flow.progress.done}
            total={flow.progress.total}
            currentLabel={
              currentPhotoStep
                ? `Photo ${currentPhotoIndex} of ${ctx.guide.steps.length}`
                : flow.phase === "questions"
                  ? "Question"
                  : flow.phase === "review"
                    ? "Review"
                    : "Done"
            }
          />
        )}

        {/* Single step content area */}
        <div className="flex flex-1 flex-col justify-center px-1 py-4">
          <div
            key={stepKey}
            className="animate-in fade-in duration-200"
          >
            {!started && flow.phase !== "submitted" ? (
              <WelcomeScreen
                businessName={ctx.businessName}
                guideName={ctx.guide.name}
                introBody={ctx.introBody}
                photoCount={ctx.guide.steps.length}
                questionCount={ctx.guide.questions.length}
                estimatedMinutes={estimatedMinutes}
                isResubmit={!!ctx.resubmit}
                onStart={() => {
                  setStarted(true);
                  trackEvent("recipient_started", { guide_id: ctx.guide.id, photos: ctx.guide.steps.length, questions: ctx.guide.questions.length });
                  if (ctx.requestId) {
                    pushCaptureEvent(ctx.requestId, {
                      type: "session_started",
                      totalSteps: ctx.guide.steps.length,
                    });
                  }
                }}
              />
            ) : (
              <StepContent
                phase={flow.phase}
                active={active}
                latestFeedback={latestFeedback}
                latestRetake={latestRetake}
                guide={ctx.guide}
                businessName={ctx.businessName}
                photos={flow.photos}
                answers={flow.answers}
                submitting={submitting}
                onCapture={flow.submitPhoto}
                onSkip={flow.skipPhoto}
                onRetake={flow.retake}
                onUseAnyway={flow.useAnyway}
                onAnswer={flow.answerQuestion}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </div>
    </RecipientBrandingProvider>
  );
}

/* ─── Slim progress bar ─── */

function ProgressBar({ title, done, total, currentLabel }: { title: string; done: number; total: number; currentLabel: string }) {
  const pct = total === 0 ? 0 : (done / total) * 100;
  return (
    <div className="touch-blur-reduce sticky top-14 z-20 border-b border-border bg-background/95 px-1 pb-2 pt-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em]">
        <p className="truncate text-muted-foreground">{currentLabel}</p>
        <span className="shrink-0 tabular-nums text-[hsl(var(--accent-kinetic))]">
          [ {String(done).padStart(2, "0")} / {String(total).padStart(2, "0")} ]
        </span>
      </div>
      <div className="mt-1.5 h-px w-full bg-border">
        <div
          className="h-px bg-[hsl(var(--accent-kinetic))] transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ─── Welcome screen ─── */

function WelcomeScreen({
  businessName,
  guideName,
  introBody,
  photoCount,
  questionCount,
  estimatedMinutes,
  isResubmit,
  onStart,
}: {
  businessName: string;
  guideName: string;
  introBody?: string;
  photoCount: number;
  questionCount: number;
  estimatedMinutes: number;
  isResubmit: boolean;
  onStart: () => void;
}) {
  return (
    <section className="relative border border-border bg-card p-6 sm:p-8">
      <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
        <span className="text-[hsl(var(--accent-kinetic))]">[ 01 ]</span>
        <span className="inline-flex items-center gap-1.5"><LockKeyhole className="h-3 w-3" /> Secure photo request</span>
      </p>
      <h1 className="mt-5 font-[Geist,Inter,system-ui,sans-serif] text-[clamp(1.6rem,4vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
        {isResubmit ? "Quick retake request" : `${businessName} needs a few photos`}
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
        {introBody || `Follow the steps for ${guideName}. It should take about ${estimatedMinutes} minutes.`}
      </p>

      <div className="mt-6 grid grid-cols-3 border-t border-border">
        <MiniStat icon={Camera} value={photoCount} label={photoCount === 1 ? "photo" : "photos"} />
        <MiniStat icon={MessageCircleQuestion} value={questionCount} label={questionCount === 1 ? "question" : "questions"} />
        <MiniStat icon={Clock3} value={`~${estimatedMinutes}`} label="min" />
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-7 inline-flex h-14 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-6 font-[Geist,Inter,system-ui,sans-serif] text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]"
      >
        Start <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
        Review everything before sending
      </p>
    </section>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: typeof Camera; value: string | number; label: string }) {
  return (
    <div className="border-r border-border p-3 text-center last:border-r-0">
      <Icon className="mx-auto h-3.5 w-3.5 text-[hsl(var(--accent-kinetic))]" />
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">{value}</p>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── Step content (one visible step at a time) ─── */

function StepContent({
  phase,
  active,
  latestFeedback,
  latestRetake,
  guide,
  businessName,
  photos,
  answers,
  submitting,
  onCapture,
  onSkip,
  onRetake,
  onUseAnyway,
  onAnswer,
  onSubmit,
}: {
  phase: string;
  active?: ChatMessage;
  latestFeedback?: Extract<ChatMessage, { kind: "ai_feedback" }>;
  latestRetake?: Extract<ChatMessage, { kind: "retake_decision" }>;
  guide: PhotoGuide;
  businessName: string;
  photos: CapturedPhoto[];
  answers: { questionId: string; prompt: string; answer: string }[];
  submitting: boolean;
  onCapture: (previewUrl: string, file: File | null) => void;
  onSkip: () => void;
  onRetake: () => void;
  onUseAnyway: (photo: CapturedPhoto) => void;
  onAnswer: (answer: string) => void;
  onSubmit: () => void;
}) {
  const guideSteps = guide.steps;

  if (phase === "submitted") {
    return (
      <StepCard>
        <SubmitConfirmationCard businessName={businessName} />
      </StepCard>
    );
  }

  if (phase === "review") {
    return (
      <StepCard>
        <ReviewSummaryCard
          guide={guide}
          photos={photos}
          answers={answers}
          onSubmit={onSubmit}
          submitting={submitting}
        />
      </StepCard>
    );
  }

  // Retake decision screen
  if (latestRetake && active?.kind !== "capture_card") {
    return (
      <StepCard>
        <StepHeader step={latestRetake.step} index={guideSteps.findIndex((s) => s.id === latestRetake.step.id) + 1} total={guideSteps.length} />
        <div className="mt-5 overflow-hidden border border-border bg-muted">
          <img src={latestRetake.photo.previewUrl} alt="Submitted" className="max-h-[40svh] w-full object-cover" />
        </div>
        <div className="mt-4">
          <AIFeedbackMessage photo={latestRetake.photo} verdict={latestRetake.photo.checks.some((c) => c.severity === "fail") ? "fail" : "warn"} />
        </div>
        <div className="mt-4">
          <RetakeDecisionCard photo={latestRetake.photo} step={latestRetake.step} onRetake={onRetake} onUseAnyway={onUseAnyway} />
        </div>
      </StepCard>
    );
  }

  // Question screen
  if (active?.kind === "question") {
    return (
      <StepCard>
        <div className="mb-5 flex h-10 w-10 items-center justify-center border border-border text-[hsl(var(--accent-kinetic))]">
          <MessageCircleQuestion className="h-4 w-4" />
        </div>
        <QuestionCard question={active.question as ContextQuestion} onAnswer={onAnswer} />
      </StepCard>
    );
  }

  // Photo capture screen
  const capture = active?.kind === "capture_card" ? active : undefined;
  const step = capture?.step ?? (active?.kind === "photo_prompt" ? active.step : guideSteps[0]);
  const index = step ? guideSteps.findIndex((s) => s.id === step.id) + 1 : 1;
  const photoForStep = step ? photos.find((p) => p.stepId === step.id) : undefined;

  return (
    <StepCard>
      <StepHeader step={step} index={index} total={guideSteps.length} />
      {photoForStep ? (
        <div className="mt-5 overflow-hidden border border-border bg-muted">
          <img src={photoForStep.previewUrl} alt="Completed" className="max-h-[40svh] w-full object-cover" />
        </div>
      ) : null}
      {latestFeedback && latestFeedback.photo.stepId === step.id ? (
        <div className="mt-4">
          <AIFeedbackMessage photo={latestFeedback.photo} verdict={latestFeedback.verdict} />
        </div>
      ) : null}
      <div className="mt-6">
        <CaptureUploadCard step={step} pending={capture?.pending ?? false} onCapture={onCapture} onSkip={!step.required ? onSkip : undefined} stepIndex={Math.max(0, index - 1)} />
      </div>
    </StepCard>
  );
}

/* ─── Shared card wrapper ─── */

function StepCard({ children }: { children: ReactNode }) {
  return (
    <section className="border border-border bg-card p-5 sm:p-6">
      {children}
    </section>
  );
}

function StepHeader({ step, index, total }: { step: GuideStep; index: number; total: number }) {
  return (
    <header>
      <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
        <span className="text-[hsl(var(--accent-kinetic))]">[ {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")} ]</span>
        <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Photo</span>
      </p>
      <h2 className="mt-4 font-[Geist,Inter,system-ui,sans-serif] text-xl font-semibold leading-tight tracking-[-0.022em] text-foreground sm:text-2xl">{step.title}</h2>
      {step.instructions ? <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{step.instructions}</p> : null}
    </header>
  );
}

/* ─── Helpers ─── */

function latestAction(messages: ChatMessage[]): ChatMessage | undefined {
  const actionKinds = new Set(["capture_card", "question", "review_summary", "submit_confirmation", "retake_decision", "photo_prompt"]);
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (actionKinds.has(messages[i].kind)) return messages[i];
  }
  return undefined;
}

function latestOf<K extends ChatMessage["kind"]>(messages: ChatMessage[], kind: K): Extract<ChatMessage, { kind: K }> | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].kind === kind) return messages[i] as Extract<ChatMessage, { kind: K }>;
  }
  return undefined;
}
