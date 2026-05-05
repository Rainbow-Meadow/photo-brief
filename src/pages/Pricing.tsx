import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, BadgeCheck, Camera, Clock3, Globe2, HardDrive, HeartHandshake, Link2, MessageSquareText, ShieldCheck, Sparkles, Users } from "lucide-react";
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

const intakeModes = [
  {
    icon: Link2,
    title: "Every plan",
    label: "Manual PhotoBrief links",
    copy: "Create a request, copy or send the clickable PhotoBrief link, and let the customer complete the mobile photo workflow.",
  },
  {
    icon: Globe2,
    title: "Pro and above",
    label: "Website Intake automation",
    copy: "Keep manual links, then add hosted intake, routing, and webhook automation for leads that should not wait on a copy-paste step.",
  },
];

const betaOffer = [
  { icon: Clock3, label: "90-day beta access", copy: "Use PhotoBrief in real customer workflows before public launch." },
  { icon: HeartHandshake, label: "Concierge setup", copy: "Get help building first templates, briefs, and team process." },
  { icon: MessageSquareText, label: "Direct influence", copy: "Your feedback helps shape what gets built next." },
  { icon: Sparkles, label: "50% off first year", copy: "Accepted partners get founding partner pricing after launch." },
];

export default function PricingPage() {
  const businessFaqs = useMemo(() => faqItems.filter((f) => f.audience === "business"), []);
  const jsonLd = useMemo(() => [buildFaqJsonLd(businessFaqs)], [businessFaqs]);

  return (
    <>
      <PageMeta
        title="Pricing | PhotoBrief.ai Founding Partner Beta"
        description="PhotoBrief.ai is accepting founding beta partners. Apply for 90-day beta access, concierge setup, direct support, and 50% off your first year after launch."
        canonicalPath="/pricing"
        jsonLd={jsonLd}
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[5.5rem] sm:-mt-[5rem] sm:pt-[6rem]">
        <div className="pb-lens-field" />
        <div className="pb-container pb-section text-center">
          <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta Pricing</span>
          <h1 className="pb-section-title mx-auto mt-4 max-w-3xl text-white">Apply now. Lock in launch-year savings if accepted.</h1>
          <p className="pb-copy mx-auto mt-5 max-w-2xl text-base sm:text-xl">
            PhotoBrief.ai is invite-only while we onboard founding partners. Accepted beta businesses get 90 days free, concierge setup, direct support, and 50% off their first year after launch.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--pb-mint)/0.4)] bg-[hsl(var(--pb-mint)/0.08)] px-3 py-1 text-sm font-medium text-[hsl(var(--pb-mint))]">
            <ShieldCheck className="h-4 w-4" /> First-pass follow-up photos do not consume credits.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="xl" className="rounded-full bg-[hsl(var(--pb-violet))] text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
              <NavLink to={signupCtaTarget()}>
                {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
              </NavLink>
            </Button>
            <Button asChild size="xl" variant="outline" className="rounded-full border-white/16 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white">
              <NavLink to="/founding-partner-beta">View beta program</NavLink>
            </Button>
          </div>
        </div>
      </section>

      {/* Beta offer cards */}
      <section className="pb-section-tight">
        <div className="pb-container grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {betaOffer.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="pb-card rounded-[1.75rem] p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[hsl(var(--pb-muted))]">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Intake modes */}
      <section className="pb-section-tight">
        <div className="pb-container grid gap-4 md:grid-cols-2">
          {intakeModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <article key={mode.title} className="pb-card rounded-[2rem] p-6">
                <span className="pb-eyebrow">
                  <Icon className="h-3.5 w-3.5" /> {mode.title}
                </span>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">{mode.label}</h2>
                <p className="pb-copy mt-2 text-sm leading-6">{mode.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-section">
        <div className="pb-container-narrow pb-8 text-center">
          <span className="pb-eyebrow">Public launch plans</span>
          <h2 className="pb-section-title mt-4 text-white">
            These are the planned tiers after beta.
          </h2>
          <p className="pb-copy mt-3 text-sm sm:text-base">
            During beta, pricing is handled through the Founding Partner program. Apply now if you want early access and launch-year savings.
          </p>
        </div>
        <PricingCardGrid />
      </section>

      {/* FAQ */}
      <section className="pb-section">
        <div className="pb-container-narrow">
          <div className="text-center">
            <span className="pb-eyebrow">FAQ</span>
            <h2 className="pb-section-title mt-4 text-white">
              Questions, answered.
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-8 pb-command-panel rounded-2xl px-4 sm:px-6">
            {businessFaqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-white/10">
                <AccordionTrigger className="text-left text-white/90">{f.q}</AccordionTrigger>
                <AccordionContent className="text-[hsl(var(--pb-muted))]">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="relative mt-12 overflow-hidden rounded-[2.4rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-8 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))]">
            <div className="pb-lens-field" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-[hsl(var(--pb-lavender))]" />
              <p className="text-base font-semibold text-white">Become a founding partner before public launch.</p>
              <p className="pb-copy max-w-md text-sm">
                Get early access, hands-on setup, feature influence, and first-year savings in exchange for using PhotoBrief in real workflows and sharing honest feedback.
              </p>
              <Button asChild size="xl" className="mt-2 rounded-full bg-[hsl(var(--pb-violet))] text-[hsl(var(--pb-night))] hover:bg-[hsl(var(--pb-lavender))]">
                <NavLink to={signupCtaTarget()}>
                  {signupCtaLabel()} <ArrowRight className="ml-1 h-4 w-4" />
                </NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
