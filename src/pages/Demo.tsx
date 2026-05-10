import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Section, Container } from "@/pages/landing/schema";
import { PageMeta } from "@/hooks/seo/usePageMeta";

type Stage = "service" | "scenario" | "clarify" | "contact" | "generating";

interface DraftPreview {
  title: string;
  introMessage?: string;
  steps: { title: string; instruction: string }[];
}

const SERVICE_CHIPS = [
  "Plumbing",
  "Roofing",
  "HVAC",
  "Auto repair",
  "Property management",
  "Landscaping",
  "Junk removal",
  "Cleaning",
];

export default function DemoPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("service");
  const [serviceType, setServiceType] = useState("");
  const [scenario, setScenario] = useState("");
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [clarifierAnswer, setClarifierAnswer] = useState("");
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [draft, setDraft] = useState<DraftPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function callDiscovery(opts: { finalize?: boolean } = {}) {
    setBusy(true);
    setError(null);
    try {
      const { data, error: invokeErr } = await supabase.functions.invoke("demo-discovery", {
        body: {
          serviceType,
          scenario,
          clarifyingQuestionAsked: clarifyingQuestion ?? undefined,
          clarifierAnswer: clarifyingQuestion ? clarifierAnswer : undefined,
          visitorName: visitorName || undefined,
          visitorEmail: visitorEmail || undefined,
          finalize: opts.finalize === true,
        },
      });
      if (invokeErr) throw invokeErr;
      const res = data as any;
      if (res?.error) throw new Error(res.error);

      if (res.status === "clarify") {
        setClarifyingQuestion(res.clarifyingQuestion);
        setStage("clarify");
        return;
      }
      if (res.status === "draft") {
        setDraft(res.draft);
        setStage("contact");
        return;
      }
      if (res.status === "ready" && res.requestLink) {
        navigate(res.requestLink);
        return;
      }
      throw new Error("Unexpected response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setStage((s) => (s === "generating" ? "contact" : s));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Try PhotoBrief on your own business — 60-second demo"
        description="Tell PhotoBrief what you do. We'll build the perfect customer photo brief and send it to you. No signup."
        canonical="https://photobrief.ai/demo"
      />
      <Section>
        <Container width="narrow">
          <div className="space-y-3 text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">[ Live demo ]</p>
            <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              See exactly what your customers would experience.
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted-foreground">
              Tell PhotoBrief what you do. In 60 seconds we'll build the brief your customers
              would walk through, then email the finished result to you.
            </p>
          </div>

          <div className="mt-10 border border-border bg-background/40 p-6 sm:p-8">
            {error ? (
              <div className="mb-4 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {stage === "service" && (
              <StepBlock
                eyebrow="Step 1 of 3"
                title="What kind of service do you provide?"
              >
                <input
                  autoFocus
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Residential plumbing"
                  className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {SERVICE_CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setServiceType(c)}
                      className="border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:border-accent hover:text-foreground"
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <PrimaryButton
                  disabled={!serviceType.trim()}
                  onClick={() => setStage("scenario")}
                >
                  Continue →
                </PrimaryButton>
              </StepBlock>
            )}

            {stage === "scenario" && (
              <StepBlock
                eyebrow="Step 2 of 3"
                title="What does a typical photo request look like for you?"
                hint={`Example: "Customer says they have a leaking faucet and we need photos to quote it."`}
              >
                <textarea
                  autoFocus
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  rows={4}
                  placeholder="Describe a real situation you handle..."
                  className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
                />
                <PrimaryButton
                  disabled={!scenario.trim() || busy}
                  onClick={() => callDiscovery()}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue →"}
                </PrimaryButton>
              </StepBlock>
            )}

            {stage === "clarify" && clarifyingQuestion && (
              <StepBlock
                eyebrow="One quick clarifier"
                title={clarifyingQuestion}
              >
                <input
                  autoFocus
                  value={clarifierAnswer}
                  onChange={(e) => setClarifierAnswer(e.target.value)}
                  placeholder="Your answer"
                  className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
                />
                <PrimaryButton
                  disabled={!clarifierAnswer.trim() || busy}
                  onClick={() => callDiscovery()}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Build my brief →"}
                </PrimaryButton>
              </StepBlock>
            )}

            {stage === "contact" && (
              <StepBlock
                eyebrow="Step 3 of 3"
                title="Where should we send the finished brief?"
                hint="We'll email you the result after you walk through the capture flow. No signup, no spam."
              >
                {draft && (
                  <div className="mb-4 border border-border bg-background/60 p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Your brief
                    </p>
                    <p className="mt-2 text-base font-semibold text-foreground">{draft.title}</p>
                    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      {draft.steps.map((s, i) => (
                        <li key={i}>
                          <span className="text-foreground">{i + 1}. {s.title}</span>
                          <span className="text-muted-foreground"> — {s.instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <input
                  autoFocus
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Your name"
                  className="mb-3 w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
                />
                <input
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
                />
                <PrimaryButton
                  disabled={!visitorEmail.trim() || !visitorName.trim() || busy}
                  onClick={() => {
                    setStage("generating");
                    callDiscovery({ finalize: true });
                  }}
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Walk through my brief →"}
                </PrimaryButton>
              </StepBlock>
            )}

            {stage === "generating" && (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Building your brief
                </p>
                <p className="text-sm text-muted-foreground">Redirecting you to the customer view…</p>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo briefs are auto-deleted after 24 hours.
          </p>
        </Container>
      </Section>
    </>
  );
}

function StepBlock({
  eyebrow, title, hint, children,
}: { eyebrow: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
        {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function PrimaryButton({
  disabled, onClick, children,
}: { disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-accent bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
