import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, HardDrive, Image, ShieldCheck, Users } from "lucide-react";
import { PricingCardGrid } from "@/components/pricing/PricingCardGrid";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { faqItems } from "@/features/help/content/faq";

import { Button } from "@/components/ui/button";
import { signupCtaTarget, signupCtaLabel } from "@/config/access";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const pricingAxes = [
  { icon: Image, label: "Photos", copy: "Plans scale by submitted customer photos, not confusing request math." },
  { icon: BadgeCheck, label: "Branding", copy: "Choose how much of your brand — and PhotoBrief's — customers see." },
  { icon: HardDrive, label: "Storage", copy: "Pick the media retention window that fits your workflow." },
  { icon: Users, label: "Team size", copy: "Pay for the number of people who need to review and manage requests." },
];

export default function PricingPage() {
  // Pricing-page FAQ = the business subset of the canonical FAQ source.
  // No hardcoded duplicates; FAQPage JSON-LD is built from this same array.
  const businessFaqs = useMemo(
    () => faqItems.filter((f) => f.audience === "business"),
    [],
  );
  const jsonLd = useMemo(() => [buildFaqJsonLd(businessFaqs)], [businessFaqs]);

  return (
    <>
      <PageMeta
        title="Pricing | PhotoBrief"
        description="PhotoBrief pricing based on monthly customer photos, branding, storage term, and team size. Follow-up photos requested by PhotoBrief are free."
        canonicalPath="/pricing"
        jsonLd={jsonLd}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ]}
      />
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-ambient-sky" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-ambient-mesh opacity-60" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 animate-lift-in">
          <p className="text-eyebrow">Pricing</p>
          <h1 className="text-display mt-3 text-foreground">Pricing that follows the real work</h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Choose by monthly photos, branding, storage term, and team size. Simple requests stay simple;
            bigger jobs just use more photos.
          </p>
          <p className="mt-2 text-sm text-primary">
            First-pass guarantee included: follow-up photos requested by PhotoBrief do not consume credits.
          </p>
        </div>
      </section>

      <section className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pricingAxes.map((axis) => {
            const Icon = axis.icon;
            return (
              <div key={axis.label} className="rounded-2xl border bg-card p-4 shadow-elev-sm">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm font-semibold text-foreground">{axis.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{axis.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-20">
        <PricingCardGrid />
      </section>

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-mesh opacity-50" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-foreground">
            Questions, answered.
          </h2>
          <Accordion type="single" collapsible className="mt-8 glass-strong rounded-2xl px-4 sm:px-6">
            {businessFaqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="glass-strong mt-12 flex flex-col items-center gap-3 rounded-3xl p-8 text-center shadow-glass-lg">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <p className="text-base font-semibold text-foreground">
              30-day money-back guarantee
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              If PhotoBrief isn't a fit in your first month, email us and we'll refund you.
            </p>
            <Button asChild size="xl" className="mt-2 rounded-full">
              <NavLink to={signupCtaTarget()}>
                {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
