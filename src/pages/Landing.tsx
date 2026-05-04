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
  ScanLine,
  ShieldCheck,
  Sparkles,
  Stamp,
  TimerReset,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { BrandMark } from "@/components/layout/BrandMark";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
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
    "PhotoBrief.ai helps businesses collect customer photos without email back-and-forth. Send one guided link, flag simple photo issues, and receive clean customer briefs ready for action.",
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
  { href: "#workflow", label: "Workflow" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#pricing-path", label: "Pricing path" },
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
    title: "Create one guided link",
    body: "Pick a template, send the link manually, or let Pro create it from your website intake.",
  },
  {
    icon: Camera,
    eyebrow: "Capture",
    title: "Customers follow photo prompts",
    body: "One shot at a time, on mobile, with plain instructions instead of a vague ask.",
  },
  {
    icon: ScanLine,
    eyebrow: "Check",
    title: "Simple issues get flagged",
    body: "Missing angles, blur, glare, unreadable labels, or cut-off subjects are caught before review.",
  },
  {
    icon: FileCheck2,
    eyebrow: "Brief",
    title: "Your team gets the packet",
    body: "Photos, notes, routing context, and a summary land together so the next action is obvious.",
  },
];

const messySignals = [
  "Photos buried in text threads",
  "Missing angles and unclear scale",
  "Vague customer descriptions",
  "Follow-up questions before anyone can quote",
  "Images detached from the job context",
];

const cleanSignals = [
  "Required shots requested in order",
  "AI flags obvious photo problems",
  "Notes and photos stay together",
  "Submission arrives as a clean brief",
  "Manual links now, routed website intake on Pro",
];

const useCases = [
  {
    icon: BadgeCheck,
    title: "Quote-ready customer submissions",
    body: "Ask for exactly the photos your estimator needs before the first call turns into three follow-ups.",
    stamp: "Quote prep",
  },
  {
    icon: MapPinned,
    title: "Dispatch prep",
    body: "Collect access photos, site context, issue details, and safety notes before a team heads out.",
    stamp: "Field ready",
  },
  {
    icon: ImageOff,
    title: "Damage or issue documentation",
    body: "Guide customers through the angles that matter so review teams can see the problem clearly.",
    stamp: "Evidence packet",
  },
  {
    icon: ShieldCheck,
    title: "Review and approval workflows",
    body: "Turn scattered customer media into a structured packet for approvals, exceptions, or internal review.",
    stamp: "Decision ready",
  },
  {
    icon: Globe2,
    title: "Website lead intake on Pro",
    body: "Replace vague forms with a hosted intake flow, branded badge, template routing, and automation.",
    stamp: "Pro route",
  },
];

const pricingPath = [
  {
    label: "Manual start",
    title: "Send PhotoBrief links yourself",
    body: "Create a request, copy or send the link, and prove the workflow with real customers.",
    bullets: ["No website changes", "Works on every plan", "Fastest path to value"],
  },
  {
    label: "Pro path",
    title: "Automate website intake",
    body: "Keep manual links, then add hosted forms, branded embeds, template routing, and webhook setups.",
    bullets: ["Website lead capture", "Request type routing", "Existing form bridge"],
  },
];

function SectionNav() {
  return (
    <nav aria-label="Landing page sections" className="sticky top-[4.5rem] z-30 border-y border-white/10 bg-[hsl(var(--pb-night)/0.82)] backdrop-blur-xl">
      <div className="pb-container flex justify-center gap-2 overflow-x-auto py-3">
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
        description="Stop chasing customer photos. Send one guided PhotoBrief link, help customers capture the right shots, and receive structured briefs ready to quote, dispatch, review, or document."
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
        <ProofPlaceholder />
        <PricingPathSection />
        <FinalCta />
      </main>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-5xl overflow-hidden border-0 bg-black p-0 sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>PhotoBrief product spotlight</DialogTitle>
            <DialogDescription>A product spotlight showing manual links, Website Intake, template routing, customer capture, photo checks, and the finished business brief.</DialogDescription>
          </VisuallyHidden>
          <video key={demoOpen ? "open" : "closed"} src="/marketing/photobrief-demo.mp4" controls autoPlay playsInline className="h-auto w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}

function HeroSection({ onOpenDemo }: { onOpenDemo: () => void }) {
  return (
    <section className="relative isolate overflow-hidden pt-12 sm:pt-16 lg:pt-20">
      <div className="pb-lens-field" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--pb-lavender)/0.55)] to-transparent" />
      <div className="pb-container relative grid gap-10 pb-16 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-24">
        <div className="relative z-10">
          <div className="mb-7 inline-flex max-w-full items-center gap-4 rounded-[1.4rem] border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-panel)/0.82)] px-4 py-3 shadow-[0_24px_70px_-52px_hsl(var(--pb-violet))]">
            <BrandMark variant="horizontal" tone="light" size={38} eager withGlow />
            <span className="hidden h-9 w-px bg-white/12 sm:block" />
            <p className="hidden max-w-[15rem] text-xs font-semibold leading-5 text-white/60 sm:block">One-link photo intake for teams that need the right shots before the next move.</p>
          </div>

          <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta now open</span>
          <h1 className="pb-hero-title mt-5 max-w-[10ch] pb-2 text-white sm:max-w-[12ch] lg:max-w-[9.9ch]">
            Stop chasing customer photos.
            <span className="block pb-2 text-[hsl(var(--pb-lavender))]">Send one guided link instead.</span>
          </h1>
          <p className="pb-copy mt-6 max-w-2xl text-lg leading-8 sm:text-xl">
            PhotoBrief turns “can you send a few photos?” into a guided mobile workflow. Customers capture the right shots, simple issues get flagged, and your team gets a clean brief ready to quote, dispatch, review, or document.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="xl" className="rounded-full bg-[hsl(var(--pb-violet))] px-7 text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
              <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "hero", label: "primary" })}>
                {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
            <Button asChild size="xl" variant="outline" className="rounded-full border-white/16 bg-white/[0.03] px-7 text-white hover:bg-white/10 hover:text-white">
              <NavLink to="/founding-partner-beta" onClick={() => trackEvent("cta_click", { location: "hero", label: "founding_beta" })}>
                View beta program
              </NavLink>
            </Button>
            <Button size="xl" variant="ghost" className="rounded-full text-white/80 hover:bg-white/8 hover:text-white" onClick={onOpenDemo}>
              <PlayCircle className="mr-1 h-5 w-5" /> Product spotlight
            </Button>
          </div>
          <div className="mt-7 grid max-w-2xl gap-2 sm:grid-cols-3">
            {[
              "Manual links on every plan",
              "Photo checks before review",
              "Website intake on Pro",
            ].map((item) => (
              <span key={item} className="pb-route-chip px-3 py-2 text-center text-xs font-semibold">{item}</span>
            ))}
          </div>
        </div>

        <HeroBriefAssembly />
      </div>
    </section>
  );
}

function HeroBriefAssembly() {
  return (
    <div className="pb-command-panel pb-focus-corners pb-scanlines relative min-h-[560px] p-4 sm:p-6 lg:p-7">
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="pb-eyebrow border-white/12 bg-white/[0.03]">Intake command view</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">Photos assemble into a brief.</h2>
        </div>
        <div className="hidden rounded-full border border-[hsl(var(--pb-mint)/0.5)] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--pb-mint))] sm:block">Ready</div>
      </div>

      <div className="relative z-10 mt-6 grid gap-5 lg:grid-cols-[0.78fr_1fr]">
        <div className="rounded-[1.4rem] border border-white/12 bg-black/24 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/48">Customer phone</span>
            <span className="rounded-full bg-[hsl(var(--pb-violet)/0.18)] px-2.5 py-1 text-xs font-bold text-[hsl(var(--pb-lavender))]">3 / 4</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/12 bg-[hsl(var(--pb-ink))]">
            <img src={pileCloseup} alt="Customer-submitted garage cleanup photo" className="h-56 w-full object-cover" loading="eager" />
          </div>
          <div className="mt-4 rounded-2xl border border-[hsl(var(--pb-mint)/0.35)] bg-[hsl(var(--pb-mint)/0.07)] p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-white"><ScanLine className="h-4 w-4 text-[hsl(var(--pb-mint))]" /> Main pile close-up</p>
            <p className="mt-1 text-sm text-white/58">Stand back enough to show the full amount.</p>
            <p className="mt-3 inline-flex rounded-full bg-[hsl(var(--pb-mint)/0.14)] px-2.5 py-1 text-xs font-bold text-[hsl(var(--pb-mint))]">Looks usable</p>
          </div>
        </div>

        <div className="relative">
          <div className="pb-route-line hidden lg:block" />
          <div className="grid grid-cols-2 gap-3">
            {loosePhotos.map((photo, index) => (
              <figure key={photo.label} className="pb-photo-frame relative" data-status={index === 2 ? "warn" : "ok"}>
                <img src={photo.src} alt={`${photo.label} submission example`} className="h-28 w-full object-cover sm:h-32" loading={index === 0 ? "eager" : "lazy"} />
                <figcaption className="flex items-center justify-between gap-2 bg-black/58 px-3 py-2 text-xs font-semibold text-white/78">
                  <span>{photo.label}</span>
                  <span className={index === 2 ? "text-[hsl(var(--pb-lavender))]" : "text-[hsl(var(--pb-mint))]"}>{photo.status}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="pb-brief-paper mt-4 rounded-[1.4rem] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/44">Brief packet</p>
                <h3 className="mt-1 text-xl font-black tracking-tight">Garage cleanout quote</h3>
              </div>
              <span className="pb-stamp rounded-full px-3 py-1">Quote-ready</span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-black/68 sm:grid-cols-3">
              <BriefMetric label="Shots" value="4/4" />
              <BriefMetric label="Issue" value="Appliance" />
              <BriefMetric label="Access" value="Ground" />
            </div>
            <p className="mt-4 rounded-2xl bg-black/[0.055] p-3 text-sm font-medium leading-6 text-black/72">
              Single-car garage cleanout, about half truckload. Ground-level access. Appliance handling likely needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/[0.055] p-3">
      <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-black/38">{label}</span>
      <span className="mt-1 block font-black text-black/78">{value}</span>
    </div>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="pb-section">
      <div className="pb-container">
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div>
            <span className="pb-eyebrow"><Route className="h-3.5 w-3.5" /> Product mechanism</span>
            <h2 className="pb-section-title mt-5 max-w-xl text-white">One request turns into an operational packet.</h2>
            <p className="pb-copy mt-5 max-w-lg text-lg">This is not a folder of uploads. It is a routed intake flow that gets customers to send the photos your team can actually use.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-8 hidden h-[calc(100%-4rem)] w-px bg-gradient-to-b from-[hsl(var(--pb-lavender))] via-[hsl(var(--pb-mint))] to-transparent md:block" />
            <div className="grid gap-4">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="pb-card relative grid gap-4 p-5 md:grid-cols-[4rem_1fr] md:p-6">
                    <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">0{index + 1} · {step.eyebrow}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">{step.title}</h3>
                      <p className="pb-copy mt-2 max-w-2xl text-base">{step.body}</p>
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
          <span className="pb-eyebrow"><MessageSquareWarning className="h-3.5 w-3.5" /> Old way vs PhotoBrief</span>
          <h2 className="pb-section-title mt-5 text-white">The problem is not photos. It is photo chaos.</h2>
          <p className="pb-copy mt-5 text-lg">PhotoBrief changes the shape of the conversation before your team wastes time sorting it out.</p>
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
              className={`flex-1 rounded-full px-4 py-3 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] ${mode === item.id ? "bg-[hsl(var(--pb-lavender))] text-[hsl(var(--pb-night))]" : "text-white/58 hover:text-white"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="pb-command-panel p-5 sm:p-6">
            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-white/48">{isClean ? "Structured intake" : "Scattered intake"}</p>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${isClean ? "bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]"}`}>{isClean ? "Ready" : "Messy"}</span>
            </div>
            <div className="relative z-10 mt-5 grid gap-3">
              {signals.map((signal, index) => (
                <div key={signal} className={`flex items-center gap-3 rounded-2xl border p-4 ${isClean ? "border-[hsl(var(--pb-mint)/0.24)] bg-[hsl(var(--pb-mint)/0.055)]" : "border-white/10 bg-white/[0.035]"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${isClean ? "bg-[hsl(var(--pb-mint)/0.14)] text-[hsl(var(--pb-mint))]" : "bg-[hsl(var(--pb-lavender)/0.13)] text-[hsl(var(--pb-lavender))]"}`}>{index + 1}</span>
                  <p className="font-semibold text-white/82">{signal}</p>
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
          <span className="pb-eyebrow"><ClipboardList className="h-3.5 w-3.5" /> Practical workflows</span>
          <h2 className="pb-section-title mt-5 text-white">Built for the jobs where one missing photo slows everyone down.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="pb-card p-5 lg:min-h-[22rem]">
                <Icon className="h-7 w-7 text-[hsl(var(--pb-lavender))]" />
                <span className="pb-stamp mt-6 inline-flex rounded-full px-3 py-1">{item.stamp}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{item.title}</h3>
                <p className="pb-copy mt-3 text-sm leading-6">{item.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProofPlaceholder() {
  return (
    <section className="pb-section-tight">
      <div className="pb-container">
        <div className="pb-command-panel grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
          <div className="relative z-10">
            <span className="pb-eyebrow"><Stamp className="h-3.5 w-3.5" /> Pilot evidence area</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Built for teams who are tired of photo chaos.</h2>
            <p className="pb-copy mt-5 text-lg">This section is ready for real pilot quotes, before/after examples, and workflow metrics when they are available. No fake testimonials. No invented logos.</p>
          </div>
          <div className="relative z-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: "3–5", label: "real workflows per beta partner" },
              { value: "90", label: "days of founding beta access" },
              { value: "50%", label: "off first year after launch" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-[1.4rem] border border-white/12 bg-white/[0.035] p-5">
                <p className="text-4xl font-black tracking-tight text-white">{stat.value}</p>
                <p className="pb-copy mt-2 text-sm leading-6">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingPathSection() {
  return (
    <section id="pricing-path" className="pb-section border-y border-white/10 bg-black/18">
      <div className="pb-container">
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow"><TimerReset className="h-3.5 w-3.5" /> Start manual. Automate later.</span>
          <h2 className="pb-section-title mt-5 text-white">The path is simple on purpose.</h2>
          <p className="pb-copy mt-5 text-lg">Start with one link. Upgrade when customer photo intake should happen without a team member copying anything.</p>
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
            <h2 className="pb-section-title mt-8 text-white">Send one link. Get the photos you actually needed.</h2>
            <p className="pb-copy mx-auto mt-5 max-w-2xl text-lg">Give customers a clear path, give your team a clean packet, and stop turning every quote into a photo scavenger hunt.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="rounded-full bg-[hsl(var(--pb-violet))] px-8 text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "final", label: "primary" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button asChild size="xl" variant="outline" className="rounded-full border-white/16 bg-white/[0.03] px-8 text-white hover:bg-white/10 hover:text-white">
                <NavLink to="/pricing">See the upgrade path</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
