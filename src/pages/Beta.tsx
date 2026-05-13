import { lazy, Suspense } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, Loader2, Clock3, HeartHandshake, MessageSquareText, Sparkles } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Section, Container, Card, Grid, Body, CTA, CTAGroup } from "@/design-system/schema";
import { SectionIntro } from "@/components/marketing/SectionIntro";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { PublicPhotoPair } from "@/components/marketing/PublicPhotoPair";
import { BetaSeatTracker } from "@/components/marketing/BetaSeatTracker";
import { BetaQuickApplyForm } from "@/components/marketing/BetaQuickApplyForm";
import { RiseIn } from "@/components/motion/RiseIn";
import { useBetaSeats } from "@/hooks/useBetaSeats";
import { BETA_DURATION_DAYS, BETA_TOTAL_PARTNERS, MAX_DISCOUNT_LABEL } from "@/config/betaProgram";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqItems } from "@/features/help/content/faq";

import betaAsyncSetup from "@/assets/beta/beta-async-setup.png";
import betaFeedbackThread from "@/assets/beta/beta-feedback-thread.png";

const BetaOnboardingAgentExperience = lazy(() =>
  import("@/components/marketing/BetaOnboardingAgentExperience").then((m) => ({
    default: m.BetaOnboardingAgentExperience,
  })),
);

const offers = [
  { icon: Clock3, label: `${BETA_DURATION_DAYS}-day beta access`, copy: "Run real customer leads through PhotoBrief. Before anyone else." },
  { icon: HeartHandshake, label: "White-glove route setup", copy: "We read your site. We build your routes. You take live traffic on day one." },
  { icon: MessageSquareText, label: "Direct line to the team", copy: "Chat. Email. In-app. Your feedback hits the roadmap." },
  { icon: Sparkles, label: "Lifetime founding pricing", copy: MAX_DISCOUNT_LABEL },
];

export default function BetaPage() {
  const { isFull } = useBetaSeats();
  const betaFaqs = faqItems.filter((f) => f.audience === "business").slice(0, 6);

  return (
    <>
      <PageMeta
        title="Founding Partner Beta | PhotoBrief"
        description={`${BETA_TOTAL_PARTNERS} seats. ${BETA_DURATION_DAYS} days. We build your routes. You lock in founding pricing for life.`}
        canonicalPath="/beta"
      />

      <Section>
        <Container width="narrow">
          <div className="text-center">
            <p className="ls-eyebrow">[ Founding Partners ]</p>
            <RiseIn>
              <h1 className="ls-h2 mt-6">
                {BETA_TOTAL_PARTNERS} seats. {BETA_DURATION_DAYS} days.
                <br />Founding pricing<span className="ls-accent-dot"> </span>forever.
              </h1>
            </RiseIn>
            <RiseIn delay={0.1}>
              <p className="ls-subtitle mx-auto mt-8 max-w-2xl">
                Not a waitlist. A {BETA_TOTAL_PARTNERS}-seat room. We build your routes from your site. You run real leads. Top two never pay for Pro again.
              </p>
            </RiseIn>
            <CTAGroup align="center">
              <CTA href="#agent" variant="primary" size="lg">
                {isFull ? "Join the waitlist" : "Take a seat"}
              </CTA>
              <CTA href="/demo" variant="secondary" size="lg">
                See it live
              </CTA>
            </CTAGroup>
          </div>
          <div className="mt-12">
            <BetaSeatTracker />
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <SectionIntro
            eyebrow="[ What you get ]"
            title="Routes from your site. Direct line. Pricing for life."
            subtitle="Help us shape the product. Walk away with pricing nobody else can buy."
          />
          <Grid cols={4} gap="md">
            {offers.map((o, i) => (
              <RiseIn key={o.label} delay={i * 0.05}>
                <Card>
                  <o.icon className="h-6 w-6 text-[hsl(var(--accent-kinetic))]" />
                  <h3 className="ls-h3 mt-4">{o.label}</h3>
                  <Body size="sm">{o.copy}</Body>
                </Card>
              </RiseIn>
            ))}
          </Grid>

          <PublicPhotoPair
            className="mt-10"
            items={[
              {
                src: betaAsyncSetup,
                alt: "Founding partner at a laptop sketching intake routes in a notebook while typing a setup note — no video call, async by design.",
                caption: "Setup happens over chat and email. We read your site. We draft your routes. You review on your time.",
              },
              {
                src: betaFeedbackThread,
                alt: "Editorial close-up of a laptop screen showing a feedback thread with two grey partner messages and one amber PhotoBrief reply.",
                caption: "Feedback stays async. Close to the product. You ask. We ship. The thread proves it.",
              },
            ]}
          />
        </Container>
      </Section>

      <Section id="agent">
        <Container>
          <SectionIntro
            eyebrow="[ Apply ]"
            title="Six minutes with the agent."
            subtitle="Tell us about the work. Tell us about the site. If a seat has your name on it, we reply in 48 hours."
          />
          <div className="border border-border bg-background p-2 sm:p-4">
            <Suspense fallback={<div className="flex h-96 items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>}>
              <BetaOnboardingAgentExperience />
            </Suspense>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container width="narrow">
          <SectionIntro
            eyebrow="[ Quick apply ]"
            title="Short on time? Drop your details."
            subtitle="We'll reach out. Finish it by email."
          />
          <BetaQuickApplyForm isFull={isFull} source="beta-page-quick-apply" agentAnchor="#agent" />
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <SectionIntro eyebrow="[ FAQ ]" title="The stuff everyone asks first." />
          <Accordion type="single" collapsible className="mt-10 border-t border-border">
            {betaFaqs.map((item, i) => (
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
          <p className="mt-8 text-center text-sm text-muted-foreground">
            More questions? <NavLink to="/help" className="text-foreground underline-offset-4 hover:underline">Read the full help center →</NavLink>
          </p>
        </Container>
      </Section>

      <FinalCtaSection
        eyebrow="Take the seat"
        title="Ready to ditch the form"
        punctuation="?"
        primary={{
          href: "#agent",
          label: (
            <>
              {isFull ? "Join the waitlist" : "Take a seat"} <ArrowRight className="h-4 w-4" />
            </>
          ),
        }}
        secondary={{ href: "/pricing", label: "See pricing" }}
      />
    </>
  );
}
