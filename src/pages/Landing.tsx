import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  DollarSign,
  Eye,
  FileCheck2,
  FormInput,
  Gift,
  Globe2,
  ImageOff,
  Link2,
  Lock,
  MapPinned,
  MessageSquareWarning,
  PlayCircle,
  Route,
  Scan,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stamp,
  TimerReset,
  TrendingDown,
  Trophy,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { BrandMark } from "@/components/layout/BrandMark";
import { FreeProEligibilityModal } from "@/components/marketing/FreeProEligibilityModal";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import { BetaOnboardingAgentExperience } from "@/components/marketing/BetaOnboardingAgentExperience";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
const InteractiveHeroBriefAssembly = lazy(() =>
  import("@/components/marketing/InteractiveHeroBriefAssembly").then((m) => ({
    default: m.InteractiveHeroBriefAssembly,
  })),
);
import { faqItems } from "@/features/help/content/faq";
import { trackEvent } from "@/lib/analytics";
import {
  PARTNER_BENEFITS,
  PARTNER_EXPECTATIONS,
  DETAILED_EXPECTATIONS,
  REWARD_TIERS,
  REWARD_CRITERIA,
  SCORING_RUBRIC,
  BETA_DURATION_DAYS,
  BETA_TOTAL_PARTNERS,
  BETA_SETUP_BUFFER_DAYS,
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
    "Replace weak website forms with guided visual intake. PhotoBrief scans your website, maps your services, and gives customers a simple photo-guided path so your team gets actionable lead packets instead of vague messages.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Team", price: "99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Business", price: "199", priceCurrency: "USD" },
  ],
  featureList: [
    "Website Intelligence — scan and map intake paths",
    "Guided customer photo capture — take or upload",
    "Simple AI photo quality checks",
    "Actionable lead packets with photos, notes, and context",
    "Customer profiles and saved templates",
    "Hosted intake links or embeddable forms",
    "Template routing rules and webhook integrations",
  ],
};

/* ── Section nav anchors ──────────────────────────────────── */

const sectionLinks = [
  { href: "#workflow", label: "How it works" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#website-intelligence", label: "Website Intelligence" },
  { href: "#beta-program", label: "Beta rewards" },
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
  {
    icon: Scan,
    eyebrow: "Scan",
    title: "We scan your website",
    body: "PhotoBrief identifies your service pages, quote buttons, contact forms, and intake gaps — so we know where guided visual intake fits.",
  },
  {
    icon: Route,
    eyebrow: "Map",
    title: "We map the right intake paths",
    body: "Your services are compressed into 2–3 simple customer choices, each with the right photo prompts attached.",
  },
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "Customers submit the right photos and context",
    body: "They open a guided flow on their phone or desktop — one clear prompt at a time — and attach notes, details, and photos before submitting.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Deliver",
    title: "Your team gets an actionable lead packet",
    body: "Photos, notes, customer context, and readiness status land together — structured and ready for quoting, dispatch, or documentation.",
  },
];

const messySignals = [
  "Generic contact form captures name and message only",
  "Photos arrive later through text or email",
  "Missing scale, angles, and context",
  "Team follows up manually before they can act",
  "Lower-quality leads get lost or deprioritized",
];

const cleanSignals = [
  "Customer chooses the right service path",
  "Required photos are requested in order",
  "Notes and photos stay attached to the lead",
  "Readiness issues are visible before review",
  "Team receives an actionable lead packet",
];

const useCases = [
  {
    icon: BadgeCheck,
    title: "Quote and estimate requests",
    body: "Ask for the photos your estimator needs before the first call becomes a chain of follow-ups.",
    stamp: "Quote-ready",
  },
  {
    icon: MapPinned,
    title: "Service and dispatch prep",
    body: "Collect site access, issue context, and handling notes before a team heads out.",
    stamp: "Field-ready",
  },
  {
    icon: ImageOff,
    title: "Damage, warranty, and claims",
    body: "Guide customers through the angles that matter so reviewers can understand the issue quickly.",
    stamp: "Evidence packet",
  },
  {
    icon: ShieldCheck,
    title: "Approvals and exceptions",
    body: "Turn customer media into a packet that can be reviewed, approved, or escalated without guessing.",
    stamp: "Decision-ready",
  },
  {
    icon: Eye,
    title: "Product and service questions where visuals matter",
    body: "When a customer's question only makes sense with a photo, give them a simple path to show what they mean.",
    stamp: "Visual context",
  },
];

const trustPoints = [
  {
    icon: Link2,
    title: "Secure, expiring upload links",
    desc: "Customers never see your dashboard or internal data.",
  },
  {
    icon: Smartphone,
    title: "No app or account for customers",
    desc: "Take photos on mobile or upload from desktop. No install, no signup, no friction.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    desc: "Photos and briefs are never shared or used for training.",
  },
];

const websiteIntelCards = [
  {
    icon: Scan,
    title: "Scan your current site",
    body: "We identify service pages, quote buttons, contact forms, CTAs, and intake gaps.",
  },
  {
    icon: Route,
    title: "Map 2–3 intake paths",
    body: "We compress your services into simple customer choices and attach the right photo prompts.",
  },
  {
    icon: Globe2,
    title: "Launch with a hosted link or embed",
    body: "Use PhotoBrief beside your current form, behind a quote button, or as a replacement intake path.",
  },
];

/* ── Main component ───────────────────────────────────────── */

export default function LandingPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const [demoOpen, setDemoOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<"messy" | "clean">(
    "messy",
  );
  const { isFull } = useBetaSeats();

  const utm = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        source: "landing",
        ref: ref || undefined,
      };
    }

    const p = new URLSearchParams(window.location.search);
    const campaignRef = p.get("ref") || ref || "";

    return {
      source: "landing",
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      referrer:
        typeof document !== "undefined"
          ? document.referrer || undefined
          : undefined,
      ref: campaignRef || undefined,
    };
  }, [ref]);
  const applicationSource = ref ? `landing:${ref}` : "landing";

  useEffect(() => {
    trackEvent("landing_page_view", { ...utm, source: applicationSource });
  }, [applicationSource, utm]);

  const jsonLd = useMemo(
    () => [
      SOFTWARE_APP_JSONLD,
      buildHowToJsonLd(
        "Replace weak website forms with guided visual intake",
        howItWorksSteps,
      ),
      buildFaqJsonLd(faqItems),
    ],
    [],
  );

  return (
    <>
      <PageMeta
        title="PhotoBrief.ai | Replace weak website forms with guided visual intake"
        description="PhotoBrief scans your website, maps your services, and gives customers a simple photo-guided path so your team gets actionable lead packets instead of vague messages."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <main className="pb-landing">
        {/* ━━ 1. HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[5.5rem] sm:-mt-[5rem] sm:pt-[6rem] lg:pt-[6.5rem]">
          <div className="pb-lens-field" />
          <div className="pb-container relative pb-8 sm:pb-10 lg:pb-12">
            <div className="relative z-10 mx-auto max-w-3xl text-center lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:text-left">
              {/* Mark — mobile/tablet only (lives above title) */}
              <div className="mb-4 sm:mb-5 lg:hidden">
                <div className="relative inline-flex items-center justify-center">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute h-36 w-36 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[60px] sm:h-48 sm:w-48 sm:blur-[80px]"
                  />
                  <BrandMark
                    variant="mark"
                    size={88}
                    eager
                    className="relative sm:hidden"
                  />
                  <BrandMark
                    variant="mark"
                    size={120}
                    eager
                    className="relative hidden sm:inline-flex"
                  />
                </div>
              </div>

              {/* Left column — copy + CTAs */}
              <div className="lg:min-w-0">
                <span className="pb-eyebrow">
                  <Sparkles className="h-3.5 w-3.5" /> Accepting beta applications
                </span>

                <h1 className="pb-hero-title mx-auto mt-3 max-w-2xl text-white sm:mt-4 lg:mx-0 lg:max-w-none">
                  Replace weak website forms with guided visual intake.
                </h1>

                <p className="pb-copy mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8 lg:mx-0 lg:max-w-xl">
                  PhotoBrief scans your website, maps your services, and gives
                  customers a simple photo-guided path so your team gets
                  actionable lead packets instead of vague messages.
                </p>

                <div className="mx-auto mt-5 flex max-w-lg flex-col gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3 lg:hidden">
                  <Button
                    size="xl"
                    variant="pb-primary"
                    onClick={() => {
                      trackEvent("cta_click", {
                        location: "hero",
                        label: "primary",
                      });
                      document
                        .getElementById("apply")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {isFull ? "Join the waitlist" : "Apply for the beta"}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                  <Button asChild size="xl" variant="pb-secondary">
                    <a
                      href="#workflow"
                      onClick={() =>
                        trackEvent("cta_click", {
                          location: "hero",
                          label: "workflow",
                        })
                      }
                    >
                      See the intake flow
                    </a>
                  </Button>
                  <Button
                    size="xl"
                    variant="pb-ghost"
                    onClick={() => setDemoOpen(true)}
                  >
                    <PlayCircle className="mr-1.5 h-4.5 w-4.5" /> Product
                    spotlight
                  </Button>
                </div>

                <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2 sm:mt-5 sm:gap-2.5 lg:mx-0 lg:justify-start">
                  {[
                    "Website scan included",
                    "Hosted link or embed",
                    "Lead packets, not form spam",
                  ].map((item) => (
                    <span
                      key={item}
                      className="pb-route-chip px-2.5 py-1.5 text-center text-[0.65rem] font-semibold sm:px-3 sm:py-2 sm:text-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Seat tracker — mobile/tablet placement */}
                <BetaSeatTracker className="mx-auto mt-4 max-w-sm sm:mt-5 lg:hidden" />
              </div>

              {/* Right column — large mark + seat tracker (desktop only) */}
              <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-6">
                <div className="relative inline-flex items-center justify-center">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute h-64 w-64 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[100px]"
                  />
                  <BrandMark variant="mark" size={200} eager className="relative" />
                </div>
                <BetaSeatTracker className="w-full max-w-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* ━━ TICKER 1 — Industry signals ━━━━━━━━━━━━━━━━━━━━━ */}
        <TickerBar items={["81% of forms abandoned before submit", "78% buy from whoever responds first", "4.2 hr avg lead response time", "60% of estimates never followed up", "5+ follow-ups to close — most stop at 1"]} />

        {/* ━━ 2. PAIN POINTS (carousel) ━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <PainPointSection />

        {/* ━━ ROI CALCULATOR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <RoiCalculatorSection />

        {/* ── Chapter break: Problem → Solution ── */}
        <ChapterDivider />

        <section className="pb-section">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-8 lg:max-w-5xl">
              <span className="pb-eyebrow">
                <Sparkles className="h-3.5 w-3.5" /> See the difference
              </span>
              <h2 className="pb-section-title mt-4 text-white">
                Vague website form becomes an actionable lead packet.
              </h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                Watch how a generic "tell us about your project" message turns
                into a structured packet with the right photos, notes, and
                context — ready for your team to act on.
              </p>
            </div>
            <Suspense fallback={<div className="min-h-[400px]" />}>
              <InteractiveHeroBriefAssembly />
            </Suspense>
          </div>
        </section>

        {/* ━━ 4. STICKY SECTION NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <SectionNav />

        {/* ━━ 5. HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <WorkflowSection />

        {/* ━━ 6. BEFORE / AFTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <ComparisonSection
          mode={comparisonMode}
          onModeChange={setComparisonMode}
        />

        {/* ━━ TICKER 2 — Product signals ━━━━━━━━━━━━━━━━━━━━━━ */}
        <TickerBar items={["Website scan included", "Hosted link or embed", "No app required for customers", "AI photo quality checks", "Lead packets — not form spam"]} direction="right" />

        {/* ── Chapter break: Solution → Fit ── */}
        <ChapterDivider />

        {/* ━━ 7. USE CASES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <UseCaseSection />

        {/* ━━ 8. WEBSITE INTELLIGENCE ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <WebsiteIntelligenceSection />

        {/* ── Major chapter break: Product → Beta ── */}
        <div className="pb-container py-6 sm:py-10" aria-hidden>
          <div className="mx-auto h-px max-w-2xl bg-gradient-to-r from-transparent via-[hsl(var(--pb-lavender)/0.3)] to-transparent" />
        </div>

        {/* ━━ BRIDGE: Why a beta? ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <BetaBridgeSection />

        {/* ━━ TRUST POINTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="pb-section-tight">
          <div className="pb-container">
            <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="pb-card p-4 text-center sm:p-5">
                  <Icon className="mx-auto h-5 w-5 text-[hsl(var(--pb-muted))]" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    {title}
                  </p>
                  <p className="pb-copy mt-1 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━ FOUNDING BETA REWARDS ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <FreeProSpotlight isFull={isFull} />
        <FoundingPartnerSection utm={utm} isFull={isFull} />

        {/* ━━ TICKER 3 — Beta social proof ━━━━━━━━━━━━━━━━━━━ */}
        <TickerBar items={[`${BETA_TOTAL_PARTNERS} founding partner seats`, "Free Pro for Life reward", `${BETA_DURATION_DAYS}-day beta`, "Concierge setup included", "Every partner earns a reward"]} />

        {/* ━━ AGENT-POWERED APPLICATION ━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="apply" className="pb-section scroll-mt-8">
          <div className="pb-container">
            <BetaOnboardingAgentExperience
              source="landing"
              title="Apply for the Founding Partner Beta"
              description={`Share your website and intake context. The onboarding agent qualifies your workflow, recommends your first intake paths, and submits your application for one of ${BETA_TOTAL_PARTNERS} founding partner seats.`}
            />
          </div>
        </section>

        {/* ━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <FinalCta isFull={isFull} />
      </main>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-5xl overflow-hidden border-0 bg-black p-0 sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>PhotoBrief product spotlight</DialogTitle>
            <DialogDescription>
              A product demo and founding partner beta overview showing the
              guided visual intake workflow, customer capture, lead packets,
              partner benefits, and reward tiers.
            </DialogDescription>
          </VisuallyHidden>
          <video
            key={demoOpen ? "open" : "closed"}
            src="/marketing/photobrief-spotlight.mp4"
            controls
            autoPlay
            playsInline
            className="h-auto w-full"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ROI Calculator
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ABANDONMENT_RATE = 0.81;
const RESPONSE_IMPROVEMENT_FACTOR = 0.30; // 30% more leads recovered with faster response
const FORM_RECOVERY_FACTOR = 0.25; // 25% of abandoned forms recovered with guided intake

function RoiCalculatorSection() {
  const [open, setOpen] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);
  const [monthlyVisitors, setMonthlyVisitors] = useState(500);
  const [avgJobValue, setAvgJobValue] = useState(2000);
  const [currentConversion, setCurrentConversion] = useState(3);

  const currentLeads = Math.round(monthlyVisitors * (currentConversion / 100));
  const abandonedVisitors = Math.round(monthlyVisitors * ABANDONMENT_RATE * (currentConversion > 0 ? 1 : 0));
  const recoveredFromForm = Math.round(abandonedVisitors * FORM_RECOVERY_FACTOR);
  const recoveredFromSpeed = Math.round(currentLeads * RESPONSE_IMPROVEMENT_FACTOR);
  const totalRecovered = recoveredFromForm + recoveredFromSpeed;
  const monthlyRevenue = totalRecovered * avgJobValue;
  const annualRevenue = monthlyRevenue * 12;

  function formatDollars(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  }

  return (
    <section className="pb-section-tight" ref={calcRef}>
      <div className="pb-container">
        <button
          type="button"
          onClick={() => {
            setOpen((p) => !p);
            if (!open) setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          }}
          className="group mx-auto flex w-full max-w-2xl items-center justify-between gap-4 rounded-[1.5rem] border border-[hsl(var(--pb-lavender)/0.25)] bg-gradient-to-r from-[hsl(var(--pb-violet)/0.10)] via-[hsl(var(--pb-ink))] to-[hsl(var(--pb-lavender)/0.06)] p-5 text-left transition hover:border-[hsl(var(--pb-lavender)/0.4)] sm:p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--pb-lavender)/0.12)]">
              <Calculator className="h-6 w-6 text-[hsl(var(--pb-lavender))]" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-white sm:text-lg">
                How much is weak intake costing you?
              </p>
              <p className="pb-copy mt-0.5 text-xs sm:text-sm">
                Plug in your numbers — see leads and revenue you could recover.
              </p>
            </div>
          </div>
          <span className={`hidden shrink-0 rounded-full border border-[hsl(var(--pb-lavender)/0.3)] px-4 py-2 text-xs font-bold text-[hsl(var(--pb-lavender))] transition group-hover:bg-[hsl(var(--pb-lavender)/0.1)] sm:inline-flex ${open ? "rotate-90" : ""}`}>
            {open ? "Close ×" : "Calculate →"}
          </span>
        </button>

        {/* Smooth expand */}
        <div
          className="mx-auto max-w-4xl overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
          }}
        >
          <div className="min-h-0">
            <div className="pt-6 sm:pt-8">
              <div className="pb-command-panel grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:p-8">
                <div className="relative z-10 grid gap-5">
                  <RoiSlider label="Monthly website visitors" value={monthlyVisitors} onChange={setMonthlyVisitors} min={100} max={10000} step={100} format={(v) => v.toLocaleString()} />
                  <RoiSlider label="Average job value" value={avgJobValue} onChange={setAvgJobValue} min={100} max={25000} step={100} format={(v) => `$${v.toLocaleString()}`} />
                  <RoiSlider label="Current form conversion rate" value={currentConversion} onChange={setCurrentConversion} min={1} max={15} step={0.5} format={(v) => `${v}%`} />
                </div>
                <div className="relative z-10 grid gap-3 sm:gap-4">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">
                      <UserCheck className="h-3.5 w-3.5" /> Current monthly leads
                    </div>
                    <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{currentLeads}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[hsl(var(--pb-lavender)/0.3)] bg-[hsl(var(--pb-lavender)/0.06)] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-lavender))]">
                      <ArrowRight className="h-3.5 w-3.5" /> Leads recovered with PhotoBrief
                    </div>
                    <p className="mt-2 text-3xl font-black tracking-tight text-[hsl(var(--pb-lavender))] sm:text-4xl">
                      +{totalRecovered}<span className="text-lg font-bold text-white/50"> /mo</span>
                    </p>
                    <p className="pb-copy mt-1 text-xs">{recoveredFromForm} from better intake · {recoveredFromSpeed} from faster response</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[hsl(var(--pb-mint)/0.3)] bg-[hsl(var(--pb-mint)/0.06)] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-mint))]">
                      <DollarSign className="h-3.5 w-3.5" /> Estimated annual revenue recovered
                    </div>
                    <p className="mt-2 text-3xl font-black tracking-tight text-[hsl(var(--pb-mint))] sm:text-4xl">{formatDollars(annualRevenue)}</p>
                    <p className="pb-copy mt-1 text-xs">{formatDollars(monthlyRevenue)}/mo × 12 · based on {totalRecovered} recovered leads at {`$${avgJobValue.toLocaleString()}`} avg job</p>
                  </div>
                </div>
              </div>
              <p className="pb-copy mx-auto mt-4 max-w-xl text-center text-[0.65rem] italic sm:text-xs">
                Estimates use 81% form abandonment (Numen Technology), 25% intake recovery rate,
                and 30% speed-to-lead improvement (MIT Lead Response Study). Your results will vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoiSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-semibold text-white">{label}</label>
        <span className="text-sm font-black tabular-nums text-[hsl(var(--pb-lavender))]">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[hsl(var(--pb-lavender))] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[hsl(var(--pb-lavender))] [&::-webkit-slider-thumb]:shadow-lg"
      />
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Sub-components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const painPoints = [
  {
    icon: FormInput,
    number: "81%",
    label: "of visitors abandon your form before submitting",
    context:
      "Most website forms ask for too much or too little. Visitors leave before your team ever sees the lead.",
    citation: { text: "Numen Technology — Form Optimization Study", url: "https://www.numentechnology.co.uk/blog/contact-form-optimization-conversion-rates" },
  },
  {
    icon: Clock,
    number: "4.2 hrs",
    label: "average response time — most leads are gone by then",
    context:
      "The industry average lead response time is over four hours. Leads contacted in under five minutes convert at 100× the rate.",
    citation: { text: "MIT Lead Response Management Study", url: "https://www.drivenresults.co/learn/b/lead-response-time-statistics-2025" },
  },
  {
    icon: MessageSquareWarning,
    number: "5+",
    label: "follow-ups to close a job — most teams stop at 1",
    context:
      "Without the right photos and context upfront, every job starts with a chain of follow-ups before anyone can quote.",
    citation: { text: "MarketingSherpa / RivetOps", url: "https://www.rivetops.io/how-many-follow-ups-to-close-a-job" },
  },
  {
    icon: TrendingDown,
    number: "78%",
    label: "of customers buy from whoever responds first",
    context:
      "Speed wins. If your intake doesn't collect what your team needs immediately, a faster competitor gets the job.",
    citation: { text: "InsideSales.com / MIT Study", url: "https://www.rapportagent.com/benchmarks/" },
  },
  {
    icon: UserX,
    number: "60%",
    label: "of estimates never get a single follow-up",
    context:
      "When intake is manual and incomplete, follow-up falls through the cracks — and revenue walks out the door.",
    citation: { text: "HomeAdvisor / US Tech Automations", url: "https://ustechautomations.com/resources/blog/home-service-estimate-follow-up-automation-case-study" },
  },
];

function PainPointSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % painPoints.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const go = useCallback((i: number) => {
    setActive(i);
    setPaused(true);
    setTimeout(() => setPaused(false), 8000);
  }, []);

  const point = painPoints[active];
  const Icon = point.icon;

  return (
    <section
      className="pb-section"
      ref={sectionRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => { setTimeout(() => setPaused(false), 6000); }}
    >
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <MessageSquareWarning className="h-3.5 w-3.5" /> The problem
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Your website intake is leaking money.
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            These are real industry numbers. Generic contact forms don't just
            lose information — they lose customers.
          </p>
        </div>

        {/* Carousel card */}
        <div className="relative mx-auto mt-8 max-w-2xl sm:mt-10">
          <div className="pb-card relative overflow-hidden p-6 sm:p-8" style={{ minHeight: 260 }}>
            {/* Crossfade — all cards absolutely positioned, container sized by tallest */}
            {painPoints.map((p, i) => {
              const PIcon = p.icon;
              const isActive = i === active;
              return (
                <div
                  key={p.number}
                  className={`absolute inset-0 p-6 sm:p-8 transition-opacity duration-500 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
                  aria-hidden={!isActive}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                      <PIcon className="h-6 w-6" />
                    </div>
                    <span className="text-5xl font-extrabold tracking-tight text-[hsl(var(--pb-lavender))] sm:text-6xl">
                      {p.number}
                    </span>
                  </div>
                  <p className="mt-4 text-lg font-bold tracking-tight text-white sm:text-xl">
                    {p.label}
                  </p>
                  <p className="pb-copy mt-2 text-sm leading-relaxed sm:text-base">
                    {p.context}
                  </p>
                  <a
                    href={p.citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-white/40 transition hover:text-[hsl(var(--pb-lavender))] sm:text-sm"
                  >
                    Source: {p.citation.text} ↗
                  </a>
                </div>
              );
            })}
          </div>

          {/* Left/right tap zones */}
          <button
            type="button"
            aria-label="Previous stat"
            onClick={() => go((active - 1 + painPoints.length) % painPoints.length)}
            className="absolute left-0 top-0 h-full w-1/4 cursor-w-resize opacity-0"
          />
          <button
            type="button"
            aria-label="Next stat"
            onClick={() => go((active + 1) % painPoints.length)}
            className="absolute right-0 top-0 h-full w-1/4 cursor-e-resize opacity-0"
          />

          {/* Dot indicators */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {painPoints.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Stat ${i + 1}`}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-[hsl(var(--pb-lavender))]" : "w-2 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        <p className="pb-copy mx-auto mt-6 max-w-xl text-center text-sm italic sm:mt-8 sm:text-base">
          PhotoBrief closes the gap between first contact and quote-ready
          information.
        </p>
      </div>
    </section>
  );
}

/* ── Ticker bar ─────────────────────────────────────────── */

function TickerBar({ items, direction = "left" }: { items: string[]; direction?: "left" | "right" }) {
  const content = items.map((t) => t.toUpperCase()).join("  ·  ");
  const doubled = `${content}  ·  ${content}  ·  `;
  return (
    <div className="overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-2.5" aria-hidden>
      <div
        className="whitespace-nowrap text-[0.6rem] font-bold tracking-[0.2em] text-white/25 sm:text-xs"
        style={{
          animation: `marquee ${items.length * 5}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {doubled}
      </div>
    </div>
  );
}

function BetaBridgeSection() {
  return (
    <section className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pb-eyebrow">
            <Users className="h-3.5 w-3.5" /> Early access
          </span>
          <h2 className="pb-section-title mt-5 text-white">
            We're building this{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-mint))] bg-clip-text text-transparent">
              with you
            </span>
            , not just for you.
          </h2>
          <p className="pb-copy mx-auto mt-5 max-w-lg text-base leading-relaxed sm:text-lg sm:leading-8">
            Visual intake is workflow-specific — every trade, every service
            type needs something slightly different. The only way to get it
            right is to build alongside real businesses running real jobs.
            That's why this is a hands-on beta, not a waitlist.
          </p>
        </div>
      </div>
    </section>
  );
}

function ChapterDivider() {
  return (
    <div className="pb-container" aria-hidden>
      <div className="mx-auto h-px max-w-lg bg-gradient-to-r from-transparent via-white/12 to-transparent" />
    </div>
  );
}

function SectionNav() {
  return (
    <nav
      aria-label="Landing page sections"
      className="sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-night)/0.82)] backdrop-blur-xl"
    >
      <div className="pb-container flex justify-start gap-1.5 overflow-x-auto py-2 sm:gap-2 sm:py-3 sm:justify-center">
        {sectionLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() =>
              trackEvent("landing_jump_nav_click", { target: item.href })
            }
            className="min-w-max rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-white/62 transition hover:border-white/14 hover:bg-white/7 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] sm:px-4 sm:py-2 sm:text-sm"
          >
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
            <span className="pb-eyebrow">
              <Route className="h-3.5 w-3.5" /> How it works
            </span>
            <h2 className="pb-section-title mt-4 max-w-xl text-white">
              From website visit to actionable lead packet.
            </h2>
            <p className="pb-copy mt-4 max-w-lg text-base sm:text-lg">
              PhotoBrief turns your website into a structured intake
              machine — from first visit to a quote-ready packet your team
              can act on without follow-ups.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[hsl(var(--pb-lavender))] via-[hsl(var(--pb-mint))] to-transparent md:block" />
            <div className="grid gap-3 sm:gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="pb-card relative grid gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-[4rem_1fr] md:p-6"
                  >
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))] sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">
                        0{index + 1} · {step.eyebrow}
                      </p>
                      <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:mt-2 sm:text-2xl">
                        {step.title}
                      </h3>
                      <p className="pb-copy mt-1.5 max-w-2xl text-sm sm:mt-2 sm:text-base">
                        {step.body}
                      </p>
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

function ComparisonSection({
  mode,
  onModeChange,
}: {
  mode: "messy" | "clean";
  onModeChange: (mode: "messy" | "clean") => void;
}) {
  const isClean = mode === "clean";
  const signals = isClean ? cleanSignals : messySignals;

  return (
    <section id="comparison" className="pb-section-tight">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <MessageSquareWarning className="h-3.5 w-3.5" /> Before / after
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Generic form vs. guided visual intake.
          </h2>
          <p className="pb-copy mt-4 text-lg">
            The difference is not more photos — it's structured context
            that lets your team skip the back-and-forth entirely.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md rounded-full border border-white/12 bg-[hsl(var(--pb-panel)/0.72)] p-1 sm:mt-10">
          {[
            { id: "messy", label: "Before" },
            { id: "clean", label: "PhotoBrief" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onModeChange(item.id as "messy" | "clean")}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] sm:py-3 ${mode === item.id ? "bg-[hsl(var(--pb-lavender))] text-[hsl(var(--pb-night))]" : "text-white/58 hover:text-white"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="pb-command-panel p-4 sm:p-5 md:p-6">
            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/48">
                {isClean ? "Guided visual intake" : "Generic website form"}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${isClean ? "bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]"}`}
              >
                {isClean ? "Actionable" : "Vague"}
              </span>
            </div>
            <div className="relative z-10 mt-4 grid gap-2 sm:mt-5 sm:gap-3">
              {signals.map((signal, index) => (
                <div
                  key={signal}
                  className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 ${isClean ? "border-[hsl(var(--pb-mint)/0.24)] bg-[hsl(var(--pb-mint)/0.055)]" : "border-white/10 bg-white/[0.035]"}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-8 sm:w-8 ${isClean ? "bg-[hsl(var(--pb-mint)/0.14)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.13)] text-[hsl(var(--pb-lavender))]"}`}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-white/82 sm:text-base">
                    {signal}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-white/12 bg-[hsl(var(--pb-panel)/0.58)] p-4 sm:min-h-[420px] sm:rounded-[2rem] sm:p-5">
            <div className="absolute inset-0 opacity-35">
              <div className="pb-lens-field" />
            </div>
            {isClean ? <CleanPacketVisual /> : <MessyThreadVisual />}
          </div>
        </div>
      </div>
    </section>
  );
}

function MessyThreadVisual() {
  const items = [
    {
      text: "I'd like a quote for my project",
      x: "left-4",
      y: "top-8",
      rot: "-rotate-2",
    },
    { text: "Can you send some photos?", x: "right-6", y: "top-24", rot: "rotate-3" },
    {
      text: "Here's one from my camera roll",
      x: "left-10",
      y: "top-44",
      rot: "rotate-2",
    },
    {
      text: "Which service was this for?",
      x: "right-10",
      y: "bottom-12",
      rot: "-rotate-3",
    },
  ];
  return (
    <div className="relative z-10 h-full min-h-[280px] sm:min-h-[380px]">
      {items.map((item) => (
        <div
          key={item.text}
          className={`absolute ${item.x} ${item.y} ${item.rot} max-w-[12rem] rounded-2xl border border-white/10 bg-black/35 p-3 shadow-2xl sm:max-w-[15rem] sm:rounded-3xl sm:p-4`}
        >
          <p className="text-xs font-semibold text-white/74 sm:text-sm">
            {item.text}
          </p>
        </div>
      ))}
      <figure className="pb-photo-frame absolute bottom-16 left-4 w-28 -rotate-6 opacity-80 sm:bottom-20 sm:left-8 sm:w-36">
        <img
          src={appliances}
          alt="Loose customer photo without context"
          className="h-20 w-full object-cover sm:h-28"
          width={300}
          height={300}
          loading="lazy"
          sizes="(min-width:640px) 144px, 112px"
        />
      </figure>
      <figure className="pb-photo-frame absolute bottom-24 right-6 w-28 rotate-6 opacity-70 sm:bottom-28 sm:right-12 sm:w-36">
        <img
          src={drivewayAccess}
          alt="Another loose customer photo without context"
          className="h-20 w-full object-cover sm:h-28"
          width={300}
          height={300}
          loading="lazy"
          sizes="(min-width:640px) 144px, 112px"
        />
      </figure>
    </div>
  );
}

function CleanPacketVisual() {
  return (
    <div className="relative z-10 mx-auto max-w-md rounded-[1.65rem] bg-[hsl(var(--pb-paper))] p-5 text-[hsl(var(--pb-ink))] shadow-[0_30px_80px_-45px_hsl(var(--pb-shadow))]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-black/42">
            Lead packet
          </p>
          <h3 className="mt-1 text-2xl font-black tracking-tight">
            Quote review
          </h3>
        </div>
        <span className="pb-stamp rounded-full px-3 py-1">Actionable</span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {loosePhotos.map((photo) => (
          <img
            key={photo.label}
            src={photo.src}
            alt={`${photo.label} organized in a lead packet`}
            className="h-16 rounded-xl object-cover"
            loading="lazy"
            width={300}
            height={300}
            sizes="80px"
          />
        ))}
      </div>
      <div className="mt-5 space-y-2 text-sm font-semibold text-black/64">
        <p className="rounded-2xl bg-black/[0.055] p-3">
          Required photos complete: 4 of 4
        </p>
        <p className="rounded-2xl bg-black/[0.055] p-3">
          Customer notes attached to the right service
        </p>
        <p className="rounded-2xl bg-black/[0.055] p-3">
          Next action: review and send estimate
        </p>
      </div>
    </div>
  );
}

function UseCaseSection() {
  return (
    <section id="use-cases" className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center lg:max-w-5xl">
          <span className="pb-eyebrow">
            <ClipboardList className="h-3.5 w-3.5" /> Use cases
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Built for businesses that need to see before they act.
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            Anywhere a missing photo slows the next step — quoting, scheduling,
            approving, or documenting — PhotoBrief structures the intake so
            your team has everything on the first pass.
          </p>
        </div>
        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="mt-8 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:mt-10 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="w-[78vw] max-w-[300px] shrink-0 snap-start pb-card p-4 sm:p-5 md:w-auto md:max-w-none md:min-w-0 md:p-6">
                <Icon className="h-6 w-6 text-[hsl(var(--pb-lavender))] sm:h-7 sm:w-7" />
                <span className="pb-stamp mt-4 inline-flex rounded-full px-3 py-1 sm:mt-5">
                  {item.stamp}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight text-white sm:mt-4 sm:text-xl">
                  {item.title}
                </h3>
                <p className="pb-copy mt-2 text-sm leading-6">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WebsiteIntelligenceSection() {
  return (
    <section id="website-intelligence" className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center lg:max-w-5xl">
          <span className="pb-eyebrow">
            <Globe2 className="h-3.5 w-3.5" /> Website Intelligence
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Your website becomes your intake engine.
          </h2>
          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">
            PhotoBrief scans your services, current forms, and
            calls-to-action, then maps them into 2–3 simple intake paths
            you can launch with a hosted link or embed. Beta partners get
            this built for them during concierge setup.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
          {websiteIntelCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="pb-card p-5 sm:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">
                  {card.title}
                </h3>
                <p className="pb-copy mt-2 text-sm leading-6">{card.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FreeProSpotlight({ isFull }: { isFull: boolean }) {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-gradient-to-br from-[hsl(var(--pb-violet)/0.18)] via-[hsl(var(--pb-ink))] to-[hsl(var(--pb-lavender)/0.10)] p-5 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--pb-lavender)/0.15)] blur-[60px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[hsl(var(--pb-mint)/0.10)] blur-[50px]"
          />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] shadow-lg shadow-[hsl(var(--pb-violet)/0.4)]">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--pb-lavender))]">
              Beta reward
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl">
              2 partners get{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-mint))] bg-clip-text text-transparent">
                Free Pro for Life
              </span>
            </h2>
            <p className="pb-copy mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base">
              The two beta partners who deliver the most useful, actionable
              feedback earn a permanent Pro plan — no invoice, no
              expiration, no strings. Your feedback literally shapes the
              product and your reward reflects that.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-white/70">
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <Crown className="h-3.5 w-3.5 text-[hsl(var(--pb-lavender))]" />{" "}
                Quality over quantity
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
                <Gift className="h-3.5 w-3.5 text-[hsl(var(--pb-mint))]" />{" "}
                All {BETA_TOTAL_PARTNERS} partners earn rewards
              </span>
            </div>
            <FreeProEligibilityModal>
              {(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="mt-4 text-xs font-semibold text-[hsl(var(--pb-lavender))] underline decoration-[hsl(var(--pb-lavender)/0.4)] underline-offset-2 transition hover:text-white hover:decoration-white/60"
                >
                  Terms &amp; eligibility →
                </button>
              )}
            </FreeProEligibilityModal>
            <Button
              size="lg"
              variant="pb-primary"
              className="mt-4"
              onClick={() => {
                trackEvent("free_pro_cta_clicked", {
                  location: "spotlight",
                });
                document
                  .getElementById("apply")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {isFull
                ? "Join the waitlist"
                : `Apply now — ${BETA_TOTAL_PARTNERS} seats, reviewed for fit`}{" "}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FoundingPartnerSection({
  utm,
  isFull,
}: {
  utm: Record<string, string | undefined>;
  isFull: boolean;
}) {
  return (
    <section id="beta-program" className="pb-section">
      <div className="pb-container">
        {/* Benefits & expectations — always visible */}
        <div className="pb-command-panel grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8 xl:p-10">
          <div className="relative z-10">
            <span className="pb-eyebrow">
              <Stamp className="h-3.5 w-3.5" /> Accepting applications
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Built with real workflows, not toy testing.
            </h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">
              We're accepting applications from businesses that collect photos
              as part of real intake, inspection, or documentation workflows.
              You get hands-on setup and early influence; we get honest workflow
              feedback.
            </p>
            <Button
              size="lg"
              variant="pb-primary"
              className="mt-6"
              onClick={() => {
                trackEvent("cta_click", { ...utm, location: "founding_beta" });
                document
                  .getElementById("apply")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {isFull ? "Join the waitlist" : "Apply now"}{" "}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            <BenefitList
              title="Beta partners get"
              items={[...PARTNER_BENEFITS]}
            />
            <BenefitList title="We ask for" items={[...PARTNER_EXPECTATIONS]} />
          </div>
        </div>

        {/* Collapsible details — accordion for progressive disclosure */}
        <div className="mx-auto mt-8 max-w-3xl">
          <Accordion type="multiple" className="grid gap-3">
            {/* Partner expectations */}
            <AccordionItem value="expectations" className="rounded-[1.2rem] border border-white/12 bg-white/[0.025] px-4 sm:px-5">
              <AccordionTrigger className="py-4 text-sm font-bold text-white hover:no-underline sm:text-base [&>svg]:text-[hsl(var(--pb-lavender))]">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  What it means to be a founding beta partner
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-copy mb-4 text-sm">
                  We're accepting {BETA_TOTAL_PARTNERS} businesses. The{" "}
                  {BETA_DURATION_DAYS}-day beta clock starts {BETA_SETUP_BUFFER_DAYS}{" "}
                  days after the final seat is filled, giving every partner time for
                  concierge setup.
                </p>
                <div className="grid gap-3 sm:gap-4">
                  {DETAILED_EXPECTATIONS.map((exp, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-xs font-black text-[hsl(var(--pb-lavender))] sm:h-8 sm:w-8">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {exp.title}
                        </p>
                        <p className="pb-copy mt-0.5 text-xs leading-5 sm:text-sm">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Reward tiers */}
            <AccordionItem value="rewards" className="rounded-[1.2rem] border border-white/12 bg-white/[0.025] px-4 sm:px-5">
              <AccordionTrigger className="py-4 text-sm font-bold text-white hover:no-underline sm:text-base [&>svg]:text-[hsl(var(--pb-lavender))]">
                <span className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  Reward tiers — every partner earns something
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-copy mb-4 text-sm">
                  Every beta partner earns a post-launch discount. Your tier is
                  based on the quality of your feedback — not just how much you
                  use the product.
                </p>
                <div className="grid gap-2">
                  {REWARD_TIERS.map((tier) => {
                    const isTopTier = tier.duration === "free-pro";
                    return (
                      <div
                        key={tier.label}
                        className={`flex items-center justify-between rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 ${isTopTier ? "border-2 border-[hsl(var(--pb-lavender)/0.5)] bg-gradient-to-r from-[hsl(var(--pb-violet)/0.15)] to-[hsl(var(--pb-lavender)/0.08)] shadow-md shadow-[hsl(var(--pb-violet)/0.2)]" : "border border-white/10 bg-white/[0.035]"}`}
                      >
                        <div className="flex items-center gap-3">
                          {isTopTier ? (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] sm:h-8 sm:w-8">
                              <Trophy className="h-3.5 w-3.5 text-white" />
                            </span>
                          ) : (
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-[10px] font-black text-[hsl(var(--pb-lavender))] sm:h-8 sm:w-8">
                              {tier.count}
                            </span>
                          )}
                          <span
                            className={`text-sm font-semibold ${isTopTier ? "text-[hsl(var(--pb-lavender))]" : "text-white"}`}
                          >
                            {tier.label}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[hsl(var(--pb-mint))] sm:text-sm">
                          {tier.shortDescription}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-[1.2rem] border border-[hsl(var(--pb-lavender)/0.2)] bg-[hsl(var(--pb-lavender)/0.04)] p-3 sm:p-4">
                  <p className="text-xs font-semibold text-white/80 sm:text-sm">
                    What drives your tier placement:
                  </p>
                  <ul className="mt-2 grid gap-1.5">
                    {REWARD_CRITERIA.map((criterion) => (
                      <li
                        key={criterion}
                        className="flex items-start gap-2 text-xs text-white/60 sm:text-sm"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--pb-mint)/0.7)]" />
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Scoring rubric */}
            <AccordionItem value="scoring" className="rounded-[1.2rem] border border-white/12 bg-white/[0.025] px-4 sm:px-5">
              <AccordionTrigger className="py-4 text-sm font-bold text-white hover:no-underline sm:text-base [&>svg]:text-[hsl(var(--pb-lavender))]">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  Scoring rubric — how we pick the top 2
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-copy mb-4 text-sm">
                  There's no secret formula — just four dimensions we weight
                  equally-ish. Here's exactly what we look at.
                </p>
                <div className="grid gap-4">
                  {SCORING_RUBRIC.map((dim) => (
                    <div key={dim.label} className="rounded-xl border border-white/8 bg-white/[0.025] p-3 sm:p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-sm font-bold tracking-tight text-white sm:text-base">
                          {dim.label}
                        </h3>
                        <span className="rounded-full border border-[hsl(var(--pb-lavender)/0.3)] bg-[hsl(var(--pb-lavender)/0.08)] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider text-[hsl(var(--pb-lavender))]">
                          {dim.weight}
                        </span>
                      </div>
                      <p className="pb-copy mt-2 text-xs leading-relaxed sm:text-sm">
                        {dim.description}
                      </p>
                      <div className="mt-2 rounded-lg border border-white/6 bg-white/[0.02] p-2.5">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                          Examples of great feedback
                        </p>
                        {dim.examples.map((ex, i) => (
                          <p
                            key={i}
                            className="mt-1 text-xs italic leading-relaxed text-white/60"
                          >
                            {ex}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.2rem] border border-[hsl(var(--pb-mint)/0.2)] bg-[hsl(var(--pb-mint)/0.04)] p-4 text-center">
                  <p className="text-sm font-semibold text-white/90">
                    Every partner earns a reward tier. The rubric above determines who
                    lands in the top&nbsp;2.
                  </p>
                  <p className="pb-copy mt-1 text-xs">
                    Scores are assessed by the PhotoBrief team at the end of the{" "}
                    {BETA_DURATION_DAYS}-day beta (which starts{" "}
                    {BETA_SETUP_BUFFER_DAYS} days after the final seat is filled). No
                    self-reporting required — we track engagement internally.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
            <BrandMark
              variant="horizontal"
              tone="light"
              size={48}
              className="justify-center"
            />
            <h2 className="pb-section-title mt-5 text-white">
              Get quote-ready leads, not vague messages.
            </h2>
            <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">
              Stop chasing customers for missing photos and context.
              With PhotoBrief, every inquiry arrives as a complete, actionable
              lead packet — so your team can quote, schedule, or approve
              without a single follow-up.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row sm:gap-3">
              <Button
                size="xl"
                variant="pb-primary"
                onClick={() =>
                  document
                    .getElementById("apply")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                {isFull ? "Join the waitlist" : "Apply for the beta"}{" "}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button asChild size="xl" variant="pb-secondary">
                <NavLink to="/pricing">See plans</NavLink>
              </Button>
            </div>
            <p className="mt-4 text-xs font-medium text-white/46 sm:text-sm">
              Customers do not need an account or app to complete a PhotoBrief
              intake.
            </p>
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
      <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
        {title}
      </h3>
      <ul className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm font-semibold leading-6 text-white/76"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
