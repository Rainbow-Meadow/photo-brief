import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, ImageOff, MessageSquareWarning, TimerReset, PlayCircle, Rocket, Tags } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";

import { BrandMark } from "@/components/layout/BrandMark";
import { Section, Container, Body } from "@/design-system/schema";
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
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";

import heroBeforeImg from "@/assets/hero/hero-before-messy-intake.jpg";
import heroAfterImg from "@/assets/hero/hero-after-photobrief-packet.jpg";
import beforeIntakeFormIllo from "@/assets/comparison/before-cedar-intake.png";
import afterCapturePipelineIllo from "@/assets/comparison/after-cedar-brief.png";
import { BeforeAfterSlider } from "@/components/marketing/BeforeAfterSlider";

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Your contact form gives you a name and a sentence. PhotoBrief reads your website, builds smart intake routes, decides when photos actually matter, and drops a brief in your inbox you can quote on the first reply.",
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
        description="Your contact form gives you a name. PhotoBrief reads your site, routes every lead through the right questions, and drops a brief you can quote — with photos when, and only when, the job needs them."
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
                Your website form gives you a name and a vibe. PhotoBrief reads your site, builds smart intake routes for every service you offer, and hands your inbox a brief you can quote — with photos when the job needs them, skipped when it doesn't.
              </p>
            </RiseIn>
            <RiseIn delay={0.35}>
              <div className="mt-10 flex flex-row flex-wrap items-center gap-x-5 gap-y-3">
                <MagneticCTA
                  href="/demo"
                  className="ls-cta ls-cta--lg ls-cta-primary"
                  onClick={() => trackEvent("landing_hero_cta_demo")}
                >
                  Try the live demo <ArrowRight className="h-4 w-4" />
                </MagneticCTA>
                <NavLink
                  to="/beta"
                  className="text-sm font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
                >
                  Apply for the beta →
                </NavLink>
              </div>
            </RiseIn>
          </div>

          <RiseIn delay={0.4} className="relative">
            <div className="mx-auto w-full max-w-[520px] lg:ml-auto lg:mr-0 lg:max-h-[520px]">
              <BeforeAfterSlider
                before={heroBeforeImg}
                after={heroAfterImg}
                beforeAlt="Laptop showing a 3-day Gmail back-and-forth between Cedar & Sons and a homeowner — six messages, still no quote sent."
                afterAlt="Laptop showing a clean two-message Gmail thread — PhotoBrief packet at 9:14 AM, Cedar & Sons quote reply at 9:31 AM."
                onFirstInteract={() => trackEvent("landing_hero_before_after_drag")}
              />
              <BrandMark variant="horizontal" tone="dark" size={28} className="mt-6 justify-center opacity-80" />
            </div>
          </RiseIn>
        </div>
      </Container>
    </Section>
  );
}

/* ── Marquee ── */
function MarqueeBand() {
  return (
    <div className="relative space-y-2 border-y border-border bg-[hsl(var(--accent-kinetic)/0.08)] py-5">
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
        <span className="ls-marquee-item">Your form asks 5 fields</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">Your customer needed different ones</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">78% buy from whoever quotes first</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">Photos when they matter. Skipped when they don't.</span>
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
          title="Stop asking. Start routing."
          subtitle={`The Reverse-Form Method™. Four moves that turn a website CTA into a brief on your desk — with the right questions, the right photos, the right next step.`}
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
          title="One generic form for every lead. Or one smart route for each."
          subtitle="Same customer. Same five minutes. Two completely different things show up in your inbox."
        />
        <div className="grid grid-cols-1 overflow-hidden border border-border lg:grid-cols-2">
          {/* Before — dimmed half */}
          <div className="border-b border-border bg-muted/30 opacity-70 grayscale-[0.4] lg:border-b-0 lg:border-r">
            <div className="overflow-hidden bg-muted">
              <img
                src={beforeIntakeFormIllo}
                alt="Broken intake form with missing photo context"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-6 lg:p-8">
              <span className="ls-numeral text-destructive">Before · your contact form</span>
              <h3 className="ls-h3 mt-3">One form for every job</h3>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  { icon: MessageSquareWarning, text: "A name, an email, one vague sentence. No idea which service. No idea where to start." },
                  { icon: ImageOff, text: "No photos when you needed them. Photos of the wrong thing when you didn't." },
                  { icon: TimerReset, text: "Three follow-up emails before you can price it. The lead cools. Your competitor quotes first." },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex gap-3 text-muted-foreground">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* After — bright half */}
          <div className="bg-card ring-1 ring-inset ring-[hsl(var(--accent-kinetic)/0.4)]">
            <div className="overflow-hidden bg-muted">
              <img
                src={afterCapturePipelineIllo}
                alt="Guided phone capture flow turning into a brief packet"
                className="h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-6 lg:p-8">
              <span className="ls-numeral text-[hsl(var(--accent-kinetic))]">After · PhotoBrief</span>
              <h3 className="ls-h3 mt-3">A smart route for every job</h3>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "We read your site. We build a route per service. Each one asks the questions that actually price the job.",
                  "Photos when the route says photos matter. Skipped when they don't. No generic photo dump.",
                  "One brief lands: who, what, which route, what they answered, photos in or still pending, what to do next.",
                ].map((text) => (
                  <li key={text} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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
    title: "Paste your URL. Watch your routes appear.",
    body: "PhotoBrief reads your site and builds a working intake live. 60 seconds. No signup.",
    cta: "Try the live demo",
  },
  {
    to: "/beta",
    icon: Rocket,
    eyebrow: "Beta",
    title: `${BETA_TOTAL_PARTNERS} founding seats. ${BETA_DURATION_DAYS} days.`,
    body: "We build your routes with you. You get a direct line to the team and founding pricing for life.",
    cta: "Apply for the beta",
  },
  {
    to: "/pricing",
    icon: Tags,
    eyebrow: "Pricing",
    title: "Plans that scale with intake volume.",
    body: "Free, Starter, Pro, Team, Business — what every tier unlocks, and what you get to keep at founding pricing.",
    cta: "See pricing",
  },
];

function SignpostSection() {
  return (
    <Section tone="alt">
      <Container>
        <SectionIntro eyebrow="[ 04 ] Where to next ]" title="Three doors. Pick one." />
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Beta — hero door, full top row */}
          <RiseIn className="lg:col-span-2">
            <NavLink
              to="/beta"
              className="group block border-t border-border bg-[hsl(var(--accent-kinetic)/0.06)] p-8 transition hover:bg-[hsl(var(--accent-kinetic)/0.12)] lg:p-12"
            >
              <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-9">
                  <h3 className="ls-h2">{signposts[1].title}</h3>
                  <Body size="md">{signposts[1].body}</Body>
                </div>
                <div className="flex items-center justify-between gap-4 lg:col-span-3 lg:justify-end">
                  <div className="flex items-center gap-3">
                    <p className="ls-eyebrow !mt-0">{signposts[1].eyebrow}</p>
                    {(() => {
                      const I = signposts[1].icon;
                      return <I className="h-5 w-5 text-[hsl(var(--accent-kinetic))]" />;
                    })()}
                  </div>
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition group-hover:text-[hsl(var(--accent-kinetic))]">
                    {signposts[1].cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </NavLink>
          </RiseIn>

          {/* Demo + Pricing — flanking smaller doors */}
          {[signposts[0], signposts[2]].map((s, i) => (
            <RiseIn key={s.to} delay={(i + 1) * 0.06}>
              <NavLink
                to={s.to}
                className="group block border-t border-border p-6 transition hover:bg-foreground/[0.02] lg:p-8"
              >
                <h3 className="ls-h3">{s.title}</h3>
                <Body size="sm">{s.body}</Body>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <p className="ls-eyebrow !mt-0">{s.eyebrow}</p>
                    <s.icon className="h-4 w-4 text-[hsl(var(--accent-kinetic))]" />
                  </div>
                  <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-foreground transition group-hover:text-[hsl(var(--accent-kinetic))]">
                    {s.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
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
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Sticky intro rail */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <SectionIntro eyebrow="[ 05 ] FAQ" title="The questions everyone asks." />
              <p className="mt-2 text-sm text-muted-foreground">
                Want every answer in one place?{" "}
                <NavLink to="/help" className="text-foreground underline-offset-4 hover:underline">
                  Open the full help center →
                </NavLink>
              </p>
            </div>
          </div>

          {/* Scrolling Q&A */}
          <div className="lg:col-span-8">
            <Accordion type="single" collapsible className="border-t border-border">
              {faqItems.slice(0, 4).map((item, i) => (
                <AccordionItem key={item.q} value={`q-${i}`} className="border-b border-border py-2">
                  <AccordionTrigger className="text-left font-display text-lg font-medium tracking-tight hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ── Final CTA ── */
function FinalCta({ isFull }: { isFull: boolean }) {
  return (
    <FinalCtaSection
      eyebrow="06 ] Stop chasing leads"
      title="Ready to replace the form"
      punctuation="?"
      body={
        isFull
          ? "Founding seats are full. Drop your email and we'll reach out the moment a seat opens."
          : `${BETA_TOTAL_PARTNERS} seats. ${BETA_DURATION_DAYS} days. Founding pricing for the life of your account.`
      }
      primary={{
        href: "/beta",
        label: (
          <>
            {isFull ? "Join waitlist" : "Apply for the beta"} <ArrowRight className="h-4 w-4" />
          </>
        ),
      }}
      secondary={{ href: "/demo", label: "See the live demo" }}
    />
  );
}
