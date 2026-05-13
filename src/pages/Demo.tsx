import { lazy, Suspense, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Section, Container, CTA, CTAGroup } from "@/design-system/schema";
import { SectionIntro } from "@/components/marketing/SectionIntro";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { UseCasesGrid } from "@/components/marketing/UseCasesGrid";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { RiseIn } from "@/components/motion/RiseIn";

const InteractiveHeroBriefAssembly = lazy(() =>
  import("@/components/marketing/InteractiveHeroBriefAssembly").then((m) => ({
    default: m.InteractiveHeroBriefAssembly,
  })),
);

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
  return (
    <>
      <PageMeta
        title="Try PhotoBrief on your own business — 60-second demo"
        description="Paste your URL. Watch PhotoBrief build the routes, ask the right questions, and hand you a brief — live, in 60 seconds. No signup."
        canonicalPath="/demo"
      />

      {/* Hero */}
      <Section>
        <Container width="narrow">
          <div className="space-y-3 text-center">
            <p className="ls-eyebrow">[ Live demo ]</p>
            <RiseIn>
              <h1 className="ls-h2 mt-6">
                Watch PhotoBrief build your intake
                <br />from your own website<span className="ls-accent-dot">.</span>
              </h1>
            </RiseIn>
            <RiseIn delay={0.1}>
              <p className="ls-subtitle mx-auto mt-8 max-w-xl">
                Paste your URL. We'll read the site, build the routes, walk one customer through, and email you the finished brief. Sixty seconds. No signup.
              </p>
            </RiseIn>
            <CTAGroup align="center">
              <CTA href="#build-yours" variant="primary" size="lg">
                Build my sample brief <ArrowRight className="h-4 w-4" />
              </CTA>
              <CTA href="#assembly" variant="secondary" size="lg">
                Watch the assembly
              </CTA>
            </CTAGroup>
          </div>
        </Container>
      </Section>

      {/* Live brief assembly */}
      <Section id="assembly" tone="alt">
        <Container>
          <SectionIntro
            eyebrow="[ Watch ]"
            title={`A website CTA → matched route → brief on your desk in 38 seconds.`}
            subtitle="Hit the steps. Watch PhotoBrief decide what to ask, when to ask for a photo, and what to hand back."
          />
          <div className="border border-border bg-background p-2 sm:p-4">
            <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
              <InteractiveHeroBriefAssembly />
            </Suspense>
          </div>
        </Container>
      </Section>

      {/* Build-your-own */}
      <Section id="build-yours">
        <Container width="narrow">
          <SectionIntro
            eyebrow="[ Try it ]"
            title="Now build the route for your business."
            subtitle="A plumber types &ldquo;leaking faucet.&rdquo; A roofer types &ldquo;missing shingles.&rdquo; PhotoBrief builds the route, decides on photos, and emails you the finished brief in 60 seconds."
          />
          <DemoDiscoveryChat />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo briefs are auto-deleted after 24 hours.
          </p>
        </Container>
      </Section>

      {/* Trades */}
      <Section tone="alt">
        <Container>
          <SectionIntro
            eyebrow="[ Built per trade ]"
            title="Different trade. Different routes. Same brief in your inbox."
            subtitle="Quiet customer? Doesn't matter. The route does the talking."
          />
          <UseCasesGrid />
        </Container>
      </Section>

      {/* Footer CTA */}
      <FinalCtaSection
        eyebrow="Like what you saw?"
        title="Lock in founding pricing"
        primary={{
          href: "/beta",
          label: (
            <>
              Apply for the beta <ArrowRight className="h-4 w-4" />
            </>
          ),
        }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}

/* ───────────── Discovery chat ───────────── */

function DemoDiscoveryChat() {
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

      if (res.status === "clarify") { setClarifyingQuestion(res.clarifyingQuestion); setStage("clarify"); return; }
      if (res.status === "draft") { setDraft(res.draft); setStage("contact"); return; }
      if (res.status === "ready" && res.requestLink) { navigate(res.requestLink); return; }
      throw new Error("Unexpected response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setStage((s) => (s === "generating" ? "contact" : s));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-border bg-background/40 p-6 sm:p-8">
      {error ? (
        <div className="mb-4 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : null}

      {stage === "service" && (
        <StepBlock eyebrow="Step 1 of 3" title="What kind of service do you provide?">
          <input
            autoFocus value={serviceType} onChange={(e) => setServiceType(e.target.value)}
            placeholder="e.g. Residential plumbing"
            className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SERVICE_CHIPS.map((c) => (
              <button
                key={c} type="button" onClick={() => setServiceType(c)}
                className="border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground hover:border-accent hover:text-foreground"
              >
                {c}
              </button>
            ))}
          </div>
          <PrimaryButton disabled={!serviceType.trim()} onClick={() => setStage("scenario")}>Continue →</PrimaryButton>
        </StepBlock>
      )}

      {stage === "scenario" && (
        <StepBlock
          eyebrow="Step 2 of 3"
          title="Walk us through a typical job that comes through your form."
          hint={`Example: "A homeowner says they have a leaking faucet and wants a quote." We'll route it and decide if photos are worth asking for.`}
        >
          <textarea
            autoFocus value={scenario} onChange={(e) => setScenario(e.target.value)} rows={4}
            placeholder="Describe a real situation you handle..."
            className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <PrimaryButton disabled={!scenario.trim() || busy} onClick={() => callDiscovery()}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue →"}
          </PrimaryButton>
        </StepBlock>
      )}

      {stage === "clarify" && clarifyingQuestion && (
        <StepBlock eyebrow="One quick clarifier" title={clarifyingQuestion}>
          <input
            autoFocus value={clarifierAnswer} onChange={(e) => setClarifierAnswer(e.target.value)}
            placeholder="Your answer"
            className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <PrimaryButton disabled={!clarifierAnswer.trim() || busy} onClick={() => callDiscovery()}>
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
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Your brief</p>
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
            autoFocus value={visitorName} onChange={(e) => setVisitorName(e.target.value)} placeholder="Your name"
            className="mb-3 w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <input
            type="email" value={visitorEmail} onChange={(e) => setVisitorEmail(e.target.value)} placeholder="you@business.com"
            className="w-full border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-accent"
          />
          <PrimaryButton
            disabled={!visitorEmail.trim() || !visitorName.trim() || busy}
            onClick={() => { setStage("generating"); callDiscovery({ finalize: true }); }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Walk through my brief →"}
          </PrimaryButton>
        </StepBlock>
      )}

      {stage === "generating" && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Building your brief</p>
          <p className="text-sm text-muted-foreground">Redirecting you to the customer view…</p>
        </div>
      )}
    </div>
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
      type="button" disabled={disabled} onClick={onClick}
      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-accent bg-accent px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
