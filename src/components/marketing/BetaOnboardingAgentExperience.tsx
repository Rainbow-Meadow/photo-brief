import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { BETA_TOTAL_PARTNERS } from "@/config/betaProgram";

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

interface BetaOnboardingAgentExperienceProps {
  source?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  showSeatTracker?: boolean;
  className?: string;
}

const AGENT_BASE = "https://beta-agent.photobrief.ai";

const examples = [
  {
    label: "Warranty team",
    value:
      "We review warranty claims for damaged products. Customers usually send blurry close-ups with no label or order context.",
  },
];

function campaignContext(baseSource: string) {
  if (typeof window === "undefined") {
    return { source: baseSource, interest: "founding-partner" };
  }

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref") || undefined;
  const source = ref ? `${baseSource}:${ref}` : baseSource;

  return {
    source,
    interest: params.get("interest") || "founding-partner",
    ref,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    referrer: document.referrer || undefined,
  };
}

export function BetaOnboardingAgentExperience({
  source = "landing",
  eyebrow = "Apply with the beta agent",
  title = "Apply for the Founding Partner Beta",
  description = `The onboarding agent asks the right questions, recommends your first PhotoBrief workflow, and submits your application for one of ${BETA_TOTAL_PARTNERS} founding partner seats.`,
  showSeatTracker = true,
  className = "",
}: BetaOnboardingAgentExperienceProps) {
  const [state, setState] = useState<AgentState | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState({ email: "", business_name: "" });
  const [website, setWebsite] = useState("");

  const context = useMemo(() => campaignContext(source), [source]);

  const progress = useMemo(() => {
    if (!state) return 0;
    const answered = Object.values(state.answers ?? {}).filter((v) =>
      String(v ?? "").trim(),
    ).length;
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
        ...context,
        website: "",
        company_website: website,
      });
      setState(payload as AgentState);
      setAnswer("");
      trackEvent("beta_onboarding_agent_started", {
        source: context.source,
        interest: context.interest,
        location: "landing_apply",
      });
    } catch {
      toast({
        title: "Agent unavailable",
        description: "The onboarding agent did not respond. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendAnswer(value = answer) {
    if (!state?.sessionId || !state.nextQuestion) return;
    setLoading(true);
    try {
      const payload = await callAgent(
        `/sessions/${encodeURIComponent(state.sessionId)}/answer`,
        {
          field: state.nextQuestion.field,
          value,
        },
      );
      setState(payload as AgentState);
      setAnswer("");
      trackEvent("beta_onboarding_agent_answered", {
        source: context.source,
        field: state.nextQuestion.field,
      });
    } catch {
      toast({
        title: "Could not save that answer",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!state?.sessionId) return;
    setLoading(true);
    try {
      const payload = await callAgent(
        `/sessions/${encodeURIComponent(state.sessionId)}/save`,
        {},
      );
      setState(payload.state as AgentState);
      trackEvent("beta_onboarding_agent_saved", {
        source: context.source,
        interest: context.interest,
        location: "landing_apply",
      });
      toast({
        title: "Application sent",
        description: "The beta onboarding agent submitted your application.",
      });
    } catch {
      toast({
        title: "Could not submit",
        description: "Try again in a moment, or email hello@photobrief.ai.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const next = state?.nextQuestion;
  const recommendation = state?.recommendation;

  return (
    <div className={`mx-auto max-w-6xl ${className}`}>
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--pb-lavender))]">
          <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" /> {eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-3xl italic leading-[1.05] tracking-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="pb-copy mx-auto mt-4 max-w-2xl text-sm leading-6 sm:text-base sm:leading-7">
          {description}
        </p>
        {showSeatTracker ? (
          <BetaSeatTracker variant="compact" className="mx-auto mt-5 max-w-sm" />
        ) : null}
      </div>

      <div className="mt-12 grid gap-10 border-t border-white/12 pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-12">
        <div className="lg:border-r lg:border-white/12 lg:pr-10">
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-lavender))]">
                <Bot className="-mt-0.5 mr-1 inline h-3 w-3" /> Guided beta intake
              </p>
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-violet))]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--pb-violet))]" />
                Live
              </span>
            </div>

            {!state ? (
              <div className="mt-6 grid gap-4">
                <p className="pb-copy text-sm">
                  Start with your email and business name. The agent qualifies the
                  workflow instead of making you fill out a static form.
                </p>
                <Input
                  value={seed.email}
                  onChange={(e) => setSeed((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30"
                />
                <Input
                  value={seed.business_name}
                  onChange={(e) =>
                    setSeed((p) => ({ ...p, business_name: e.target.value }))
                  }
                  placeholder="Business name"
                  autoComplete="organization"
                  className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30"
                />
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <Button
                  size="xl"
                  variant="pb-primary"
                  onClick={start}
                  disabled={loading || !seed.email.trim() || !seed.business_name.trim()}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <WandSparkles className="mr-2 h-4 w-4" />
                  )}
                  Start agent application
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
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {next ? (
                  <div className="border-l-2 border-[hsl(var(--pb-lavender)/0.5)] pl-4">
                    <p className="font-serif text-base italic text-white sm:text-lg">{next.prompt}</p>
                    <p className="pb-copy mt-1.5 text-xs">{next.helper}</p>
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={4}
                      placeholder={next.required ? "Type your answer…" : "Type an answer or skip…"}
                      className="mt-4 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30"
                    />
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Button
                        variant="pb-primary"
                        onClick={() => sendAnswer()}
                        disabled={loading || (next.required && !answer.trim())}
                      >
                        {loading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Send answer <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      {!next.required && (
                        <Button
                          variant="pb-secondary"
                          onClick={() => sendAnswer("")}
                          disabled={loading}
                        >
                          Skip this one
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-l-2 border-[hsl(var(--pb-violet)/0.5)] pl-4">
                    <div className="flex items-center gap-2 font-serif text-base italic text-white sm:text-lg">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(var(--pb-violet))]" />
                      The agent has enough to recommend your beta path.
                    </div>
                    <Button
                      className="mt-4"
                      variant="pb-primary"
                      onClick={save}
                      disabled={loading || state.saved}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {state.saved ? "Application submitted" : "Submit agent-built application"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative lg:pl-2">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-lavender))]">
              <ClipboardCheck className="-mt-0.5 mr-1 inline h-3 w-3" /> Agent output
            </p>
            {recommendation ? (
              <div className="mt-5 grid gap-6">
                <div className="border-l-2 border-[hsl(var(--pb-lavender)/0.5)] pl-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-lavender))]">
                    Fit score
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="font-serif text-6xl leading-none text-white">
                      {recommendation.fitScore}
                    </span>
                    <span className="pb-copy pb-2 text-sm">/ 5 for beta fit</span>
                  </div>
                  <p className="pb-copy mt-3 text-sm">{recommendation.summary}</p>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/12 pt-5 sm:grid-cols-4">
                  <Metric label="Workflow" value={recommendation.workflowType} />
                  <Metric label="Segment" value={recommendation.segment.replace(/_/g, " ")} />
                  <Metric label="Template" value={recommendation.suggestedTemplate} />
                  <Metric label="Status" value={state?.saved ? "Submitted" : "Ready"} />
                </dl>
                <div className="border-t border-white/12 pt-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                    First request steps
                  </p>
                  <ol className="mt-3 grid gap-3">
                    {recommendation.firstRequestSteps.map((step, i) => (
                      <li
                        key={step}
                        className="flex items-baseline gap-3 text-sm text-white/82"
                      >
                        <span className="font-serif text-base text-[hsl(var(--pb-lavender))]">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                {recommendation.concerns.length ? (
                  <div className="border-l-2 border-white/15 pl-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                      Manual review notes
                    </p>
                    <p className="pb-copy mt-1 text-xs">
                      {recommendation.concerns.join(" · ")}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 grid">
                {examples.map((example, idx) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => setAnswer(example.value)}
                    className={`group text-left transition py-4 ${idx > 0 ? "border-t border-white/10" : ""}`}
                  >
                    <p className="font-serif text-base italic text-white transition group-hover:text-[hsl(var(--pb-lavender))] sm:text-lg">
                      {example.label}
                    </p>
                    <p className="pb-copy mt-1.5 text-xs">{example.value}</p>
                  </button>
                ))}
                <div className="mt-4 flex items-start gap-3 border-l-2 border-[hsl(var(--pb-violet)/0.4)] pl-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-violet))]" />
                  <p className="pb-copy text-xs">
                    The agent uses opaque session IDs and submits through the same beta
                    intake pipeline as the original application form.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-base italic capitalize text-white sm:text-lg">
        {value}
      </dd>
    </div>
  );
}
