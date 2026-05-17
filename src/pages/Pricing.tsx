import { useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PricingCardGrid } from "@/components/pricing/PricingCardGrid";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { faqItems } from "@/features/help/content/faq";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import type { Plan } from "@/types/photobrief";

import { Button } from "@/components/ui/button";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, Container } from "@/design-system/schema";

const LOGGED_IN_PRICE_ID: Record<string, string> = {
  intake: "intake_monthly",
  intake_team: "intake_team_monthly",
};

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
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Product",
            name: "PhotoBrief Smart Intake",
            description: "Smart Intake replaces dumb website contact forms with a guided intake that produces quote-ready briefs.",
            brand: { "@type": "Brand", name: "PhotoBrief" },
            offers: [
              {
                "@type": "Offer",
                name: "Smart Intake",
                price: "79",
                priceCurrency: "USD",
                priceSpecification: { "@type": "UnitPriceSpecification", price: "79", priceCurrency: "USD", billingIncrement: 1, unitCode: "MON" },
                url: "https://photobrief.ai/pricing",
              },
              {
                "@type": "Offer",
                name: "Smart Intake Team",
                price: "199",
                priceCurrency: "USD",
                priceSpecification: { "@type": "UnitPriceSpecification", price: "199", priceCurrency: "USD", billingIncrement: 1, unitCode: "MON" },
                url: "https://photobrief.ai/pricing",
              },
            ],
          },
          buildFaqJsonLd(businessFaqs),
        ]}
      />

      {/* Hero */}
      <Section>
        <Container width="narrow">
          <div className="text-center">
            <p className="ls-eyebrow">Pricing</p>
            <h1 className="mx-auto mt-5 max-w-3xl text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              One flat price. Every brief, every route, every seat.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Start a 14-day free trial. No credit card. Upgrade, downgrade, or cancel anytime.
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

      {/* Pricing cards */}
      <Section>
        <Container width="narrow">
          <PricingCardGrid
            currentPlan={subscription?.plan_tier}
            onSelectPlan={handleSelectPlan}
          />
        </Container>
      </Section>

      {/* FAQ */}
      <Section tone="alt">
        <Container width="narrow">
          <h2 className="text-center text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight text-foreground">
            Pricing questions
          </h2>
          <Accordion type="single" collapsible className="mt-8 border border-border bg-card px-4 sm:px-6">
            {businessFaqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-border">
                <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>
    </>
  );
}
