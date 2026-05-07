import { useMemo, useState } from "react";
import { ArrowRight, Bot, BrainCircuit, Camera, CheckCircle2, ClipboardCheck, Loader2, MessageSquareText, Network, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { BrandMark } from "@/components/layout/BrandMark";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

type AgentQuestion = {
  field: string;
  prompt: string;
  helper: string;
  required: boolean;
};

type Recommendation = {
  fitScore: number;
  workflowType: string;
  segment: string;
  suggestedTemplate: string;
  summary: string;
  firstRequestSteps: string[];
  concerns: string[];
};

type AgentState = {
  sessionId: string;
  answers: Record<string, string>;
  nextQuestion: AgentQuestion | null;
  complete: boolean;
  recommendation: Recommendation | null;
  saved: boolean;
};

const AGENT_BASE = "https://beta-agent.photobrief.ai";

const examples = [
  {
    label: "Warranty team",
    value: "We review warranty claims for damaged products. Customers usually send blurry close-ups with no label or order context.",
  },
  {
    label: "Dispatch prep",
    value: "We need customers to show the site, access point, issue, and model number before we send a technician.",
  },
  {
    label: "Quote workflow",
    value: "We quote repair jobs from photos. The usual problem is missing wide shots, unclear scale, and no notes about what they want fixed.",
  },
];

const agentCards = [
  {
    icon: Bot,
    title: "Beta onboarding agent",
    body: "Qualifies applicants, scores fit, recommends the first template, and submits the beta application through the existing intake pipeline.",
    status: "Live public surface",
  },
  {
    icon: Camera,
    title: "Capture agent",
    body: "Turns request links into guided customer photo collection with clearer steps and fewer missing shots.",
    status: "Customer workflow",
  },
  {
    icon: BrainCircuit,
    title: "Assistant agent",
    body: "Watches workspace activity, indexes guides, and prepares operational insights for teams after they activate.",
    status: "Workspace intelligence",
  },
  {
    icon: Network,
    title: "MCP agent",
    body: "Gives external AI systems a clean way to understand and invoke PhotoBrief workflows safely.",
    status: "Agentic integration",
  },
];

export default function BetaOnboardingAgentPage() {
  const [state, setState] = useState<AgentState | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState({ email: "", business_name: "" });

  const progress = useMemo(() => {
    if (!state) return 0;
    const answered = Object.values(state.answers ?? {}).filter((v) => String(v ?? "").trim()).length;
    return Math.min(100, Math.round((answered / 9) * 100));
  }, [state]);

  async function callAgent(path: string, body?: Record<string, unknown>) {
    const res = await fetch(`${AGENT_BASE}${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`Agent returned ${res.status}`);
    return res.json();
  }

  async function start() {
    setLoading(true);
    try {
      const payload = await callAgent("/sessions/start", {
        ...seed,
        source: "public-ui-beta-onboarding",
      });
      setState(payload as AgentState);
      setAnswer("");
      trackEvent("beta_onboarding_agent_started", { source: "public-ui" });
    } catch {
      toast({ title: "Agent unavailable", description: "The onboarding agent did not respond. Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function sendAnswer(value = answer) {
    if (!state?.sessionId || !state.nextQuestion) return;
    setLoading(true);
    try {
      const payload = await callAgent(`/sessions/${encodeURIComponent(state.sessionId)}/answer`, {
        field: state.nextQuestion.field,
        value,
      });
      setState(payload as AgentState);
      setAnswer("");
      trackEvent("beta_onboarding_agent_answered", { field: state.nextQuestion.field });
    } catch {
      toast({ title: "Could not save that answer", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!state?.sessionId) return;
    setLoading(true);
    try {
      const payload = await callAgent(`/sessions/${encodeURIComponent(state.sessionId)}/save`, {});
      setState(payload.state as AgentState);
      trackEvent("beta_onboarding_agent_saved", { source: "public-ui" });
      toast({ title: "Application sent", description: "The beta onboarding agent submitted your application." });
    } catch {
      toast({ title: "Could not submit", description: "Use the regular application form or try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const next = state?.nextQuestion;
  const recommendation = state?.recommendation;

  return (
    <>
      <PageMeta
        title="Beta Onboarding Agent — PhotoBrief.ai"
        description="Try PhotoBrief's beta onboarding agent. It qualifies your workflow, recommends a starter template, and submits your Founding Partner Beta application."
        canonicalPath="/beta-onboarding"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Beta onboarding agent", path: "/beta-onboarding" }]}
      />

      <main className="pb-landing">
        <section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[6rem] sm:-mt-[5rem] sm:pt-[7rem]">
          <div className="pb-lens-field" />
          <div className="pb-container relative z-10 pb-12 sm:pb-16">
            <div className="mx-auto max-w-3xl text-center">
              <BrandMark variant="mark" size={104} eager className="mx-auto" />
              <span className="pb-eyebrow mt-5"><Sparkles className="h-3.5 w-3.5" /> Live Cloudflare Agent</span>
              <h1 className="pb-hero-title mx-auto mt-4 max-w-3xl text-white">
                Meet the agent that turns beta interest into an onboarding plan.
              </h1>
              <p className="pb-copy mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
                PhotoBrief now has a public beta onboarding agent. It asks the right questions, recommends your first visual intake workflow, and routes qualified applications into the same beta review pipeline as the landing page.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className="pb-command-panel p-4 sm:p-6">
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="pb-eyebrow"><Bot className="h-3.5 w-3.5" /> Guided beta intake</span>
                    <span className="rounded-full border border-[hsl(var(--pb-mint)/0.25)] bg-[hsl(var(--pb-mint)/0.08)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-mint))]">Live</span>
                  </div>

                  {!state ? (
                    <div className="mt-6 grid gap-4">
                      <p className="pb-copy text-sm">Start with just an email and business name. The agent will take it from there.</p>
                      <Input value={seed.email} onChange={(e) => setSeed((p) => ({ ...p, email: e.target.value }))} placeholder="you@company.com" className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                      <Input value={seed.business_name} onChange={(e) => setSeed((p) => ({ ...p, business_name: e.target.value }))} placeholder="Business name" className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                      <Button size="xl" variant="pb-primary" onClick={start} disabled={loading || !seed.email.trim() || !seed.business_name.trim()}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                        Start agent onboarding
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-5">
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-white/60">
                          <span>Onboarding progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-mint))] transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {next ? (
                        <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-4">
                          <p className="text-sm font-semibold text-white">{next.prompt}</p>
                          <p className="pb-copy mt-1.5 text-xs">{next.helper}</p>
                          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={4} placeholder={next.required ? "Type your answer…" : "Type an answer or skip…"} className="mt-4 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Button variant="pb-primary" onClick={() => sendAnswer()} disabled={loading || (next.required && !answer.trim())}>
                              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                              Send answer <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            {!next.required && <Button variant="pb-secondary" onClick={() => sendAnswer("")} disabled={loading}>Skip this one</Button>}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[1.25rem] border border-[hsl(var(--pb-mint)/0.25)] bg-[hsl(var(--pb-mint)/0.07)] p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-[hsl(var(--pb-mint))]" /> The agent has enough to recommend your beta path.</div>
                          <Button className="mt-4" variant="pb-primary" onClick={save} disabled={loading || state.saved}>
                            {state.saved ? "Application submitted" : "Submit agent-built application"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pb-card relative overflow-hidden p-4 sm:p-6">
                <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--pb-lavender)/0.18)] blur-[60px]" />
                <div className="relative z-10">
                  <span className="pb-eyebrow"><ClipboardCheck className="h-3.5 w-3.5" /> Agent output</span>
                  {recommendation ? (
                    <div className="mt-5 grid gap-4">
                      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.045] p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-lavender))]">Fit score</p>
                        <div className="mt-2 flex items-end gap-3">
                          <span className="text-5xl font-black tracking-tight text-white">{recommendation.fitScore}</span>
                          <span className="pb-copy pb-2 text-sm">/ 5 for beta fit</span>
                        </div>
                        <p className="pb-copy mt-3 text-sm">{recommendation.summary}</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Metric label="Workflow" value={recommendation.workflowType} />
                        <Metric label="Segment" value={recommendation.segment.replace(/_/g, " ")} />
                        <Metric label="Starter template" value={recommendation.suggestedTemplate} />
                        <Metric label="Status" value={state?.saved ? "Submitted" : "Ready to submit"} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">First request steps</p>
                        <div className="mt-3 grid gap-2">
                          {recommendation.firstRequestSteps.map((step, i) => (
                            <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.16)] text-xs font-black text-[hsl(var(--pb-lavender))]">{i + 1}</span>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      {examples.map((example) => (
                        <button key={example.label} type="button" onClick={() => setAnswer(example.value)} className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-[hsl(var(--pb-lavender)/0.45)] hover:bg-white/[0.07]">
                          <p className="text-sm font-semibold text-white">{example.label}</p>
                          <p className="pb-copy mt-1.5 text-xs">{example.value}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-section-tight">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow"><MessageSquareText className="h-3.5 w-3.5" /> The PhotoBrief agent layer</span>
              <h2 className="pb-section-title mt-4 text-white">The public onboarding agent is the front door. The rest of the agent stack keeps the workflow moving.</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {agentCards.map(({ icon: Icon, title, body, status }) => (
                <div key={title} className="pb-card p-5">
                  <Icon className="h-6 w-6 text-[hsl(var(--pb-lavender))]" />
                  <p className="mt-4 text-sm font-semibold text-white">{title}</p>
                  <p className="pb-copy mt-2 text-xs leading-5">{body}</p>
                  <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/55">{status}</p>
                </div>
              ))}
            </div>
            <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-[1.25rem] border border-[hsl(var(--pb-mint)/0.18)] bg-[hsl(var(--pb-mint)/0.06)] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--pb-mint))]" />
              <p className="pb-copy text-sm">The onboarding agent uses opaque session IDs and submits through the same beta intake path as the main landing page, so public UI stays clean while application review stays centralized.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-white/10 bg-white/[0.04] p-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-white/45">{label}</p>
      <p className="mt-1 text-sm font-semibold capitalize text-white">{value}</p>
    </div>
  );
}
