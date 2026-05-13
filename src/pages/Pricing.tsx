import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, Camera, Clock3, Globe2, HardDrive, HeartHandshake, Link2, MessageSquareText, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PricingCardGrid } from "@/components/pricing/PricingCardGrid";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { faqItems } from "@/features/help/content/faq";
import { BETA_DURATION_DAYS, MAX_DISCOUNT_LABEL } from "@/config/betaProgram";
import { PublicPhotoPair } from "@/components/marketing/PublicPhotoPair";

import { Button } from "@/components/ui/button";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, Container, SectionHeader } from "@/design-system/schema";

import pricingCedarOwnerLaptop from "@/assets/pricing/pricing-cedar-owner-laptop.png";
import pricingMultiTradeFan from "@/assets/pricing/pricing-multi-trade-fan.png";

const pricingAxes = [
  { icon: Camera, label: "Photos", copy: "Plans scale by submitted customer photos. Routes that don't need photos don't burn credits." },
  { icon: BadgeCheck, label: "Branding", copy: "Pick the customer-facing brand level — and decide whether PhotoBrief shows up at all." },
  { icon: HardDrive, label: "Storage term", copy: "Keep customer media for the window your business actually reviews against." },
  { icon: Users, label: "Team size", copy: "Add the people who triage briefs, run quotes, and close jobs." },
];

const intakeModes = [
  {
    icon: Link2,
    title: "Every plan",
    label: "Manual smart intake links",
    copy: "Spin up a smart intake from your URL, copy the link, send it however you already reach customers. The whole route engine works on day one.",
  },
  {
    icon: Globe2,
    title: "Pro and above",
    label: "Hosted intake on your website",
    copy: "Drop the badge, embed, or webhook on your live site so every CTA fires straight into the right route — no copy-paste, no manual step.",
  },
];

const betaOffer = [
  { icon: Clock3, label: `${BETA_DURATION_DAYS}-day beta access`, copy: "Run PhotoBrief on real customer leads before public launch." },
  { icon: HeartHandshake, label: "White-glove route setup", copy: "We read your site with you and ship your first routes ready to take live traffic." },
  { icon: MessageSquareText, label: "Direct line to the team", copy: "Async feedback (chat, email, in-app) goes straight onto the roadmap." },
  { icon: Sparkles, label: "Tiered post-launch rewards", copy: MAX_DISCOUNT_LABEL },
];

export default function PricingPage() {
  const businessFaqs = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const jsonLd = useMemo(() => [buildFaqJsonLd(businessFaqs)], [businessFaqs]);

  return (
    <>
      <PageMeta
        title={`Pricing | PhotoBrief Founding Partner Beta`}
        description={`Founding seats are open. ${BETA_DURATION_DAYS} days free, your routes built with you from your own website, direct line to the team, and post-launch rewards up to 75% off forever or free Pro for life.`}
        canonicalPath="/pricing"
        ogImage="/og/pricing.png"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]}
      />

      {/* Hero */}
      <Section>
        <Container>
          <div className="text-center">
            <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
              <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta Pricing</span>
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              Get your routes built. Lock in pricing nobody else gets.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              PhotoBrief is invite-only while we hand-build the first thirty workspaces. Accepted partners get {BETA_DURATION_DAYS} days free, their routes shipped from their own website, a direct line to the team, and post-launch rewards up to 75% off forever — or free Pro for life.
            </p>
            <p className="mx-auto mt-5 inline-flex items-center gap-1.5 border border-[hsl(var(--accent-sage)/0.4)] bg-[hsl(var(--accent-sage)/0.08)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[hsl(var(--accent-sage))]">
              <ShieldCheck className="h-4 w-4" /> First-pass photo retakes don't burn credits.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="xl" className="rounded-[0.25rem] uppercase tracking-[0.14em]">
                <NavLink to="/beta">
                  Apply for the beta <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
              <Button asChild size="xl" variant="outline" className="rounded-[0.25rem] border-border uppercase tracking-[0.14em]">
                <NavLink to="/demo">See the live demo</NavLink>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section size="tight">
        <Container>
          <PublicPhotoPair
            items={[
              {
                src: pricingCedarOwnerLaptop,
                alt: "Cedar & Sons owner reviewing a lead brief on a laptop with a Pro Founding badge visible.",
                caption: "A founding partner opens the brief, reads the route the customer matched, and quotes — no second email needed.",
              },
              {
                src: pricingMultiTradeFan,
                alt: "Four phones showing new-lead brief packets for tree care, HVAC, plumbing, and junk removal.",
                caption: "Four trades. Four routes. Four briefs. The same intake engine, configured to each business's site.",
              },
            ]}
          />
        </Container>
      </Section>

      {/* Beta offer cards */}
      <Section size="tight">
        <Container>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {betaOffer.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="border border-border bg-card p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
                      [ {String(i + 1).padStart(2, "0")} ]
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-5 text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.copy}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Intake modes */}
      <Section size="tight">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            {intakeModes.map((mode, i) => {
              const Icon = mode.icon;
              return (
                <article key={mode.title} className="border border-border bg-card p-6 sm:p-8">
                  <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
                    <Icon className="h-3.5 w-3.5" /> [ 0{i + 1} ] {mode.title}
                  </p>
                  <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{mode.label}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{mode.copy}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Pricing cards */}
      <Section>
        <Container width="narrow">
          <SectionHeader
            align="center"
            eyebrow="Public launch plans"
            title="Here's what every plan looks like after beta."
            description="During beta, pricing runs through the Founding Partner program. Apply now to lock in launch-year savings before public pricing kicks in."
          />
          <div className="mt-10">
            <PricingCardGrid />
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container width="narrow">
          <div className="text-center">
            <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
              <span className="text-[hsl(var(--accent-kinetic))]">[ 99 ]</span>
              <span>FAQ</span>
            </p>
            <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
              The questions everyone asks first.
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-8 border border-border bg-card px-4 sm:px-6">
            {businessFaqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-border">
                <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="relative mt-12 overflow-hidden border border-border bg-card p-8 text-center">
            <div className="absolute inset-x-0 top-0 h-px bg-[hsl(var(--accent-kinetic))]" aria-hidden />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-[hsl(var(--accent-kinetic))]" />
              <p className="text-base font-semibold text-foreground">Become a founding partner before the doors open.</p>
              <p className="max-w-md text-sm text-muted-foreground">
                We build your routes from your site, walk you through the workflow, and lock in pricing nobody else gets — in exchange for running PhotoBrief on real customer leads and telling us what's working.
              </p>
              <Button asChild size="xl" className="mt-2 rounded-[0.25rem] uppercase tracking-[0.14em]">
                <NavLink to="/beta">
                  Apply for the beta <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
