import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Camera, Globe2, HardDrive, Link2, Sparkles, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { PricingCardGrid } from "@/components/pricing/PricingCardGrid";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { faqItems } from "@/features/help/content/faq";
import { PublicPhotoPair } from "@/components/marketing/PublicPhotoPair";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import type { Plan } from "@/types/photobrief";

import { Button } from "@/components/ui/button";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, Container, SectionHeader } from "@/design-system/schema";

import pricingCedarOwnerLaptop from "@/assets/pricing/pricing-cedar-owner-laptop.png";
import pricingMultiTradeFan from "@/assets/pricing/pricing-multi-trade-fan.png";

const LOGGED_IN_PRICE_ID: Record<string, string> = {
  intake: "intake_monthly",
  intake_team: "intake_team_monthly",
};

const pricingAxes = [
  { icon: Camera, label: "Photos", copy: "Plans scale by submitted customer photos. Routes that don't need photos don't burn credits." },
  { icon: BadgeCheck, label: "Branding", copy: "Pick the customer-facing brand level — and decide whether PhotoBrief shows up at all." },
  { icon: HardDrive, label: "Storage term", copy: "Keep customer media for the window your business actually reviews against." },
  { icon: Users, label: "Team size", copy: "Add the people who triage briefs, run quotes, and close jobs." },
];

const intakeModes = [
  {
    icon: Link2,
    title: "Smart Intake",
    label: "One guided intake link",
    copy: "Replace your form with one Smart Intake link. Send it however you already reach customers. Briefs land clean, photos only when they help.",
  },
  {
    icon: Globe2,
    title: "Smart Intake Team",
    label: "Multiple links. One inbox.",
    copy: "Run intake across sources, sites, and staff. Briefs queue in one team inbox your crew can quote, assign, and close — with notes, webhooks, and priority support.",
  },
];

export default function PricingPage() {
  const businessFaqs = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workspace } = useCurrentWorkspace();
  const { isPaid, subscription } = useSubscription(workspace?.id);
  const { openCheckout } = usePaddleCheckout();
  const canShowCheckout = !!user && !!workspace?.id && !isPaid;
  const handleSelectPlan = canShowCheckout
    ? async (planId: Plan) => {
        const priceId = LOGGED_IN_PRICE_ID[planId];
        if (!priceId) {
          navigate("/settings/billing");
          return;
        }
        try {
          await openCheckout({
            priceId,
            workspaceId: workspace!.id,
            customerEmail: user!.email ?? undefined,
            successUrl: `${window.location.origin}/settings/billing?checkout=success&from=checkout`,
          });
        } catch (e) {
          console.error(e);
          toast.error("Couldn't open checkout. Try again.");
        }
      }
    : undefined;

  return (
    <>
      <PageMeta
        title="Pricing | PhotoBrief"
        description="Simple, flat pricing for Smart Intake. Start a 14-day free trial — no credit card required."
        canonicalPath="/pricing"
        ogImage="https://photobrief.ai/og/pricing.png"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]}
      />

      {/* Hero */}
      <Section>
        <Container>
          <div className="text-center">
            <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
              <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Pricing</span>
            </p>
            <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              One flat price. Every brief, every route, every seat.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Start a 14-day free trial. No credit card. When you're ready, pick the plan that fits your crew — Smart Intake for solo operators, Smart Intake Team for everyone else.
            </p>
            <p className="mx-auto mt-5 inline-flex items-center gap-1.5 border border-[hsl(var(--accent-sage)/0.4)] bg-[hsl(var(--accent-sage)/0.08)] px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[hsl(var(--accent-sage))]">
              <ShieldCheck className="h-4 w-4" /> First-pass photo retakes don't burn credits.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="xl" className="rounded-[0.25rem] uppercase tracking-[0.14em]">
                <NavLink to="/auth?mode=signup">
                  Start my 14-day trial <ArrowRight className="ml-1 h-4 w-4" />
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
                alt: "Cedar & Sons owner reviewing a lead brief on a laptop.",
                caption: "Open the brief, read the route the customer matched, and quote — no second email needed.",
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

      {/* Pricing axes */}
      <Section size="tight">
        <Container>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pricingAxes.map((item, i) => {
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
            eyebrow="Plans"
            title="Pick the plan that fits your crew."
            description="Every plan starts with a 14-day free trial. Upgrade, downgrade, or cancel anytime."
          />
          <div className="mt-10">
            <PricingCardGrid
              currentPlan={subscription?.plan_tier}
              onSelectPlan={handleSelectPlan}
            />
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
              <p className="text-base font-semibold text-foreground">Stop chasing. Start closing.</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Spin up your first Smart Intake link in minutes. We'll read your site, build your routes, and hand you a link you can drop anywhere customers find you.
              </p>
              <Button asChild size="xl" className="mt-2 rounded-[0.25rem] uppercase tracking-[0.14em]">
                <NavLink to="/auth?mode=signup">
                  Start my 14-day trial <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
