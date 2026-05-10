import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, ImageOff, MessageSquareWarning, TimerReset, PlayCircle, Rocket, Tags } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";

import { BrandMark } from "@/components/layout/BrandMark";
import { Section, Container, Card, Body, CTA, CTAGroup } from "@/pages/landing/schema";
import { MarqueeRow } from "@/components/motion/MarqueeRow";
import { RiseIn } from "@/components/motion/RiseIn";
import { MagneticCTA } from "@/components/motion/MagneticCTA";

import { faqItems } from "@/features/help/content/faq";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { trackEvent } from "@/lib/analytics";
import { BETA_DURATION_DAYS, BETA_TOTAL_PARTNERS } from "@/config/betaProgram";
import { useBetaSeats } from "@/hooks/useBetaSeats";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { SectionIntro } from "@/components/marketing/SectionIntro";
import { MechanismGrid } from "@/components/marketing/MechanismGrid";

import heroIllustration from "@/assets/hero-new.png";
import beforeIntakeFormIllo from "@/assets/comparison/before-intake-form.png";
import afterCapturePipelineIllo from "@/assets/comparison/after-capture-pipeline.png";

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Your contact form is leaking money. PhotoBrief's Reverse-Form Method™ tells customers exactly what to send — and a quote-ready lead packet lands in your inbox on the first try.",
};

export default function LandingPage() {
  const { isFull } = useBetaSeats();

  const heroJsonLd = buildHowToJsonLd(
    "How PhotoBrief works",
    howItWorksSteps.map((s) => ({ title: s.title, body: s.body })),
  );
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <>
      <PageMeta
        title="PhotoBrief — Guide. Capture. Close."
        description="Stop chasing customers for the right photo. PhotoBrief's Reverse-Form Method™ delivers a quote-ready lead packet on the first try."
        canonicalPath="/"
        jsonLd={[SOFTWARE_APP_JSONLD, heroJsonLd, faqJsonLd]}
      />

      <Hero />
      <MarqueeBand />
      <MechanismSection />
      <ComparisonSection />
      <SignpostSection />
      <FaqSection />
      <FinalCta isFull={isFull} />
    </>
  );
}

/* ── Hero ── */
function Hero() {
  return (
    <Section>
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="ls-eyebrow">[ 01 ] The Reverse-Form Method™</p>
            <RiseIn delay={0.05}>
              <h1 className="ls-h1 ls-display-stack mt-6">
                <span className="block">Guide.</span>
                <span className="block">Capture.</span>
                <span className="block">
                  Close<span className="ls-accent-dot">.</span>
                </span>
              </h1>
            </RiseIn>
            <RiseIn delay={0.25}>
              <p className="ls-subtitle mt-8 max-w-[44ch]">
                Your contact form is leaking money. The Reverse-Form Method™ patches it — <em>you</em> tell customers exactly what to send, and a quote-ready packet lands in your inbox on the first try.
              </p>
            </RiseIn>
            <RiseIn delay={0.35}>
              <CTAGroup>
                <MagneticCTA
                  href="/demo"
                  className="ls-cta ls-cta--lg ls-cta-primary mt-10"
                  onClick={() => trackEvent("landing_hero_cta_demo")}
                >
                  Try the live demo <ArrowRight className="h-4 w-4" />
                </MagneticCTA>
                <NavLink to="/beta" className="ls-cta ls-cta--lg ls-cta-quiet mt-10">
                  Apply for the beta →
                </NavLink>
              </CTAGroup>
            </RiseIn>
          </div>

          <RiseIn delay={0.4} className="relative">
            <div className="relative aspect-[3/2] w-full overflow-hidden border border-border bg-[hsl(var(--pb-paper))]">
              <img
                src={heroIllustration}
                alt="Customer capturing the photos a contractor actually needs."
                className="h-full w-full object-contain"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-[10px] uppercase tracking-[0.2em] text-foreground/80 mix-blend-difference">
                <span className="font-mono">Fig. 01</span>
                <span className="font-mono">Reverse-Form Method™</span>
              </div>
            </div>
            <BrandMark variant="horizontal" tone="dark" size={28} className="mt-6 justify-center opacity-80" />
          </RiseIn>
        </div>
      </Container>
    </Section>
  );
}

/* ── Marquee ── */
function MarqueeBand() {
  return (
    <div className="relative space-y-3 border-y border-border bg-card py-8">
      <MarqueeRow duration={45} direction="left">
        <span className="ls-marquee-item">Guide</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">Capture</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">Close</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item ls-marquee-item--accent">photo·brief</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
      </MarqueeRow>
      <MarqueeRow duration={60} direction="right">
        <span className="ls-marquee-item">81% bail before they hit submit</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">78% buy from whoever responds first</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">4.2 hr avg lead response time</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item ls-marquee-item--accent">Reverse-Form Method™</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
      </MarqueeRow>
    </div>
  );
}

/* ── Mechanism teaser ── */
function MechanismSection() {
  return (
    <Section id="workflow" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 02 ] The mechanism"
          title="Stop asking. Start telling."
          subtitle={`The Reverse-Form Method™. Four moves that turn "I need a quote" into a quotable job in 38 seconds.`}
        />
        <MechanismGrid />
      </Container>
    </Section>
  );
}

/* ── Before / after ── */
function ComparisonSection() {
  return (
    <Section>
      <Container>
        <SectionIntro
          eyebrow="[ 03 ] Before / after"
          title="The intake your customers feel — and the one your estimator doesn't curse at."
          subtitle="Same five minutes. Two different futures for the lead."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <span className="ls-numeral text-destructive">Before · status quo</span>
            <h3 className="ls-h3 mt-3">Generic intake form</h3>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: ImageOff, text: "Photos missing or shot from across the yard." },
                { icon: MessageSquareWarning, text: "Three follow-ups before anyone can price it." },
                { icon: TimerReset, text: "The lead cools while you chase context." },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3 text-muted-foreground">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 aspect-[16/9] overflow-hidden border border-border bg-muted">
              <img src={beforeIntakeFormIllo} alt="Broken intake form with missing photo context"
                className="h-full w-full object-contain p-4" loading="lazy" />
            </div>
          </Card>
          <Card elevated>
            <span className="ls-numeral text-[hsl(var(--accent-kinetic))]">After · PhotoBrief</span>
            <h3 className="ls-h3 mt-3">A guided capture pipeline</h3>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Right angle. Right lighting. Right context — every single time.",
                "One packet hits your inbox: photos, notes, location, scope.",
                "Your estimator quotes on the first reply. The job moves.",
              ].map((text) => (
                <li key={text} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 aspect-[16/9] overflow-hidden border border-border bg-muted">
              <img src={afterCapturePipelineIllo} alt="Guided phone capture flow turning into a brief packet"
                className="h-full w-full object-contain p-4" loading="lazy" />
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

/* ── Signpost — three doors ── */
const signposts = [
  {
    to: "/demo",
    icon: PlayCircle,
    eyebrow: "Demo",
    title: "See it work on your business.",
    body: "Watch a brief assemble live, then build one tailored to your trade in 60 seconds.",
    cta: "Try the live demo",
  },
  {
    to: "/beta",
    icon: Rocket,
    eyebrow: "Beta",
    title: `${BETA_TOTAL_PARTNERS} founding seats. ${BETA_DURATION_DAYS} days.`,
    body: "Concierge setup, direct line to the team, lifetime founding pricing for accepted partners.",
    cta: "Apply for the beta",
  },
  {
    to: "/pricing",
    icon: Tags,
    eyebrow: "Pricing",
    title: "Plans that scale with the work.",
    body: "Free, Starter, Pro, Team, Business — see what's included and what unlocks at each tier.",
    cta: "See pricing",
  },
];

function SignpostSection() {
  return (
    <Section tone="alt">
      <Container>
        <SectionIntro eyebrow="[ 04 ] Where to next ]" title="Pick a door." />
        <div className="grid gap-6 md:grid-cols-3">
          {signposts.map((s, i) => (
            <RiseIn key={s.to} delay={i * 0.06}>
              <NavLink to={s.to} className="group block h-full">
                <Card>
                  <s.icon className="h-7 w-7 text-[hsl(var(--accent-kinetic))]" />
                  <p className="ls-eyebrow mt-4">{s.eyebrow}</p>
                  <h3 className="ls-h3 mt-2">{s.title}</h3>
                  <Body size="sm">{s.body}</Body>
                  <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition group-hover:text-[hsl(var(--accent-kinetic))]">
                    {s.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </NavLink>
            </RiseIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ── Compact FAQ ── */
function FaqSection() {
  return (
    <Section>
      <Container width="narrow">
        <SectionIntro eyebrow="[ 05 ] FAQ" title="Frequently. Honestly." />
        <Accordion type="single" collapsible className="mt-10 border-t border-border">
          {faqItems.slice(0, 4).map((item, i) => (
            <AccordionItem key={item.q} value={`q-${i}`} className="border-b border-border py-2">
              <AccordionTrigger className="text-left font-display text-lg font-medium tracking-tight hover:no-underline">
                <span className="flex w-full items-baseline gap-4">
                  <span className="ls-numeral shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item.q}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-12 text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          More questions?{" "}
          <NavLink to="/help" className="text-foreground underline-offset-4 hover:underline">
            Read the full help center →
          </NavLink>
        </p>
      </Container>
    </Section>
  );
}

/* ── Final CTA ── */
function FinalCta({ isFull }: { isFull: boolean }) {
  return (
    <Section tone="dark">
      <Container>
        <div className="text-center">
          <p className="ls-eyebrow">[ 06 ] Pick up the pen ]</p>
          <RiseIn>
            <h2 className="ls-h1 mt-6">
              Ready to replace the chase
              <span className="ls-accent-dot">?</span>
            </h2>
          </RiseIn>
          <RiseIn delay={0.1}>
            <Body size="lg">
              {isFull
                ? "Founding seats are full. Join the waitlist and we'll reach out the moment a seat opens."
                : `${BETA_TOTAL_PARTNERS} seats. ${BETA_DURATION_DAYS} days. Founding pricing for the lifetime of your account.`}
            </Body>
          </RiseIn>
          <CTAGroup>
            <CTA href="/beta" variant="primary" size="lg">
              {isFull ? "Join waitlist" : "Apply for the beta"} <ArrowRight className="h-4 w-4" />
            </CTA>
            <CTA href="/demo" variant="secondary" size="lg">
              See the live demo
            </CTA>
          </CTAGroup>
        </div>
      </Container>
    </Section>
  );
}
