import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { Section, Container, SectionHeader } from "@/design-system/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqItems } from "@/features/help/content/faq";

/**
 * Public help / FAQ page. Mounted at both `/help` (marketing) and `/app/help`
 * (authenticated app). Splits the FAQ into business and recipient buckets and
 * surfaces a primary CTA back to the live demo.
 */
export default function HelpPage() {
  const business = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const recipient = useMemo(() => faqItems.filter((f) => f.audience === "recipient"), []);

  return (
    <>
      <PageMeta
        title="Help & FAQ | PhotoBrief"
        description="How PhotoBrief works, setup tips, photo policy, and the answers customers ask most."
        canonicalPath="/help"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Help", path: "/help" },
        ]}
        jsonLd={buildFaqJsonLd(faqItems)}
      />

      <Section>
        <Container width="narrow">
          <SectionHeader
            align="center"
            eyebrow="Help"
            title="The questions everyone asks first."
            description="Two short reads — one for business owners, one for the customer on the other end of the link."
          />
        </Container>
      </Section>

      <Section size="tight">
        <Container width="narrow">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">For business owners</h2>
          <Accordion type="single" collapsible className="mt-6 border border-border bg-card px-4 sm:px-6">
            {business.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-border">
                <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>

      <Section size="tight">
        <Container width="narrow">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">For customers receiving a link</h2>
          <Accordion type="single" collapsible className="mt-6 border border-border bg-card px-4 sm:px-6">
            {recipient.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-border">
                <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </Section>

      <Section>
        <Container width="narrow">
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-base font-semibold text-foreground">Still have questions?</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              Try the live demo on your own URL — the fastest way to see what PhotoBrief gives you.
            </p>
            <Button asChild size="xl" className="mt-5 rounded-[0.25rem] uppercase tracking-[0.14em]">
              <NavLink to="/demo">
                Try the live demo <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
