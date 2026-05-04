import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Globe2,
  Link2,
  PlayCircle,
  Route,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { BrandMark } from "@/components/layout/BrandMark";
import { HeroGlassStory } from "@/components/marketing/HeroGlassStory";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { faqItems } from "@/features/help/content/faq";
import { trackEvent } from "@/lib/analytics";
import { signupCtaTarget, signupCtaLabel } from "@/config/access";

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PhotoBrief.ai helps businesses collect customer photos without email back-and-forth. Founding beta partners get early access, concierge setup, direct support, and 50% off their first year after launch.",
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
  { href: "#start", label: "Apply" },
  { href: "#flow", label: "Flow" },
  { href: "#automation", label: "Automate" },
  { href: "#pricing", label: "Beta offer" },
];

const pathCards = [
  {
    href: signupCtaTarget(),
    icon: Sparkles,
    label: "Founding beta",
    title: "Apply as a founding partner.",
    body: "Get 90 days of free beta access, concierge setup, direct support, and a chance to shape PhotoBrief before public launch.",
    points: ["Limited beta spots", "Hands-on setup", "50% off first year after launch"],
    cta: signupCtaLabel(),
    eventLabel: "founding_partner_path",
  },
  {
    href: "#automation",
    icon: Globe2,
    label: "Pro and above",
    title: "Keep manual links. Unlock the true magic too.",
    body: "Pro and higher plans still include manual PhotoBrief links for one-off jobs, VIP customers, and quick follow-ups. They also unlock Website Intake, routing, and automation for leads that should not wait on a copy-paste step.",
    points: ["Manual links still included", "Hosted intake form", "Template routing + automation"],
    cta: "See automation",
    eventLabel: "automation_path",
  },
];

const outcomeCards = [
  {
    icon: Camera,
    title: "Customers capture the right shots",
    body: "One plain instruction at a time, on mobile, with simple feedback before submit.",
  },
  {
    icon: ClipboardList,
    title: "Your team gets one clean brief",
    body: "Photos, answers, labels, quality checks, and summary are grouped for action.",
  },
  {
    icon: BadgeCheck,
    title: "You keep control of the experience",
    body: "Templates, branding, messages, and routing keep intake consistent as you scale.",
  },
];

const automationSteps = [
  {
    icon: Link2,
    title: "Use manual links anytime",
    body: "Pro does not replace the simple send-a-link workflow. It keeps it available for human-triggered requests.",
  },
  {
    icon: Globe2,
    title: "Replace the vague form CTA",
    body: "Put a hosted PhotoBrief intake link behind Get a quote, Request service, or Start a return.",
  },
  {
    icon: Route,
    title: "Route by request type",
    body: "Map common jobs to the right template so every lead receives the right photo request automatically.",
  },
  {
    icon: Sparkles,
    title: "Use AI only where it helps",
    body: "AI checks photos and can assist routing inside your configured rules, without making the page feel magic-for-magic's-sake.",
  },
];

const pricingTiers = [
  {
    name: "90 days",
    price: "Free",
    summary: "Use PhotoBrief in real workflows during the founding beta.",
  },
  {
    name: "Setup",
    price: "Concierge",
    summary: "Get help building first briefs, templates, and team process.",
  },
  {
    name: "After launch",
    price: "50% off",
    summary: "Accepted partners get half off their first year after launch.",
  },
];

function CompactSectionNav() {
  return (
    <nav
      aria-label="Landing page sections"
      className="sticky top-[4.5rem] z-30 border-y border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
    >
      <div className="mx-auto flex max-w-5xl justify-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
        {sectionLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => trackEvent("landing_jump_nav_click", { target: item.href })}
            className="min-w-max rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function HeroBrandFeature() {
  return (
    <div className="mb-5 flex justify-center lg:justify-start">
      <div className="relative w-full max-w-[31rem] overflow-hidden rounded-[1.5rem] border border-primary/20 bg-card/75 p-3 shadow-glow backdrop-blur-xl sm:p-4 lg:max-w-[34rem]">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary/14 via-transparent to-accent/10" />
        <div aria-hidden className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(12rem,0.78fr)] sm:items-center">
          <BrandMark variant="horizontal" tone="auto" size={36} eager withGlow />
          <p className="border-t border-border/80 pt-3 text-center text-[11px] font-medium leading-5 text-muted-foreground sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0 sm:text-left">
            The guided photo request layer for quotes, reviews, dispatch, returns, and service intake.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const jsonLd = useMemo(
    () => [SOFTWARE_APP_JSONLD, buildHowToJsonLd("Collect customer photos with PhotoBrief", howItWorksSteps), buildFaqJsonLd(faqItems)],
    [],
  );

  return (
    <>
      <PageMeta
        title="PhotoBrief.ai | Founding Partner Beta"
        description="Apply for the PhotoBrief.ai Founding Partner Beta. Get early access, hands-on setup, direct support, and a better way to collect customer photos."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <section className="relative overflow-hidden" id="overview">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-ambient-future" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 -z-10 opacity-60" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:px-8 lg:pb-16 lg:pt-14 xl:gap-10">
          <div className="max-w-2xl animate-lift-in text-center lg:text-left">
            <HeroBrandFeature />
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" /> Founding Partner Beta now open
            </span>
            <h1 className="mt-5 max-w-[12.5ch] text-[clamp(3.35rem,4.9vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-foreground sm:max-w-[13ch] lg:max-w-[12.25ch]">
              Stop chasing customer photos.
              <br />
              <span className="text-gradient-future">Become a founding partner.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg lg:max-w-xl">
              PhotoBrief turns “can you send a few photos?” into a short mobile workflow. Founding partners get early access, concierge setup, direct support, and the chance to shape the product before public launch.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button asChild size="lg" className="rounded-full sm:h-12 sm:px-6">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "hero", label: "apply_founding_partner" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button asChild size="lg" variant="glass" className="rounded-full sm:h-12 sm:px-6">
                <NavLink to="/founding-partner-beta" onClick={() => trackEvent("cta_click", { location: "hero", label: "view_beta_program" })}>
                  View beta program
                </NavLink>
              </Button>
              <Button
                size="lg"
                variant="glass"
                className="rounded-full sm:h-12 sm:px-6"
                onClick={() => {
                  trackEvent("cta_click", { location: "hero", label: "watch_product_spotlight" });
                  setDemoOpen(true);
                }}
              >
                <PlayCircle className="mr-1 h-5 w-5" /> Product spotlight
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
              <span className="rounded-full glass px-3 py-1">90-day free beta</span>
              <span className="rounded-full glass px-3 py-1">Concierge setup</span>
              <span className="rounded-full glass px-3 py-1">50% off first year</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[640px] lg:pl-0 xl:max-w-[720px]">
            <HeroGlassStory density="hero" />
          </div>
        </div>
      </section>

      <CompactSectionNav />

      <section id="start" className="relative overflow-hidden bg-background scroll-mt-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-sky opacity-55" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-eyebrow">Pick the next action</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Join as a partner. Use it in real work.
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              The founding beta is for businesses willing to use PhotoBrief in real workflows and share honest feedback along the way.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {pathCards.map((card) => {
              const Icon = card.icon;
              const isAnchor = card.href.startsWith("#");
              const content = (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Icon className="h-3.5 w-3.5" /> {card.label}
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{card.body}</p>
                  <ul className="mt-5 grid gap-2">
                    {card.points.map((point) => (
                      <li key={point} className="flex gap-2 rounded-2xl bg-muted/45 p-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {point}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
                    {card.cta} <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </>
              );

              const className = "group glass-strong magnetic-card block rounded-[2rem] p-6 text-left transition hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8";

              return isAnchor ? (
                <a key={card.title} href={card.href} className={className} onClick={() => trackEvent("landing_path_click", { label: card.eventLabel })}>
                  {content}
                </a>
              ) : (
                <NavLink key={card.title} to={card.href} className={className} onClick={() => trackEvent("landing_path_click", { label: card.eventLabel })}>
                  {content}
                </NavLink>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flow" className="relative overflow-hidden bg-background scroll-mt-28">
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-45" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-eyebrow">The workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Four steps, then the page moves on.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                This is the whole product motion: request, guide, capture, brief. Everything else supports one of those steps.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {howItWorksSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="glass-strong magnetic-card rounded-[1.75rem] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-eyebrow tabular-nums">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {outcomeCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.title} className="rounded-[1.5rem] border bg-card/55 p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-semibold text-foreground">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{card.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="automation" className="relative overflow-hidden bg-background scroll-mt-28">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-eyebrow">Pro automation</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Pro adds the magic. Manual links stay.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
              Pro and higher plans do not force every request through automation. Your team can still create and send manual PhotoBrief links whenever that is the right move. The unlock is that your website, forms, and routing rules can now create the same guided request automatically.
            </p>
            <Button asChild size="lg" className="mt-7 rounded-full">
              <NavLink to="/pricing" onClick={() => trackEvent("cta_click", { location: "automation", label: "view_pro_pricing" })}>
                Compare Pro plans <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
          </div>

          <div className="space-y-4">
            <div className="glass-strong overflow-hidden rounded-[1.75rem] p-3">
              <img
                src="/marketing/website-intake-flow.svg"
                alt="Website lead routed into a mobile PhotoBrief request and job-ready brief"
                loading="lazy"
                className="w-full rounded-[1.25rem]"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {automationSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="glass-strong magnetic-card rounded-[1.5rem] p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.body}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative overflow-hidden border-t bg-background scroll-mt-28">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-ambient-sky opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-eyebrow">Beta offer</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Exclusive enough to be worth your time. Sustainable enough to keep.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Accepted founding partners get 90 days free, concierge setup, biweekly feedback check-ins, and 50% off their first year after launch.
              </p>
              <Button asChild size="lg" className="mt-7 rounded-full">
                <NavLink to="/founding-partner-beta" onClick={() => trackEvent("cta_click", { location: "pricing_snapshot", label: "view_beta_program" })}>
                  View full beta program <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <article key={tier.name} className="glass-strong magnetic-card rounded-[1.75rem] p-5">
                  <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{tier.price}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{tier.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-[2rem] border bg-card/70 p-6 text-center shadow-sm sm:p-8">
            <p className="text-eyebrow">Ready action</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">Apply now. Help shape what gets built next.</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              We’re looking for businesses willing to use PhotoBrief on real projects and share honest feedback along the way.
            </p>
            <Button asChild size="xl" className="mt-6 rounded-full">
              <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "final", label: "apply_founding_partner" })}>
                {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="max-w-5xl overflow-hidden border-0 bg-black p-0 sm:rounded-2xl">
          <VisuallyHidden>
            <DialogTitle>PhotoBrief product spotlight</DialogTitle>
            <DialogDescription>A professionally produced product spotlight showing manual links, Website Intake, template routing, customer capture, AI photo checks, and the finished business brief.</DialogDescription>
          </VisuallyHidden>
          <video key={demoOpen ? "open" : "closed"} src="/marketing/photobrief-demo.mp4" controls autoPlay playsInline className="h-auto w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}
