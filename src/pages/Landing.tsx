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
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { HeroGlassStory } from "@/components/marketing/HeroGlassStory";
import { TrustLogosStrip } from "@/components/marketing/TrustLogosStrip";
import { HowItWorksSteps, howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { StatsBand } from "@/components/marketing/StatsBand";
import { IndustryGrid } from "@/components/marketing/IndustryGrid";
import { TestimonialsRow } from "@/components/marketing/TestimonialsRow";
import { FinalCtaCard } from "@/components/marketing/FinalCtaCard";
import { FirstPassGuaranteeBand } from "@/components/marketing/FirstPassGuaranteeBand";
import { PricingCardGrid } from "@/components/pricing/PricingCardGrid";
import { faqItems } from "@/features/help/content/faq";
import { trackEvent } from "@/lib/analytics";
import { signupCtaTarget, signupCtaLabel } from "@/config/access";

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PhotoBrief helps small businesses collect customer photos without email back-and-forth: send clickable request links manually, or upgrade to Pro to automate website intake with hosted forms, routing, mobile capture, AI photo checks, and clean summaries.",
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

const painPoints = [
  "Vague contact forms",
  "Email threads asking for photos",
  "Blurry uploads with no context",
  "Missed details before quoting",
];

const startModes = [
  {
    icon: Link2,
    label: "Free + Starter",
    title: "Send one clickable PhotoBrief link.",
    body: "Create a request, send the link by email/text/DM, and get organized photos back without forcing customers to create an account.",
    points: ["Fastest first win", "No website changes", "Good for one-off jobs and early testing"],
  },
  {
    icon: Globe2,
    label: "Pro and above",
    title: "Turn website leads into requests automatically.",
    body: "Put Website Intake behind your site CTA or connect an existing form so new leads become routed PhotoBrief requests automatically.",
    points: ["Hosted intake form", "Template routing", "Webhook / Zapier / Make paths"],
  },
];

const proofCards = [
  {
    icon: Camera,
    title: "Customers know what to capture",
    body: "Each photo has one plain instruction, one capture action, and simple feedback if the image may not be usable.",
  },
  {
    icon: ClipboardList,
    title: "Your team gets the useful version",
    body: "Photos, answers, labels, AI checks, and a plain-English summary arrive as one organized brief.",
  },
  {
    icon: BadgeCheck,
    title: "You control the customer experience",
    body: "Starter adds your logo and messages. Pro removes PhotoBrief branding and adds automated intake.",
  },
];

const automationCards = [
  {
    icon: Globe2,
    title: "Hosted intake link",
    body: "Put a clean PhotoBrief form behind your website’s Get a quote or Request service button.",
  },
  {
    icon: Route,
    title: "Template routing",
    body: "Map request types like repair, quote, return, or roof to the exact photo template you want sent.",
  },
  {
    icon: Sparkles,
    title: "AI fallback",
    body: "If a rule does not match, PhotoBrief can choose from your configured rules only when it is confident.",
  },
];

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const jsonLd = useMemo(() => [SOFTWARE_APP_JSONLD, buildHowToJsonLd("Collect customer photos with PhotoBrief", howItWorksSteps), buildFaqJsonLd(faqItems)], []);
  return (
    <>
      <PageMeta
        title="PhotoBrief | Stop chasing customer photos"
        description="Send clickable PhotoBrief links manually, or automate website intake on Pro. Customers follow a mobile photo workflow and your business gets organized, AI-checked photo briefs."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-ambient-future" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center animate-lift-in">
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" /> Customer photo intake without the back-and-forth
            </span>
            <h1 className="text-display mt-6 text-foreground">
              Stop chasing customer photos.
              <br />
              <span className="text-gradient-future">Send one link instead.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-muted-foreground sm:text-xl">
              PhotoBrief turns “can you send a few photos?” into a guided mobile workflow. Customers take the right photos, AI flags simple issues, and your team gets a clean brief that is ready to quote, dispatch, review, or document.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground/90">
              Start free with manual PhotoBrief links. Upgrade to Pro when you want website leads and existing forms to create routed PhotoBrief requests automatically.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="xl" className="rounded-full">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "hero", label: "start_manual_link" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button size="xl" variant="glass" className="rounded-full" onClick={() => { trackEvent("cta_click", { location: "hero", label: "watch_product_spotlight" }); setDemoOpen(true); }}>
                <PlayCircle className="mr-1 h-5 w-5" /> Watch product spotlight
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full glass px-3 py-1">No app for customers</span>
              <span className="rounded-full glass px-3 py-1">Manual links on Free</span>
              <span className="rounded-full glass px-3 py-1">Website Intake on Pro</span>
              <span className="rounded-full glass px-3 py-1">Photo-credit pricing</span>
            </div>
          </div>

          <div className="mt-14 sm:mt-16 lg:mt-20">
            <HeroGlassStory />
          </div>
          <div className="h-16 sm:h-20" />
        </div>
      </section>

      <TrustLogosStrip />

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-sky opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-eyebrow">The problem</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Your intake process breaks the moment photos are needed.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Most businesses already know what they need to see. The hard part is getting customers to send the right photos with enough context, without three days of email cleanup.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {painPoints.map((pain) => (
                <div key={pain} className="glass-strong magnetic-card rounded-[1.5rem] p-4 text-sm font-medium text-foreground">
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">×</span>
                  {pain}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-65" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-eyebrow">Two ways to start</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Start simple. Automate when it is worth it.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
              The first win should not require a website project. Send one link today, then turn your website into the intake engine on Pro.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {startModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <article key={mode.title} className="glass-strong magnetic-card rounded-[2.25rem] p-6 sm:p-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Icon className="h-3.5 w-3.5" /> {mode.label}
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{mode.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">{mode.body}</p>
                  <ul className="mt-5 grid gap-2">
                    {mode.points.map((point) => (
                      <li key={point} className="flex gap-2 rounded-2xl bg-muted/45 p-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <HowItWorksSteps />

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-eyebrow">Why businesses switch</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Less chasing. Better photos. Faster decisions.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                PhotoBrief is not another generic form builder. It is a customer-facing photo workflow that makes intake clearer for the customer and more useful for the business.
              </p>
            </div>
            <div className="grid gap-4">
              {proofCards.map((card) => (
                <article key={card.title} className="glass-strong magnetic-card rounded-[1.75rem] p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <card.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.body}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-eyebrow">Pro automation</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                When your website should do more than collect a message.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Once PhotoBrief is working for manual requests, Pro lets your website start the same structured workflow automatically. One CTA can replace the contact-form-to-email-to-photo-chase routine.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Paste a hosted Website Intake link behind your main CTA.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Route each request type to a saved photo template.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Use webhooks only when you need to keep an existing form.</li>
              </ul>
            </div>
            <div className="space-y-4">
              <div className="glass-strong magnetic-card overflow-hidden rounded-[1.75rem] p-3">
                <img
                  src="/marketing/website-intake-flow.svg"
                  alt="Website lead routed into a mobile PhotoBrief request and job-ready brief"
                  loading="lazy"
                  className="w-full rounded-[1.25rem]"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {automationCards.map((card) => (
                  <article key={card.title} className="glass-strong magnetic-card rounded-[1.75rem] p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <card.icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{card.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.body}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatsBand />
      <FirstPassGuaranteeBand />
      <IndustryGrid />
      <TestimonialsRow />

      <section id="pricing" className="relative overflow-hidden border-t bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-ambient-sky opacity-70" />
        <div className="relative mx-auto max-w-3xl px-4 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Pricing that matches how businesses adopt this.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Free and Starter help you prove the manual PhotoBrief link workflow. Pro adds Website Intake automation, routing, and integrations.
          </p>
          <p className="mt-2 text-sm text-primary">
            Photo plans scale by monthly photos, branding, storage term, and team size. First-pass follow-up photos requested by PhotoBrief do not consume credits.
          </p>
        </div>
        <div className="relative px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20">
          <PricingCardGrid />
        </div>
      </section>

      <FinalCtaCard />

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
