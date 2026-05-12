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
import { SlideStack, RawSlide } from "@/components/marketing/SlideStack";

import pricingCedarOwnerLaptop from "@/assets/pricing/pricing-cedar-owner-laptop.png";
import pricingMultiTradeFan from "@/assets/pricing/pricing-multi-trade-fan.png";

const pricingAxes = [
  { icon: Camera, label: "Photos", copy: "Plans scale by submitted customer photos. Simple jobs stay simple; bigger jobs use more photos." },
  { icon: BadgeCheck, label: "Branding", copy: "Choose your customer-facing brand level and whether PhotoBrief branding appears." },
  { icon: HardDrive, label: "Storage term", copy: "Keep customer media for the window that matches how your business reviews work." },
  { icon: Users, label: "Team size", copy: "Add the people who need to review, assign, and manage finished briefs." },
];

const intakeModes = [
  {
    icon: Link2,
    title: "Every plan",
    label: "Manual PhotoBrief links",
    copy: "Create a request, copy or send the clickable PhotoBrief link, and let the customer complete the mobile photo workflow.",
  },
  {
    icon: Globe2,
    title: "Pro and above",
    label: "Website Intake automation",
    copy: "Keep manual links, then add hosted intake, routing, and webhook automation for leads that should not wait on a copy-paste step.",
  },
];

const betaOffer = [
  { icon: Clock3, label: `${BETA_DURATION_DAYS}-day beta access`, copy: "Use PhotoBrief in real customer workflows before public launch." },
  { icon: HeartHandshake, label: "Concierge setup", copy: "Get help building first templates, briefs, and team process." },
  { icon: MessageSquareText, label: "Direct influence", copy: "Your feedback helps shape what gets built next." },
  { icon: Sparkles, label: "Tiered post-launch rewards", copy: MAX_DISCOUNT_LABEL },
];

export default function PricingPage() {
  const businessFaqs = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const jsonLd = useMemo(() => [buildFaqJsonLd(businessFaqs)], [businessFaqs]);

  return (
    <>
      <PageMeta
        title={`Pricing | PhotoBrief.ai Founding Partner Beta`}
        description={`PhotoBrief.ai is accepting founding beta partners. Apply for ${BETA_DURATION_DAYS}-day beta access, concierge setup, direct support, and tiered post-launch rewards — up to 75% off or free Pro for life.`}
        canonicalPath="/pricing"
        ogImage="/og/pricing.png"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]}
      />

      <SlideStack>
        {/* Hero */}
        <RawSlide anchor="hero" label="Hero">
          <Section>
            <Container>
              <div className="text-center">
                <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
                  <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
                  <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta Pricing</span>
                </p>
                <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
                  Apply now. Lock in launch-year savings if accepted.
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  PhotoBrief.ai is invite-only while we onboard founding partners. Accepted beta businesses get {BETA_DURATION_DAYS} days free, concierge setup, direct support, and tiered post-launch rewards — up to 75% off or free Pro for life.
                </p>
                <p className="mx-auto mt-5 inline-flex items-center gap-1.5 border border-[hsl(var(--accent-sage)/0.4)] bg-[hsl(var(--accent-sage)/0.08)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[hsl(var(--accent-sage))]">
                  <ShieldCheck className="h-4 w-4" /> First-pass follow-up photos do not consume credits.
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
        </RawSlide>

        <RawSlide anchor="trades" label="Trades" tone="alt">
          <Section size="tight">
            <Container>
              <PublicPhotoPair
                items={[
                  {
                    src: pricingCedarOwnerLaptop,
                    alt: "Cedar & Sons owner reviewing a lead brief on a laptop with a Pro Founding badge visible.",
                    caption: "A founding partner sees the full packet before anyone has to ask for a second photo.",
                  },
                  {
                    src: pricingMultiTradeFan,
                    alt: "Four phones showing new-lead brief packets for tree care, HVAC, plumbing, and junk removal.",
                    caption: "The same workflow scales across trades — from tree care to plumbing, HVAC, and junk removal.",
                  },
                ]}
              />
            </Container>
          </Section>
        </RawSlide>

        {/* Beta offer cards */}
        <RawSlide anchor="offer" label="Offer">
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
        </RawSlide>

        {/* Intake modes */}
        <RawSlide anchor="intake" label="Intake" tone="alt">
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
        </RawSlide>

        {/* Pricing cards */}
        <RawSlide anchor="plans" label="Plans">
          <Section>
            <Container width="narrow">
              <SectionHeader
                align="center"
                eyebrow="Public launch plans"
                title="These are the planned tiers after beta."
                description="During beta, pricing is handled through the Founding Partner program. Apply now if you want early access and launch-year savings."
              />
              <div className="mt-10">
                <PricingCardGrid />
              </div>
            </Container>
          </Section>
        </RawSlide>

        {/* FAQ */}
        <RawSlide anchor="faq" label="FAQ" tone="alt">
          <Section>
            <Container width="narrow">
              <div className="text-center">
                <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
                  <span className="text-[hsl(var(--accent-kinetic))]">[ 99 ]</span>
                  <span>FAQ</span>
                </p>
                <h2 className="mt-5 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
                  Questions, answered.
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
                  <p className="text-base font-semibold text-foreground">Become a founding partner before public launch.</p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Get early access, hands-on setup, feature influence, and first-year savings in exchange for using PhotoBrief in real workflows and sharing honest feedback.
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
        </RawSlide>
      </SlideStack>
    </>
  );
}
