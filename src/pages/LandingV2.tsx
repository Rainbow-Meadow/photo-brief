import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
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
  MapPinned,
  MessageSquareWarning,
  PlayCircle,
  Route,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TimerReset,
  TrendingDown,
  Trophy,
  UserX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BrandMark } from "@/components/layout/BrandMark";
import { FreeProEligibilityModal } from "@/components/marketing/FreeProEligibilityModal";
import { BetaOnboardingAgentExperience } from "@/components/marketing/BetaOnboardingAgentExperience";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { useBetaSeats } from "@/hooks/useBetaSeats";
import { trackEvent } from "@/lib/analytics";
import { faqItems } from "@/features/help/content/faq";
import {
  BETA_DURATION_DAYS,
  BETA_SETUP_BUFFER_DAYS,
  BETA_TOTAL_PARTNERS,
  REWARD_TIERS,
} from "@/config/betaProgram";
import wideGarage from "@/assets/junk-removal/wide-garage.webp";
import pileCloseup from "@/assets/junk-removal/pile-closeup.webp";
import appliances from "@/assets/junk-removal/appliances.webp";
import drivewayAccess from "@/assets/junk-removal/driveway-access.webp";

const InteractiveHeroBriefAssembly = lazy(() =>
  import("@/components/marketing/InteractiveHeroBriefAssembly").then((m) => ({
    default: m.InteractiveHeroBriefAssembly,
  })),
);

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PhotoBrief.ai replaces weak website forms with guided visual intake that turns vague inquiries into actionable lead packets for quotes, service, dispatch, damage review, and approvals.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Team", price: "99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Business", price: "199", priceCurrency: "USD" },
  ],
  featureList: [
    "Hosted website intake links and embeds",
    "Website Intelligence scans for services, forms, and calls-to-action",
    "Guided customer photo capture from phone or desktop",
    "Routed intake workflows for quote, service, warranty, damage, and review paths",
    "Actionable lead packets with photos, notes, context, and next-step readiness",
    "Manual intake links for phone, email, and one-off customer requests",
  ],
};

const sectionLinks = [
  { href: "#workflow", label: "How it works" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Who it helps" },
  { href: "#setup", label: "Done-for-you setup" },
  { href: "#apply", label: "Apply" },
];

const painPoints = [
  {
    icon: FormInput,
    number: "Vague",
    label: "form submissions stall sales",
    context:
      "Name, email, and a message rarely give your team enough context to quote, schedule, approve, or review.",
  },
  {
    icon: Camera,
    number: "Missing",
    label: "photos arrive too late",
    context:
      "Customers send random snapshots after the fact, usually without scale, labels, access details, or the right angle.",
  },
  {
    icon: Clock,
    number: "Hours",
    label: "disappear before action",
    context:
      "Every follow-up question delays the next step and gives the customer time to drift, shop around, or give up.",
  },
  {
    icon: UserX,
    number: "Friction",
    label: "kills self-serve momentum",
    context:
      "Customers want to finish the request on their phone without downloading an app, waiting for a callback, or guessing what to send.",
  },
  {
    icon: TrendingDown,
    number: "Leads",
    label: "look equal when they are not",
    context:
      "Without visual context, good leads and bad leads land in the same inbox looking equally unfinished.",
  },
];

const workflowSteps = [
  {
    icon: ScanSearch,
    eyebrow: "Scan",
    title: "We understand your website first",
    body: "PhotoBrief looks at your services, current forms, calls-to-action, and customer paths so intake can match what your business actually sells.",
  },
  {
    icon: Route,
    eyebrow: "Route",
    title: "Customers choose a simple path",
    body: "Instead of a giant form, visitors pick from 2–3 clear options like quote, service, warranty, damage, product question, or review.",
  },
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "PhotoBrief asks for the right photos",
    body: "Customers take or upload photos from any device, one plain-language prompt at a time. No app, account, or guesswork.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Packet",
    title: "Your team gets an actionable lead packet",
    body: "Photos, notes, customer details, matched service path, missing items, and next-step readiness arrive together.",
  },
];

const messySignals = [
  "Generic contact form with name, email, and a vague message",
  "Photos arrive later through text, email, or not at all",
  "No scale, model number, access context, or issue close-up",
  "Team asks the same follow-up questions again",
  "Quote, schedule, or review decision gets delayed",
];

const cleanSignals = [
  "Customer starts from the right service path",
  "Required photos are requested in order",
  "Notes, IDs, and context stay attached to the submission",
  "Readiness issues are visible before the team acts",
  "The result arrives as an actionable lead packet",
];

const intakeExamples = [
  {
    icon: BadgeCheck,
    title: "Quote and estimate requests",
    body: "Capture scope, wide shots, close-ups, labels, measurements, or access details before the first sales call.",
    stamp: "Quote-ready",
  },
  {
    icon: MapPinned,
    title: "Service and dispatch prep",
    body: "Collect issue context, location photos, urgency, and job-site constraints before a technician or crew heads out.",
    stamp: "Field-ready",
  },
  {
    icon: ImageOff,
    title: "Damage, warranty, and claims",
    body: "Guide customers through proof photos, serial numbers, order details, packaging shots, and condition notes.",
    stamp: "Evidence packet",
  },
  {
    icon: ShieldCheck,
    title: "Approvals and exceptions",
    body: "Turn customer media into a packet that can be reviewed, approved, escalated, or declined without guessing.",
    stamp: "Decision-ready",
  },
];

const setupSteps = [
  {
    icon: Globe2,
    title: "Scan your current site",
    body: "We identify service pages, quote buttons, contact forms, CTAs, and the places where your current intake loses context.",
  },
  {
    icon: ClipboardList,
    title: "Map 2–3 intake paths",
    body: "We compress your services into simple customer choices and attach the right photo prompts to each path.",
  },
  {
    icon: Link2,
    title: "Launch a hosted link or embed",
    body: "Use PhotoBrief beside your current form, behind a quote button, or as a replacement intake path. No coding required for beta partners.",
  },
];

const trustPoints = [
  {
    icon: Smartphone,
    title: "No app for customers",
    desc: "Visitors complete intake from mobile or desktop with no install, account, or login.",
  },
  {
    icon: Link2,
    title: "Secure intake links",
    desc: "Customers only see the intake flow. They never see your dashboard or internal data.",
  },
  {
    icon: Lock,
    title: "Your data stays yours",
    desc: "Photos and lead packets are not shared or used for training.",
  },
];

const proofPhotos = [
  { src: wideGarage, label: "Wide context", status: "Ready" },
  { src: pileCloseup, label: "Close-up", status: "Useful" },
  { src: appliances, label: "Item detail", status: "Flagged" },
  { src: drivewayAccess, label: "Access", status: "Ready" },
];

export default function LandingV2Page() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const [demoOpen, setDemoOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<"messy" | "clean">("messy");
  const { isFull } = useBetaSeats();

  const applicationSource = ref ? `landing:${ref}` : "landing";
  const utm = useMemo(() => {
    if (typeof window === "undefined") return { source: "landing", ref: ref || undefined };
    const p = new URLSearchParams(window.location.search);
    return {
      source: "landing",
      utm_source: p.get("utm_source") || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      ref: p.get("ref") || ref || undefined,
    };
  }, [ref]);

  useEffect(() => {
    trackEvent("landing_page_view", { ...utm, source: applicationSource });
  }, [applicationSource, utm]);

  const jsonLd = useMemo(
    () => [
      SOFTWARE_APP_JSONLD,
      buildHowToJsonLd("Turn website visitors into visual lead packets with PhotoBrief", howItWorksSteps),
      buildFaqJsonLd(faqItems),
    ],
    [],
  );

  const scrollToApply = (location: string) => {
    trackEvent("cta_click", { location, label: isFull ? "join_waitlist" : "apply_beta" });
    document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <PageMeta
        title="PhotoBrief.ai | Guided visual intake for quote-ready leads"
        description="Replace weak website forms with guided visual intake. PhotoBrief scans your site, maps your services, and turns visitors into actionable lead packets."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <main className="pb-landing">
        <HeroSection isFull={isFull} onApply={() => scrollToApply("hero")} onDemo={() => setDemoOpen(true)} />
        <PainPointSection />
        <DemoSection />
        <SectionNav />
        <WorkflowSection />
        <ComparisonSection mode={comparisonMode} onModeChange={setComparisonMode} />
        <UseCaseSection />
        <WebsiteIntelligenceSection onApply={() => scrollToApply("website_intelligence")} />
        <BetaProgramSection isFull={isFull} onApply={() => scrollToApply("beta_program")} />
        <TrustSection />
        <section id="apply" className="pb-section scroll-mt-8">
          <div className="pb-container">
            <BetaOnboardingAgentExperience source="landing" />
          </div>
        </section>
        <FinalCta isFull={isFull} onApply={() => scrollToApply("final_cta")} />
      </main>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-5xl overflow-hidden border-0 bg-black p-0 sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>PhotoBrief product spotlight</DialogTitle>
            <DialogDescription>
              A product overview showing guided website intake, customer capture, lead packets, and beta partner rewards.
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

function HeroSection({ isFull, onApply, onDemo }: { isFull: boolean; onApply: () => void; onDemo: () => void }) {
  return (
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

          <span className="pb-eyebrow">
            <Sparkles className="h-3.5 w-3.5" /> Accepting beta applications
          </span>

          <h1 className="pb-hero-title mx-auto mt-3 max-w-3xl text-white sm:mt-4">
            Replace weak website forms with guided visual intake.
            <span className="mt-1 block text-[hsl(var(--pb-lavender))]">
              Get quote-ready leads, not vague messages.
            </span>
          </h1>

          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
            PhotoBrief scans your website, maps your services, and gives customers a simple photo-guided path so your team receives actionable lead packets instead of form spam.
          </p>

          <div className="mx-auto mt-5 flex max-w-lg flex-col gap-2.5 sm:mt-6 sm:max-w-none sm:flex-row sm:justify-center sm:gap-3">
            <Button size="xl" variant="pb-primary" onClick={onApply}>
              {isFull ? "Join the waitlist" : "Apply for the beta"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button asChild size="xl" variant="pb-secondary">
              <a href="#workflow" onClick={() => trackEvent("cta_click", { location: "hero", label: "workflow" })}>
                See the intake flow
              </a>
            </Button>
            <Button size="xl" variant="pb-ghost" onClick={onDemo}>
              <PlayCircle className="mr-1.5 h-4.5 w-4.5" /> Product spotlight
            </Button>
          </div>

          <div className="mx-auto mt-4 flex max-w-2xl flex-wrap justify-center gap-2 sm:mt-5 sm:gap-2.5">
            {["Website scan included", "Hosted link or embed", "Lead packets, not form spam"].map((item) => (
              <span key={item} className="pb-route-chip whitespace-nowrap px-2.5 py-1.5 text-center text-[0.65rem] font-semibold sm:px-3 sm:py-2 sm:text-xs">
                {item}
              </span>
            ))}
          </div>

          <BetaSeatTracker className="mx-auto mt-4 max-w-sm sm:mt-5" />
        </div>
      </div>
    </section>
  );
}

function PainPointSection() {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">
            <MessageSquareWarning className="h-3.5 w-3.5" /> The gap
          </span>
          <h2 className="pb-section-title mt-4 text-white">Your intake process is costing you good leads.</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            Between a vague website form and a lead your team can actually quote, schedule, or review, momentum disappears into missing photos, unclear context, and repeated follow-up.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-5">
          {painPoints.map(({ icon: Icon, number, label, context }) => (
            <article key={number + label} className="pb-card flex flex-col p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-[hsl(var(--pb-lavender))] sm:text-3xl">{number}</span>
              </div>
              <p className="mt-3 text-sm font-bold tracking-tight text-white sm:text-base">{label}</p>
              <p className="pb-copy mt-1 text-xs leading-relaxed sm:text-sm">{context}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <Suspense fallback={<div className="min-h-[400px]" />}>
          <InteractiveHeroBriefAssembly />
        </Suspense>
      </div>
    </section>
  );
}

function SectionNav() {
  return (
    <nav aria-label="Landing page sections" className="sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-night)/0.82)] backdrop-blur-xl">
      <div className="pb-container flex justify-start gap-1.5 overflow-x-auto py-2 sm:justify-center sm:gap-2 sm:py-3">
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
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-10">
          <div>
            <span className="pb-eyebrow"><Route className="h-3.5 w-3.5" /> How it works</span>
            <h2 className="pb-section-title mt-4 max-w-xl text-white">From website visitor to actionable lead packet.</h2>
            <p className="pb-copy mt-4 max-w-lg text-base sm:text-lg">
              PhotoBrief is not another generic form. It matches the visitor to the right intake path, asks for the right visuals, and packages the result for action.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[hsl(var(--pb-lavender))] via-[hsl(var(--pb-mint))] to-transparent md:block" />
            <div className="grid gap-3 sm:gap-4">
              {workflowSteps.map(({ icon: Icon, eyebrow, title, body }, index) => (
                <article key={title} className="pb-card relative grid gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-[4rem_1fr] md:p-6">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))] sm:h-14 sm:w-14">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">0{index + 1} · {eyebrow}</p>
                    <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-white sm:mt-2 sm:text-2xl">{title}</h3>
                    <p className="pb-copy mt-1.5 max-w-2xl text-sm sm:mt-2 sm:text-base">{body}</p>
                  </div>
                </article>
              ))}
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
          <h2 className="pb-section-title mt-4 text-white">Your team should not have to decode a lead after it arrives.</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            PhotoBrief moves the structure upstream, before the customer submits, so the packet is useful when your team opens it.
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-fit rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button type="button" onClick={() => onModeChange("messy")} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${!isClean ? "bg-white text-[hsl(var(--pb-night))]" : "text-white/62 hover:text-white"}`}>Weak form</button>
          <button type="button" onClick={() => onModeChange("clean")} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${isClean ? "bg-white text-[hsl(var(--pb-night))]" : "text-white/62 hover:text-white"}`}>PhotoBrief intake</button>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="pb-card overflow-hidden p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              {proofPhotos.map((photo) => (
                <figure key={photo.label} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                  <img src={photo.src} alt={`${photo.label} example`} className="aspect-[4/3] w-full object-cover" />
                  <figcaption className="flex items-center justify-between px-3 py-2 text-xs">
                    <span className="font-semibold text-white">{photo.label}</span>
                    <span className={photo.status === "Flagged" ? "text-[hsl(var(--pb-gold))]" : "text-[hsl(var(--pb-mint))]"}>{photo.status}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <div className="pb-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--pb-lavender)/0.14)] text-[hsl(var(--pb-lavender))]">
                {isClean ? <CheckCircle2 className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">{isClean ? "After" : "Before"}</p>
                <h3 className="text-xl font-semibold text-white">{isClean ? "A routed, visual lead packet" : "A generic form submission"}</h3>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {signals.map((signal) => (
                <li key={signal} className="flex gap-3 text-sm text-white/78">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${isClean ? "bg-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-gold))]"}`} />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCaseSection() {
  return (
    <section id="use-cases" className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><BadgeCheck className="h-3.5 w-3.5" /> Who it helps</span>
          <h2 className="pb-section-title mt-4 text-white">Built for businesses that need to see before they act.</h2>
          <p className="pb-copy mt-4 text-base sm:text-lg">
            If your team needs photos, labels, site context, damage proof, or access details before taking the next step, PhotoBrief belongs in your intake flow.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {intakeExamples.map(({ icon: Icon, title, body, stamp }) => (
            <article key={title} className="pb-card p-5">
              <div className="flex items-start justify-between gap-3">
                <Icon className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white/60">{stamp}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
              <p className="pb-copy mt-2 text-sm">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WebsiteIntelligenceSection({ onApply }: { onApply: () => void }) {
  return (
    <section id="setup" className="pb-section-tight">
      <div className="pb-container">
        <div className="relative overflow-hidden rounded-[2rem] border border-[hsl(var(--pb-lavender)/0.28)] bg-gradient-to-br from-[hsl(var(--pb-violet)/0.16)] via-[hsl(var(--pb-ink))] to-[hsl(var(--pb-mint)/0.08)] p-5 sm:p-8 lg:p-10">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[hsl(var(--pb-lavender)/0.16)] blur-[80px]" />
          <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <span className="pb-eyebrow"><Bot className="h-3.5 w-3.5" /> Website Intelligence</span>
              <h2 className="pb-section-title mt-4 max-w-xl text-white">For beta partners, we build the first intake from your website.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                Apply with your website. If accepted, PhotoBrief scans your services, current forms, and calls-to-action, then maps them into 2–3 simple intake paths you can launch with a link or embed.
              </p>
              <Button size="lg" variant="pb-primary" className="mt-6" onClick={onApply}>
                {`Apply for one of ${BETA_TOTAL_PARTNERS} beta seats`} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {setupSteps.map(({ icon: Icon, title, body }, index) => (
                <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[hsl(var(--pb-lavender))]"><Icon className="h-5 w-5" /></div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">0{index + 1}</p>
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{title}</h3>
                  <p className="pb-copy mt-1 text-sm">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BetaProgramSection({ isFull, onApply }: { isFull: boolean; onApply: () => void }) {
  return (
    <section id="beta-program" className="pb-section">
      <div className="pb-container">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <span className="pb-eyebrow"><Gift className="h-3.5 w-3.5" /> Founding beta</span>
            <h2 className="pb-section-title mt-4 text-white">Shape the intake engine while we build yours.</h2>
            <p className="pb-copy mt-4 text-base sm:text-lg">
              We are selecting beta partners who want better website leads and are willing to test real customer intake flows over {BETA_DURATION_DAYS} days. We handle the setup; you bring the feedback.
            </p>
            <div className="mt-5 grid gap-2 text-sm text-white/76">
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /> Website scan and intake mapping included.</p>
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /> {BETA_SETUP_BUFFER_DAYS}-day setup buffer before the active beta window.</p>
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" /> Rewards for all accepted partners, with the top two earning Free Pro for Life.</p>
            </div>
          </div>

          <div className="pb-card overflow-hidden p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] shadow-lg shadow-[hsl(var(--pb-violet)/0.35)]">
                <Trophy className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">The founding reward</p>
                <h3 className="text-2xl font-bold text-white">2 partners get Free Pro for Life</h3>
              </div>
            </div>
            <p className="pb-copy mt-4 text-sm sm:text-base">
              The strongest beta feedback earns the strongest reward. Quality over quantity: clear examples, real lead outcomes, and honest workflow friction matter most.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {REWARD_TIERS.slice(0, 2).map((tier) => (
                <div key={tier.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <p className="text-sm font-semibold text-white">{tier.name}</p>
                  <p className="pb-copy mt-1 text-xs">{tier.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <FreeProEligibilityModal>
                {(open) => (
                  <Button type="button" variant="pb-secondary" onClick={open}>Terms & eligibility</Button>
                )}
              </FreeProEligibilityModal>
              <Button variant="pb-primary" onClick={onApply}>
                {isFull ? "Join the waitlist" : "Apply now"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
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
  );
}

function FinalCta({ isFull, onApply }: { isFull: boolean; onApply: () => void }) {
  return (
    <section className="pb-section-tight pb-20">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 text-center shadow-2xl shadow-black/20 sm:p-10">
          <span className="pb-eyebrow"><TimerReset className="h-3.5 w-3.5" /> Prelaunch beta</span>
          <h2 className="pb-section-title mt-4 text-white">Turn your website into a better lead intake system.</h2>
          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">
            Give us your website. We will scan it, map the intake paths, and help you launch a visual intake that helps customers explain what they need — and helps your business sell, quote, schedule, or review faster.
          </p>
          <Button size="xl" variant="pb-primary" className="mt-6" onClick={onApply}>
            {isFull ? "Join the waitlist" : "Apply for beta access"} <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <p className="pb-copy mt-3 text-xs">{BETA_TOTAL_PARTNERS} founding seats · reviewed for fit · no app required for customers</p>
        </div>
      </div>
    </section>
  );
}
