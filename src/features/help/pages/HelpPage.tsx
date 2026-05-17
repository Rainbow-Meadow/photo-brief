import { useMemo } from "react";

import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { Section, Container, SectionHeader } from "@/design-system/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqItems } from "@/features/help/content/faq";

/**
 * Public help / FAQ page. Mounted at both `/help` (marketing) and `/app/help`.
 * Splits the FAQ into business and recipient buckets.
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

      <Section size="tight">
        <Container width="narrow">
          <p className="text-center text-sm text-muted-foreground">
            Still stuck? Email{" "}
            <a className="font-medium text-foreground underline-offset-4 hover:underline" href="mailto:hello@photobrief.ai">
              hello@photobrief.ai
            </a>
            .
          </p>
        </Container>
      </Section>
    </>
  );
}
