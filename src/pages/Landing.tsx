import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  
  DollarSign,
  Eye,
  FileCheck2,
  FileText,
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
  Truck,
  UserCheck,
  UserX,
  Users,
  Wind,
  Wrench,
  Leaf,
  Package,
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

import { FreeProEligibilityModal } from "@/components/marketing/FreeProEligibilityModal";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import { BetaOnboardingAgentExperience } from "@/components/marketing/BetaOnboardingAgentExperience";
import { BrandMark } from "@/components/layout/BrandMark";
import { MarketingHero, MarketingSection } from "@/components/layout/primitives";
import {
  Section,
  Container,
  Eyebrow,
  Title,
  Subtitle,
  Body,
  CTA,
  CTAGroup,
} from "@/pages/landing/schema";
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
import heroIllustration from "@/assets/landing-hero-illustration.png";
import landscaperIllo from "@/assets/trades/landscaper-illustration.png";
import junkHaulerIllo from "@/assets/trades/junk-hauler-illustration.png";
import hvacTechIllo from "@/assets/trades/hvac-tech-illustration.png";
import plumberIllo from "@/assets/trades/plumber-illustration.png";
import estimatorIllo from "@/assets/trades/estimator-illustration.png";
import transformationIllo from "@/assets/scenes/transformation-illustration.png";
import foundingBadgeIllo from "@/assets/scenes/founding-badge-illustration.png";
import rewardRibbonsIllo from "@/assets/scenes/reward-ribbons-illustration.png";
import betaNotebookIllo from "@/assets/scenes/beta-notebook-illustration.png";
import mailboxFlagIllo from "@/assets/scenes/mailbox-flag-illustration.png";

/* ── JSON-LD ───────────────────────────────────────────────── */

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Stop chasing customers for missing photos. PhotoBrief uses the Reverse-Form Method — instead of asking your customer what they need, you tell them exactly what to send. The form follows the job, and a quote-ready lead packet lands in your inbox on the first try.",
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
  { href: "#workflow", label: "The mechanism" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Who it's for" },
  { href: "#website-intelligence", label: "Site scan" },
  { href: "#beta-program", label: "Founding seats" },
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
    title: "We read your site like your best estimator would.",
    body: "Before we ask your customer a single question, we crawl your services, your quote buttons, your forms, and your CTAs. We learn what jobs you actually take, what you charge for, and where the cracks in your current intake are leaking money. No upload. No spreadsheet. We just read.",
  },
  {
    icon: Route,
    eyebrow: "Map",
    title: "We compress 27 service pages into 3 customer choices.",
    body: "Most websites give visitors 14 ways to ask for help. We pick the 2–3 paths that actually drive revenue and attach the exact photo prompts each one needs — the panel access shot, the driveway angle, the nameplate close-up. The customer never sees the complexity. They just see the next button.",
  },
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "Your customer takes the right photo, not just any photo.",
    body: "One prompt at a time. On their phone, no app, no signup. They photograph what your team actually needs to quote — wide shot, scale shot, problem shot, access shot — guided in the order that mirrors how you walk a job. They can't skip. They can't send a blurry blob and call it a day.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Deliver",
    title: "Your inbox gets a packet. Not a guessing game.",
    body: "Every photo labeled. Every note attached to the right service line. Readiness flags up top. By the time you open it, you already know whether to quote it, schedule it, or pass — without typing a single follow-up email. The first reply you send is the price.",
  },
];

const messySignals = [
  "Generic form: name, email, and a 200-character box marked 'tell us about your project.'",
  "Photos arrive three days later — by text, by email, on the wrong thread.",
  "No scale. No angle. No clue what you're actually looking at.",
  "You ask three follow-up questions before you can even start a quote.",
  "Half the leads die in your inbox while you're chasing the other half.",
];

const cleanSignals = [
  "Customer picks the exact service in two taps — no guessing required.",
  "Required photos requested in order — wide shot, close-up, access, scale.",
  "Notes stay glued to the right service line, not floating in a thread.",
  "Readiness flags surface missing info before it ever hits your team.",
  "Your first reply is the quote — not 'hey, can you send a few photos?'",
];

const useCases = [
  {
    icon: Leaf,
    title: "Landscapers — quote the yard from the driveway shot",
    body: "The customer who said 'just need a small cleanup' actually has a half-acre with three dead trees. Guided lot, slope, and access photos surface the real scope before your truck rolls — so you stop quoting blind and stop losing your shirt on $200 jobs that turn into $2,000 days.",
    stamp: "Landscaping",
  },
  {
    icon: Truck,
    title: "Junk haulers — price the pile before you leave the shop",
    body: "Vague 'come haul this' becomes a quoted load — pile shot, appliance shot, driveway access, hazardous flags. You roll with the right truck and the right crew. No second trips. No 'oh, I forgot to mention the piano.' Every $480 driveway hauler stays a $480 driveway hauler.",
    stamp: "Junk removal",
  },
  {
    icon: Wind,
    title: "HVAC & repair — show up with the right part the first time",
    body: "Nameplate. Filter. Breaker. Surrounding access. Captured before the dispatch ticket closes. Your tech rolls with the right capacitor, the right refrigerant, the right model number. The HVAC tech who showed up empty-handed twice last month? That tech doesn't exist anymore.",
    stamp: "HVAC & repair",
  },
  {
    icon: Wrench,
    title: "Plumbers — diagnose the leak before the truck rolls",
    body: "Shutoff location. Leak source. Supply line condition. Captured by the customer in 90 seconds. Now dispatch knows whether it's a 30-minute fitting swap or a half-day repipe — before they assign the job. You stop sending two-hour windows for jobs that need four.",
    stamp: "Plumbing",
  },
  {
    icon: Package,
    title: "Damage & return estimators — turn customer photos into evidence",
    body: "Insurance. Warranty. E-commerce returns. Angles, scale references, and serial number shots arrive in a structured packet your reviewers can adjudicate first pass. No back-and-forth. No 'please resubmit with a measuring tape.' The claim closes in one round.",
    stamp: "Estimating",
  },
];

/** Trades targeted by PhotoBrief — used in the hero strip and SEO copy. */
const TRADES = [
  { name: "Landscapers", icon: Leaf, stamp: "Landscaping" },
  { name: "Junk haulers", icon: Truck, stamp: "Junk removal" },
  { name: "HVAC & repair", icon: Wind, stamp: "HVAC & repair" },
  { name: "Plumbers", icon: Wrench, stamp: "Plumbing" },
];

const trustPoints = [
  {
    icon: Link2,
    title: "Your customer never sees your dashboard",
    desc: "Secure, expiring upload links. They submit. You receive. Nothing in between.",
  },
  {
    icon: Smartphone,
    title: "No app. No account. No friction.",
    desc: "Your customer opens a link, takes the photos, and submits. That's it. If their grandma can text, she can use this.",
  },
  {
    icon: Lock,
    title: "Your photos never train our models",
    desc: "Period. Your data is yours. We don't share it, sell it, or feed it to anything.",
  },
];

const websiteIntelCards = [
  {
    icon: Scan,
    title: "What we read",
    body: "Your service pages. Your quote buttons. Your contact forms. The CTAs that work and the ones that quietly leak. We map every place a visitor tries to talk to you — and every place you're missing them.",
  },
  {
    icon: Route,
    title: "What we map",
    body: "Twenty-seven service pages compressed into 2–3 customer choices, each with its own photo prompt order. The decisions you've been making in your head for ten years, finally written down — and pointed at your customer.",
  },
  {
    icon: Globe2,
    title: "What we ship",
    body: "A hosted intake link or a one-line embed. Drop it on your homepage. Put it behind your quote button. Replace the form that's been costing you. You're live in seven days. Beta partners pay nothing for the build.",
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
  const [activeUseCaseStamp, setActiveUseCaseStamp] = useState<string | null>(null);
  const [betaDetailsOpen, setBetaDetailsOpen] = useState<string[]>([]);
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
        title="PhotoBrief.ai | Visual intake for landscapers, junk haulers, HVAC, plumbers & estimators"
        description="PhotoBrief replaces weak website forms with guided visual intake — built for landscapers, junk haulers, HVAC and repair techs, plumbers, and damage / return estimators. Scan your site, map your services, and get actionable lead packets instead of vague messages."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <main className="pb-landing pb-on-paper">
        {/* ━━ 1. HERO — editorial / paper ━━━━━━━━━━━━━━━━━━━━━ */}
        <MarketingHero width="full" className="px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 px-0 lg:grid-cols-2 lg:gap-12 lg:pl-20 lg:pr-8">
              {/* Left — copy */}
              <div className="text-left pl-0">
                <Eyebrow>
                  <Sparkles className="h-3.5 w-3.5" /> Accepting beta applications
                </Eyebrow>

                <div className="mt-4 sm:mt-6">
                  <Title level={1}>
                    Replace weak forms.
                    <br />
                    Send a guided
                    <br />
                    photo brief.
                  </Title>
                </div>

                <div className="mt-4 sm:mt-6 max-w-xl">
                  <Subtitle>
                    PhotoBrief scans your website, maps your services, and gives
                    customers a simple photo-guided path — so your team gets
                    actionable lead packets instead of vague messages. Built for
                    landscapers, junk haulers, HVAC and repair techs, plumbers,
                    and damage estimators.
                  </Subtitle>
                </div>

                <div className="mt-6 sm:mt-8">
                  <CTAGroup>
                    <CTA
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        trackEvent("cta_click", { location: "hero", label: "primary" });
                        document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {isFull ? "Join the waitlist" : "Apply for the beta"}
                      <ArrowRight className="h-4 w-4" />
                    </CTA>
                    <CTA variant="quiet" size="lg" onClick={() => setDemoOpen(true)}>
                      <PlayCircle className="h-5 w-5" />
                      Watch the product spotlight
                    </CTA>
                  </CTAGroup>
                </div>

                <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[hsl(var(--pb-ink-muted))] sm:text-sm">
                  {[
                    "Website scan included",
                    "Hosted link or embed",
                    "Lead packets, not form spam",
                  ].map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--pb-violet)/0.55)]" />
                      {item}
                    </span>
                  ))}
                </div>

                {/* Built-for trade strip — links to matching use case */}
                <div className="mt-8 sm:mt-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--pb-ink-muted))]">
                    Built for
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {TRADES.map(({ name, icon: TIcon }) => (
                      <a
                        key={name}
                        href="#use-cases"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--pb-ink-soft)/0.18)] bg-[hsl(var(--pb-ink-soft)/0.04)] px-3 py-1.5 text-xs font-bold text-[hsl(var(--pb-ink))] transition hover:border-[hsl(var(--pb-violet)/0.55)] hover:text-[hsl(var(--pb-violet))] sm:text-sm"
                      >
                        <TIcon className="h-4 w-4 text-[hsl(var(--pb-violet))]" />
                        {name}
                      </a>
                    ))}
                  </div>
                </div>

                <BetaSeatTracker className="pb-on-paper mt-8 max-w-sm sm:mt-10" />
              </div>

              {/* Right — brand mark + hand-drawn illustration */}
              <div className="flex flex-col items-center min-w-0">
                <div className="mb-4 sm:mb-6 w-full max-w-sm sm:max-w-md lg:max-w-lg lg:translate-x-2 flex justify-center">
                  <BrandMark variant="horizontal" size={64} eager className="sm:hidden" />
                  <BrandMark variant="horizontal" size={88} eager className="hidden sm:inline-flex lg:hidden" />
                  <BrandMark variant="horizontal" size={112} eager className="hidden lg:inline-flex" />
                </div>
                <div className="relative flex w-full justify-center">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-xl rounded-full bg-[hsl(var(--pb-lavender)/0.22)] blur-[110px]"
                  />
                  <img
                    src={heroIllustration}
                    alt="Hand-drawn illustration of a phone showing a guided photo-request flow"
                    width={1024}
                    height={1024}
                    className="relative w-full max-w-sm drop-shadow-[0_30px_50px_hsl(var(--pb-ink-soft)/0.18)] sm:max-w-md lg:max-w-lg lg:translate-x-2"
                  />
                </div>
              </div>
            </div>
        </MarketingHero>

        {/* ━━ TICKER 1 — Industry signals ━━━━━━━━━━━━━━━━━━━ */}
        <TickerBar
          tone="paper"
          items={[
            "81% of forms abandoned before submit",
            "78% buy from whoever responds first",
            "4.2 hr avg lead response time",
            "60% of estimates never followed up",
            "5+ follow-ups to close — most stop at 1",
          ]}
        />

        {/* ━━ 2. PAIN POINTS + ROI — ivory alt ━━━━━━━━━━━━━━ */}
        <div className="pb-section-alt">
          <PainPointSection />
        </div>

        {/* ━━ SEAM A — Chapter marker (Problem → Solution) ━━━━ */}
        <ChapterMarker
          stamp="Chapter II · The fix"
          words={[
            ["messy form", "clean packet"],
            ["vague intake", "actionable lead"],
            ["back-and-forth", "one round trip"],
          ]}
        />

        <MarketingSection>
          <SectionIntro
            className="mb-6 sm:mb-8"
            eyebrow={<><Sparkles className="h-3.5 w-3.5" /> See the difference</>}
            title="Vague website form becomes an actionable lead packet."
            description={`Watch how a generic "tell us about your project" message turns into a structured packet with the right photos, notes, and context — ready for your team to act on.`}
            accent={
              <TradeAccent
                src={transformationIllo}
                alt="Hand-drawn illustration of a crumpled note transforming into a tidy clipped photo packet"
              />
            }
          />
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <InteractiveHeroBriefAssembly />
          </Suspense>
        </MarketingSection>

        {/* ━━ 4. STICKY SECTION NAV ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <SectionNav tone="paper" />

        {/* ━━ 5. HOW IT WORKS — tier 2 anchor ━━━━━━━━━━━━━━━━━ */}
        <div className="pb-tier-2">
          <WorkflowSection />
        </div>

        {/* ━━ SEAM B — Comparison toggle promoted to seam ━━━━━ */}
        <ComparisonSeam mode={comparisonMode} onModeChange={setComparisonMode} />

        {/* ━━ 6. BEFORE / AFTER — ivory alt ━━━━━━━━━━━━━━━━━━ */}
        <div className="pb-section-alt">
          <ComparisonSection mode={comparisonMode} />
        </div>

        {/* ━━ TICKER 2 — Product signals ━━━━━━━━━━━━━━━━━━━━━━ */}
        <TickerBar tone="paper" items={["Website scan included", "Hosted link or embed", "No app required for customers", "AI photo quality checks", "Lead packets — not form spam"]} direction="right" />

        {/* ━━ SEAM C — Use case chip filter ━━━━━━━━━━━━━━━━━━ */}
        <UseCaseChipRow active={activeUseCaseStamp} onChange={setActiveUseCaseStamp} />

        {/* ━━ 7. USE CASES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <UseCaseSection activeStamp={activeUseCaseStamp} />

        {/* ━━ 8. WEBSITE INTELLIGENCE — ivory alt ━━━━━━━━━━━━━ */}
        <div className="pb-section-alt">
          <WebsiteIntelligenceSection />
        </div>

        {/* ━━ SEAM D — Beta crossover ticker ━━━━━━━━━━━━━━━━━ */}
        <TickerBar
          tone="paper"
          items={[
            `${BETA_TOTAL_PARTNERS} founding partner seats`,
            "Free Pro for Life reward",
            `${BETA_DURATION_DAYS}-day beta`,
            "Concierge setup included",
            "Every partner earns a reward",
          ]}
        />

        {/* ━━ BETA ZONE — distinct lavender-tinted chapter ━━━━━━ */}
        <div className="pb-beta-zone">
          {/* Founding partner narrative + apply agent */}
          <FoundingPartnerBetaSection isFull={isFull} />

          {/* Reward tiers — ivory alt emphasis (within beta zone) */}
          <div className="pb-section-alt">
            <RewardTiersSection />
          </div>

          {/* Details — collapsed disclosure with master toggle seam */}
          <BetaDetailsAccordion value={betaDetailsOpen} onValueChange={setBetaDetailsOpen} />
        </div>

        {/* ━━ FINAL CTA — schema-driven dark section ━━━━━━━━━ */}
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
    <section className="w-full" ref={calcRef}>
      <div className="mx-auto w-full max-w-sm">
        <button
          type="button"
          onClick={() => {
            setOpen((p) => !p);
            if (!open) setTimeout(() => calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
          }}
          className="group mx-auto flex w-full max-w-sm flex-col items-center gap-3 rounded-[1.5rem] border border-[hsl(var(--pb-lavender)/0.25)] bg-gradient-to-r from-[hsl(var(--pb-violet)/0.10)] via-[hsl(var(--pb-ink))] to-[hsl(var(--pb-lavender)/0.06)] p-5 transition hover:border-[hsl(var(--pb-lavender)/0.4)] sm:p-6 text-left pt-[24px] mt-[24px]"
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
                  <div className="rounded-[1.25rem] border border-[hsl(var(--pb-violet)/0.3)] bg-[hsl(var(--pb-violet)/0.06)] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-violet))]">
                      <DollarSign className="h-3.5 w-3.5" /> Estimated annual revenue recovered
                    </div>
                    <p className="mt-2 text-3xl font-black tracking-tight text-[hsl(var(--pb-violet))] sm:text-4xl">{formatDollars(annualRevenue)}</p>
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
        {/* Top — artwork/intro + stat/ROI in two columns */}
        <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-8 lg:text-left">
          {/* Left column — artwork + intro copy */}
          <div className="lg:min-w-0 lg:text-left">
            <img
              src={junkHaulerIllo}
              alt="Hand-drawn illustration of a junk hauler standing beside an unsorted pile"
              width={1024}
              height={1024}
              loading="lazy"
              decoding="async"
              className="mx-auto mb-6 w-full max-w-[280px] drop-shadow-[0_22px_36px_hsl(var(--pb-ink-soft)/0.28)] lg:mx-0 lg:max-w-[320px] text-left object-cover scale-150 origin-center lg:origin-left"
            />
            <span className="pb-eyebrow">
              <MessageSquareWarning className="h-3.5 w-3.5" /> The problem
            </span>
            <h2 className="pb-section-title mt-4 text-white">
              Your website intake is leaking money.
            </h2>
            <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg lg:mx-0 lg:max-w-xl">
              These are real industry numbers. Generic contact forms don't
              just lose information — they lose customers.
            </p>
          </div>

          {/* Right column — 81% stat + ROI calculator */}
          <div className="mt-6 flex flex-col items-center gap-4 lg:mt-0 lg:items-center lg:justify-center">
            <StatAccent
              icon={TrendingDown}
              value="81%"
              label="of website forms are abandoned before submit."
              tone="lavender"
            />
            <RoiCalculatorSection />
            <p className="pb-copy max-w-sm text-center text-sm italic sm:text-base mt-[24px]">
              PhotoBrief closes the gap between first contact and quote-ready information.
            </p>
          </div>
        </div>

        {/* Bottom — full-width carousel */}
        <div className="relative mx-auto mt-10 w-full sm:mt-12">
          <div className="pb-card relative overflow-hidden p-6 sm:p-8" style={{ minHeight: 260 }}>
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
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[hsl(var(--pb-ink-soft)/0.18)] bg-[hsl(var(--pb-ink-soft)/0.06)] text-[hsl(var(--pb-lavender))]">
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
      </div>
    </section>
  );
}

/* ── Ticker bar ─────────────────────────────────────────── */

function TickerBar({
  items,
  direction = "left",
  tone = "dark",
}: {
  items: string[];
  direction?: "left" | "right";
  tone?: "dark" | "paper";
}) {
  const content = items.map((t) => t.toUpperCase()).join("  ·  ");
  const doubled = `${content}  ·  ${content}  ·  `;
  const wrapClass =
    tone === "paper"
      ? "pb-ticker-paper overflow-hidden py-2.5"
      : "overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-2.5";
  const textClass =
    tone === "paper"
      ? "pb-ticker-text whitespace-nowrap text-[0.6rem] font-bold tracking-[0.2em] sm:text-xs"
      : "whitespace-nowrap text-[0.6rem] font-bold tracking-[0.2em] text-white/25 sm:text-xs";
  return (
    <div className={wrapClass} aria-hidden>
      <div
        className={textClass}
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

function FoundingPartnerBetaSection({ isFull }: { isFull: boolean }) {
  return (
    <MarketingSection id="beta-program">
        <SectionIntro
          eyebrow={<><Stamp className="h-3.5 w-3.5" /> Accepting applications</>}
          title={
            <>
              Built with real workflows,{" "}
              <span className="not-italic font-semibold bg-gradient-to-r from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))] bg-clip-text text-transparent">
                with you.
              </span>
            </>
          }
          description="Visual intake is workflow-specific — every trade, every service type needs something slightly different. The only way to get it right is to build alongside real businesses running real jobs. That's why this is a hands-on beta, not a waitlist."
          accent={
            <TradeAccent
              src={foundingBadgeIllo}
              alt="Hand-drawn illustration of three numbered ribbon badges pinned to a corkboard"
            />
          }
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 sm:mt-10">
          {/* LEFT — narrative detail */}
          <div className="lg:pr-2">
            {/* Seat tracker */}
            <div>
              <BetaSeatTracker className="w-full max-w-sm" />
            </div>

            {/* Reward callout */}
            <div className="mt-7 rounded-xl border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-lavender)/0.06)] p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--pb-lavender)/0.4)] bg-[hsl(var(--pb-lavender)/0.1)]">
                  <Trophy className="h-4.5 w-4.5 text-[hsl(var(--pb-lavender))]" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--pb-lavender))]">
                    Beta reward
                  </p>
                  <p className="mt-1.5 font-serif text-lg italic leading-snug text-white sm:text-xl">
                    2 partners get{" "}
                    <span className="not-italic font-semibold">Free Pro for Life</span>.
                    All {BETA_TOTAL_PARTNERS} earn a post-launch reward tier.
                  </p>
                  <FreeProEligibilityModal>
                    {(open) => (
                      <button
                        type="button"
                        onClick={open}
                        className="mt-2 text-xs font-semibold text-[hsl(var(--pb-lavender))] underline decoration-[hsl(var(--pb-lavender)/0.4)] underline-offset-2 transition hover:text-white hover:decoration-white/60"
                      >
                        Terms &amp; eligibility →
                      </button>
                    )}
                  </FreeProEligibilityModal>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-8 grid gap-5 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-0">
              {trustPoints.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="border-t border-[hsl(var(--pb-ink-soft)/0.18)] pt-3.5">
                  <Icon className="h-4 w-4 text-[hsl(var(--pb-violet))]" />
                  <p className="mt-2 font-serif text-sm italic leading-snug text-[hsl(var(--pb-ink))]">
                    {title}
                  </p>
                  <p className="pb-copy mt-1 text-[11px] leading-[1.45]">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — apply agent */}
          <div id="apply" className="scroll-mt-8 lg:sticky lg:top-6 lg:self-start">
            <BetaOnboardingAgentExperience
              source="landing"
              title={isFull ? "Join the waitlist" : "Apply for the Founding Partner Beta"}
              description={`Share your website and intake context. The onboarding agent qualifies your workflow, recommends your first intake paths, and submits your application for one of ${BETA_TOTAL_PARTNERS} founding partner seats.`}
            />
          </div>
        </div>
    </MarketingSection>
  );
}

/**
 * ChapterMarker — animated seam with a chapter stamp + rotating word pair.
 * Replaces the old passive ChapterDivider hairline.
 */
function ChapterMarker({
  stamp,
  words,
}: {
  stamp: string;
  words: ReadonlyArray<readonly [string, string]>;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || words.length <= 1) return;
    const t = window.setInterval(() => setIdx((i) => (i + 1) % words.length), 2400);
    return () => window.clearInterval(t);
  }, [words.length]);
  const [a, b] = words[idx];
  return (
    <div className="pb-container">
      <div className="pb-chapter-marker">
        <span className="pb-chapter-marker-stamp">{stamp}</span>
        <span className="pb-chapter-marker-rule" aria-hidden />
        <span className="pb-chapter-marker-words" aria-live="polite">
          <span key={`a-${idx}`} className="pb-chapter-marker-word">{a}</span>
          <span className="pb-chapter-marker-arrow">→</span>
          <span key={`b-${idx}`} className="pb-chapter-marker-word pb-chapter-marker-word-b">{b}</span>
        </span>
      </div>
    </div>
  );
}

/** ComparisonSeam — promotes the Before / PhotoBrief toggle into the seam between Workflow and Comparison. */
function ComparisonSeam({
  mode,
  onModeChange,
}: {
  mode: "messy" | "clean";
  onModeChange: (mode: "messy" | "clean") => void;
}) {
  return (
    <div className="pb-seam-bar">
      <div className="pb-container">
        <div className="flex flex-col items-center justify-between gap-3 py-4 sm:flex-row sm:py-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--pb-violet))]">
            See the difference
          </p>
          <div className="pb-seam-toggle" role="tablist" aria-label="Comparison mode">
            {[
              { id: "messy", label: "Before" },
              { id: "clean", label: "PhotoBrief" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={mode === item.id}
                data-active={mode === item.id}
                onClick={() => onModeChange(item.id as "messy" | "clean")}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="hidden text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--pb-ink-muted))] sm:block">
            Toggle to compare
          </p>
        </div>
      </div>
    </div>
  );
}

/** UseCaseChipRow — quick-filter pills that highlight a matching use case card. */
function UseCaseChipRow({
  active,
  onChange,
}: {
  active: string | null;
  onChange: (stamp: string | null) => void;
}) {
  const stamps = useCases.map((u) => u.stamp);
  return (
    <div className="border-b border-[hsl(var(--pb-ink-soft)/0.14)]">
      <div className="pb-container">
        <div className="pb-chip-row" role="tablist" aria-label="Filter use cases">
          <button
            type="button"
            data-active={active === null}
            onClick={() => onChange(null)}
            className="pb-chip"
          >
            All
          </button>
          {stamps.map((stamp) => (
            <button
              key={stamp}
              type="button"
              data-active={active === stamp}
              onClick={() => onChange(active === stamp ? null : stamp)}
              className="pb-chip"
            >
              {stamp}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Two-column section intro.
 * Mobile/tablet: stacked centered. Desktop (lg+): copy left, accent right.
 */
/** Trade illustration accent — drops into a SectionIntro `accent` slot. */
function TradeAccent({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      width={1024}
      height={1024}
      loading="lazy"
      decoding="async"
      className="w-full max-w-[420px] drop-shadow-[0_22px_36px_hsl(var(--pb-ink-soft)/0.28)]"
    />
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  accent,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  accent?: ReactNode;
  className?: string;
}) {
  if (!accent) {
    return (
      <div className={`mx-auto max-w-3xl text-center lg:max-w-5xl ${className ?? ""}`}>
        <span className="pb-eyebrow">{eyebrow}</span>
        <h2 className="pb-section-title mt-4 text-white">{title}</h2>
        {description ? (
          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">{description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`mx-auto max-w-3xl text-center lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:text-left ${className ?? ""}`}
    >
      <div className="lg:min-w-0">
        <span className="pb-eyebrow">{eyebrow}</span>
        <h2 className="pb-section-title mt-4 text-white">{title}</h2>
        {description ? (
          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg lg:mx-0 lg:max-w-xl">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-8 flex justify-center lg:mt-0 lg:justify-end text-center">{accent}</div>
    </div>
  );
}

/** Compact stat tile used as a SectionIntro accent. */
function StatAccent({
  value,
  label,
  icon: Icon,
}: {
  value: ReactNode;
  label: ReactNode;
  icon?: LucideIcon;
  /** Kept for backward-compat; ignored — single violet accent system. */
  tone?: "lavender" | "mint" | "amber";
}) {
  return (
    <div className="w-full max-w-sm text-left">
      <div className="flex items-center gap-2 text-[hsl(var(--pb-violet))]">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span className="text-[10px] font-black uppercase tracking-[0.28em]">
          By the numbers
        </span>
      </div>
      <div className="mt-3 border-t-2 border-[hsl(var(--pb-violet)/0.45)] pt-4">
        <div className="font-serif text-5xl italic leading-none tracking-tight text-[hsl(var(--pb-violet))] sm:text-6xl">
          {value}
        </div>
        <p className="pb-copy mt-3 max-w-xs text-sm leading-snug">{label}</p>
      </div>
    </div>
  );
}


function SectionNav({ tone = "dark" }: { tone?: "dark" | "paper" }) {
  const isPaper = tone === "paper";
  return (
    <nav
      aria-label="Landing page sections"
      className={
        isPaper
          ? "sticky top-[4.5rem] z-30 border-y border-[hsl(var(--pb-ink-soft)/0.10)] bg-[hsl(var(--pb-cream)/0.85)] backdrop-blur-xl"
          : "sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-cream)/0.86)] backdrop-blur-xl"
      }
    >
      <div className="pb-container flex justify-start gap-1.5 overflow-x-auto py-2 sm:gap-2 sm:py-3 sm:justify-center">
        {sectionLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() =>
              trackEvent("landing_jump_nav_click", { target: item.href })
            }
            className={
              isPaper
                ? "min-w-max rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-[hsl(var(--pb-ink-muted))] transition hover:border-[hsl(var(--pb-violet)/0.25)] hover:bg-[hsl(var(--pb-violet)/0.06)] hover:text-[hsl(var(--pb-violet))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-violet))] sm:px-4 sm:py-2 sm:text-sm"
                : "min-w-max rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-white/62 transition hover:border-white/14 hover:bg-white/7 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] sm:px-4 sm:py-2 sm:text-sm"
            }
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
    <MarketingSection id="workflow">
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
            <div className="mt-8 hidden lg:block">
              <img
                src={hvacTechIllo}
                alt="Hand-drawn illustration of an HVAC technician working through a structured intake checklist"
                width={1024}
                height={1024}
                loading="lazy"
                decoding="async"
                className="w-full max-w-[420px] drop-shadow-[0_24px_40px_hsl(var(--pb-ink-soft)/0.28)]"
              />
            </div>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[hsl(var(--pb-lavender))] via-[hsl(var(--pb-violet))] to-transparent md:block" />
            <div className="grid gap-3 sm:gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="pb-card relative grid gap-3 p-4 sm:gap-4 sm:p-5 md:grid-cols-[4rem_1fr] md:p-6"
                  >
                    <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-ink-soft)/0.18)] bg-[hsl(var(--pb-ink-soft)/0.06)] text-[hsl(var(--pb-lavender))] sm:h-14 sm:w-14">
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
    </MarketingSection>
  );
}

function ComparisonSection({ mode }: { mode: "messy" | "clean" }) {
  const isClean = mode === "clean";
  const signals = isClean ? cleanSignals : messySignals;

  return (
    <MarketingSection id="comparison" spacing="tight">
        <SectionIntro
          eyebrow={<><MessageSquareWarning className="h-3.5 w-3.5" /> Before / after</>}
          title="Generic form vs. guided visual intake."
          description="The difference is not more photos — it's structured context that lets your team skip the back-and-forth entirely."
          accent={
            <TradeAccent
              src={estimatorIllo}
              alt="Hand-drawn illustration of a damage estimator reviewing a structured photo packet"
            />
          }
        />

        {/* Editorial spread — two columns separated by a hairline rule */}
        <div className="mt-8 grid gap-6 sm:mt-10 sm:gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-0 lg:divide-x lg:divide-[hsl(var(--pb-ink-soft)/0.18)]">
          <div className="lg:pr-8 xl:pr-12">
            <div className="flex items-baseline justify-between gap-3 border-b border-[hsl(var(--pb-ink-soft)/0.18)] pb-3">
              <p className="font-serif text-lg italic text-[hsl(var(--pb-ink))] sm:text-xl">
                {isClean ? "Guided visual intake" : "Generic website form"}
              </p>
              <span
                className={`text-[10px] font-black uppercase tracking-[0.22em] ${
                  isClean
                    ? "text-[hsl(var(--pb-violet))]"
                    : "text-[hsl(var(--pb-violet))]"
                }`}
              >
                {isClean ? "Actionable" : "Vague"}
              </span>
            </div>
            <ol className="mt-5 space-y-4">
              {signals.map((signal, index) => (
                <li
                  key={signal}
                  className="flex items-start gap-4 border-b border-[hsl(var(--pb-ink-soft)/0.10)] pb-4 last:border-0"
                >
                  <span
                    className={`mt-0.5 font-serif text-2xl leading-none ${
                      isClean
                        ? "text-[hsl(var(--pb-violet))]"
                        : "text-[hsl(var(--pb-violet))]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm text-[hsl(var(--pb-ink-soft))] sm:text-base">
                    {signal}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px] lg:pl-8 xl:pl-12">
            <div className="absolute inset-0 opacity-15">
              <div className="pb-lens-field" />
            </div>
            {isClean ? <CleanPacketVisual /> : <MessyThreadVisual />}
          </div>
        </div>
    </MarketingSection>
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

function UseCaseSection({ activeStamp }: { activeStamp?: string | null }) {
  return (
    <MarketingSection id="use-cases">
        <SectionIntro
          eyebrow={<><ClipboardList className="h-3.5 w-3.5" /> Use cases</>}
          title="Built for the trades that need to see before they act."
          description="Landscapers, junk haulers, HVAC and repair techs, plumbers, and damage / return estimators — anywhere a missing photo slows the next step, PhotoBrief structures the intake so your team has everything on the first pass."
          accent={
            <TradeAccent
              src={landscaperIllo}
              alt="Hand-drawn illustration of a landscaper sending a yard photo from a phone"
            />
          }
        />
        {/* Editorial index — numbered entries divided by hairlines */}
        <div className="mt-8 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory sm:mt-10 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-0 md:overflow-visible md:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {useCases.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeStamp === item.stamp;
            const isDim = activeStamp != null && !isActive;
            return (
              <article
                key={item.title}
                data-usecase-card
                data-active={isActive || undefined}
                data-dim={isDim || undefined}
                className="w-[78vw] max-w-[300px] shrink-0 snap-start border-t border-[hsl(var(--pb-ink-soft)/0.18)] pt-5 md:w-auto md:max-w-none md:min-w-0 md:pt-6"
              >
                {/* image moved to section anchor */}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-2xl leading-none text-[hsl(var(--pb-violet))] sm:text-3xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-[hsl(var(--pb-ink-muted))]" />
                </div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-ink-muted))]">
                  {item.stamp}
                </p>
                <h3 className="mt-2 font-serif text-xl italic leading-tight text-[hsl(var(--pb-ink))] sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 leading-6 text-[hsl(var(--pb-ink-soft))] text-lg">{item.body}</p>
              </article>
            );
          })}
        </div>
    </MarketingSection>
  );
}

function WebsiteIntelligenceSection() {
  return (
    <MarketingSection id="website-intelligence">
        <SectionIntro
          eyebrow={<><Globe2 className="h-3.5 w-3.5" /> Website Intelligence</>}
          title="Your website becomes your intake engine."
          description="PhotoBrief scans your services, current forms, and calls-to-action, then maps them into 2–3 simple intake paths you can launch with a hosted link or embed. Beta partners get this built for them during concierge setup."
          accent={
            <TradeAccent
              src={plumberIllo}
              alt="Hand-drawn illustration of a plumber capturing a guided diagnostic photo"
            />
          }
        />

        <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-3 md:gap-x-10 md:gap-y-0">
          {websiteIntelCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="border-t border-white/12 pt-5 md:pt-6"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-serif text-2xl leading-none text-[hsl(var(--pb-lavender))] sm:text-3xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-5 w-5 text-white/40" />
                </div>
                <h3 className="mt-3 font-serif text-xl italic leading-tight text-white sm:text-2xl">
                  {card.title}
                </h3>
                <p className="pb-copy mt-3 text-sm leading-6">{card.body}</p>
              </article>
            );
          })}
        </div>
    </MarketingSection>
  );
}

function RewardTiersSection() {
  return (
    <MarketingSection spacing="tight">
        <SectionIntro
          eyebrow={<><Gift className="h-3.5 w-3.5" /> Reward tiers</>}
          title="Every partner earns something."
          description="Your tier is based on the quality of your feedback — not just how much you use the product. We track engagement internally; no self-reporting required."
          accent={
            <TradeAccent
              src={rewardRibbonsIllo}
              alt="Hand-drawn illustration of layered award rosette ribbons"
            />
          }
        />
        <div className="mx-auto mt-10 max-w-3xl sm:mt-10">
          <div className="grid border-t border-[hsl(var(--pb-ink-soft)/0.18)]">
            {REWARD_TIERS.map((tier) => {
              const isTopTier = tier.duration === "free-pro";
              return (
                <div
                  key={tier.label}
                  className="flex items-center justify-between gap-3 border-b border-[hsl(var(--pb-ink-soft)/0.18)] py-3.5"
                >
                  <div className="flex items-center gap-3">
                    {isTopTier ? (
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--pb-lavender))] to-[hsl(var(--pb-violet))]">
                        <Trophy className="h-3.5 w-3.5 text-white" />
                      </span>
                    ) : (
                      <span className="font-serif text-lg leading-none text-[hsl(var(--pb-lavender))] sm:text-xl">
                        {String(tier.count).padStart(2, "0")}
                      </span>
                    )}
                    <span
                      className={`text-sm font-semibold sm:text-base ${isTopTier ? "text-[hsl(var(--pb-lavender))]" : "text-white"}`}
                    >
                      {tier.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[hsl(var(--pb-violet))] sm:text-sm">
                    {tier.shortDescription}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-l-2 border-[hsl(var(--pb-lavender)/0.4)] pl-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-lavender))]">
              What drives your tier placement
            </p>
            <ul className="mt-2 grid gap-1.5">
              {REWARD_CRITERIA.map((criterion) => (
                <li
                  key={criterion}
                  className="flex items-start gap-2 text-xs text-white/70 sm:text-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--pb-violet)/0.7)]" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
    </MarketingSection>
  );
}

type BetaDetailsAccordionProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
};

function BetaDetailsAccordion({ value, onValueChange }: BetaDetailsAccordionProps) {
  const ALL_ITEMS = ["expectations", "scoring"];
  const allOpen = ALL_ITEMS.every((id) => value.includes(id));
  return (
    <MarketingSection spacing="tight">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
        <div className="lg:min-w-0">
          <span className="pb-eyebrow"><FileText className="h-3.5 w-3.5" /> The fine print</span>
          <h2 className="pb-section-title mt-4 text-white">Everything in writing.</h2>
          <p className="pb-copy mt-4 max-w-xl text-base sm:text-lg">
            How the program runs, what we ask of partners, and exactly how rewards are decided.
          </p>
          <div className="mt-8">
          <div className="flex items-center justify-end border-b border-[hsl(var(--pb-ink-soft)/0.18)] py-3">
            <button
              type="button"
              className="pb-master-toggle"
              onClick={() => onValueChange(allOpen ? [] : ALL_ITEMS)}
              aria-expanded={allOpen}
            >
              {allOpen ? "Hide details ↑" : "Show all details ↓"}
            </button>
          </div>
          <Accordion type="multiple" value={value} onValueChange={onValueChange} className="grid">
            <AccordionItem value="expectations" className="border-b border-[hsl(var(--pb-ink-soft)/0.18)]">
              <AccordionTrigger className="py-5 text-left text-sm font-bold text-white hover:no-underline sm:text-base [&>svg]:text-[hsl(var(--pb-lavender))]">
                <span className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  What it means to be a founding beta partner
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="pb-copy mb-5 text-sm">
                  We're accepting {BETA_TOTAL_PARTNERS} businesses. The{" "}
                  {BETA_DURATION_DAYS}-day beta clock starts {BETA_SETUP_BUFFER_DAYS}{" "}
                  days after the final seat is filled, giving every partner time for
                  concierge setup.
                </p>
                <div className="mb-6 grid gap-6 sm:grid-cols-2">
                  <BenefitList title="Beta partners get" items={[...PARTNER_BENEFITS]} />
                  <BenefitList title="We ask for" items={[...PARTNER_EXPECTATIONS]} />
                </div>
                <ol className="grid gap-5">
                  {DETAILED_EXPECTATIONS.map((exp, i) => (
                    <li key={i} className="flex gap-4 border-t border-[hsl(var(--pb-ink-soft)/0.18)] pt-4 first:border-0 first:pt-0">
                      <span className="font-serif text-xl leading-none text-[hsl(var(--pb-lavender))] sm:text-2xl">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-serif text-base italic text-white sm:text-lg">
                          {exp.title}
                        </p>
                        <p className="pb-copy mt-1 text-xs leading-5 sm:text-sm">
                          {exp.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="scoring" className="border-b border-[hsl(var(--pb-ink-soft)/0.18)]">
              <AccordionTrigger className="py-5 text-left text-sm font-bold text-white hover:no-underline sm:text-base [&>svg]:text-[hsl(var(--pb-lavender))]">
                <span className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  Scoring rubric — how we pick the top 2
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6">
                <p className="pb-copy mb-5 text-sm">
                  There's no secret formula — just four dimensions we weight
                  equally-ish. Here's exactly what we look at.
                </p>
                <div className="grid">
                  {SCORING_RUBRIC.map((dim, idx) => (
                    <div
                      key={dim.label}
                      className={`py-5 ${idx > 0 ? "border-t border-[hsl(var(--pb-ink-soft)/0.18)]" : ""}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="font-serif text-lg italic text-white sm:text-xl">
                          {dim.label}
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[hsl(var(--pb-lavender))]">
                          {dim.weight}
                        </span>
                      </div>
                      <p className="pb-copy mt-2 text-xs leading-relaxed sm:text-sm">
                        {dim.description}
                      </p>
                      <div className="mt-3 border-l-2 border-[hsl(var(--pb-ink-soft)/0.18)] pl-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          </div>
        </div>
        <div className="flex justify-center lg:sticky lg:top-24 lg:justify-end">
          <TradeAccent
            src={betaNotebookIllo}
            alt="Hand-drawn illustration of an open notebook with a magnifying glass — the fine print"
          />
        </div>
      </div>
    </MarketingSection>
  );
}

function FinalCta({ isFull }: { isFull: boolean }) {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <Eyebrow>The last word</Eyebrow>
            <div className="mt-6">
              <Title level={2}>
                Get quote-ready leads, not vague messages.
              </Title>
            </div>
            <div className="mt-6 max-w-md">
              <Body size="lg">
                Stop chasing customers for missing photos and context. Every
                inquiry arrives as a complete, actionable lead packet — so your
                team can quote, schedule, or approve without a single follow-up.
              </Body>
            </div>
            <div className="mt-7">
              <CTAGroup>
                <CTA
                  variant="primary"
                  size="lg"
                  onClick={() =>
                    document
                      .getElementById("apply")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  {isFull ? "Join the waitlist" : "Apply for the beta"}
                  <ArrowRight className="h-4 w-4" />
                </CTA>
                <CTA variant="secondary" size="lg" href="/pricing">
                  See plans
                </CTA>
              </CTAGroup>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <img
              src={mailboxFlagIllo}
              alt="Hand-drawn illustration of a mailbox with the flag raised — invitation to apply"
              width={1024}
              height={1024}
              loading="lazy"
              decoding="async"
              className="w-full max-w-[320px]"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */

function BenefitList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-t border-white/12 pt-5">
      <h3 className="font-serif text-lg italic text-white sm:text-xl">
        {title}
      </h3>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-3 text-sm leading-6 text-white/76"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--pb-violet))]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
