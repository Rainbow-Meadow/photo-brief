import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
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
  Trophy,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
    "Guided visual intake for customers",
    "Actionable lead packets with photos and context",
    "Hosted link or embed on your website",
    "Simple AI photo quality checks",
    "Customer profiles and saved templates",
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
    title: "Scan the website",
    body: "PhotoBrief reads your service pages, quote buttons, contact forms, and CTAs to understand how leads reach you today.",
  },
  {
    icon: Route,
    eyebrow: "Map",
    title: "Map the right intake paths",
    body: "We compress your services into 2–3 simple customer choices and attach the right photo prompts to each one.",
  },
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "Ask customers for the right photos and context",
    body: "They follow a guided flow on any device — one prompt at a time — with plain instructions instead of a vague \"send a few photos.\"",
  },
  {
    icon: FileCheck2,
    eyebrow: "Deliver",
    title: "Deliver an actionable lead packet",
    body: "Photos, notes, customer context, and readiness status land together — ready for quoting, dispatch, review, or documentation.",
  },
];

const messySignals = [
  "Generic contact form with a text box",
  "Vague message: \"I need a quote\"",
  "Photos arrive later through text or email",
  "Missing scale, angles, and context",
  "Repeated follow-up before anyone can act",
];

const cleanSignals = [
  "Customer chooses the right service path",
  "Required photos are requested in order",
  "Notes and photos stay attached together",
  "Readiness issues are visible before triage",
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
    title: "Product or service questions where visuals matter",
    body: "When a text description isn't enough, let customers show what they mean with guided photos and notes.",
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
    icon: Globe2,
    eyebrow: "01",
    title: "Scan your current site",
    body: "We identify service pages, quote buttons, contact forms, CTAs, and intake gaps.",
  },
  {
    icon: Route,
    eyebrow: "02",
    title: "Map 2–3 intake paths",
    body: "We compress your services into simple customer choices and attach the right photo prompts.",
  },
  {
    icon: Link2,
    eyebrow: "03",
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
            <div className="relative z-10 mx-auto max-w-3xl text-center">
              <div className="mb-4 sm:mb-5">
                <div className="relative inline-flex items-center justify-center">
                  <div
                    aria-hidden
                    className="touch-hide pointer-events-none absolute h-36 w-36 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[60px] sm:h-48 sm:w-48 sm:blur-[80px]"
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
                    className="relative hidden sm:inline-flex lg:hidden"
                  />
                  <BrandMark
                    variant="mark"
                    size={144}
                    eager
                    className="relative hidden lg:inline-flex"
                  />
                </div>
              </div>

              <span className="pb-eyebrow">
                <Sparkles className="h-3.5 w-3.5" /> Accepting beta applications
              </span>

              <h1 className="pb-hero-title mx-auto mt-3 max-w-2xl text-white sm:mt-4">
                Replace weak website forms with
                <span className="mt-1 block text-[hsl(var(--pb-lavender))]">
                  guided visual intake.
                </span>
              </h1>

              <p className="pb-copy mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
                PhotoBrief scans your website, maps your services, and gives
                customers a simple photo-guided path so your team gets
                actionable lead packets instead of vague messages.
              </p>

              <div className="mx-auto mt-5 flex max-w-lg flex-col gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
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

              <div className="mx-auto mt-4 flex max-w-md justify-center gap-2 sm:mt-5 sm:gap-2.5">
                {[
                  "Website scan included",
                  "Hosted link or embed",
                  "Lead packets, not form spam",
                ].map((item) => (
                  <span
                    key={item}
                    className="pb-route-chip whitespace-nowrap px-2.5 py-1.5 text-center text-[0.65rem] font-semibold sm:px-3 sm:py-2 sm:text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <BetaSeatTracker className="mx-auto mt-4 max-w-sm sm:mt-5" />
            </div>
          </div>
        </section>

        {/* ━━ 2. PAIN POINTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <PainPointSection />

        {/* ━━ 3. INTERACTIVE DEMO / PRODUCT PROOF ━━━━━━━━━━━━━━━ */}
        <section className="pb-section-tight">
          <div className="pb-container">
            <div className="mx-auto mb-6 max-w-3xl text-center sm:mb-8">
              <span className="pb-eyebrow">
                <ClipboardList className="h-3.5 w-3.5" /> Product proof
              </span>
              <h2 className="pb-section-title mt-4 text-white">
                See how a vague website form becomes an actionable lead packet.
              </h2>
            </div>
            <Suspense fallback={<div className="min-h-[400px]" />}>
              <InteractiveHeroBriefAssembly />
            </Suspense>
          </div>
        </section>

        {/* ━━ 4. STICKY SECTION NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <SectionNav />

        {/* ━━ 5. HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <WorkflowSection />

        {/* ━━ 6. BEFORE / AFTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <ComparisonSection
          mode={comparisonMode}
          onModeChange={setComparisonMode}
        />

        {/* ━━ 7. USE CASES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <UseCaseSection />

        {/* ━━ 8. WEBSITE INTELLIGENCE / DONE-FOR-YOU SETUP ━━━━━ */}
        <WebsiteIntelligenceSection />

        {/* ━━ 9. FOUNDING BETA REWARDS ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <BetaRewardSpotlight isFull={isFull} />
        <FoundingPartnerSection utm={utm} isFull={isFull} />

        {/* ━━ 10. TRUST POINTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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

        {/* ━━ 11. AGENT-POWERED APPLICATION ━━━━━━━━━━━━━━━━━━━━ */}
        <section id="apply" className="pb-section scroll-mt-8">
          <div className="pb-container">
            <BetaOnboardingAgentExperience
              source="landing"
              description={`The onboarding agent asks about your website, intake workflow, and team — then recommends your first PhotoBrief intake paths and submits your application for one of ${BETA_TOTAL_PARTNERS} founding partner seats.`}
            />
          </div>
        </section>

        {/* ━━ 12. FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <FinalCta isFull={isFull} />
      </main>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-5xl overflow-hidden border-0 bg-black p-0 sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>PhotoBrief product spotlight</DialogTitle>
            <DialogDescription>
              A product demo showing how PhotoBrief replaces weak website forms
              with guided visual intake that produces actionable lead packets.
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
   Sub-components
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const painPoints = [
  {
    icon: FormInput,
    number: "Text only",
    label: "is what your form collects",
    context:
      "A name and a vague message are not enough when your team needs photos, context, and service details before acting.",
  },
  {
    icon: MessageSquareWarning,
    number: "Vague",
    label: "submissions stall your pipeline",
    context:
      "\"I need a quote\" with no photos, no details, and no context turns every lead into a triage project.",
  },
  {
    icon: Clock,
    number: "Hours",
    label: "lost chasing photos after the fact",
    context:
      "Your team emails or texts back asking for pictures — then waits while the lead goes cold.",
  },
  {
    icon: ImageOff,
    number: "Missing",
    label: "angles, scale, and context",
    context:
      "Customers don't know what to photograph. You get blurry close-ups with no reference and no notes.",
  },
  {
    icon: Globe2,
    number: "Lost",
    label: "leads from weak intake",
    context:
      "Visitors who can't figure out your form just leave. The ones who submit give you almost nothing to work with.",
  },
];

function PainPointSection() {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <MessageSquareWarning className="h-3.5 w-3.5" /> The problem
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Your website intake is losing you leads.
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            Weak contact forms collect vague messages. Your team chases photos
            through text and email. By the time you have enough to quote,
            half your leads have moved on.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <article
                key={point.number + point.label}
                className="pb-card flex flex-col p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-extrabold tracking-tight text-[hsl(var(--pb-lavender))] sm:text-4xl">
                    {point.number}
                  </span>
                </div>
                <p className="mt-3 text-sm font-bold tracking-tight text-white sm:text-base">
                  {point.label}
                </p>
                <p className="pb-copy mt-1 text-xs leading-relaxed sm:text-sm">
                  {point.context}
                </p>
              </article>
            );
          })}
        </div>

        <p className="pb-copy mx-auto mt-6 max-w-xl text-center text-sm italic sm:mt-8 sm:text-base">
          PhotoBrief turns your website into a guided intake path — so your team
          gets quote-ready leads, not vague messages.
        </p>
      </div>
    </section>
  );
}

function SectionNav() {
  return (
    <nav
      aria-label="Landing page sections"
      className="sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-night)/0.82)] backdrop-blur-xl touch-blur-reduce"
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
              From weak form to actionable lead packet.
            </h2>
            <p className="pb-copy mt-4 max-w-lg text-base sm:text-lg">
              PhotoBrief scans your website, maps intake paths for your
              services, guides customers through the right photos and context,
              and delivers a structured lead packet your team can act on
              immediately.
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
            The value isn't "more photos." It's getting the right photos, tied
            to the right service, with enough context to act — from the first
            touch.
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
                {isClean ? "Guided intake" : "Generic form"}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${isClean ? "bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]"}`}
              >
                {isClean ? "Quote-ready" : "Vague"}
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
      text: "I need a quote",
      x: "left-4",
      y: "top-8",
      rot: "-rotate-2",
    },
    { text: "Can you send a few pics?", x: "right-6", y: "top-24", rot: "rotate-3" },
    {
      text: "Here's one — is this enough?",
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
        <span className="pb-stamp rounded-full px-3 py-1">Quote-ready</span>
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
          Customer notes and service path attached
        </p>
        <p className="rounded-2xl bg-black/[0.055] p-3">
          Next action: estimate and schedule
        </p>
      </div>
    </div>
  );
}

function UseCaseSection() {
  return (
    <section id="use-cases" className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <ClipboardList className="h-3.5 w-3.5" /> Use cases
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            Built for businesses that need to see before they act.
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            PhotoBrief works anywhere a missing photo, unclear context, or vague
            submission slows down the next step.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {useCases.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="pb-card p-4 sm:p-5 md:p-6">
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
        <div className="mx-auto mt-4 grid max-w-4xl gap-4 md:grid-cols-2">
          {useCases.slice(3).map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="pb-card p-4 sm:p-5 md:p-6">
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
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <Scan className="h-3.5 w-3.5" /> Website Intelligence
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            For beta partners, we build the first intake from your website.
          </h2>
          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">
            Apply with your website. If accepted, PhotoBrief scans your
            services, current forms, and calls-to-action, then maps them into
            2–3 simple intake paths you can launch with a hosted link or embed.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-3">
          {websiteIntelCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="pb-card relative overflow-hidden p-5 sm:p-6"
              >
                <span
                  aria-hidden
                  className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30 blur-xl"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="pb-eyebrow tabular-nums">{card.eyebrow}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
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

function BetaRewardSpotlight({ isFull }: { isFull: boolean }) {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[1.5rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-gradient-to-br from-[hsl(var(--pb-violet)/0.18)] via-[hsl(var(--pb-ink))] to-[hsl(var(--pb-lavender)/0.10)] p-5 sm:p-8">
          <div
            aria-hidden
            className="touch-hide pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[hsl(var(--pb-lavender)/0.15)] blur-[60px]"
          />
          <div
            aria-hidden
            className="touch-hide pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[hsl(var(--pb-mint)/0.10)] blur-[50px]"
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
              expiration, no strings. Every partner earns a post-launch
              reward tier based on the quality of their participation.
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
        {/* Benefits & expectations */}
        <div className="pb-command-panel grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8 xl:p-10">
          <div className="relative z-10">
            <span className="pb-eyebrow">
              <Stamp className="h-3.5 w-3.5" /> Accepting applications
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
              Built with real intake workflows, not toy testing.
            </h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">
              We're accepting applications from businesses with real website
              intake, quoting, or documentation needs. You get hands-on setup
              and early influence; we get honest workflow feedback.
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

        {/* Detailed expectations */}
        <div className="mx-auto mt-8 max-w-3xl text-center">
          <span className="pb-eyebrow">
            <Users className="h-3.5 w-3.5" /> What we expect
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            What it means to be a founding beta partner.
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            We're accepting {BETA_TOTAL_PARTNERS} businesses. The{" "}
            {BETA_DURATION_DAYS}-day beta clock starts {BETA_SETUP_BUFFER_DAYS}{" "}
            days after the final seat is filled, giving every partner time for
            concierge setup. In exchange for free access and significant
            post-launch rewards, we ask for real usage and honest feedback.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <div className="pb-command-panel p-4 sm:p-5 md:p-6">
            <div className="relative z-10">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">
                Partner expectations
              </p>
              <div className="mt-4 grid gap-3 sm:gap-4">
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
            </div>
          </div>
        </div>

        {/* Reward tiers */}
        <div className="mx-auto mt-6 max-w-2xl">
          <div className="pb-command-panel p-4 sm:p-5 md:p-6">
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">
                  Reward tiers
                </p>
              </div>
              <p className="pb-copy mt-2 text-sm">
                Every beta partner earns a post-launch discount. Your tier is
                based on the quality of your feedback — not just how much you
                use the product.
              </p>
              <div className="mt-4 grid gap-2">
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
            </div>
          </div>
        </div>

        {/* Scoring rubric */}
        <div className="mx-auto mt-10 max-w-3xl text-center">
          <span className="pb-eyebrow">
            <Trophy className="h-3.5 w-3.5" /> Scoring rubric
          </span>
          <h2 className="pb-section-title mt-4 text-white">
            How we pick the top&nbsp;2
          </h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            There's no secret formula — just four dimensions we weight
            equally-ish. Here's exactly what we look at and what "great" looks
            like.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:mt-10">
          {SCORING_RUBRIC.map((dim) => (
            <div key={dim.label} className="pb-command-panel p-4 sm:p-5 md:p-6">
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-bold tracking-tight text-white sm:text-lg">
                    {dim.label}
                  </h3>
                  <span className="rounded-full border border-[hsl(var(--pb-lavender)/0.3)] bg-[hsl(var(--pb-lavender)/0.08)] px-2.5 py-0.5 text-[11px] font-extrabold tracking-wider text-[hsl(var(--pb-lavender))]">
                    {dim.weight}
                  </span>
                </div>
                <p className="pb-copy mt-2 text-sm leading-relaxed">
                  {dim.description}
                </p>
                <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.025] p-3">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Examples of great feedback
                  </p>
                  {dim.examples.map((ex, i) => (
                    <p
                      key={i}
                      className="mt-1.5 text-xs italic leading-relaxed text-white/60 sm:text-sm"
                    >
                      {ex}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <div className="rounded-[1.2rem] border border-[hsl(var(--pb-mint)/0.2)] bg-[hsl(var(--pb-mint)/0.04)] p-4 text-center">
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
              Replace your weak website form with guided visual intake.
              Customers follow a simple path, your team gets an actionable lead
              packet, and nobody chases photos through text and email.
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
