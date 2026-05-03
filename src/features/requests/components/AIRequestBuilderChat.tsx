import { useMemo, useState } from "react";
import { ArrowRight, Camera, CheckCircle2, Loader2, MessageCircleQuestion, Minus, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface AiBuilderMessage {
  id: string;
  from: "user" | "assistant";
  text: string;
  pending?: boolean;
}

interface AIRequestBuilderChatProps {
  messages: AiBuilderMessage[];
  isGenerating: boolean;
  onSubmit: (prompt: string) => void;
}

const EXAMPLES = [
  "Junk removal quote",
  "Appliance repair intake",
  "Roof leak review",
  "Product return photos",
];

function listFromText(value: string) {
  return value
    .split("\n")
    .map((line) => line.replace(/^[-•\d.)\s]+/, "").trim())
    .filter(Boolean);
}

function buildPrompt(args: {
  purpose: string;
  photoCount: number;
  mustCapture: string;
  questions: string;
  extraContext: string;
}) {
  const photos = listFromText(args.mustCapture);
  const questions = listFromText(args.questions);
  return [
    `Create a simple PhotoBrief request template for: ${args.purpose}.`,
    `Use exactly ${args.photoCount} photo step${args.photoCount === 1 ? "" : "s"}.`,
    photos.length
      ? `The photo steps must include these requested photos, in a sensible order:\n${photos.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
      : "Choose the simplest useful photo steps for this request.",
    questions.length
      ? `Include these required customer questions:\n${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : "Only add customer questions if they are truly necessary.",
    args.extraContext.trim() ? `Extra context: ${args.extraContext.trim()}` : null,
    "Keep the result consumer-simple: short titles, plain instructions, no admin language, no jargon.",
  ].filter(Boolean).join("\n\n");
}

/** Guided AI setup for request/template creation. */
export function AIRequestBuilderChat({ messages, isGenerating, onSubmit }: AIRequestBuilderChatProps) {
  const [purpose, setPurpose] = useState("");
  const [photoCount, setPhotoCount] = useState(3);
  const [mustCapture, setMustCapture] = useState("");
  const [questions, setQuestions] = useState("");
  const [extraContext, setExtraContext] = useState("");

  const photoLines = useMemo(() => listFromText(mustCapture), [mustCapture]);
  const questionLines = useMemo(() => listFromText(questions), [questions]);
  const ready = purpose.trim().length > 2;

  const submit = () => {
    if (!ready || isGenerating) return;
    onSubmit(buildPrompt({ purpose, photoCount, mustCapture, questions, extraContext }));
  };

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 p-4 shadow-[0_24px_70px_-45px_hsl(222_47%_11%/0.5)] backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Build with AI</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Answer a few quick things first. Then I’ll make a clean request you can edit before sending.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">What is this request for?</label>
            <Input
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. junk removal quote"
              className="h-12 rounded-2xl bg-background/80 text-base"
              disabled={isGenerating}
            />
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPurpose(example)}
                  disabled={isGenerating}
                  className="rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-primary shadow-sm">
                  <Camera className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">How many photos?</p>
                  <p className="text-xs text-muted-foreground">Most requests work best with 2–5.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-background p-1 shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={isGenerating || photoCount <= 1}
                  onClick={() => setPhotoCount((n) => Math.max(1, n - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-7 text-center text-sm font-semibold text-foreground">{photoCount}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={isGenerating || photoCount >= 8}
                  onClick={() => setPhotoCount((n) => Math.min(8, n + 1))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Any photos that must be included?</label>
            <Textarea
              value={mustCapture}
              onChange={(e) => setMustCapture(e.target.value)}
              placeholder={"One per line, optional\nWide photo of the whole area\nClose-up of the issue\nPhoto of the label or model number"}
              rows={4}
              className="rounded-2xl bg-background/80 text-sm"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              {photoLines.length ? `${photoLines.length} specific photo${photoLines.length === 1 ? "" : "s"} included.` : "Leave blank and AI will choose the simplest useful set."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <MessageCircleQuestion className="h-4 w-4 text-primary" /> Required questions
            </label>
            <Textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={"One per line, optional\nWhen did this start?\nWhat is the best time to contact you?"}
              rows={3}
              className="rounded-2xl bg-background/80 text-sm"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              {questionLines.length ? `${questionLines.length} question${questionLines.length === 1 ? "" : "s"} will be included.` : "Photos first. Questions only when they help."}
            </p>
          </div>

          <details className="rounded-2xl border bg-background/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">Add extra context</summary>
            <Textarea
              value={extraContext}
              onChange={(e) => setExtraContext(e.target.value)}
              placeholder="Anything the AI should know, like tone, industry, or what the business needs to decide."
              rows={3}
              className="mt-3 rounded-2xl bg-card text-sm"
              disabled={isGenerating}
            />
          </details>

          <Button
            type="button"
            size="lg"
            className="h-14 w-full rounded-2xl text-base shadow-glow"
            onClick={submit}
            disabled={!ready || isGenerating}
          >
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isGenerating ? "Building…" : "Build request"}
            {!isGenerating ? <ArrowRight className="ml-2 h-5 w-5" /> : null}
          </Button>
        </div>
      </section>

      {messages.length > 0 ? (
        <section className="space-y-2 rounded-[1.5rem] border bg-background/70 p-3">
          {messages.slice(-2).map((m) => (
            <div key={m.id} className={cn("rounded-2xl p-3 text-sm", m.from === "user" ? "bg-primary/10 text-foreground" : "bg-card text-muted-foreground")}>
              {m.pending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Building your draft…
                </span>
              ) : m.from === "assistant" ? (
                <span className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {m.text}
                </span>
              ) : (
                <span className="line-clamp-3">{m.text}</span>
              )}
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
