import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, Globe2, PlayCircle, Route, Sparkles, Zap } from "lucide-react";
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
    "PhotoBrief turns website inquiries and customer photo requests into complete photo-ready job briefs with hosted intake forms, routing rules, mobile capture, AI photo checks, and summaries.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "USD" },
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Team", price: "99", priceCurrency: "USD" },
    { "@type": "Offer", name: "Business", price: "199", priceCurrency: "USD" },
  ],
  featureList: [
    "Hosted website intake forms",
    "Universal website form webhook",
    "Template routing rules and AI routing fallback",
    "Mobile-first customer photo capture",
    "Simple AI photo quality checks",
    "Business-ready photo brief summaries",
    "Customer profiles and saved templates",
  ],
};

const automationCards = [
  {
    icon: Globe2,
    title: "Hosted intake link",
    body: "Put a clean PhotoBrief form behind your website's Get a quote or Request service button.",
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
  const jsonLd = useMemo(() => [SOFTWARE_APP_JSONLD, buildHowToJsonLd("Automate a website lead into a PhotoBrief request", howItWorksSteps), buildFaqJsonLd(faqItems)], []);
  return (
    <>
      <PageMeta
        title="PhotoBrief | Turn website leads into photo-ready job briefs"
        description="PhotoBrief automates small business intake: website lead capture, template routing, mobile photo requests, AI photo checks, and clean job summaries."
        canonicalPath="/"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }]}
      />

      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-ambient-future" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-4xl text-center animate-lift-in">
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-foreground/80">
              <Sparkles className="h-3 w-3 text-primary" /> The visual intake layer for small business
            </span>
            <h1 className="text-display mt-6 text-foreground">
              Turn website leads into
              <br />
              <span className="text-gradient-future">photo-ready briefs.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl">
              PhotoBrief replaces “can you send a few photos?” with an automatic flow: customer inquiry, right template, guided mobile photos, AI checks, and a clean summary your team can act on.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground/90">
              Built for service businesses, property teams, claims, warranty, returns, and anyone who needs customer photos before making a decision.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="xl" className="rounded-full">
                <NavLink to={signupCtaTarget()} onClick={() => trackEvent("cta_click", { location: "hero", label: "primary" })}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button size="xl" variant="glass" className="rounded-full" onClick={() => { trackEvent("cta_click", { location: "hero", label: "watch_product_spotlight" }); setDemoOpen(true); }}>
                <PlayCircle className="mr-1 h-5 w-5" /> Watch product spotlight
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full glass px-3 py-1">No app for customers</span>
              <span className="rounded-full glass px-3 py-1">Hosted intake or webhook</span>
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
      <HowItWorksSteps />

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-eyebrow">Website Intake</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                The button your website has always needed.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Most small-business sites collect vague contact forms, then the real work happens over email. PhotoBrief lets that first request start the actual intake workflow automatically.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Add a hosted intake link to your website.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Route each request type to a saved photo template.</li>
                <li className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> Send the customer straight into a five-minute mobile capture flow.</li>
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
            Pricing built around the photos you actually collect.
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Plans scale by monthly photos, customer branding, PhotoBrief branding, storage term, and team size.
          </p>
          <p className="mt-2 text-sm text-primary">
            First-pass follow-up photos requested by PhotoBrief do not consume credits.
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
            <DialogDescription>A professionally produced product spotlight showing Website Intake, template routing, customer capture, AI photo checks, and the finished business brief.</DialogDescription>
          </VisuallyHidden>
          <video key={demoOpen ? "open" : "closed"} src="/marketing/photobrief-demo.mp4" controls autoPlay playsInline className="h-auto w-full" />
        </DialogContent>
      </Dialog>
    </>
  );
}
