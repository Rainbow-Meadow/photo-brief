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
  BETA_TOTAL_PARTNERS,
} from "@/config/betaProgram";
import { useBetaSeats } from "@/hooks/useBetaSeats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

import heroIllustration from "@/assets/landing-hero-illustration.png";
import landscaperIllo from "@/assets/trades/landscaper-illustration.png";
import hvacTechIllo from "@/assets/trades/hvac-tech-illustration.png";
import researchMagnifierIllo from "@/assets/rmbc/research-magnifier.png";
import mechanismGearsIllo from "@/assets/rmbc/mechanism-gears.png";
import briefPacketIllo from "@/assets/rmbc/brief-packet.png";
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
    "Stop chasing customers for missing photos. PhotoBrief uses the Reverse-Form Method — you tell the customer what to send, and a quote-ready lead packet lands in your inbox on the first try.",
};

/* ── Anchors ───────────────────────────────────────────── */

const sectionLinks = [
  { href: "#workflow", label: "Mechanism" },
  { href: "#comparison", label: "Before / after" },
  { href: "#use-cases", label: "Trades" },
  { href: "#website-intelligence", label: "Intelligence" },
  { href: "#beta-program", label: "Beta" },
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
        title="PhotoBrief — Guide · Capture · Close"
        description="The Reverse-Form Method. Stop chasing customers for missing photos. Tell them exactly what to send, and a quote-ready lead packet lands in your inbox on the first try."
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
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="ls-eyebrow">[ 01 ] Visual intake, redesigned</p>
            <RiseIn delay={0.05}>
              <h1 className="ls-h1 ls-display-stack mt-6">
                <span className="block">Guide.</span>
                <span className="block">Capture.</span>
                <span className="block">
                  Close
                  <span className="ls-italic-accent">.</span>
                </span>
              </h1>
            </RiseIn>
            <RiseIn delay={0.25}>
              <p className="ls-subtitle mt-8 max-w-[40ch]">
                Stop chasing customers for missing photos. Tell them exactly what to send,
                and a quote-ready lead packet lands in your inbox — on the first try.
              </p>
            </RiseIn>
            <RiseIn delay={0.35}>
              <CTAGroup>
                <MagneticCTA
                  href="#apply"
                  className="ls-cta ls-cta--lg ls-cta-primary mt-10"
                  onClick={() => trackEvent("landing_hero_cta_apply")}
                >
                  Apply for founding seat <ArrowRight className="h-4 w-4" />
                </MagneticCTA>
                <a href="#workflow" className="ls-cta ls-cta--lg ls-cta-quiet mt-10">
                  See the mechanism →
                </a>
              </CTAGroup>
            </RiseIn>
          </div>

          <RiseIn delay={0.4} className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-border bg-muted">
              <img
                src={heroIllustration}
                alt="Customer capturing the photos a contractor actually needs."
                className="h-full w-full object-cover opacity-90"
                loading="eager"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-[10px] uppercase tracking-[0.2em] text-foreground/80 mix-blend-difference">
                <span className="font-mono">Fig. 01</span>
                <span className="font-mono">Reverse-Form Method™</span>
              </div>
            </div>
            <BrandMark
              variant="horizontal"
              tone="auto"
              size={28}
              className="mt-6 justify-center opacity-80"
            />
          </RiseIn>
        </div>

        {/* Anchor nav strip */}
        <div className="mt-20 hidden border-y border-border py-4 lg:flex lg:items-center lg:gap-8">
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
    <div className="relative border-y border-border bg-card py-8">
      <MarqueeRow duration={45}>
        <span className="ls-marquee-item">Guide</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">Capture</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item">Close</span>
        <span className="ls-marquee-item ls-marquee-item--ghost">·</span>
        <span className="ls-marquee-item ls-italic-accent">photo·brief</span>
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
    body: "We map the job type, the trade, and the photo coverage your estimators need to quote without a callback.",
    illo: researchMagnifierIllo,
  },
  {
    n: "02",
    title: "Mechanism",
    body: "A guided, step-by-step capture flow. Customers tap, the camera opens at the right angle, the right shot lands.",
    illo: mechanismGearsIllo,
  },
  {
    n: "03",
    title: "Brief",
    body: "Photos, notes and context arrive as a single packet — formatted for your CRM, your estimators, and your inbox.",
    illo: briefPacketIllo,
  },
  {
    n: "04",
    title: "Close",
    body: "Your team quotes on the first reply. Customers feel heard. Jobs move forward.",
    illo: methodOverviewIllo,
  },
];

function MechanismSection() {
  return (
    <Section id="workflow" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 02 ] The mechanism"
          title="A method, not a form."
          subtitle="The Reverse-Form Method™. Four moves that replace the back-and-forth of intake with a guided capture pipeline."
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
          title="The intake your customers feel."
          subtitle="A mute form versus a guided sequence. Same five minutes, two different futures for the lead."
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <span className="ls-numeral text-destructive">Before · status quo</span>
            <h3 className="ls-h3 mt-3">Generic intake form</h3>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: ImageOff, text: "Photos missing or wrong angle." },
                { icon: MessageSquareWarning, text: "Three follow-ups before a quote." },
                { icon: TimerReset, text: "Lead cools while you chase context." },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3 text-muted-foreground">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card elevated>
            <span className="ls-numeral text-[hsl(var(--accent-kinetic))]">After · PhotoBrief</span>
            <h3 className="ls-h3 mt-3">A guided capture pipeline</h3>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Right angle, right lighting, right context — every time.",
                "A single packet hits your inbox: photos, notes, location.",
                "Your estimator quotes on the first reply.",
              ].map((text) => (
                <li key={text} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 aspect-[16/9] overflow-hidden border border-border bg-muted">
              <img
                src={briefPacketIllo}
                alt="Brief packet preview"
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
  { icon: Wrench, label: "Plumbers", note: "Leaks, fixtures, access.", illo: hvacTechIllo },
  { icon: Wind, label: "HVAC", note: "Units, vents, electrical.", illo: hvacTechIllo },
  { icon: Leaf, label: "Landscapers", note: "Yard size, slope, access.", illo: landscaperIllo },
  { icon: Truck, label: "Junk haulers", note: "Pile, driveway, hazards.", illo: landscaperIllo },
  { icon: Calculator, label: "Estimators", note: "Photo coverage that prices.", illo: hvacTechIllo },
];

function UseCasesSection() {
  return (
    <Section id="use-cases" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 04 ] Trades"
          title="Built around the work."
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
  { icon: Scan, title: "Scan",    text: "We crawl the site, score the intake paths, and find the leaks." },
  { icon: Route, title: "Route",  text: "Templates routed to forms, embeds, or your existing webhook." },
  { icon: Eye,   title: "Observe", text: "Every submission tracked end-to-end with photo coverage scoring." },
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
              title="Read the site. Route the lead."
              subtitle="An automation layer that turns your existing website into a PhotoBrief intake funnel."
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
          title="Watch a brief assemble itself."
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
          title="A program, not a launch list."
          subtitle={`Twenty-five small businesses. Sixty days of close work. Founding pricing forever.`}
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

function ApplySection({ showAgent }: { showAgent: boolean }) {
  return (
    <Section id="apply" tone="alt">
      <Container>
        <SectionIntro
          eyebrow="[ 08 ] Apply"
          title="Six minutes with the onboarding agent."
          subtitle="Tell us about the work. We'll tell you within 48 hours if there's a founding seat with your name on it."
        />
        <div className="border border-border bg-background p-2 sm:p-4">
          <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
            <BetaOnboardingAgentExperience autoStart={showAgent} />
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
            <p className="ls-eyebrow">[ 10 ] One last thing</p>
            <RiseIn>
              <h2 className="ls-h1 mt-6">
                Ready to{" "}
                <span className="ls-italic-accent">replace the chase</span>?
              </h2>
            </RiseIn>
            <RiseIn delay={0.1}>
              <Body size="lg">
                {isFull
                  ? "Founding seats are full. Join the waitlist and we'll reach out the moment a seat opens."
                  : `Twenty-five seats. Sixty days. Founding pricing for the lifetime of your account.`}
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
      <p className="ls-eyebrow">{isFull ? "Waitlist" : "30-second application"}</p>
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
