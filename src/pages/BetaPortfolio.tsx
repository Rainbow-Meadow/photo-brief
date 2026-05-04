import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Globe2,
  HeartHandshake,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  MessageSquareText,
  MousePointerClick,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { HeroGlassStory } from "@/components/marketing/HeroGlassStory";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { signupCtaTarget } from "@/config/access";
import { trackEvent } from "@/lib/analytics";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PhotoBrief.ai helps businesses replace photo-chasing email threads with guided customer photo requests, AI quality checks, and organized business-ready briefs.",
  url: "https://photobrief.ai/beta-portfolio",
};

const launchFacts = [
  { label: "Product", value: "Guided customer photo intake" },
  { label: "Audience", value: "Service, quote, review, return, and field teams" },
  { label: "Primary wedge", value: "One link replaces the photo chase" },
  { label: "Beta offer", value: "Exclusive founding partner program" },
];

const coreSurfaces = [
  {
    icon: Link2,
    eyebrow: "Manual request",
    title: "Create one guided photo link",
    body: "A team member chooses a template, sends a public link, and avoids the loose email/text thread.",
  },
  {
    icon: Camera,
    eyebrow: "Customer capture",
    title: "Mobile-first photo workflow",
    body: "Customers get one clear photo prompt at a time, with simple context questions and upload guidance.",
  },
  {
    icon: ClipboardList,
    eyebrow: "Review brief",
    title: "Photos, answers, and AI checks in one place",
    body: "The business gets a structured brief that is ready for quoting, dispatch, documentation, or follow-up.",
  },
  {
    icon: Globe2,
    eyebrow: "Website Intake",
    title: "Pro automation for site leads",
    body: "Pro and above keep manual links, then add hosted intake, routing, and webhook automation on top.",
  },
];

const betaBenefits = [
  {
    icon: Clock3,
    title: "90 days of free beta access",
    body: "Enough time to use PhotoBrief in actual business workflows instead of poking around once and forgetting.",
  },
  {
    icon: HeartHandshake,
    title: "Concierge onboarding and setup",
    body: "Hands-on help creating first briefs, templates, workflows, and team process so adoption does not stall.",
  },
  {
    icon: MessageSquareText,
    title: "Priority support and direct channel",
    body: "Beta partners get a human support path for questions, confusing moments, workflow fit, and setup help.",
  },
  {
    icon: Sparkles,
    title: "Priority feature influence",
    body: "Your feedback helps decide what gets built, refined, and prioritized before public launch.",
  },
  {
    icon: BadgeCheck,
    title: "50% off the first year after launch",
    body: "Founding partners get launch-year savings without creating a forever discount that hurts the business later.",
  },
  {
    icon: Star,
    title: "Optional Founding Partner recognition",
    body: "Businesses that want visibility can be listed, spotlighted, or recognized as early adopters.",
  },
  {
    icon: WandSparkles,
    title: "Early access to future tools",
    body: "Partner teams see new capture, routing, AI, and review features before the public rollout.",
  },
];

const partnerCommitments = [
  "Use PhotoBrief on at least 3–5 real projects, jobs, or workflows during the beta.",
  "Share brief feedback every two weeks.",
  "Report bugs, confusing moments, or missing workflow details.",
  "Allow anonymized quotes, learnings, or results to guide marketing.",
  "Optionally provide a testimonial or case study if PhotoBrief creates value.",
];

const positioningPairs = [
  { avoid: "We’re looking for testers.", say: "We’re inviting a small group of businesses to become founding beta partners." },
  { avoid: "The product is still early.", say: "You’ll get early access and direct input before public launch." },
  { avoid: "Please give feedback.", say: "Your workflow will help shape what we build next." },
];

const launchAssets = [
  {
    label: "One-liner",
    body: "PhotoBrief.ai turns customer photo requests into guided mobile workflows, AI-checked submissions, and business-ready briefs.",
  },
  {
    label: "Short pitch",
    body: "Stop chasing customer photos. Send one guided link, or automate Website Intake on Pro, and get the images, answers, checks, and summary your team needs to act faster.",
  },
  {
    label: "BetaList angle",
    body: "A practical AI workflow tool for businesses that need better photos before quoting, dispatching, approving, returning, or documenting work.",
  },
  {
    label: "Founding Partner copy",
    body: "PhotoBrief is opening a limited beta for businesses that want a better way to collect and manage photo-based project briefs. Founding partners get early access, hands-on setup, direct support, feature input, and exclusive first-year pricing after launch.",
  },
];

const workflowStats = [
  { value: "90", label: "free beta days" },
  { value: "50%", label: "off first year" },
  { value: "3–5", label: "real workflows requested" },
];

export default function BetaPortfolioPage() {
  const breadcrumbs = useMemo(() => [{ name: "Beta Portfolio", path: "/beta-portfolio" }], []);

  return (
    <>
      <PageMeta
        title="PhotoBrief.ai Founding Partner Beta | Product Portfolio"
        description="A polished product portfolio and founding partner beta offer for PhotoBrief.ai, designed for BetaList, launch directories, and early customer review."
        canonicalPath="/beta-portfolio"
        jsonLd={[jsonLd]}
        breadcrumbs={breadcrumbs}
      />

      <main className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[780px] bg-ambient-future" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-45" />

        <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="animate-lift-in">
              <div className="mb-7 inline-flex max-w-full rounded-[2rem] border border-primary/20 bg-card/78 p-4 shadow-glow backdrop-blur-xl sm:p-5">
                <BrandMark variant="horizontal" tone="auto" size={58} eager withGlow />
              </div>
              <p className="text-eyebrow">Founding Partner Beta</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Become a PhotoBrief.ai founding partner.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl">
                PhotoBrief is opening a limited beta for businesses that want a better way to collect, organize, and act on photo-based project briefs. Founding partners get early access, hands-on setup, direct support, and the chance to shape the product before public launch.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="xl" className="rounded-full">
                  <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "beta_portfolio_hero", label: "apply_beta" })}>
                    Apply to join the beta <ArrowRight className="ml-1 h-4 w-4" />
                  </NavLink>
                </Button>
                <Button asChild size="xl" variant="glass" className="rounded-full">
                  <a href="#portfolio" onClick={() => trackEvent("cta_click", { location: "beta_portfolio_hero", label: "view_surfaces" })}>
                    View product portfolio
                  </a>
                </Button>
              </div>
            </div>

            <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-5 shadow-glass-lg sm:p-6">
              <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-12 bg-white/35 blur-xl" />
              <div className="relative grid gap-4 sm:grid-cols-2">
                {launchFacts.map((fact) => (
                  <div key={fact.label} className="rounded-[1.5rem] border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{fact.label}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-foreground">{fact.value}</p>
                  </div>
                ))}
              </div>
              <div className="relative mt-5 rounded-[2rem] bg-primary/10 p-5 ring-1 ring-primary/20">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" /> The positioning
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Access, influence, savings, and hands-on help.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This is not “please test my unfinished thing.” It is a limited founding partner program for businesses willing to use PhotoBrief in real workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="portfolio" className="relative border-y bg-background/82 py-14 backdrop-blur-sm sm:py-18">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-eyebrow">Product portfolio</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">One workflow, all core surfaces.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                These visuals are the reusable launch story: manual request, customer capture, business review, and Pro automation.
              </p>
            </div>
            <div className="mt-10">
              <HeroGlassStory />
            </div>
          </div>
        </section>

        <section className="relative py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {coreSurfaces.map((surface) => {
                const Icon = surface.icon;
                return (
                  <article key={surface.title} className="glass-strong magnetic-card rounded-[2rem] p-5">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{surface.eyebrow}</p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">{surface.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{surface.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-background py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-sky opacity-60" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-8">
            <div>
              <p className="text-eyebrow">Core surface gallery</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Show reviewers the actual product motion, not just a claim.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                BetaList-style submissions need quick proof that the product has depth. This page packages the capture flow, workspace tools, AI review layer, and website automation into one curated product narrative.
              </p>
            </div>
            <SurfaceGallery />
          </div>
        </section>

        <section className="relative border-y bg-muted/25 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-eyebrow">Founding Partner Beta Offer</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Exclusive, useful, and sustainable.</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                  Join the PhotoBrief beta and get white-glove access to a faster way to collect, organize, and act on photo briefs — before public launch.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {workflowStats.map((stat) => (
                    <div key={stat.label} className="rounded-[1.5rem] border bg-card/70 p-4 text-center">
                      <p className="text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 rounded-[1.5rem] border border-primary/20 bg-primary/5 p-4 text-sm leading-6 text-primary">
                  Recommended structure: 90-day free beta, concierge setup, biweekly feedback check-ins, 50% off first year after launch, founder pricing locked for 12 months, and optional public Founding Partner mention.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {betaBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <article key={benefit.title} className="rounded-[1.75rem] border bg-card/80 p-5 shadow-sm">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="mt-4 text-base font-semibold text-foreground">{benefit.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.body}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
              <p className="text-eyebrow">What partners give back</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">Clear expectations keep the beta serious.</h2>
              <ul className="mt-6 space-y-3">
                {partnerCommitments.map((item) => (
                  <li key={item} className="flex gap-3 rounded-2xl bg-background/70 p-3 text-sm leading-6 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
              <p className="text-eyebrow">Positioning rules</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">Sound like access, not apology.</h2>
              <div className="mt-6 space-y-4">
                {positioningPairs.map((pair) => (
                  <div key={pair.avoid} className="rounded-2xl border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Do not say</p>
                    <p className="mt-1 text-sm text-muted-foreground">“{pair.avoid}”</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-success">Say</p>
                    <p className="mt-1 text-sm font-medium text-foreground">“{pair.say}”</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-background py-14 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-60" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-eyebrow">Submission copy bank</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Copy that can move from this page into launch forms.</h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                The goal is one consistent story across BetaList, startup directories, social posts, and early partner outreach.
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {launchAssets.map((asset) => (
                <article key={asset.label} className="glass-strong rounded-[2rem] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{asset.label}</p>
                  <p className="mt-4 text-base leading-7 text-foreground">{asset.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border bg-card/80 p-8 text-center shadow-glass-lg sm:p-12">
            <BrandMark variant="horizontal" tone="auto" size={52} className="justify-center" withGlow />
            <p className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Limited spots available.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              We’re inviting businesses willing to use PhotoBrief in real workflows and share honest feedback along the way.
            </p>
            <Button asChild size="xl" className="mt-8 rounded-full">
              <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "beta_portfolio_final", label: "apply_beta" })}>
                Apply to join the beta <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}

function SurfaceGallery() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <SurfaceMockup
        icon={MousePointerClick}
        label="Request builder"
        title="Send a brief link"
        rows={["Template: Property quote", "Recipient: New lead", "Needed: 5 photos + notes"]}
      />
      <SurfaceMockup
        icon={Camera}
        label="Customer capture"
        title="One shot at a time"
        rows={["Step 2 of 5", "Prompt: show the damage", "AI check: usable photo"]}
      />
      <SurfaceMockup
        icon={LayoutDashboard}
        label="Workspace inbox"
        title="Know what needs action"
        rows={["Ready to quote: 12", "Needs retake: 3", "Waiting on customer: 8"]}
      />
      <SurfaceMockup
        icon={FileText}
        label="Submission review"
        title="Brief, photos, answers"
        rows={["Summary generated", "Missing shots flagged", "Export / approve / request retake"]}
      />
      <SurfaceMockup
        icon={Globe2}
        label="Website Intake"
        title="Automated lead routing"
        rows={["CTA: Get a quote", "Route: Roof repair", "Template: 6-shot inspection"]}
      />
      <SurfaceMockup
        icon={LockKeyhole}
        label="Plan gates"
        title="Manual links plus Pro magic"
        rows={["Manual links: every plan", "Website Intake: Pro+", "Team workflows: Team+"]}
      />
    </div>
  );
}

function SurfaceMockup({
  icon: Icon,
  label,
  title,
  rows,
}: {
  icon: typeof Link2;
  label: string;
  title: string;
  rows: string[];
}) {
  return (
    <article className="glass-strong magnetic-card overflow-hidden rounded-[2rem] p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">Portfolio asset</span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{label}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
      <div className="mt-5 space-y-2">
        {rows.map((row) => (
          <div key={row} className="rounded-2xl bg-background/70 px-4 py-3 text-sm text-muted-foreground ring-1 ring-border/60">
            {row}
          </div>
        ))}
      </div>
    </article>
  );
}
