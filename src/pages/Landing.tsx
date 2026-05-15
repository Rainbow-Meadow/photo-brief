import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, ImageOff, MessageSquareWarning, TimerReset, PlayCircle, Tags } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";

import { BrandMark } from "@/components/layout/BrandMark";
import { Section, Container, Body } from "@/design-system/schema";
import { OneLinkAnywhereSection } from "@/components/marketing/OneLinkAnywhereSection";
import { RiseIn } from "@/components/motion/RiseIn";
import { MagneticCTA } from "@/components/motion/MagneticCTA";

import { faqItems } from "@/features/help/content/faq";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { trackEvent } from "@/lib/analytics";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import { SectionIntro } from "@/components/marketing/SectionIntro";
import { MechanismGrid } from "@/components/marketing/MechanismGrid";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";

import heroBeforeImg from "@/assets/hero/hero-before-messy-intake.jpg";
import heroAfterImg from "@/assets/hero/hero-after-photobrief-packet.jpg";
import beforeIntakeFormIllo from "@/assets/comparison/cedar-before-contact-form.jpg";
import afterCapturePipelineIllo from "@/assets/comparison/cedar-after-photobrief-embed.jpg";
import { BeforeAfterSlider } from "@/components/marketing/BeforeAfterSlider";
import { CfImg } from "@/components/shared/CfImg";

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Your form gives you a name. PhotoBrief gives you a quote-ready brief.",
};

export default function LandingPage() {
  const heroJsonLd = buildHowToJsonLd(
    "How PhotoBrief works",
    howItWorksSteps.map((s) => ({ title: s.title, body: s.body })),
  );

  return (
    <>
      <PageMeta
        title="PhotoBrief — Guide. Capture. Close."
        description="Your form gives you a name. PhotoBrief gives you a brief you can quote on the first reply."
        canonicalPath="/"
        jsonLd={[SOFTWARE_APP_JSONLD, heroJsonLd]}
      />

      <Hero />
      <OneLinkAnywhereSection />
      <MechanismSection />
      <ComparisonSection />
      <SignpostSection />
      <FaqSection />
      <FinalCta />
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
              <h1 className="ls-h1 ls-display-stack mt-8">
                <span className="block">Guide.</span>
                <span className="block">Capture.</span>
                <span className="block">
                  Close<span className="ls-accent-dot">.</span>
                </span>
              </h1>
            </RiseIn>
            <RiseIn delay={0.25}>
              <p className="ls-subtitle mt-6 max-w-[44ch]">
                Your form gives you a name. We give you a brief. Quote on the first reply.
              </p>
            </RiseIn>
            <RiseIn delay={0.35}>
              <div className="mt-8 flex flex-row flex-wrap items-center gap-x-5 gap-y-3">
                <MagneticCTA
                  href="/demo"
                  className="ls-cta ls-cta--lg ls-cta-primary"
                  onClick={() => trackEvent("landing_hero_cta_demo")}
                >
                  Try the live demo <ArrowRight className="h-4 w-4" />
                </MagneticCTA>
                <NavLink
                  to="/auth?mode=signup"
                  className="text-sm font-medium text-foreground/80 underline-offset-4 hover:text-foreground hover:underline"
                >
                  Or start your 14-day trial →
                </NavLink>
              </div>
            </RiseIn>
          </div>

          <RiseIn delay={0.4} className="relative">
            <div className="mx-auto w-full max-w-[520px] lg:ml-auto lg:mr-0 lg:max-w-[420px]">
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


/* ── Mechanism teaser ── */
function MechanismSection() {
  return (
    <Section id="workflow" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 02 ] The mechanism"
          title="Stop asking. Start routing."
          subtitle="Four moves. Website CTA to brief on your desk."
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
          title="One form. Or one route per job."
          subtitle="Same lead. Same five minutes. Two very different inboxes."
        />
        <div className="grid grid-cols-1 overflow-hidden border border-border lg:grid-cols-2">
          {/* Before — dimmed half */}
          <div className="border-b border-border bg-muted/30 opacity-70 grayscale-[0.4] lg:border-b-0 lg:border-r">
            <div className="overflow-hidden bg-muted">
              <CfImg
                src={beforeIntakeFormIllo}
                cfWidth={720}
                widths={[480, 720, 1080]}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt="Cedar &amp; Oak Tree Care website with a generic three-field Contact us form — the kind of intake PhotoBrief replaces."
                className="h-auto w-full object-contain"
                loading="lazy"
                decoding="async"
                width={1280}
                height={960}
              />
            </div>
            <div className="p-6 lg:p-8">
              <span className="ls-numeral text-destructive">Before · your contact form</span>
              <h3 className="ls-h3 mt-3">One form. Every job.</h3>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  { icon: MessageSquareWarning, text: "A name. An email. One vague sentence." },
                  { icon: ImageOff, text: "Wrong photos. Or none at all." },
                  { icon: TimerReset, text: "Three follow-ups. Your competitor quotes first." },
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
              <CfImg
                src={afterCapturePipelineIllo}
                cfWidth={720}
                widths={[480, 720, 1080]}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt="PhotoBrief inbox for Cedar &amp; Oak Tree Care showing two route-specific intake briefs — Emergency limb (photos required) and Full removal quote (photos recommended)."
                className="h-auto w-full object-contain"
                loading="lazy"
                decoding="async"
                width={1280}
                height={960}
              />
            </div>
            <div className="p-6 lg:p-8">
              <span className="ls-numeral text-[hsl(var(--accent-kinetic))]">After · PhotoBrief</span>
              <h3 className="ls-h3 mt-3">One route per job.</h3>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "A route per service. The right questions every time.",
                  "Photos only when they help. No generic dump.",
                  "One brief. Everything you need to quote.",
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
    body: "Live, in 60 seconds. No signup.",
    cta: "Try the live demo",
  },
  {
    to: "/auth?mode=signup",
    icon: ArrowRight,
    eyebrow: "Start",
    title: "Replace your form in an afternoon.",
    body: "14-day free trial. No card upfront. Cancel anytime.",
    cta: "Start free trial",
  },
  {
    to: "/pricing",
    icon: Tags,
    eyebrow: "Pricing",
    title: "Plans that scale with your intake.",
    body: "Smart Intake at $59/mo. Smart Intake Team at $149/mo.",
    cta: "See pricing",
  },
];

function SignpostSection() {
  return (
    <Section tone="alt">
      <Container>
        <SectionIntro eyebrow="[ 04 ] Where to next ]" title="Three doors. Pick one." />
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Start — hero door, full top row */}
          <RiseIn className="lg:col-span-2">
            <NavLink
              to={signposts[1].to}
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
              <SectionIntro eyebrow="[ 05 ] FAQ" title="The stuff people always ask." />
              <p className="mt-2 text-sm text-muted-foreground">
                <NavLink to="/help" className="text-foreground underline-offset-4 hover:underline">
                  Full help center →
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
function FinalCta() {
  return (
    <FinalCtaSection
      eyebrow="06 ] Replace the form"
      title="Ready to ditch the form"
      punctuation="?"
      body="14-day free trial. No card upfront. Cancel anytime."
      primary={{
        href: "/auth?mode=signup",
        label: (
          <>
            Start free trial <ArrowRight className="h-4 w-4" />
          </>
        ),
      }}
      secondary={{ href: "/demo", label: "See the live demo" }}
    />
  );
}
