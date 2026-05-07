import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  FileCheck2,
  FormInput,
  Gift,
  Globe2,
  ImageOff,
  Link2,
  Lock,
  MailCheck,
  MapPinned,
  MessageSquareWarning,
  PlayCircle,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stamp,
  TimerReset,
  TrendingDown,
  Trophy,
  UserX,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { BrandMark } from "@/components/layout/BrandMark";
import { FreeProEligibilityModal } from "@/components/marketing/FreeProEligibilityModal";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { InteractiveHeroBriefAssembly } from "@/components/marketing/InteractiveHeroBriefAssembly";
import { faqItems } from "@/features/help/content/faq";
import { conversions, trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  PARTNER_BENEFITS,
  PARTNER_EXPECTATIONS,
  CONFIRMATION_SUMMARY,
  DETAILED_EXPECTATIONS,
  REWARD_TIERS,
  REWARD_CRITERIA,
  SCORING_RUBRIC,
  BETA_DURATION_DAYS,
  BETA_TOTAL_PARTNERS,
  BETA_SETUP_BUFFER_DAYS,
  MAX_DISCOUNT_LABEL,
} from "@/config/betaProgram";
import { useBetaSeats } from "@/hooks/useBetaSeats";
import wideGarage from "@/assets/junk-removal/wide-garage.webp";
import pileCloseup from "@/assets/junk-removal/pile-closeup.webp";
import appliances from "@/assets/junk-removal/appliances.webp";
import drivewayAccess from "@/assets/junk-removal/driveway-access.webp";

/* ── JSON-LD ───────────────────────────────────────────────── */

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PhotoBrief.ai helps businesses collect customer photos without email or text-message back-and-forth. Send one guided link, flag simple photo issues, and receive clean customer briefs ready for action.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Team", price: "99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Business", price: "199", priceCurrency: "USD" },
  ],
  featureList: [
    "Clickable manual PhotoBrief request links",
    "Guided customer photo capture — take or upload",
    "Simple AI photo quality checks",
    "Business-ready photo brief summaries",
    "Customer profiles and saved templates",
    "Hosted website intake forms on Pro",
    "Template routing rules and webhook integrations on Pro",
  ],
};

/* ── Section nav anchors ──────────────────────────────────── */

const sectionLinks = [
  { href: "#workflow", label: "How it works" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#beta-program", label: "Beta program" },
  { href: "#apply", label: "Apply" },
];

/* ── Content arrays ───────────────────────────────────────── */

const loosePhotos = [
  { src: wideGarage, label: "Wide area", status: "Useful" },
  { src: pileCloseup, label: "Main pile", status: "Clear" },
  { src: appliances, label: "Appliance", status: "Flagged" },
  { src: drivewayAccess, label: "Access", status: "Ready" },
];

const workflowSteps = [
  { icon: Globe2, eyebrow: "Connect", title: "Add PhotoBrief to your website", body: "Use our hosted intake form, bridge your existing form with a webhook, or send manual links — however your customers reach you." },
  { icon: Camera, eyebrow: "Capture", title: "Customers capture the right shots", body: "They take photos on their phone or upload from any device — one clear prompt at a time, with plain instructions instead of a vague \u201csend a few photos.\u201d" },
  { icon: Route, eyebrow: "Check", title: "Obvious problems get flagged", body: "PhotoBrief calls out missing, unclear, or review-needed shots before your team has to sort through them." },
  { icon: FileCheck2, eyebrow: "Brief", title: "Your team gets a usable packet", body: "Photos, notes, customer context, and next-step status land together for quoting, dispatch, review, or documentation." },
];

const messySignals = [
  "Photos scattered across texts and emails",
  "Missing angles, unclear scale, and bad lighting",
  "Customer notes separated from the job",
  "Follow-up questions before anyone can quote",
  "No clear next action for the team",
];

const cleanSignals = [
  "Required shots requested in order",
  "Customer notes stay with the photos",
  "Simple photo issues are flagged early",
  "The submission arrives as a structured brief",
  "Hosted form replaces or extends your current one",
];

const useCases = [
  { icon: Globe2, title: "Website intake that collects proof", body: "Replace your generic contact form with a hosted PhotoBrief form, or bridge your existing form with a webhook. Either way, every lead arrives with the photos your team needs.", stamp: "Primary" },
  { icon: BadgeCheck, title: "Quote-ready submissions", body: "Ask for the photos your estimator needs before the first call becomes a chain of follow-ups.", stamp: "Quote prep" },
  { icon: MapPinned, title: "Dispatch prep", body: "Collect site access, issue context, and handling notes before a team heads out.", stamp: "Field ready" },
  { icon: ImageOff, title: "Damage documentation", body: "Guide customers through the angles that matter so reviewers can understand the issue quickly.", stamp: "Evidence packet" },
  { icon: ShieldCheck, title: "Approvals and exceptions", body: "Turn customer media into a packet that can be reviewed, approved, or escalated without guessing.", stamp: "Decision ready" },
];

const trustPoints = [
  { icon: Link2, title: "Secure, expiring upload links", desc: "Customers never see your dashboard or internal data." },
  { icon: Smartphone, title: "No app or account for customers", desc: "Take photos on mobile or upload from desktop. No install, no signup, no friction." },
  { icon: Lock, title: "Your data stays yours", desc: "Photos and briefs are never shared or used for training." },
];

const pricingPath = [
  {
    label: "Website intake",
    title: "Replace or extend your form",
    body: "Use a hosted PhotoBrief form on your site, or connect your existing form with a webhook. Every lead triggers a guided photo workflow automatically.",
    bullets: ["Hosted intake form", "Webhook for existing forms", "Template routing"],
  },
  {
    label: "Manual links",
    title: "Send requests on demand",
    body: "Create a request, copy the link, and text or email it to any customer. Great for one-off jobs or when leads come in by phone.",
    bullets: ["Works on every plan", "No website changes", "Fastest path to value"],
  },
];

/* ── Form ──────────────────────────────────────────────────── */

const VOLUMES = ["Fewer than 10", "10–50", "51–200", "200+"];
const WORKFLOW_TYPES = ["Quotes / estimates", "Dispatch prep", "Approvals / reviews", "Returns / warranty", "Documentation", "Other"];

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

/* ── Main component ───────────────────────────────────────── */

export default function LandingPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const interest = params.get("interest") || "founding-partner";

  const [demoOpen, setDemoOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<"messy" | "clean">("messy");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"new" | "already" | null>(null);
  const [applicationStarted, setApplicationStarted] = useState(false);
  const { isFull } = useBetaSeats();

  const utmContext = useRef(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      source: "landing" as const,
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      referrer: document.referrer || undefined,
      ref: ref || undefined,
    };
  }).current;
  const utm = utmContext();

  useEffect(() => {
    trackEvent("landing_page_view", utm);
  }, []);

  const jsonLd = useMemo(
    () => [SOFTWARE_APP_JSONLD, buildHowToJsonLd("Collect customer photos with PhotoBrief", howItWorksSteps), buildFaqJsonLd(faqItems)],
    [],
  );

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

  const handleFormFocus = () => {
    if (!applicationStarted) {
      setApplicationStarted(true);
      trackEvent("application_started", utm);
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
    const source = ref ? `landing:${ref}` : "landing";
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-submit", {
        body: { ...form, name: form.name.trim() || undefined, email: form.email.trim().toLowerCase(), interest, source },
      });
      if (error) throw error;
      const payload = data as { ok?: boolean; already?: boolean } | null;
      if (payload?.already) {
        trackEvent("application_submitted", { ...utm, duplicate: true });
        setDone("already");
      } else {
        trackEvent("application_submitted", { ...utm, business_type: form.business_type || undefined });
        conversions.waitlistSubmitted({ interest: "landing", business_type: form.business_type || undefined });
        setDone("new");
      }
    } catch {
      trackEvent("application_error", utm);
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Post-submission thank-you ─────────────────────────── */
  if (done) {
    return (
      <>
        <PageMeta title="Application received — PhotoBrief.ai" description="Your Founding Partner Beta application has been received." canonicalPath="/" jsonLd={jsonLd} breadcrumbs={[{ name: "Home", path: "/" }]} />
        <section className="pb-section relative isolate">
          <div className="pb-lens-field" />
          <div className="pb-container relative z-10 mx-auto max-w-lg text-center">
            <BrandMark variant="stacked" tone="light" size={72} eager />
            {done === "new" ? (
              <>
                <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)]">
                  <CheckCircle2 className="h-8 w-8 text-[hsl(var(--pb-mint))]" />
                </div>
                <h1 className="pb-section-title mt-6 text-white">You're on the list</h1>
                <p className="pb-copy mt-4">Thanks — you're on the Founding Partner Beta list. We'll review your fit and reach out with next steps.</p>
              </>
            ) : (
              <>
                <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.12)]">
                  <MailCheck className="h-8 w-8 text-[hsl(var(--pb-lavender))]" />
                </div>
                <h1 className="pb-section-title mt-6 text-white">You're already on the list</h1>
                <p className="pb-copy mt-4">We already have your application. No need to resubmit — we'll be in touch as soon as a spot opens.</p>
              </>
            )}
            <div className="pb-card mt-8 p-5 text-left sm:p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">What happens next</p>
              <ol className="mt-4 grid gap-3">
                {["We review your application within a few business days.", "If it's a fit, we send a personal invite with your login link.", "We set up your first templates together via chat or email.", "You start sending guided PhotoBrief links to real customers."].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-xs font-black text-[hsl(var(--pb-lavender))]">{i + 1}</span>
                    <span className="pb-copy text-sm">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-5 rounded-[1.2rem] border border-[hsl(var(--pb-lavender)/0.25)] bg-[hsl(var(--pb-lavender)/0.04)] p-4">
              <p className="text-sm font-semibold text-white/90">Founding Partner Beta includes:</p>
              <p className="pb-copy mt-1.5 text-xs">{CONFIRMATION_SUMMARY}</p>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs text-white/40">Questions? <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--pb-lavender))] hover:underline">hello@photobrief.ai</a></p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="PhotoBrief.ai | One-link customer photo intake"
        description="Collect quote-ready customer photos with one guided link. PhotoBrief helps customers capture the right shots and gives your team a structured brief ready for quotes, dispatch, review, or documentation."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <main className="pb-landing">
        {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[5.5rem] sm:-mt-[5rem] sm:pt-[6rem] lg:pt-[6.5rem]">
          <div className="pb-lens-field" />
          <div className="pb-container relative pb-8 sm:pb-10 lg:pb-12">
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <div className="mb-4 sm:mb-5">
                <div className="relative inline-flex items-center justify-center">
                  <div aria-hidden className="pointer-events-none absolute h-36 w-36 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[60px] sm:h-48 sm:w-48 sm:blur-[80px]" />
                  <BrandMark variant="mark" size={88} eager className="relative sm:hidden" />
                  <BrandMark variant="mark" size={120} eager className="relative hidden sm:inline-flex lg:hidden" />
                  <BrandMark variant="mark" size={144} eager className="relative hidden lg:inline-flex" />
                </div>
              </div>

              <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Accepting beta applications</span>

              <h1 className="pb-hero-title mx-auto mt-3 max-w-2xl text-white sm:mt-4">
                Replace your intake form.
                <span className="mt-1 block text-[hsl(var(--pb-lavender))]">Get photos, not just text.</span>
              </h1>

              <p className="pb-copy mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
                Drop a hosted PhotoBrief form on your website — or connect it to your existing one with a webhook. Customers capture or upload the exact photos you need from any device, and your team gets a structured brief instead of a vague message.
              </p>

              <div className="mx-auto mt-5 flex max-w-lg flex-col gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
                <Button size="xl" variant="pb-primary" onClick={() => { trackEvent("cta_click", { location: "hero", label: "primary" }); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}>
                  {isFull ? "Join the waitlist" : "Apply now"} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button asChild size="xl" variant="pb-secondary">
                  <a href="#workflow" onClick={() => trackEvent("cta_click", { location: "hero", label: "workflow" })}>See how it works</a>
                </Button>
                <Button size="xl" variant="pb-ghost" onClick={() => setDemoOpen(true)}>
                  <PlayCircle className="mr-1.5 h-4.5 w-4.5" /> Product spotlight
                </Button>
              </div>

              <div className="mx-auto mt-4 flex max-w-md justify-center gap-2 sm:mt-5 sm:gap-2.5">
                {["Hosted form or webhook", "Take or upload photos", "No app needed"].map((item) => (
                  <span key={item} className="pb-route-chip whitespace-nowrap px-2.5 py-1.5 text-center text-[0.65rem] font-semibold sm:px-3 sm:py-2 sm:text-xs">{item}</span>
                ))}
              </div>

              <BetaSeatTracker className="mx-auto mt-4 max-w-sm sm:mt-5" />
            </div>
          </div>
        </section>

        {/* ━━ PAIN POINTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <PainPointSection />

        {/* ━━ FREE PRO FOR LIFE SPOTLIGHT ━━━━━━━━━━━━━━━━━━━━ */}
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
                  The two beta partners who deliver the most useful, actionable feedback earn a permanent Pro plan — no invoice, no expiration, no strings. Your feedback literally shapes the product and your reward reflects that.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white/70">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5"><Crown className="h-3.5 w-3.5 text-[hsl(var(--pb-lavender))]" /> Quality over quantity</span>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5"><Gift className="h-3.5 w-3.5 text-[hsl(var(--pb-mint))]" /> All {BETA_TOTAL_PARTNERS} partners earn rewards</span>
                </div>
                <FreeProEligibilityModal>
                  {(open) => (
                    <button type="button" onClick={open} className="mt-4 text-xs font-semibold text-[hsl(var(--pb-lavender))] underline decoration-[hsl(var(--pb-lavender)/0.4)] underline-offset-2 transition hover:text-white hover:decoration-white/60">
                      Terms &amp; eligibility →
                    </button>
                  )}
                </FreeProEligibilityModal>
                <Button size="lg" variant="pb-primary" className="mt-4" onClick={() => { trackEvent("free_pro_cta_clicked", { location: "spotlight" }); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}>
                  {isFull ? "Join the waitlist" : `Apply now — ${BETA_TOTAL_PARTNERS} seats, reviewed for fit`} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
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

        {/* ━━ SECTION NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <SectionNav />

        {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <WorkflowSection />

        {/* ━━ BEFORE / AFTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <ComparisonSection mode={comparisonMode} onModeChange={setComparisonMode} />

        {/* ━━ USE CASES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <UseCaseSection />

        {/* ━━ FOUNDING PARTNER BETA ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <FoundingPartnerSection utm={utm} isFull={isFull} />

        {/* ━━ PRICING PATH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <PricingPathSection />

        {/* ━━ TRUST POINTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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

        {/* ━━ APPLICATION FORM ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="apply" className="pb-section scroll-mt-8">
          <div className="pb-container">
            <div className="pb-command-panel mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
              <div className="relative z-10">
                <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> {isFull ? "Waitlist" : "Apply for beta"}</span>
                <h2 className="mt-3 text-lg font-semibold tracking-tight text-white sm:mt-4 sm:text-2xl">{isFull ? "Join the Waitlist" : "Apply for the Founding Partner Beta"}</h2>
                <p className="pb-copy mt-1.5 text-sm">Every application is reviewed for workflow fit · Limited to {BETA_TOTAL_PARTNERS} seats</p>
                <BetaSeatTracker variant="compact" className="mt-3" />

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
                    {submitting ? "Submitting…" : isFull ? "Join the waitlist" : "Submit your application"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <FinalCta isFull={isFull} />
      </main>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-5xl overflow-hidden border-0 bg-black p-0 sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>PhotoBrief product spotlight</DialogTitle>
            <DialogDescription>A product spotlight showing manual links, website intake, template routing, customer capture, photo checks, and the finished business brief.</DialogDescription>
          </VisuallyHidden>
          <video key={demoOpen ? "open" : "closed"} src="/marketing/photobrief-demo.mp4" controls autoPlay playsInline className="h-auto w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Sub-components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const painPoints = [
  {
    icon: Clock,
    stat: "62% of first quotes are delayed",
    context: "…waiting for photos the customer forgot to send.",
  },
  {
    icon: MessageSquareWarning,
    stat: "5+ back-and-forth messages",
    context: "…just to get the right angle, scale, or context for one job.",
  },
  {
    icon: FormInput,
    stat: "Forms capture text, not proof",
    context: "Your intake form collects a name and a message. PhotoBrief replaces or extends it to collect the photos your team actually needs.",
  },
  {
    icon: UserX,
    stat: "75% of consumers prefer zero human contact",
    context: "They want to self-serve on their phone — not call, not email, not wait for a callback.",
  },
  {
    icon: TrendingDown,
    stat: "Low-quality leads look identical to good ones",
    context: "Without photos, your team triages blind and wastes site visits on jobs that don't convert.",
  },
];

function PainPointSection() {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <MessageSquareWarning className="h-3.5 w-3.5" /> The gap
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Your intake process is losing you money.
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            Between the first "can you send a few photos?" and a quote your team can act on, hours disappear into email chains, blurry snapshots, and missing context.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <article
                key={point.stat}
                className="pb-card flex gap-4 p-4 sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight text-white sm:text-base">
                    {point.stat}
                  </p>
                  <p className="pb-copy mt-1 text-xs leading-relaxed sm:text-sm">
                    {point.context}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="pb-copy mx-auto mt-6 max-w-xl text-center text-sm italic sm:mt-8 sm:text-base">
          PhotoBrief closes the gap between first contact and actionable information.
        </p>
      </div>
    </section>
  );
}

function SectionNav() {
  return (
    <nav aria-label="Landing page sections" className="sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-night)/0.82)] backdrop-blur-xl">
      <div className="pb-container flex justify-start gap-1.5 overflow-x-auto py-2 sm:gap-2 sm:py-3 sm:justify-center">
        {sectionLinks.map((item) => (
          <a key={item.href} href={item.href} onClick={() => trackEvent("landing_jump_nav_click", { target: item.href })} className="min-w-max rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-white/62 transition hover:border-white/14 hover:bg-white/7 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] sm:px-4 sm:py-2 sm:text-sm">
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="pb-section">
      <div className="pb-container">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-10">
          <div>
            <span className="pb-eyebrow"><Route className="h-3.5 w-3.5" /> How it works</span>
            <h2 className="pb-section-title mt-4 max-w-xl text-white">From vague request to usable brief.</h2>
            <p className="pb-copy mt-4 max-w-lg text-base sm:text-lg">PhotoBrief does not just collect uploads. It guides the customer, keeps context attached, and packages the result for the next business step.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[hsl(var(--pb-lavender))] via-[hsl(var(--pb-mint))] to-transparent md:block" />
            <div className="grid gap-3 sm:gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="pb-card relative grid gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-[4rem_1fr] md:p-6">
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))] sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">0{index + 1} · {step.eyebrow}</p>
                      <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:mt-2 sm:text-2xl">{step.title}</h3>
                      <p className="pb-copy mt-1.5 max-w-2xl text-sm sm:mt-2 sm:text-base">{step.body}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection({ mode, onModeChange }: { mode: "messy" | "clean"; onModeChange: (mode: "messy" | "clean") => void }) {
  const isClean = mode === "clean";
  const signals = isClean ? cleanSignals : messySignals;

  return (
    <section id="comparison" className="pb-section-tight">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><MessageSquareWarning className="h-3.5 w-3.5" /> Before / after</span>
          <h2 className="pb-section-title mt-4 text-white">Your team should not have to decode a camera roll.</h2>
          <p className="pb-copy mt-4 text-lg">The value is not "more photos." The value is getting the right photos, tied to the right job, with enough context to act.</p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md rounded-full border border-white/12 bg-[hsl(var(--pb-panel)/0.72)] p-1 sm:mt-10">
          {[{ id: "messy", label: "Before" }, { id: "clean", label: "PhotoBrief" }].map((item) => (
            <button key={item.id} type="button" onClick={() => onModeChange(item.id as "messy" | "clean")} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] sm:py-3 ${mode === item.id ? "bg-[hsl(var(--pb-lavender))] text-[hsl(var(--pb-night))]" : "text-white/58 hover:text-white"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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

          <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-white/12 bg-[hsl(var(--pb-panel)/0.58)] p-4 sm:min-h-[420px] sm:rounded-[2rem] sm:p-5">
            <div className="absolute inset-0 opacity-35"><div className="pb-lens-field" /></div>
            {isClean ? <CleanPacketVisual /> : <MessyThreadVisual />}
          </div>
        </div>
      </div>
    </section>
  );
}

function MessyThreadVisual() {
  const items = [
    { text: "Can you send a few pics?", x: "left-4", y: "top-8", rot: "-rotate-2" },
    { text: "Is this enough?", x: "right-6", y: "top-24", rot: "rotate-3" },
    { text: "Need the other side too", x: "left-10", y: "top-44", rot: "rotate-2" },
    { text: "Which job was this for?", x: "right-10", y: "bottom-12", rot: "-rotate-3" },
  ];
  return (
    <div className="relative z-10 h-full min-h-[280px] sm:min-h-[380px]">
      {items.map((item) => (
        <div key={item.text} className={`absolute ${item.x} ${item.y} ${item.rot} max-w-[12rem] rounded-2xl border border-white/10 bg-black/35 p-3 shadow-2xl sm:max-w-[15rem] sm:rounded-3xl sm:p-4`}>
          <p className="text-xs font-semibold text-white/74 sm:text-sm">{item.text}</p>
        </div>
      ))}
      <figure className="pb-photo-frame absolute bottom-16 left-4 w-28 -rotate-6 opacity-80 sm:bottom-20 sm:left-8 sm:w-36">
        <img src={appliances} alt="Loose customer photo without context" className="h-20 w-full object-cover sm:h-28" width={300} height={300} loading="lazy" sizes="(min-width:640px) 144px, 112px" />
      </figure>
      <figure className="pb-photo-frame absolute bottom-24 right-6 w-28 rotate-6 opacity-70 sm:bottom-28 sm:right-12 sm:w-36">
        <img src={drivewayAccess} alt="Another loose customer photo without context" className="h-20 w-full object-cover sm:h-28" width={300} height={300} loading="lazy" sizes="(min-width:640px) 144px, 112px" />
      </figure>
    </div>
  );
}

function CleanPacketVisual() {
  return (
    <div className="relative z-10 mx-auto max-w-md rounded-[1.65rem] bg-[hsl(var(--pb-paper))] p-5 text-[hsl(var(--pb-ink))] shadow-[0_30px_80px_-45px_hsl(var(--pb-shadow))]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-black/42">PhotoBrief packet</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight">Quote review</h3>
        </div>
        <span className="pb-stamp rounded-full px-3 py-1">Ready</span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {loosePhotos.map((photo) => (
          <img key={photo.label} src={photo.src} alt={`${photo.label} organized in a brief`} className="h-16 rounded-xl object-cover" loading="lazy" width={300} height={300} sizes="80px" />
        ))}
      </div>
      <div className="mt-5 space-y-2 text-sm font-semibold text-black/64">
        <p className="rounded-2xl bg-black/[0.055] p-3">Required photos complete: 4 of 4</p>
        <p className="rounded-2xl bg-black/[0.055] p-3">Customer notes attached to the right job</p>
        <p className="rounded-2xl bg-black/[0.055] p-3">Next action: estimate cleanout cost</p>
      </div>
    </div>
  );
}

function UseCaseSection() {
  return (
    <section id="use-cases" className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><ClipboardList className="h-3.5 w-3.5" /> Use cases</span>
          <h2 className="pb-section-title mt-4 text-white">Useful anywhere a missing photo slows the next step.</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">PhotoBrief is built for teams that need customer media before quoting, scheduling, approving, reviewing, or documenting work.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {useCases.slice(0, 3).map((item) => {
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
        <div className="mx-auto mt-4 grid max-w-4xl gap-4 md:grid-cols-2">
          {useCases.slice(3).map((item) => {
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
  );
}

function FoundingPartnerSection({ utm, isFull }: { utm: Record<string, string | undefined>; isFull: boolean }) {
  return (
    <section id="beta-program" className="pb-section">
      <div className="pb-container">
        {/* Benefits & expectations */}
        <div className="pb-command-panel grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8 xl:p-10">
          <div className="relative z-10">
            <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> Accepting applications</span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">Built with real workflows, not toy testing.</h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">We're accepting applications from businesses that collect photos as part of real intake, inspection, or documentation workflows. You get hands-on setup and early influence; we get honest workflow feedback.</p>
            <Button size="lg" variant="pb-primary" className="mt-6" onClick={() => { trackEvent("cta_click", { ...utm, location: "founding_beta" }); document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" }); }}>
              {isFull ? "Join the waitlist" : "Apply now"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            <BenefitList title="Beta partners get" items={[...PARTNER_BENEFITS]} />
            <BenefitList title="We ask for" items={[...PARTNER_EXPECTATIONS]} />
          </div>
        </div>

        {/* Detailed expectations */}
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <span className="pb-eyebrow"><Users className="h-3.5 w-3.5" /> What we expect</span>
          <h2 className="pb-section-title mt-4 text-white">What it means to be a founding beta partner.</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            We're accepting {BETA_TOTAL_PARTNERS} businesses. The {BETA_DURATION_DAYS}-day beta clock starts {BETA_SETUP_BUFFER_DAYS} days after the final seat is filled, giving every partner time for concierge setup. In exchange for free access and significant post-launch rewards, we ask for real usage and honest feedback.
          </p>
        </div>

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
              <p className="pb-copy mt-2 text-sm">Every beta partner earns a post-launch discount. Your tier is based on the quality of your feedback — not just how much you use the product.</p>
              <div className="mt-4 grid gap-2">
                {REWARD_TIERS.map((tier) => {
                  const isTopTier = tier.duration === "free-pro";
                  return (
                    <div key={tier.label} className={`flex items-center justify-between rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${isTopTier ? "border-2 border-[hsl(var(--pb-lavender)/0.5)] bg-gradient-to-r from-[hsl(var(--pb-violet)/0.15)] to-[hsl(var(--pb-lavender)/0.08)] shadow-md shadow-[hsl(var(--pb-violet)/0.2)]" : "border border-white/10 bg-white/[0.035]"}`}>
                      <div className="flex items-center gap-3">
                        {isTopTier ? (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] sm:h-8 sm:w-8"><Trophy className="h-3.5 w-3.5 text-white" /></span>
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-[10px] font-black text-[hsl(var(--pb-lavender))] sm:h-8 sm:w-8">{tier.count}</span>
                        )}
                        <span className={`text-sm font-semibold ${isTopTier ? "text-[hsl(var(--pb-lavender))]" : "text-white"}`}>{tier.label}</span>
                      </div>
                      <span className="text-xs font-bold text-[hsl(var(--pb-mint))] sm:text-sm">{tier.shortDescription}</span>
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

        {/* Scoring rubric */}
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <span className="pb-eyebrow"><Trophy className="h-3.5 w-3.5" /> Scoring rubric</span>
          <h2 className="pb-section-title mt-4 text-white">How we pick the top&nbsp;2</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            There's no secret formula — just four dimensions we weight equally-ish. Here's exactly what we look at and what "great" looks like.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:mt-10">
          {SCORING_RUBRIC.map((dim) => (
            <div key={dim.label} className="pb-command-panel p-4 sm:p-5 md:p-6">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">{dim.label}</h3>
                  <span className="rounded-full border border-[hsl(var(--pb-lavender)/0.3)] bg-[hsl(var(--pb-lavender)/0.08)] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider text-[hsl(var(--pb-lavender))]">{dim.weight}</span>
                </div>
                <p className="pb-copy mt-2 text-sm leading-relaxed">{dim.description}</p>
                <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.025] p-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/40">Examples of great feedback</p>
                  {dim.examples.map((ex, i) => (
                    <p key={i} className="mt-1.5 text-xs italic leading-relaxed text-white/60 sm:text-sm">{ex}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <div className="rounded-[1.2rem] border border-[hsl(var(--pb-mint)/0.2)] bg-[hsl(var(--pb-mint)/0.04)] p-4 text-center">
            <p className="text-sm font-semibold text-white/90">Every partner earns a reward tier. The rubric above determines who lands in the top&nbsp;2.</p>
            <p className="pb-copy mt-1 text-xs">Scores are assessed by the PhotoBrief team at the end of the {BETA_DURATION_DAYS}-day beta (which starts {BETA_SETUP_BUFFER_DAYS} days after the final seat is filled). No self-reporting required — we track engagement internally.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingPathSection() {
  return (
    <section className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><TimerReset className="h-3.5 w-3.5" /> Start manual. Automate later.</span>
          <h2 className="pb-section-title mt-4 text-white">Use one link first. Add automation when it pays for itself.</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">Start with manual PhotoBrief links. Upgrade to Pro when website leads, routed requests, and form handoffs should happen without copy/paste.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-2">
          {pricingPath.map((tier) => (
            <article key={tier.label} className="pb-card p-5 sm:p-6 lg:p-8">
              <span className="pb-eyebrow border-white/12 bg-white/[0.03]">{tier.label}</span>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{tier.title}</h3>
              <p className="pb-copy mt-2.5 text-sm leading-6 sm:mt-3 sm:text-base sm:leading-7">{tier.body}</p>
              <ul className="mt-5 grid gap-2.5 sm:mt-6 sm:gap-3">
                {tier.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm font-semibold text-white/78">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /> {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ isFull }: { isFull: boolean }) {
  return (
    <section className="pb-section">
      <div className="pb-container">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-6 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))] sm:p-8 lg:p-12">
          <div className="pb-lens-field" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <BrandMark variant="horizontal" tone="light" size={48} className="justify-center" />
            <h2 className="pb-section-title mt-5 text-white">Send one link. Get a usable brief.</h2>
            <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">Give customers a clear path, give your team a clean packet, and stop turning every quote into a photo scavenger hunt.</p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row sm:gap-3">
              <Button size="xl" variant="pb-primary" onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}>
                {isFull ? "Join the waitlist" : "Apply now"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button asChild size="xl" variant="pb-secondary">
                <NavLink to="/pricing">See plans</NavLink>
              </Button>
            </div>
            <p className="mt-4 text-xs font-medium text-white/46 sm:text-sm">Customers do not need an account or app to complete a PhotoBrief request.</p>
          </div>
        </div>
      </div>
    </section>
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
