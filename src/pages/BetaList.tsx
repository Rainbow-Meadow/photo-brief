import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  ImageOff,
  Link2,
  Lock,
  MailCheck,
  MapPinned,
  MessageSquareWarning,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stamp,
} from "lucide-react";

import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/components/layout/BrandMark";
import { InteractiveHeroBriefAssembly } from "@/components/marketing/InteractiveHeroBriefAssembly";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { conversions, trackEvent } from "@/lib/analytics";

/* ── constants ──────────────────────────────────────────── */

const BUSINESS_TYPES = [
  "Roofing", "HVAC", "Plumbing", "Electrical", "General contractor",
  "Junk removal / hauling", "Pest control", "Insurance / claims",
  "Property management", "Landscaping", "Appliance repair",
  "Other home services", "Other",
];

const VOLUMES = [
  "Fewer than 10", "10–50", "51–200", "200+",
];

const WORKFLOW_TYPES = [
  "Quotes / estimates",
  "Dispatch prep",
  "Approvals / reviews",
  "Returns / warranty",
  "Documentation",
  "Other",
];

const messySignals = [
  "Photos scattered across texts and emails",
  "Missing angles, unclear scale, and bad lighting",
  "Customer notes separated from the job",
  "Follow-up questions before anyone can quote",
];

const cleanSignals = [
  "Required shots requested in order",
  "Customer notes stay with the photos",
  "Simple photo issues are flagged early",
  "The submission arrives as a structured brief",
];

const workflowSteps = [
  { icon: Link2, eyebrow: "Request", title: "Send one guided link", body: "Choose a template, send the link by text or email, or paste it into any customer thread." },
  { icon: Camera, eyebrow: "Capture", title: "Customers take the right shots", body: "They see one mobile prompt at a time with plain instructions — no app, no account." },
  { icon: Route, eyebrow: "Check", title: "Obvious problems get flagged", body: "PhotoBrief flags missing, unclear, or review-needed shots before your team sorts through them." },
  { icon: FileCheck2, eyebrow: "Brief", title: "Your team gets a usable packet", body: "Photos, notes, customer context, and next-step status land together for quoting, dispatch, or approval." },
];

const useCases = [
  { icon: BadgeCheck, title: "Quote-ready submissions", body: "Get the photos your estimator needs before the first call becomes a chain of follow-ups.", stamp: "Quote prep" },
  { icon: MapPinned, title: "Dispatch prep", body: "Collect site access, issue context, and handling notes before a team heads out.", stamp: "Field ready" },
  { icon: ImageOff, title: "Damage documentation", body: "Guide customers through the angles that matter so reviewers can understand the issue quickly.", stamp: "Evidence packet" },
  { icon: ShieldCheck, title: "Approvals and exceptions", body: "Turn customer media into a packet that can be reviewed, approved, or escalated without guessing.", stamp: "Decision ready" },
];

const partnerBenefits = [
  "60–90 days free founding beta access",
  "Concierge setup for first templates and workflows",
  "Direct feedback channel and priority product input",
  "Early access to future tools",
  "50% off the first year after launch",
];

const partnerAsks = [
  "Use PhotoBrief on 3–5 real customer workflows",
  "Share short feedback every two weeks",
  "Report confusing moments or missing workflow needs",
];

const trustPoints = [
  { icon: Link2, title: "Secure, expiring upload links", desc: "Customers never see your dashboard or internal data." },
  { icon: Smartphone, title: "No app or account for customers", desc: "Clean mobile capture. No install, no signup, no friction." },
  { icon: Lock, title: "Your data stays yours", desc: "Photos and briefs are never shared or used for training." },
];

/* ── form state ─────────────────────────────────────────── */

interface FormState {
  name: string;
  business_name: string;
  email: string;
  business_type: string;
  website: string;
  use_case: string;
  estimated_monthly_requests: string;
  workflow_type: string;
}

const EMPTY: FormState = {
  name: "", business_name: "", email: "", business_type: "",
  website: "", use_case: "", estimated_monthly_requests: "",
  workflow_type: "",
};

/* ── Main component ─────────────────────────────────────── */

export default function BetaListPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"new" | "already" | null>(null);
  const [comparisonMode, setComparisonMode] = useState<"messy" | "clean">("messy");

  useEffect(() => {
    trackEvent("betalist_page_viewed", ref ? { ref } : undefined);
  }, [ref]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function validate(): string | null {
    if (!form.email.trim()) return "We need a work email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "That email doesn't look right.";
    if (!form.business_name.trim()) return "Please enter your business name.";
    if (!form.use_case.trim()) return "Tell us what you need customer photos for.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Please check the form", description: err, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const source = ref ? `betalist:${ref}` : "betalist";
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-submit", {
        body: {
          ...form,
          name: form.name.trim() || undefined,
          email: form.email.trim().toLowerCase(),
          notes: [
            `source=${source}`,
            form.workflow_type ? `workflow_type=${form.workflow_type}` : "",
          ].filter(Boolean).join("; "),
          source,
        },
      });
      if (error) throw error;
      const payload = data as { ok?: boolean; already?: boolean } | null;
      if (payload?.already) {
        trackEvent("betalist_duplicate", { ref });
        setDone("already");
      } else {
        trackEvent("betalist_submitted", { ref, business_type: form.business_type || undefined });
        conversions.waitlistSubmitted({ interest: "betalist", business_type: form.business_type || undefined });
        setDone("new");
      }
    } catch (e) {
      toast({
        title: "Something went wrong",
        description: (e as Error).message ?? "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Post-submission thank-you ─────────────────────────── */
  if (done) {
    return (
      <div className="pb-landing min-h-screen">
        <SEOHead
          title="Application received — PhotoBrief.ai"
          description="Your Founding Partner Beta application has been received."
          canonicalPath="/betalist"
        />
        <section className="pb-section relative isolate">
          <div className="pb-lens-field" />
          <div className="pb-container relative z-10 mx-auto max-w-lg text-center">
            <BrandMark variant="stacked" tone="light" size={72} eager withGlow />

            {done === "new" ? (
              <>
                <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)]">
                  <CheckCircle2 className="h-8 w-8 text-[hsl(var(--pb-mint))]" />
                </div>
                <h1 className="pb-section-title mt-6 text-white">Application received</h1>
                <p className="pb-copy mt-4">
                  Thanks for applying to the Founding Partner Beta. PhotoBrief is invite-only — we review every application by hand.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.12)]">
                  <MailCheck className="h-8 w-8 text-[hsl(var(--pb-lavender))]" />
                </div>
                <h1 className="pb-section-title mt-6 text-white">You're already on the list</h1>
                <p className="pb-copy mt-4">
                  We already have your application. No need to resubmit — we'll be in touch as soon as a spot opens.
                </p>
              </>
            )}

            <div className="pb-card mt-8 p-5 text-left sm:p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">What happens next</p>
              <ol className="mt-4 grid gap-3">
                {[
                  "We review your application within a few business days.",
                  "If it's a fit, we send a personal invite with your login link.",
                  "We set up your first templates together in a concierge call.",
                  "You start sending guided PhotoBrief links to real customers.",
                ].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-xs font-black text-[hsl(var(--pb-lavender))]">{i + 1}</span>
                    <span className="pb-copy text-sm">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 rounded-[1.2rem] border border-[hsl(var(--pb-lavender)/0.25)] bg-[hsl(var(--pb-lavender)/0.04)] p-4">
              <p className="text-sm font-semibold text-white/90">Founding Partner Beta includes:</p>
              <p className="pb-copy mt-1.5 text-xs">
                60–90 days free · concierge setup · priority support · direct roadmap input · early access to future tools · 50% off year one
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button asChild variant="pb-secondary" size="lg">
                <NavLink to="/founding-partner-beta">Learn more about the beta</NavLink>
              </Button>
              <p className="text-xs text-white/40">
                Questions? <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--pb-lavender))] hover:underline">hello@photobrief.ai</a>
              </p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ── Landing page ──────────────────────────────────────── */
  const isClean = comparisonMode === "clean";
  const signals = isClean ? cleanSignals : messySignals;

  return (
    <div className="pb-landing min-h-screen">
      <SEOHead
        title="PhotoBrief.ai — Guided customer photo requests"
        description="PhotoBrief.ai turns customer photo chasing into one guided mobile workflow. Send a link, collect the right shots, flag obvious photo issues, and get a clean brief ready to act on."
        canonicalPath="/betalist"
        ogImage="/og-betalist.png"
        ogTitle="PhotoBrief.ai — Stop chasing customer photos"
        ogDescription="Send one guided PhotoBrief link and get a clean, AI-checked brief back."
      />

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative isolate overflow-hidden pt-10 sm:pt-14">
        <div className="pb-lens-field" />
        <div className="pb-container relative z-10 pb-6 sm:pb-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 sm:mb-5">
              <div className="relative inline-flex items-center justify-center">
                <div aria-hidden className="pointer-events-none absolute h-36 w-36 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[60px] sm:h-48 sm:w-48 sm:blur-[80px]" />
                <BrandMark variant="mark" size={88} withGlow eager className="relative sm:hidden" />
                <BrandMark variant="mark" size={120} withGlow eager className="relative hidden sm:inline-flex" />
              </div>
            </div>

            <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta</span>

            <h1 className="pb-hero-title mx-auto mt-3 max-w-2xl text-white sm:mt-4">
              Stop chasing<br className="sm:hidden" /> customer photos.
            </h1>

            <p className="pb-copy mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
              Send one guided PhotoBrief link and get a clean, AI&#8209;checked brief back. For teams that need the right photos before they quote, dispatch, approve, review, document, or follow up.
            </p>

            <div className="mx-auto mt-5 flex max-w-lg flex-col gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
              <Button size="xl" variant="pb-primary" onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}>
                Apply for Founding Partner Beta <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="xl" variant="pb-secondary" onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}>
                See how it works
              </Button>
            </div>

            <div className="mx-auto mt-4 flex max-w-md justify-center gap-2 sm:mt-5 sm:gap-2.5">
              {["No app for customers", "Invite-only beta", "Concierge setup"].map((item) => (
                <span key={item} className="pb-route-chip whitespace-nowrap px-2.5 py-1.5 text-center text-[0.65rem] font-semibold sm:px-3 sm:py-2 sm:text-xs">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ INTERACTIVE DEMO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <InteractiveHeroBriefAssembly />
        </div>
      </section>

      {/* ━━ APPLICATION FORM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="apply" className="pb-section-tight scroll-mt-8">
        <div className="pb-container">
          <div className="pb-command-panel mx-auto max-w-xl p-5 sm:p-6 lg:p-8">
            <div className="relative z-10">
              <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> Apply for beta access</span>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-white sm:text-2xl">Join the Founding Partner Beta</h2>
              <p className="pb-copy mt-2 text-sm">Limited spots · We typically reply within a few days</p>

              <form onSubmit={onSubmit} className="mt-6 grid gap-4">
                <Field id="bl-email" label="Work email" required>
                  <Input id="bl-email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required placeholder="you@company.com" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="bl-name" label="Your name">
                    <Input id="bl-name" value={form.name} onChange={update("name")} autoComplete="name" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                  </Field>
                  <Field id="bl-biz" label="Business name">
                    <Input id="bl-biz" value={form.business_name} onChange={update("business_name")} autoComplete="organization" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="bl-type" label="Business type">
                    <select id="bl-type" value={form.business_type} onChange={update("business_type")} className="flex h-11 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]">
                      <option value="" className="bg-[hsl(var(--pb-ink))]">Select…</option>
                      {BUSINESS_TYPES.map((t) => <option key={t} value={t} className="bg-[hsl(var(--pb-ink))]">{t}</option>)}
                    </select>
                  </Field>
                  <Field id="bl-web" label="Website">
                    <Input id="bl-web" value={form.website} onChange={update("website")} placeholder="https://" autoComplete="url" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                  </Field>
                </div>
                <Field id="bl-usecase" label="What workflow would you use PhotoBrief for?">
                  <Textarea id="bl-usecase" value={form.use_case} onChange={update("use_case")} rows={2} placeholder="e.g. Getting roof damage photos before we send a quote." className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <Field id="bl-vol" label="Approx. monthly photo requests">
                  <select id="bl-vol" value={form.estimated_monthly_requests} onChange={update("estimated_monthly_requests")} className="flex h-11 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]">
                    <option value="" className="bg-[hsl(var(--pb-ink))]">Select…</option>
                    {VOLUMES.map((v) => <option key={v} value={v} className="bg-[hsl(var(--pb-ink))]">{v}</option>)}
                  </select>
                </Field>
                <Button type="submit" size="lg" disabled={submitting} variant="pb-primary" className="w-full">
                  {submitting ? "Submitting…" : "Apply for Founding Partner Beta"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ WORKFLOW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="workflow" className="pb-section">
        <div className="pb-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="pb-eyebrow"><Route className="h-3.5 w-3.5" /> How it works</span>
            <h2 className="pb-section-title mt-4 text-white">From vague request to usable brief.</h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">PhotoBrief guides the customer, keeps context attached, and packages the result for the next business step.</p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="grid gap-3 sm:gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="pb-card grid gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-[4rem_1fr] md:p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))] sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">0{index + 1} · {step.eyebrow}</p>
                      <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">{step.title}</h3>
                      <p className="pb-copy mt-1.5 text-sm sm:text-base">{step.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ BEFORE / AFTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="pb-eyebrow"><MessageSquareWarning className="h-3.5 w-3.5" /> Before / after</span>
            <h2 className="pb-section-title mt-4 text-white">Your team should not have to decode a camera roll.</h2>
          </div>

          <div className="mx-auto mt-6 flex max-w-md rounded-full border border-white/12 bg-[hsl(var(--pb-panel)/0.72)] p-1 sm:mt-8">
            {[
              { id: "messy", label: "Before" },
              { id: "clean", label: "PhotoBrief" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setComparisonMode(item.id as "messy" | "clean")}
                className={`flex-1 rounded-full px-4 py-2.5 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] sm:py-3 ${comparisonMode === item.id ? "bg-[hsl(var(--pb-lavender))] text-[hsl(var(--pb-night))]" : "text-white/58 hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-2xl">
            <div className="pb-command-panel p-4 sm:p-5 md:p-6">
              <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/48">{isClean ? "Structured intake" : "Scattered intake"}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${isClean ? "bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]"}`}>{isClean ? "Ready" : "Messy"}</span>
              </div>
              <div className="relative z-10 mt-4 grid gap-2 sm:mt-5 sm:gap-3">
                {signals.map((signal, index) => (
                  <div key={signal} className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 ${isClean ? "border-[hsl(var(--pb-mint)/0.24)] bg-[hsl(var(--pb-mint)/0.055)]" : "border-white/10 bg-white/[0.035]"}`}>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-8 sm:w-8 ${isClean ? "bg-[hsl(var(--pb-mint)/0.14)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.13)] text-[hsl(var(--pb-lavender))]"}`}>{index + 1}</span>
                    <p className="text-sm font-semibold text-white/82 sm:text-base">{signal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ USE CASES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section">
        <div className="pb-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="pb-eyebrow"><ClipboardList className="h-3.5 w-3.5" /> Use cases</span>
            <h2 className="pb-section-title mt-4 text-white">Built for moments when photos decide the next step.</h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">PhotoBrief is built for teams that need customer media before quoting, scheduling, approving, reviewing, or documenting work.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2">
            {useCases.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="pb-card p-4 sm:p-5 md:p-6">
                  <Icon className="h-6 w-6 text-[hsl(var(--pb-lavender))] sm:h-7 sm:w-7" />
                  <span className="pb-stamp mt-4 inline-flex rounded-full px-3 py-1 sm:mt-5">{item.stamp}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-white sm:mt-4 sm:text-xl">{item.title}</h3>
                  <p className="pb-copy mt-2 text-sm leading-6">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━ FOUNDING PARTNER BETA ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <div className="pb-command-panel grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
            <div className="relative z-10">
              <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> Founding beta</span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Built with real workflows, not toy testing.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">We are inviting a small group of businesses to use PhotoBrief in real intake scenarios before public launch. You get hands-on setup and early influence; we get honest workflow feedback.</p>
              <Button size="lg" variant="pb-primary" className="mt-6" onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}>
                Apply now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="relative z-10 grid gap-4 sm:grid-cols-2">
              <BenefitList title="Beta partners get" items={partnerBenefits} />
              <BenefitList title="We ask for" items={partnerAsks} />
            </div>
          </div>
        </div>
      </section>

      {/* ━━ TRUST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
            {trustPoints.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="pb-card p-4 text-center sm:p-5">
                <Icon className="mx-auto h-5 w-5 text-[hsl(var(--pb-muted))]" />
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="pb-copy mt-1 text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section">
        <div className="pb-container">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-6 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))] sm:p-8 lg:p-12">
            <div className="pb-lens-field" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <BrandMark variant="horizontal" tone="light" size={48} className="justify-center" withGlow />
              <h2 className="pb-section-title mt-5 text-white">Send one link. Get a usable brief.</h2>
              <p className="pb-copy mx-auto mt-4 max-w-xl text-base sm:text-lg">Give customers a clear path, give your team a clean packet, and stop turning every quote into a photo scavenger hunt.</p>
              <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row sm:gap-3">
                <Button size="xl" variant="pb-primary" onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}>
                  Apply for Founding Partner Beta <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <p className="mt-4 text-xs font-medium text-white/46 sm:text-sm">Customers do not need an account or app to complete a PhotoBrief request.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2.5 text-center text-xs text-white/30">
          <BrandMark variant="horizontal" tone="light" size={26} />
          <p>© {new Date().getFullYear()} PhotoBrief.ai · <NavLink to="/privacy" className="hover:text-white/60">Privacy</NavLink> · <NavLink to="/terms" className="hover:text-white/60">Terms</NavLink></p>
        </div>
      </footer>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function BenefitList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.2rem] border border-white/12 bg-white/[0.035] p-4 sm:rounded-[1.4rem] sm:p-5">
      <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h3>
      <ul className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-white/76">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1 inline-block text-[13px] text-white/75">
        {label}
        {required && <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>}
      </Label>
      {children}
    </div>
  );
}
