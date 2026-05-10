import { lazy, Suspense, useState, type ReactNode } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Camera,
  Wrench,
  Wind,
  Leaf,
  Truck,
  Calculator,
  Globe2,
  Eye,
  Scan,
  Route,
  ImageOff,
  TimerReset,
  MessageSquareWarning,
} from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildHowToJsonLd } from "@/hooks/seo/buildHowToJsonLd";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";

import { BrandMark } from "@/components/layout/BrandMark";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import {
  Section,
  Container,
  Eyebrow,
  Title,
  Subtitle,
  Body,
  Card,
  Grid,
  CTA,
  CTAGroup,
} from "@/pages/landing/schema";
import { MarqueeRow } from "@/components/motion/MarqueeRow";
import { RiseIn } from "@/components/motion/RiseIn";
import { MagneticCTA } from "@/components/motion/MagneticCTA";

import { faqItems } from "@/features/help/content/faq";
import { howItWorksSteps } from "@/components/marketing/HowItWorksSteps";
import { trackEvent } from "@/lib/analytics";
import {
  BETA_DURATION_DAYS,
  BETA_TOTAL_PARTNERS,
} from "@/config/betaProgram";
import { useBetaSeats } from "@/hooks/useBetaSeats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import landscaperIllo from "@/assets/trades/landscaper-illustration.png";
import hvacTechIllo from "@/assets/trades/hvac-tech-illustration.png";
import plumberIllo from "@/assets/trades/plumber-illustration.png";
import junkHaulerIllo from "@/assets/trades/junk-hauler-illustration.png";
import estimatorIllo from "@/assets/trades/estimator-illustration.png";
import researchMagnifierIllo from "@/assets/rmbc/research-magnifier.png";
import mechanismGearsIllo from "@/assets/rmbc/mechanism-gears.png";
import briefPacketIllo from "@/assets/rmbc/brief-packet.png";
import beforeIntakeFormIllo from "@/assets/comparison/before-intake-form.png";
import afterCapturePipelineIllo from "@/assets/comparison/after-capture-pipeline.png";
import methodOverviewIllo from "@/assets/rmbc/method-overview.png";

const InteractiveHeroBriefAssembly = lazy(() =>
  import("@/components/marketing/InteractiveHeroBriefAssembly").then((m) => ({
    default: m.InteractiveHeroBriefAssembly,
  })),
);
const BetaOnboardingAgentExperience = lazy(() =>
  import("@/components/marketing/BetaOnboardingAgentExperience").then((m) => ({
    default: m.BetaOnboardingAgentExperience,
  })),
);

/* ── JSON-LD ───────────────────────────────────────────────── */

const SOFTWARE_APP_JSONLD: Record<string, unknown> = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Your contact form is leaking money. PhotoBrief's Reverse-Form Method™ tells customers exactly what to send — and a quote-ready lead packet lands in your inbox on the first try. No chasing. No callbacks. No vague 'I need a quote'.",
};

/* ── Anchors ───────────────────────────────────────────── */

const sectionLinks = [
  { href: "#workflow", label: "Mechanism" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Trades" },
  { href: "#website-intelligence", label: "Intelligence" },
  { href: "#apply", label: "Apply" },
];

/* ─────────────────────────────────────────────────────────
   The page
   ───────────────────────────────────────────────────────── */

export default function LandingPage() {
  const [params] = useSearchParams();
  const showAgent = params.get("agent") === "1";
  const { isFull } = useBetaSeats();

  const heroJsonLd = buildHowToJsonLd(
    "How PhotoBrief works",
    howItWorksSteps.map((s) => ({ title: s.title, body: s.body })),
  );
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <>
      <PageMeta
        title="PhotoBrief — Stop the leak. Quote on the first reply."
        description="Your contact form is leaking money. PhotoBrief's Reverse-Form Method™ tells customers exactly what to send — and a quote-ready lead packet lands in your inbox on the first try. No chasing. No callbacks."
        canonicalPath="/"
        jsonLd={[SOFTWARE_APP_JSONLD, heroJsonLd, faqJsonLd]}
      />

      <Hero />
      <MarqueeBand />
      <MechanismSection />
      <ComparisonSection />
      <UseCasesSection />
      <WebsiteIntelligenceSection />
      <LiveDemoSection />
      <BetaProgramSection />
      <ApplySection showAgent={showAgent} />
      <FaqSection />
      <FinalCta isFull={isFull} />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Hero — kinetic editorial stack
   ───────────────────────────────────────────────────────── */

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
                Your contact form is leaking money. The Reverse-Form Method™ patches it — <em>you</em> tell customers exactly what to send, in the order an estimator needs it, and a quote-ready packet lands in your inbox on the first try.
              </p>
            </RiseIn>
            <RiseIn delay={0.35}>
              <CTAGroup>
                <MagneticCTA
                  href="#apply"
                  className="ls-cta ls-cta--lg ls-cta-primary mt-10"
                  onClick={() => trackEvent("landing_hero_cta_apply")}
                >
                  Claim a founding seat <ArrowRight className="h-4 w-4" />
                </MagneticCTA>
                <a href="#workflow" className="ls-cta ls-cta--lg ls-cta-quiet mt-10">
                  See the mechanism →
                </a>
              </CTAGroup>
            </RiseIn>
          </div>

          <div className="relative order-first lg:order-none">
            <div className="relative aspect-video w-full overflow-hidden border border-border bg-[hsl(var(--pb-paper))]">
              <video
                src="/marketing/photobrief-demo.mp4"
                poster="/marketing/photobrief-demo-poster.jpg"
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label="PhotoBrief product demo: Guide, Capture, Close."
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-[10px] uppercase tracking-[0.2em] text-foreground/80 mix-blend-difference">
                <span className="font-mono">Fig. 01</span>
                <span className="font-mono">Reverse-Form Method™</span>
              </div>
            </div>
            <BrandMark
              variant="horizontal"
              tone="dark"
              size={28}
              className="mt-6 justify-center opacity-80"
            />
          </div>
        </div>

        {/* Anchor nav strip */}
        <div className="mt-20 hidden border-y border-border py-4 md:flex md:flex-wrap md:items-center md:gap-x-8 md:gap-y-2">
          <span className="ls-numeral">Index</span>
          {sectionLinks.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {String(i + 1).padStart(2, "0")} · {l.label}
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Marquee band — kinetic word strip
   ───────────────────────────────────────────────────────── */

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
        <span className="ls-marquee-item ls-marquee-item--ghost">60% of estimates never followed up</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">5+ follow-ups to close — most stop at 1</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item ls-marquee-item--accent">Reverse-Form Method™</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
      </MarqueeRow>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Mechanism — 4-step Reverse-Form Method
   ───────────────────────────────────────────────────────── */

const workflowSteps = [
  {
    n: "01",
    title: "Research",
    body: "We scan your site, your trade, and the photos your estimators actually need. The ones that kill callbacks.",
    illo: researchMagnifierIllo,
  },
  {
    n: "02",
    title: "Mechanism",
    body: "The customer taps a link. The camera opens at the right angle. The right shot lands. No app, no login, no thinking.",
    illo: mechanismGearsIllo,
  },
  {
    n: "03",
    title: "Brief",
    body: "Photos, notes, and address arrive as one packet — formatted for your inbox, your CRM, and the person writing the quote.",
    illo: briefPacketIllo,
  },
  {
    n: "04",
    title: "Close",
    body: "Your team quotes on the first reply. The lead doesn't cool. The job moves.",
    illo: methodOverviewIllo,
  },
];

function MechanismSection() {
  return (
    <Section id="workflow" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 02 ] The mechanism"
          title="Stop asking. Start telling."
          subtitle={`The Reverse-Form Method™. Four moves that turn "I need a quote" into a quotable job in 38 seconds.`}
        />
        <Grid cols={4} gap="md">
          {workflowSteps.map((step, i) => (
            <RiseIn key={step.n} delay={i * 0.06}>
              <Card>
                <div className="flex items-baseline justify-between">
                  <span className="ls-numeral">{step.n}</span>
                  <span className="ls-numeral text-foreground/40">04</span>
                </div>
                <div className="mt-6 aspect-square w-full overflow-hidden border border-border bg-muted">
                  <img
                    src={step.illo}
                    alt=""
                    className="h-full w-full object-contain p-6 opacity-90"
                    loading="lazy"
                  />
                </div>
                <h3 className="ls-h3 mt-6">{step.title}</h3>
                <Body size="sm">{step.body}</Body>
              </Card>
            </RiseIn>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Comparison — before / after
   ───────────────────────────────────────────────────────── */

function ComparisonSection() {
  return (
    <Section id="comparison">
      <Container>
        <SectionIntro
          eyebrow="[ 03 ] Before / after"
          title="The intake your customers feel — and the one your estimator doesn't curse at."
          subtitle="Same five minutes. Two different futures for the lead. One ends in a quote."
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
              <img
                src={beforeIntakeFormIllo}
                alt="Illustration of a broken intake form with missing photo context"
                className="h-full w-full object-contain p-4"
                loading="lazy"
              />
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
              <img
                src={afterCapturePipelineIllo}
                alt="Illustration of a guided phone capture flow turning into a ready brief packet"
                className="h-full w-full object-contain p-4"
                loading="lazy"
              />
            </div>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Use cases — trade illustrations
   ───────────────────────────────────────────────────────── */

const useCases = [
  { icon: Wrench, label: "Plumbers", note: "Under-sink, shut-off, the exact leak — captured in order.", illo: plumberIllo },
  { icon: Wind, label: "HVAC", note: "Outdoor unit, indoor air-handler, breaker panel — one tap each.", illo: hvacTechIllo },
  { icon: Leaf, label: "Landscapers", note: "Front yard, back yard, slope, side-gate access — drone-free.", illo: landscaperIllo },
  { icon: Truck, label: "Junk haulers", note: "The pile, the path, the hazards — before the truck rolls.", illo: junkHaulerIllo },
  { icon: Calculator, label: "Estimators", note: "Photo coverage that actually prices the job.", illo: estimatorIllo },
];

function UseCasesSection() {
  return (
    <Section id="use-cases" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 04 ] Trades"
          title="Built around the work, not the form."
          subtitle="Coverage templates per trade. Mute customer? Doesn't matter. The form does the talking."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {useCases.map((u, i) => (
            <RiseIn key={u.label} delay={i * 0.05}>
              <Card>
                <u.icon className="h-6 w-6 text-[hsl(var(--accent-kinetic))]" />
                <h3 className="ls-h3 mt-4">{u.label}</h3>
                <Body size="sm">{u.note}</Body>
              </Card>
            </RiseIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Website Intelligence
   ───────────────────────────────────────────────────────── */

const websiteIntelCards = [
  { icon: Scan, title: "Scan",    text: "We crawl your site, score every intake path, and find where leads bleed out." },
  { icon: Route, title: "Route",  text: "Templates routed to your existing forms, embeds, or webhook — no rebuild." },
  { icon: Eye,   title: "Observe", text: "Every submission tracked end-to-end with photo-coverage scoring." },
];

function WebsiteIntelligenceSection() {
  return (
    <Section id="website-intelligence">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <RiseIn>
            <div className="aspect-square overflow-hidden border border-border bg-muted">
              <img
                src={researchMagnifierIllo}
                alt="Website intelligence"
                className="h-full w-full object-contain p-12"
                loading="lazy"
              />
            </div>
          </RiseIn>
          <div>
            <SectionIntro
              eyebrow="[ 05 ] Website intelligence"
              title="Your site is already telling us how to fix it."
              subtitle="An automation layer that turns the intake you already own into a Reverse-Form pipeline."
            />
            <Grid cols={3} gap="md">
              {websiteIntelCards.map((c, i) => (
                <RiseIn key={c.title} delay={i * 0.05}>
                  <Card>
                    <c.icon className="h-5 w-5 text-[hsl(var(--accent-kinetic))]" />
                    <h3 className="ls-h3 mt-3">{c.title}</h3>
                    <Body size="sm">{c.text}</Body>
                  </Card>
                </RiseIn>
              ))}
            </Grid>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Live demo
   ───────────────────────────────────────────────────────── */

function LiveDemoSection() {
  return (
    <Section tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 06 ] Live"
          title={`Watch a vague "I need a quote" turn into a quotable job in 38 seconds.`}
          subtitle="Hit the steps. The packet builds in real time."
        />
        <div className="border border-border bg-background p-2 sm:p-4">
          <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
            <InteractiveHeroBriefAssembly />
          </Suspense>
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Beta program
   ───────────────────────────────────────────────────────── */

function BetaProgramSection() {
  return (
    <Section id="beta-program">
      <Container width="narrow">
        <SectionIntro
          eyebrow="[ 07 ] Founding partners"
          title={`${BETA_TOTAL_PARTNERS} seats. ${BETA_DURATION_DAYS} days. Founding pricing forever.`}
          subtitle={`This isn't a waitlist. It's a ${BETA_TOTAL_PARTNERS}-person room — and we're hiring two co-builders. Every founding partner walks out with a reward; the top two never pay for PhotoBrief Pro again.`}
        />
        <div className="mt-10">
          <BetaSeatTracker />
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Apply — onboarding agent
   ───────────────────────────────────────────────────────── */

function ApplySection({ showAgent: _showAgent }: { showAgent: boolean }) {
  return (
    <Section id="apply" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 08 ] Apply"
          title="Six minutes with the onboarding agent."
          subtitle="Tell us about the work. If a founding seat has your name on it, you'll hear back within 48 hours."
        />
        <div className="border border-border bg-background p-2 sm:p-4">
          <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
            <BetaOnboardingAgentExperience />
          </Suspense>
        </div>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   FAQ
   ───────────────────────────────────────────────────────── */

function FaqSection() {
  return (
    <Section>
      <Container width="narrow">
        <SectionIntro
          eyebrow="[ 09 ] FAQ"
          title="Frequently. Honestly."
        />
        <Accordion type="single" collapsible className="mt-10 border-t border-border">
          {faqItems.slice(0, 8).map((item, i) => (
            <AccordionItem key={item.q} value={`q-${i}`} className="border-b border-border py-2">
              <AccordionTrigger className="text-left font-display text-lg font-medium tracking-tight hover:no-underline">
                <span className="flex w-full items-baseline gap-4">
                  <span className="ls-numeral shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item.q}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pl-12 text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}

/* ─────────────────────────────────────────────────────────
   Final CTA + quick apply form
   ───────────────────────────────────────────────────────── */

function FinalCta({ isFull }: { isFull: boolean }) {
  return (
    <Section tone="dark">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="ls-eyebrow">[ 10 ] Pick up the pen</p>
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
                  : `${BETA_TOTAL_PARTNERS} seats. ${BETA_DURATION_DAYS} days. Two free-for-life winners. Founding pricing for the lifetime of your account — never repriced, never rolled back.`}
              </Body>
            </RiseIn>
            <CTAGroup>
              <CTA href="#apply" variant="primary" size="lg">
                {isFull ? "Join waitlist" : "Open the agent"}
              </CTA>
              <CTA href="/pricing" variant="secondary" size="lg">
                See pricing
              </CTA>
            </CTAGroup>
          </div>
          <FinalCtaQuickApply isFull={isFull} />
        </div>
      </Container>
    </Section>
  );
}

const quickApplySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(254),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  website_url: z.string().max(0).optional().or(z.literal("")), // honeypot
});

function FinalCtaQuickApply({ isFull }: { isFull: boolean }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [trap, setTrap] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submitLabel = isFull ? "Join the waitlist" : "Send my application";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = quickApplySchema.safeParse({ name, email, company, website_url: trap });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (trap) { setDone(true); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("waitlist-submit", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          business_name: parsed.data.company || undefined,
          source: "landing-final-cta",
          interest: "founding-partner",
        },
      });
      if (error) throw error;
      trackEvent("landing_final_cta_quick_apply_submit", { has_company: Boolean(parsed.data.company) });
      setDone(true);
    } catch (err) {
      toast({
        title: "Couldn't submit",
        description: "Something went wrong. Try again or use the full agent above.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-border bg-card p-8">
        <p className="ls-eyebrow">[ ✓ ] You're in the queue</p>
        <p className="ls-h3 mt-4">Watch your inbox.</p>
        <Body>
          We review every application by hand. If you fit one of the {BETA_TOTAL_PARTNERS} founding seats,
          you'll hear back within 48 hours.
        </Body>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-border bg-card p-6 sm:p-8"
      noValidate
    >
      <p className="ls-eyebrow">{isFull ? "Waitlist" : "Thirty seconds to a founding seat"}</p>
      <div className="mt-6 space-y-5">
        <FormField
          label="Name"
          error={errors.name}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            autoComplete="name"
            className="w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition-colors focus:border-[hsl(var(--accent-kinetic))]"
          />
        </FormField>
        <FormField label="Work email" error={errors.email}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            required
            autoComplete="email"
            className="w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition-colors focus:border-[hsl(var(--accent-kinetic))]"
          />
        </FormField>
        <FormField label="Company or website" hint="optional">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            maxLength={120}
            autoComplete="organization"
            className="w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition-colors focus:border-[hsl(var(--accent-kinetic))]"
          />
        </FormField>
        <input
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
      </div>
      <CTAGroup>
        <button
          type="submit"
          disabled={submitting}
          className="ls-cta ls-cta--lg ls-cta-primary mt-8 w-full disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {submitting ? "Sending…" : submitLabel}
        </button>
      </CTAGroup>
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Prefer the full 6-min agent?{" "}
        <a
          href="#apply"
          className="text-foreground underline-offset-4 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Open the onboarding agent
        </a>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */

function SectionIntro({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div className="mb-14 max-w-3xl">
      <p className="ls-eyebrow">{eyebrow}</p>
      <RiseIn>
        <Title level={2}>
          <span className="mt-5 block">{title}</span>
        </Title>
      </RiseIn>
      {subtitle && (
        <RiseIn delay={0.08}>
          <Subtitle>{subtitle}</Subtitle>
        </RiseIn>
      )}
    </div>
  );
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-muted-foreground/60">({hint})</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && <span className="mt-1 block text-xs text-[hsl(var(--accent-kinetic))]">{error}</span>}
    </label>
  );
}
