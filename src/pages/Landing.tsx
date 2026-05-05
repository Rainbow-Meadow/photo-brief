import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Globe2,
  ImageOff,
  Link2,
  MapPinned,
  MessageSquareWarning,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Stamp,
  TimerReset,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { BrandMark } from "@/components/layout/BrandMark";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { InteractiveHeroBriefAssembly } from "@/components/marketing/InteractiveHeroBriefAssembly";
import { faqItems } from "@/features/help/content/faq";
import { trackEvent } from "@/lib/analytics";
import { signupCtaTarget, signupCtaLabel } from "@/config/access";
import wideGarage from "@/assets/junk-removal/wide-garage.jpg";
import pileCloseup from "@/assets/junk-removal/pile-closeup.jpg";
import appliances from "@/assets/junk-removal/appliances.jpg";
import drivewayAccess from "@/assets/junk-removal/driveway-access.jpg";

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
    "Mobile-first customer photo capture",
    "Simple AI photo quality checks",
    "Business-ready photo brief summaries",
    "Customer profiles and saved templates",
    "Hosted website intake forms on Pro",
    "Template routing rules and webhook integrations on Pro",
  ],
};

const sectionLinks = [
  { href: "#workflow", label: "How it works" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#beta-offer", label: "Beta offer" },
  { href: "#pricing-path", label: "Upgrade path" },
];

const loosePhotos = [
  { src: wideGarage, label: "Wide area", status: "Useful" },
  { src: pileCloseup, label: "Main pile", status: "Clear" },
  { src: appliances, label: "Appliance", status: "Flagged" },
  { src: drivewayAccess, label: "Access", status: "Ready" },
];

const workflowSteps = [
  {
    icon: Link2,
    eyebrow: "Request",
    title: "Send one guided link",
    body: "Choose a template, send the link by text or email, or copy the branded request into any customer thread.",
  },
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "Customers take the right shots",
    body: "They see one mobile prompt at a time, with plain instructions instead of a vague “send a few photos.”",
  },
  {
    icon: Route,
    eyebrow: "Check",
    title: "Obvious problems get flagged",
    body: "PhotoBrief calls out missing, unclear, or review-needed shots before your team has to sort through them.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Brief",
    title: "Your team gets a usable packet",
    body: "Photos, notes, customer context, and next-step status land together for quoting, dispatch, review, or documentation.",
  },
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
  "Manual links now, routed website intake on Pro",
];

const useCases = [
  {
    icon: BadgeCheck,
    title: "Quote-ready submissions",
    body: "Ask for the photos your estimator needs before the first call becomes a chain of follow-ups.",
    stamp: "Quote prep",
  },
  {
    icon: MapPinned,
    title: "Dispatch prep",
    body: "Collect site access, issue context, and handling notes before a team heads out.",
    stamp: "Field ready",
  },
  {
    icon: ImageOff,
    title: "Damage documentation",
    body: "Guide customers through the angles that matter so reviewers can understand the issue quickly.",
    stamp: "Evidence packet",
  },
  {
    icon: ShieldCheck,
    title: "Approvals and exceptions",
    body: "Turn customer media into a packet that can be reviewed, approved, or escalated without guessing.",
    stamp: "Decision ready",
  },
  {
    icon: Globe2,
    title: "Website lead intake",
    body: "On Pro, replace vague forms with hosted intake, branded embeds, request routing, and integrations.",
    stamp: "Pro route",
  },
];

const betaBenefits = [
  "90-day free founding beta access",
  "Concierge setup for first templates and workflows",
  "Direct feedback channel and priority product input",
  "50% off the first year after launch",
];

const betaAsks = [
  "Use PhotoBrief on 3–5 real customer workflows",
  "Share short feedback every two weeks",
  "Report confusing moments or missing workflow needs",
  "Optional testimonial or case study if it helps your team",
];

const pricingPath = [
  {
    label: "Manual start",
    title: "Send PhotoBrief links yourself",
    body: "Create a request, copy the link, and prove the workflow with real customers before changing your website.",
    bullets: ["No website changes", "Works on every plan", "Fastest path to value"],
  },
  {
    label: "Pro upgrade",
    title: "Automate intake when it earns its keep",
    body: "Keep manual links, then add hosted forms, branded embeds, template routing, and webhook-based handoffs.",
    bullets: ["Website lead capture", "Request type routing", "Existing form bridge"],
  },
];

function SectionNav() {
  return (
    <nav aria-label="Landing page sections" className="sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-night)/0.82)] backdrop-blur-xl">
      <div className="pb-container flex justify-start gap-2 overflow-x-auto py-3 sm:justify-center">
        {sectionLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => trackEvent("landing_jump_nav_click", { target: item.href })}
            className="min-w-max rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-white/62 transition hover:border-white/14 hover:bg-white/7 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<"messy" | "clean">("messy");
  const jsonLd = useMemo(
    () => [SOFTWARE_APP_JSONLD, buildHowToJsonLd("Collect customer photos with PhotoBrief", howItWorksSteps), buildFaqJsonLd(faqItems)],
    [],
  );

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
        <HeroSection onOpenDemo={() => setDemoOpen(true)} />
        <SectionNav />
        <WorkflowSection />
        <ComparisonSection mode={comparisonMode} onModeChange={setComparisonMode} />
        <UseCaseSection />
        <FoundingPartnerSection />
        <PricingPathSection />
        <FinalCta />
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

function HeroSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section className="relative isolate overflow-hidden pt-10 sm:pt-14 lg:pt-18">
      <div className="pb-lens-field" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--pb-lavender)/0.55)] to-transparent" />
      <div className="pb-container relative grid gap-10 pb-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:pb-20">
        <div className="relative z-10 max-w-3xl lg:max-w-none">
          <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta now open</span>
          <h1 className="pb-hero-title mt-5 pb-2 text-white">
            Get quote-ready customer photos.
            <span className="block pb-2 text-[hsl(var(--pb-lavender))]">Send one guided link.</span>
          </h1>
          <p className="pb-copy mt-5 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
            PhotoBrief is a one-link photo intake tool for service, repair, review, and documentation workflows. Customers follow mobile prompts, obvious issues get flagged, and your team receives a clean brief instead of a messy thread.
          </p>
          <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            <Button asChild size="xl" className="rounded-full bg-[hsl(var(--pb-violet))] px-7 text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
              <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "hero", label: "primary" })}>
                {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
            <Button asChild size="xl" variant="outline" className="rounded-full border-white/16 bg-white/[0.03] px-7 text-white hover:bg-white/10 hover:text-white">
              <a href="#workflow" onClick={() => trackEvent("cta_click", { location: "hero", label: "workflow" })}>
                See how it works
              </a>
            </Button>
            <Button size="xl" variant="ghost" className="rounded-full text-white/80 hover:bg-white/8 hover:text-white" onClick={onOpenDemo}>
              <PlayCircle className="mr-1 h-5 w-5" /> Product spotlight
            </Button>
          </div>
          <div className="mt-6 grid max-w-2xl gap-1.5 sm:mt-7 sm:grid-cols-3 sm:gap-2">
            {[
              "No app for customers",
              "Manual links first",
              "Automation on Pro",
            ].map((item) => (
              <span key={item} className="pb-route-chip px-3 py-1.5 text-center text-[0.7rem] font-semibold sm:py-2 sm:text-xs">{item}</span>
            ))}
          </div>
        </div>

        <InteractiveHeroBriefAssembly />
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="pb-section">
      <div className="pb-container">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
          <div>
            <span className="pb-eyebrow"><Route className="h-3.5 w-3.5" /> How it works</span>
            <h2 className="pb-section-title mt-5 max-w-xl text-white">From vague request to usable brief.</h2>
            <p className="pb-copy mt-5 max-w-lg text-base sm:text-lg">PhotoBrief does not just collect uploads. It guides the customer, keeps context attached, and packages the result for the next business step.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[hsl(var(--pb-lavender))] via-[hsl(var(--pb-mint))] to-transparent md:block" />
            <div className="grid gap-4">
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
    <section id="comparison" className="pb-section-tight border-y border-white/10 bg-black/18">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><MessageSquareWarning className="h-3.5 w-3.5" /> Before / after</span>
          <h2 className="pb-section-title mt-5 text-white">Your team should not have to decode a camera roll.</h2>
          <p className="pb-copy mt-5 text-lg">The value is not “more photos.” The value is getting the right photos, tied to the right job, with enough context to act.</p>
        </div>

        <div className="mx-auto mt-10 flex max-w-md rounded-full border border-white/12 bg-[hsl(var(--pb-panel)/0.72)] p-1">
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="pb-command-panel p-4 sm:p-5 md:p-6">
            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/48">{isClean ? "Structured intake" : "Scattered intake"}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${isClean ? "bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]"}`}>{isClean ? "Ready" : "Messy"}</span>
            </div>
            <div className="relative z-10 mt-5 grid gap-3">
              {signals.map((signal, index) => (
                <div key={signal} className={`flex items-center gap-3 rounded-2xl border p-3 sm:p-4 ${isClean ? "border-[hsl(var(--pb-mint)/0.24)] bg-[hsl(var(--pb-mint)/0.055)]" : "border-white/10 bg-white/[0.035]"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black sm:h-8 sm:w-8 ${isClean ? "bg-[hsl(var(--pb-mint)/0.14)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.13)] text-[hsl(var(--pb-lavender))]"}`}>{index + 1}</span>
                  <p className="text-sm font-semibold text-white/82 sm:text-base">{signal}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/12 bg-[hsl(var(--pb-panel)/0.58)] p-5">
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
    { text: "Can you send a few pics?", x: "left-4", y: "top-8", rot: "-rotate-2" },
    { text: "Is this enough?", x: "right-6", y: "top-24", rot: "rotate-3" },
    { text: "Need the other side too", x: "left-10", y: "top-44", rot: "rotate-2" },
    { text: "Which job was this for?", x: "right-10", y: "bottom-12", rot: "-rotate-3" },
  ];
  return (
    <div className="relative z-10 h-full min-h-[380px]">
      {items.map((item) => (
        <div key={item.text} className={`absolute ${item.x} ${item.y} ${item.rot} max-w-[15rem] rounded-3xl border border-white/10 bg-black/35 p-4 shadow-2xl`}>
          <p className="text-sm font-semibold text-white/74">{item.text}</p>
        </div>
      ))}
      <figure className="pb-photo-frame absolute bottom-20 left-8 w-36 -rotate-6 opacity-80">
        <img src={appliances} alt="Loose customer photo without context" className="h-28 w-full object-cover" />
      </figure>
      <figure className="pb-photo-frame absolute bottom-28 right-12 w-36 rotate-6 opacity-70">
        <img src={drivewayAccess} alt="Another loose customer photo without context" className="h-28 w-full object-cover" />
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
          <img key={photo.label} src={photo.src} alt={`${photo.label} organized in a brief`} className="h-16 rounded-xl object-cover" loading="lazy" />
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
        <div className="max-w-3xl">
          <span className="pb-eyebrow"><ClipboardList className="h-3.5 w-3.5" /> Use cases</span>
          <h2 className="pb-section-title mt-5 text-white">Useful anywhere a missing photo slows the next step.</h2>
          <p className="pb-copy mt-5 max-w-2xl text-base sm:text-lg">PhotoBrief is built for teams that need customer media before quoting, scheduling, approving, reviewing, or documenting work.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="pb-card p-4 sm:p-5 md:p-6">
                <Icon className="h-6 w-6 text-[hsl(var(--pb-lavender))] sm:h-7 sm:w-7" />
                <span className="pb-stamp mt-5 inline-flex rounded-full px-3 py-1 sm:mt-6">{item.stamp}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-white sm:mt-5 sm:text-xl">{item.title}</h3>
                <p className="pb-copy mt-2 text-sm leading-6 sm:mt-3">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FoundingPartnerSection() {
  return (
    <section id="beta-offer" className="pb-section-tight">
      <div className="pb-container">
        <div className="pb-command-panel grid gap-6 p-5 sm:gap-8 sm:p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8 xl:p-10">
          <div className="relative z-10">
            <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> Founding beta</span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:mt-5 sm:text-3xl lg:text-4xl">Built with real workflows, not toy testing.</h2>
            <p className="pb-copy mt-4 text-base sm:mt-5 sm:text-lg">We are inviting a small group of businesses to use PhotoBrief in real intake scenarios before public launch. You get hands-on setup and early influence; we get honest workflow feedback.</p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
              <Button asChild size="lg" className="rounded-full bg-[hsl(var(--pb-violet))] text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "beta_offer", label: "primary" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/16 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white">
                <NavLink to="/founding-partner-beta">Read beta details</NavLink>
              </Button>
            </div>
          </div>
          <div className="relative z-10 grid gap-4 md:grid-cols-2">
            <BetaList title="Beta partners get" items={betaBenefits} />
            <BetaList title="We ask for" items={betaAsks} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BetaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[1.4rem] border border-white/12 bg-white/[0.035] p-5">
      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      <ul className="mt-4 grid gap-3">
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

function PricingPathSection() {
  return (
    <section id="pricing-path" className="pb-section border-y border-white/10 bg-black/18">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><TimerReset className="h-3.5 w-3.5" /> Start manual. Automate later.</span>
          <h2 className="pb-section-title mt-5 text-white">Use one link first. Add automation when it pays for itself.</h2>
          <p className="pb-copy mt-5 text-lg">Start with manual PhotoBrief links. Upgrade to Pro when website leads, routed requests, and form handoffs should happen without copy/paste.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {pricingPath.map((tier) => (
            <article key={tier.label} className="pb-card p-6 sm:p-8">
              <span className="pb-eyebrow border-white/12 bg-white/[0.03]">{tier.label}</span>
              <h3 className="mt-5 text-3xl font-semibold tracking-tight text-white">{tier.title}</h3>
              <p className="pb-copy mt-3 text-base leading-7">{tier.body}</p>
              <ul className="mt-6 grid gap-3">
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

function FinalCta() {
  return (
    <section className="pb-section">
      <div className="pb-container">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-7 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))] sm:p-12">
          <div className="pb-lens-field" />
          <div className="relative z-10 mx-auto max-w-4xl">
            <BrandMark variant="horizontal" tone="light" size={48} className="justify-center" withGlow />
            <h2 className="pb-section-title mt-8 text-white">Send one link. Get a usable brief.</h2>
            <p className="pb-copy mx-auto mt-5 max-w-2xl text-lg">Give customers a clear path, give your team a clean packet, and stop turning every quote into a photo scavenger hunt.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="rounded-full bg-[hsl(var(--pb-violet))] px-8 text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "final", label: "primary" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button asChild size="xl" variant="outline" className="rounded-full border-white/16 bg-white/[0.03] px-8 text-white hover:bg-white/10 hover:text-white">
                <NavLink to="/pricing">See plans</NavLink>
              </Button>
            </div>
            <p className="mt-5 text-sm font-medium text-white/46">Customers do not need an account or app to complete a PhotoBrief request.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
