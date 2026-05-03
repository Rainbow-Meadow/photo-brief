import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, Camera, HardDrive, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PricingCardGrid } from "@/components/pricing/PricingCardGrid";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { buildFaqJsonLd } from "@/hooks/seo/buildFaqJsonLd";
import { faqItems } from "@/features/help/content/faq";

import { Button } from "@/components/ui/button";
import { signupCtaTarget, signupCtaLabel } from "@/config/access";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const pricingAxes = [
  { icon: Camera, label: "Photos", copy: "Plans scale by submitted customer photos. Simple jobs stay simple; bigger jobs use more photos." },
  { icon: BadgeCheck, label: "Branding", copy: "Choose your customer-facing brand level and whether PhotoBrief branding appears." },
  { icon: HardDrive, label: "Storage term", copy: "Keep customer media for the window that matches how your business reviews work." },
  { icon: Users, label: "Team size", copy: "Add the people who need to review, assign, and manage finished briefs." },
];

export default function PricingPage() {
  const businessFaqs = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const jsonLd = useMemo(() => [buildFaqJsonLd(businessFaqs)], [businessFaqs]);

  return (
    <>
      <PageMeta
        title="Pricing | PhotoBrief"
        description="PhotoBrief pricing based on monthly customer photos, customer branding, PhotoBrief branding, storage term, and team size. First-pass follow-up photos are free."
        canonicalPath="/pricing"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]}
      />
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-ambient-future" />
        <div aria-hidden className="future-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 animate-lift-in">
          <p className="text-eyebrow">Pricing</p>
          <h1 className="text-display mt-3 text-foreground">Priced for real customer photos.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-xl">
            PhotoBrief pricing follows how small-business intake actually works: number of photos, branding, storage, and team size.
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full glass px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" /> First-pass follow-up photos do not consume credits.
          </p>
        </div>
      </section>

      <section className="relative px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {pricingAxes.map((axis) => {
            const Icon = axis.icon;
            return (
              <div key={axis.label} className="glass-strong magnetic-card rounded-[1.75rem] p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground">{axis.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{axis.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative px-4 pb-16 pt-4 sm:px-6 lg:px-8 lg:pb-20">
        <PricingCardGrid />
      </section>

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-60" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-eyebrow">FAQ</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Questions, answered.
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-8 glass-strong rounded-2xl px-4 sm:px-6">
            {businessFaqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="glass-strong magnetic-card mt-12 flex flex-col items-center gap-3 rounded-[2rem] p-8 text-center shadow-glass-lg">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="text-base font-semibold text-foreground">Build the intake system before the lead volume hits.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Start with one template and one website intake link. Then scale the photo volume when the workflow proves itself.
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
