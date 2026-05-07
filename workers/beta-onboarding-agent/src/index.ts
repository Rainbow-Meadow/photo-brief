/**
 * PhotoBrief Beta Onboarding Agent
 *
 * A small stateful Cloudflare Agent that qualifies Founding Partner Beta users,
 * recommends a starter workflow, and submits the completed application through
 * the existing waitlist-submit edge function.
 */

import { Agent } from "agents";

interface Env {
  BETA_ONBOARDING_AGENT: DurableObjectNamespace;
  SUPABASE_URL: string;
  SITE_URL: string;
}

type Field =
  | "email"
  | "business_name"
  | "website"
  | "business_type"
  | "use_case"
  | "monthly_photo_volume"
  | "current_method"
  | "pain_points"
  | "commitment";

type Answers = Partial<Record<Field, string>>;

interface Recommendation {
  fitScore: number;
  workflowType: string;
  segment: string;
  suggestedTemplate: string;
  summary: string;
  firstRequestSteps: string[];
  concerns: string[];
}

interface AgentState {
  sessionId: string;
  source: string;
  answers: Answers;
  recommendation: Recommendation | null;
  saved: boolean;
  updatedAt: string;
}

const QUESTIONS: { field: Field; prompt: string; helper: string; required: boolean }[] = [
  { field: "email", prompt: "What work email should we use for beta access?", helper: "Use the address you want attached to your beta application.", required: true },
  { field: "business_name", prompt: "What business or team is this for?", helper: "A company, department, shop, practice, or project name is fine.", required: true },
  { field: "website", prompt: "What website should we review, if any?", helper: "This helps us recommend where PhotoBrief should fit into your intake path.", required: false },
  { field: "business_type", prompt: "What kind of business is it?", helper: "Examples: repair service, warranty team, property manager, apparel brand, installer, manufacturer.", required: true },
  { field: "use_case", prompt: "What do you need customers to send photos for?", helper: "Examples: quotes, dispatch prep, warranty review, damage documentation, returns, approvals.", required: true },
  { field: "monthly_photo_volume", prompt: "Roughly how many customer photo requests happen each month?", helper: "Fewer than 10, 10-50, 51-200, 200+, or your best estimate.", required: false },
  { field: "current_method", prompt: "How do you ask for photos today?", helper: "Text, email, website form, phone call, CRM/helpdesk, or something else.", required: false },
  { field: "pain_points", prompt: "What usually goes wrong with the photos you receive?", helper: "Missing angles, blurry shots, no label or serial number, no context, hard to match to the customer, etc.", required: true },
  { field: "commitment", prompt: "Could you try PhotoBrief on 3-5 real workflows during beta?", helper: "A simple yes/no/maybe is enough, plus any constraint we should know.", required: true },
];

export class BetaOnboardingAgent extends Agent<Env, AgentState> {
  initialState: AgentState = {
    sessionId: "",
    source: "beta-onboarding-agent",
    answers: {},
    recommendation: null,
    saved: false,
    updatedAt: new Date().toISOString(),
  };

  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);

    try {
      if (request.method === "GET" && url.pathname === "/state") return json(this.publicState());

      if (request.method === "POST" && url.pathname === "/start") {
        const body = await readJson(request);
        const sessionId = clean(body.sessionId) || this.state.sessionId || crypto.randomUUID();
        this.setState({
          ...this.state,
          sessionId,
          source: clean(body.source) || this.state.source,
          answers: { ...this.state.answers, ...pickAnswers(body) },
          updatedAt: new Date().toISOString(),
        });
        return json(this.publicState());
      }

      if (request.method === "POST" && url.pathname === "/answer") {
        const body = await readJson(request);
        const field = isField(body.field) ? body.field : this.nextQuestion()?.field;
        if (!field) return json({ error: "No remaining questions." }, 400);
        const value = clean(body.value ?? body.answer, 2000) || "";
        if (!value && questionFor(field)?.required) return json({ error: "This answer is required.", question: questionFor(field) }, 400);
        const answers = { ...this.state.answers, [field]: value };
        const recommendation = this.complete(answers) ? recommend(answers) : null;
        this.setState({ ...this.state, answers, recommendation, updatedAt: new Date().toISOString() });
        return json(this.publicState());
      }

      if (request.method === "POST" && url.pathname === "/plan") {
        const recommendation = recommend(this.state.answers);
        this.setState({ ...this.state, recommendation, updatedAt: new Date().toISOString() });
        return json({ recommendation, state: this.publicState() });
      }

      if (request.method === "POST" && url.pathname === "/save") {
        const recommendation = this.state.recommendation ?? recommend(this.state.answers);
        await submitApplication(this.env, this.state.answers, recommendation, this.state.source);
        this.setState({ ...this.state, recommendation, saved: true, updatedAt: new Date().toISOString() });
        return json({ ok: true, state: this.publicState() });
      }

      return json({ error: "Use /start, /state, /answer, /plan, or /save." }, 404);
    } catch (error) {
      console.error("beta onboarding agent error", error);
      return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
    }
  }

  private publicState() {
    const complete = this.complete(this.state.answers);
    return {
      sessionId: this.state.sessionId,
      source: this.state.source,
      answers: this.state.answers,
      nextQuestion: this.nextQuestion(),
      complete,
      recommendation: this.state.recommendation ?? (complete ? recommend(this.state.answers) : null),
      saved: this.state.saved,
      updatedAt: this.state.updatedAt,
    };
  }

  private nextQuestion(answers = this.state.answers) {
    return QUESTIONS.find((q) => q.required && !clean(answers[q.field])) ?? QUESTIONS.find((q) => !clean(answers[q.field])) ?? null;
  }

  private complete(answers = this.state.answers) {
    return QUESTIONS.filter((q) => q.required).every((q) => Boolean(clean(answers[q.field])));
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") return json({ ok: true, name: "PhotoBrief Beta Onboarding Agent", version: "1.0.0" });

    if (request.method === "POST" && url.pathname === "/sessions/start") {
      const body = await readJson(request);
      const sessionId = clean(body.sessionId) || clean(body.email)?.toLowerCase() || crypto.randomUUID();
      const id = env.BETA_ONBOARDING_AGENT.idFromName(sessionId);
      const stub = env.BETA_ONBOARDING_AGENT.get(id);
      return stub.fetch(new Request(new URL("/start", url.origin), { method: "POST", headers: request.headers, body: JSON.stringify({ ...body, sessionId }) }));
    }

    const match = url.pathname.match(/^\/sessions\/([^/]+)\/(state|answer|plan|save)$/);
    if (!match) return json({ error: "Use /sessions/start or /sessions/:sessionId/state|answer|plan|save." }, 404);

    const [, rawSessionId, action] = match;
    const id = env.BETA_ONBOARDING_AGENT.idFromName(decodeURIComponent(rawSessionId));
    const stub = env.BETA_ONBOARDING_AGENT.get(id);
    const method = action === "state" ? "GET" : "POST";
    return stub.fetch(new Request(new URL(`/${action}`, url.origin), { method, headers: request.headers, body: method === "GET" ? undefined : request.body }));
  },
};

async function submitApplication(env: Env, answers: Answers, recommendation: Recommendation, source: string) {
  const email = clean(answers.email, 254)?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid work email is required before saving.");

  const response = await fetch(`${env.SUPABASE_URL}/functions/v1/waitlist-submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      business_name: answers.business_name,
      website: answers.website,
      business_type: answers.business_type,
      use_case: answers.use_case,
      workflow_type: recommendation.workflowType,
      estimated_monthly_requests: answers.monthly_photo_volume,
      interest: "founding-partner",
      source,
      notes: buildNotes(answers, recommendation),
    }),
  });

  if (!response.ok) throw new Error(`Application save failed with status ${response.status}`);
  return response.json().catch(() => ({ ok: true }));
}

function recommend(answers: Answers): Recommendation {
  const text = [answers.business_type, answers.use_case, answers.pain_points, answers.current_method].filter(Boolean).join(" ").toLowerCase();
  const workflowType = chooseWorkflowType(text);
  const segment = chooseSegment(text, workflowType);
  const suggestedTemplate = chooseTemplate(workflowType, text);
  const fitScore = scoreFit(answers, text);
  const concerns = buildConcerns(answers, fitScore);
  return {
    fitScore,
    workflowType,
    segment,
    suggestedTemplate,
    summary: `${answers.business_name || "This team"} looks like a ${fitScore >= 4 ? "strong" : fitScore >= 3 ? "possible" : "light"} beta fit for ${workflowType.toLowerCase()} workflows. Start with ${suggestedTemplate}.`,
    firstRequestSteps: templateSteps(suggestedTemplate),
    concerns,
  };
}

function chooseWorkflowType(text: string) {
  if (/warranty|return|claim|damage|defect|rma/.test(text)) return "Returns / warranty";
  if (/dispatch|arrival|site visit|field|technician|access/.test(text)) return "Dispatch prep";
  if (/approve|approval|review|exception|evidence/.test(text)) return "Approvals / reviews";
  if (/quote|estimate|price|bid|cost|roof|repair|install|service/.test(text)) return "Quotes / estimates";
  return "Documentation";
}

function chooseSegment(text: string, workflowType: string) {
  if (/property|rental|tenant|maintenance|move/.test(text)) return "property_maintenance";
  if (/apparel|garment|fit|textile|fabric/.test(text)) return "apparel_fit_review";
  if (/manufactur|supplier|batch|quality|qc|defect/.test(text)) return "product_defect";
  if (workflowType === "Returns / warranty") return "returns_warranty";
  if (workflowType === "Dispatch prep") return "dispatch_prep";
  if (workflowType === "Quotes / estimates") return "service_estimate";
  return "general_documentation";
}

function chooseTemplate(workflowType: string, text: string) {
  if (workflowType === "Returns / warranty") return "Return / Warranty Review";
  if (workflowType === "Dispatch prep") return "Dispatch Prep";
  if (workflowType === "Quotes / estimates") return "Quote / Estimate";
  if (/defect|qc|quality|batch/.test(text)) return "Product / Defect Review";
  return "Documentation";
}

function scoreFit(answers: Answers, text: string) {
  let score = 1;
  if ((answers.use_case?.length ?? 0) > 30) score += 1;
  if (/10|50|51|200|200\+|weekly|daily|month|often|many/.test(answers.monthly_photo_volume?.toLowerCase() ?? "")) score += 1;
  if (/missing|blurry|angle|label|serial|context|follow|email|text|delay|wrong/.test(text)) score += 1;
  if (/yes|yep|sure|can|willing|try/.test(answers.commitment?.toLowerCase() ?? "")) score += 1;
  return Math.max(1, Math.min(5, score));
}

function buildConcerns(answers: Answers, fitScore: number) {
  const concerns: string[] = [];
  if (!answers.monthly_photo_volume) concerns.push("Monthly request volume is unknown.");
  if (!/yes|yep|sure|can|willing|try/.test(answers.commitment?.toLowerCase() ?? "")) concerns.push("Commitment to real beta workflows is unclear.");
  if (fitScore <= 2) concerns.push("Use case may need manual review before acceptance.");
  return concerns;
}

function templateSteps(template: string) {
  if (template === "Return / Warranty Review") return ["Product front", "Damage or issue close-up", "Label, tag, serial number, or order identifier", "Packaging if available"];
  if (template === "Dispatch Prep") return ["Wide area/context shot", "Access point or location", "Close-up of issue", "Relevant label, panel, model number, or detail"];
  if (template === "Quote / Estimate") return ["Wide context shot", "Main project or issue area", "Close-up of damage/problem", "Product label, model, or measurement if relevant"];
  if (template === "Product / Defect Review") return ["Full product view", "Defect close-up", "Label or batch identifier", "Comparison photo if available"];
  return ["Wide context shot", "Required detail shot", "Supporting label or identifying information", "Customer notes"];
}

function buildNotes(answers: Answers, recommendation: Recommendation) {
  return [
    "Generated by Beta Onboarding Agent.",
    `Fit score: ${recommendation.fitScore}`,
    `Segment: ${recommendation.segment}`,
    `Suggested template: ${recommendation.suggestedTemplate}`,
    `Current method: ${answers.current_method || "not provided"}`,
    `Pain points: ${answers.pain_points || "not provided"}`,
    `Beta commitment: ${answers.commitment || "not provided"}`,
    recommendation.concerns.length ? `Concerns: ${recommendation.concerns.join("; ")}` : null,
  ].filter(Boolean).join("\n");
}

function questionFor(field: Field) { return QUESTIONS.find((q) => q.field === field); }
function isField(value: unknown): value is Field { return typeof value === "string" && QUESTIONS.some((q) => q.field === value); }
function pickAnswers(input: Record<string, unknown>) { const answers: Answers = {}; for (const q of QUESTIONS) { const value = clean(input[q.field]); if (value) answers[q.field] = value; } return answers; }
async function readJson(request: Request): Promise<Record<string, any>> { return request.body ? request.json().catch(() => ({})) : {}; }
function clean(value: unknown, max = 500) { if (typeof value !== "string") return undefined; const trimmed = value.trim(); return trimmed ? trimmed.slice(0, max) : undefined; }
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
