import { useEffect, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Crown,
  FileCheck2,
  Gift,
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
  Trophy,
  Users,
} from "lucide-react";

import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/components/layout/BrandMark";
import { InteractiveHeroBriefAssembly } from "@/components/marketing/InteractiveHeroBriefAssembly";
import { FreeProEligibilityModal } from "@/components/marketing/FreeProEligibilityModal";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { conversions, trackEvent } from "@/lib/analytics";
import {
  PARTNER_BENEFITS,
  PARTNER_EXPECTATIONS,
  CONFIRMATION_SUMMARY,
  DETAILED_EXPECTATIONS,
  REWARD_TIERS,
  REWARD_CRITERIA,
  BETA_DURATION_DAYS,
  BETA_TOTAL_PARTNERS,
} from "@/config/betaProgram";

/* ── constants ──────────────────────────────────────────── */


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
  const interest = params.get("interest") || "founding-partner";
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"new" | "already" | null>(null);
  const [comparisonMode, setComparisonMode] = useState<"messy" | "clean">("messy");
  const [applicationStarted, setApplicationStarted] = useState(false);

  /* ── UTM / attribution ──────────────────────────────────── */
  const utmContext = useRef(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      source: "betalist" as const,
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      referrer: document.referrer || undefined,
      ref: ref || undefined,
    };
  }).current;
  const utm = utmContext();

  useEffect(() => {
    trackEvent("betalist_page_view", utm);
  }, []);

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

  /* ── Track first form interaction ─────────────────────── */
  const handleFormFocus = () => {
    if (!applicationStarted) {
      setApplicationStarted(true);
      trackEvent("betalist_application_started", utm);
    }
  };

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
          interest,
          source,
        },
      });
      if (error) throw error;
      const payload = data as { ok?: boolean; already?: boolean } | null;
      if (payload?.already) {
        trackEvent("betalist_application_submitted", { ...utm, duplicate: true });
        setDone("already");
      } else {
        trackEvent("betalist_application_submitted", { ...utm, business_type: form.business_type || undefined });
        conversions.waitlistSubmitted({ interest: "betalist", business_type: form.business_type || undefined });
        setDone("new");
      }
    } catch {
      trackEvent("betalist_application_error", utm);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Post-submission thank-you ─────────────────────────── */
  if (done) {
    return (
      <>
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
                <h1 className="pb-section-title mt-6 text-white">You're on the list</h1>
                <p className="pb-copy mt-4">
                  Thanks — you're on the Founding Partner Beta list. We'll review your fit and reach out with next steps.
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
                {CONFIRMATION_SUMMARY}
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs text-white/40">
                Questions? <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--pb-lavender))] hover:underline">hello@photobrief.ai</a>
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  /* ── Landing page ──────────────────────────────────────── */
  const isClean = comparisonMode === "clean";
  const signals = isClean ? cleanSignals : messySignals;

  return (
    <>
      <SEOHead
        title="PhotoBrief.ai — Guided customer photo requests"
        description="PhotoBrief.ai turns customer photo chasing into one guided mobile workflow. Send a link, collect the right shots, flag obvious photo issues, and get a clean brief ready to act on."
        canonicalPath="/betalist"
        ogImage="/og-betalist.png"
        ogTitle="PhotoBrief.ai — Stop chasing customer photos"
        ogDescription="Send one guided PhotoBrief link and get a clean, AI-checked brief back."
      />

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative isolate overflow-hidden pt-8 sm:pt-14">
        <div className="pb-lens-field" />
        <div className="pb-container relative z-10 pb-4 sm:pb-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 sm:mb-5">
              <div className="relative inline-flex items-center justify-center">
                <div aria-hidden className="pointer-events-none absolute h-28 w-28 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[50px] sm:h-48 sm:w-48 sm:blur-[80px]" />
                <BrandMark variant="mark" size={56} withGlow eager className="relative sm:hidden" />
                <BrandMark variant="mark" size={120} withGlow eager className="relative hidden sm:inline-flex" />
              </div>
            </div>

            <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta</span>

            <h1 className="pb-hero-title mx-auto mt-2 max-w-2xl text-white sm:mt-4">
              Stop chasing customer photos.
            </h1>

            <p className="pb-copy mx-auto mt-3 max-w-xl text-[0.938rem] leading-[1.6] sm:mt-4 sm:max-w-2xl sm:text-lg sm:leading-8">
              Send one guided link. Get a clean, AI&#8209;checked brief back — ready to quote, dispatch, or act on.
            </p>

            <div className="mx-auto mt-4 flex max-w-lg flex-col gap-2 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
              <Button size="xl" variant="pb-primary" onClick={() => { trackEvent("betalist_primary_cta_clicked", { ...utm, location: "hero" }); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}>
                Apply for beta access <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button size="xl" variant="pb-secondary" onClick={() => { trackEvent("betalist_secondary_cta_clicked", { ...utm, location: "hero" }); document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" }); }}>
                See how it works
              </Button>
            </div>

            <div className="mx-auto mt-3 flex max-w-md justify-center gap-2 sm:mt-5 sm:gap-2.5">
              {["No app for customers", "Invite-only beta", "Concierge setup"].map((item) => (
                <span key={item} className="pb-route-chip whitespace-nowrap px-2 py-1 text-center text-[0.6rem] font-semibold sm:px-3 sm:py-2 sm:text-xs">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ FREE PRO FOR LIFE SPOTLIGHT ━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-gradient-to-br from-[hsl(var(--pb-violet)/0.18)] via-[hsl(var(--pb-ink))] to-[hsl(var(--pb-lavender)/0.10)] p-5 sm:p-8">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--pb-lavender)/0.15)] blur-[60px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[hsl(var(--pb-mint)/0.10)] blur-[50px]" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] shadow-lg shadow-[hsl(var(--pb-violet)/0.4)]">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--pb-lavender))]">The ultimate reward</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
                2 partners get <span className="bg-gradient-to-r from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-mint))] bg-clip-text text-transparent">Free Pro for Life</span>
              </h2>
              <p className="pb-copy mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base">
                The two beta partners who deliver the most useful, actionable feedback
                earn a permanent Pro plan — no invoice, no expiration, no strings.
                Your feedback literally shapes the product and your reward reflects that.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white/70">
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                  <Crown className="h-3.5 w-3.5 text-[hsl(var(--pb-lavender))]" /> Quality over quantity
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                  <Gift className="h-3.5 w-3.5 text-[hsl(var(--pb-mint))]" /> All {BETA_TOTAL_PARTNERS} partners earn rewards
                </span>
              </div>
              <Button
                size="lg"
                variant="pb-primary"
                className="mt-6"
                onClick={() => { trackEvent("betalist_free_pro_cta_clicked", utm); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                Apply now — limited to {BETA_TOTAL_PARTNERS} spots <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ APPLICATION FORM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="apply" className="pb-section-tight scroll-mt-8">
        <div className="pb-container">
          <div className="pb-command-panel mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
            <div className="relative z-10">
              <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> Apply for beta access</span>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-white sm:mt-4 sm:text-2xl">Join the Founding Partner Beta</h2>
              <p className="pb-copy mt-1.5 text-sm">Limited spots · We typically reply within a few days</p>

              <form onSubmit={onSubmit} onFocusCapture={handleFormFocus} className="mt-5 grid gap-3.5 sm:mt-6 sm:gap-4">
                <Field id="bl-email" label="Work email" required>
                  <Input id="bl-email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required placeholder="you@company.com" className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <Field id="bl-biz" label="Business name" required>
                  <Input id="bl-biz" value={form.business_name} onChange={update("business_name")} autoComplete="organization" required className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <Field id="bl-web" label="Website">
                  <Input id="bl-web" value={form.website} onChange={update("website")} placeholder="https://" autoComplete="url" className="h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <Field id="bl-usecase" label="What do you need customer photos for?" required>
                  <Textarea id="bl-usecase" value={form.use_case} onChange={update("use_case")} rows={2} required placeholder="e.g. Getting roof damage photos before we send a quote." className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                  <Field id="bl-vol" label="Approx. monthly photo requests">
                    <select id="bl-vol" value={form.estimated_monthly_requests} onChange={update("estimated_monthly_requests")} className="flex h-12 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]">
                      <option value="" className="bg-[hsl(var(--pb-ink))]">Select…</option>
                      {VOLUMES.map((v) => <option key={v} value={v} className="bg-[hsl(var(--pb-ink))]">{v}</option>)}
                    </select>
                  </Field>
                  <Field id="bl-fit" label="Best fit">
                    <select id="bl-fit" value={form.workflow_type} onChange={update("workflow_type")} className="flex h-12 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]">
                      <option value="" className="bg-[hsl(var(--pb-ink))]">Select…</option>
                      {WORKFLOW_TYPES.map((w) => <option key={w} value={w} className="bg-[hsl(var(--pb-ink))]">{w}</option>)}
                    </select>
                  </Field>
                </div>
                <Button type="submit" size="lg" disabled={submitting} variant="pb-primary" className="mt-1 h-12 w-full text-base">
                  {submitting ? "Submitting…" : "Apply for beta access"}
                </Button>
              </form>
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
              <Button size="lg" variant="pb-primary" className="mt-6" onClick={() => { trackEvent("betalist_primary_cta_clicked", { ...utm, location: "founding_beta" }); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}>
                Apply now <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="relative z-10 grid gap-4 sm:grid-cols-2">
              <BenefitList title="Beta partners get" items={[...PARTNER_BENEFITS]} />
              <BenefitList title="We ask for" items={[...PARTNER_EXPECTATIONS]} />
            </div>
          </div>
        </div>
      </section>

      {/* ━━ EXPECTATIONS & REWARDS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section">
        <div className="pb-container">
          <div className="mx-auto max-w-3xl text-center">
            <span className="pb-eyebrow"><Users className="h-3.5 w-3.5" /> What we expect</span>
            <h2 className="pb-section-title mt-4 text-white">What it means to be a founding beta partner.</h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">
              We're accepting {BETA_TOTAL_PARTNERS} businesses over {BETA_DURATION_DAYS} days. In exchange for free access and significant post-launch rewards, we ask for real usage and honest feedback.
            </p>
          </div>

          {/* Detailed expectations */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="pb-command-panel p-4 sm:p-5 md:p-6">
              <div className="relative z-10">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">Partner expectations</p>
                <div className="mt-4 grid gap-3 sm:gap-4">
                  {DETAILED_EXPECTATIONS.map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-xs font-black text-[hsl(var(--pb-lavender))] sm:h-8 sm:w-8">{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{exp.title}</p>
                        <p className="pb-copy mt-0.5 text-xs leading-5 sm:text-sm">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reward tiers */}
          <div className="mx-auto mt-6 max-w-2xl">
            <div className="pb-command-panel p-4 sm:p-5 md:p-6">
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">Reward tiers</p>
                </div>
                <p className="pb-copy mt-2 text-sm">
                  Every beta partner earns a post-launch discount. Your tier is based on the quality of your feedback — not just how much you use the product.
                </p>

                <div className="mt-4 grid gap-2">
                  {REWARD_TIERS.map((tier) => {
                    const isTopTier = tier.duration === "free-pro";
                    return (
                      <div
                        key={tier.label}
                        className={`flex items-center justify-between rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${
                          isTopTier
                            ? "border-2 border-[hsl(var(--pb-lavender)/0.5)] bg-gradient-to-r from-[hsl(var(--pb-violet)/0.15)] to-[hsl(var(--pb-lavender)/0.08)] shadow-md shadow-[hsl(var(--pb-violet)/0.2)]"
                            : "border border-white/10 bg-white/[0.035]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isTopTier ? (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] sm:h-8 sm:w-8">
                              <Trophy className="h-3.5 w-3.5 text-white" />
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-[10px] font-black text-[hsl(var(--pb-lavender))] sm:h-8 sm:w-8">{tier.count}</span>
                          )}
                          <span className={`text-sm font-semibold ${isTopTier ? "text-[hsl(var(--pb-lavender))]" : "text-white"}`}>{tier.label}</span>
                        </div>
                        <span className={`text-xs font-bold sm:text-sm ${isTopTier ? "text-[hsl(var(--pb-mint))]" : "text-[hsl(var(--pb-mint))]"}`}>{tier.shortDescription}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[1.2rem] border border-[hsl(var(--pb-lavender)/0.2)] bg-[hsl(var(--pb-lavender)/0.04)] p-3 sm:p-4">
                  <p className="text-xs font-semibold text-white/80 sm:text-sm">What drives your tier placement:</p>
                  <ul className="mt-2 grid gap-1.5">
                    {REWARD_CRITERIA.map((criterion) => (
                      <li key={criterion} className="flex items-start gap-2 text-xs text-white/60 sm:text-sm">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--pb-mint)/0.7)]" />
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <Button size="xl" variant="pb-primary" onClick={() => { trackEvent("betalist_primary_cta_clicked", { ...utm, location: "final_cta" }); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}>
                  Apply for beta access <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <p className="mt-4 text-xs font-medium text-white/46 sm:text-sm">Customers do not need an account or app to complete a PhotoBrief request.</p>
            </div>
          </div>
        </div>
      </section>
    </>
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
