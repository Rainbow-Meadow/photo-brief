import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Globe2,
  HeartHandshake,
  Link2,
  MessageSquareText,
  Sparkles,
  Star,
  WandSparkles,
  ShieldCheck,
  CreditCard,
  Smartphone,
} from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InteractiveHeroBriefAssembly } from "@/components/marketing/InteractiveHeroBriefAssembly";
import { ComparisonTable } from "@/components/marketing/ComparisonTable";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

/* ── constants ──────────────────────────────────────────── */

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhotoBrief.ai",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PhotoBrief.ai helps businesses replace photo-chasing email threads with guided customer photo requests, AI quality checks, and organized business-ready briefs.",
  url: "https://photobrief.ai/founding-partner-beta",
};

const workflowSteps = [
  { icon: Link2, number: "1", title: "Request", body: "Pick a template and send one guided link to your customer." },
  { icon: Camera, number: "2", title: "Capture", body: "Customers see one clear photo prompt at a time — no app, no login." },
  { icon: Sparkles, number: "3", title: "Check", body: "Simple AI flags obvious issues before the customer finishes." },
  { icon: ClipboardList, number: "4", title: "Brief", body: "Your team gets a clean brief with photos, answers, and a summary." },
];

const useCases = [
  { title: "Quotes & estimates", body: "See the job before sending a crew or pricing a project." },
  { title: "Dispatch & scheduling", body: "Know what tools, parts, or crew to send before arriving." },
  { title: "Inspections & documentation", body: "Collect structured photo evidence for compliance and records." },
  { title: "Returns & warranty claims", body: "Get clear photos of damage or defects before approving a return." },
  { title: "Approvals & sign-offs", body: "Share visual proof of completed work for customer sign-off." },
  { title: "Follow-ups & reviews", body: "Request progress photos without another phone call or visit." },
];

const betaBenefits = [
  { icon: Clock3, title: "90 days of free beta access", body: "Enough time to use PhotoBrief in actual business workflows." },
  { icon: HeartHandshake, title: "Concierge onboarding", body: "Hands-on help creating first briefs, templates, and team process." },
  { icon: MessageSquareText, title: "Priority support", body: "A human support path for questions, workflow fit, and setup help." },
  { icon: Sparkles, title: "Feature influence", body: "Your feedback helps decide what gets built before public launch." },
  { icon: BadgeCheck, title: "50% off first year", body: "Founding partners get launch-year savings locked in." },
  { icon: Star, title: "Founding Partner recognition", body: "Optional listing as an early adopter and product shaper." },
  { icon: WandSparkles, title: "Early access to new tools", body: "See new capture, routing, AI, and review features first." },
];

const trustPoints = [
  { icon: Smartphone, text: "No app download required — customers use any mobile browser" },
  { icon: CreditCard, text: "No credit card needed — the beta is completely free" },
  { icon: ShieldCheck, text: "Your data stays private and is never shared with third parties" },
];

/* ── form state ─────────────────────────────────────────── */

interface FormState {
  email: string;
  name: string;
  business_name: string;
  photo_use_case: string;
}

const EMPTY: FormState = { email: "", name: "", business_name: "", photo_use_case: "" };

const inputClass = "h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30";
const textareaClass = "border-white/12 bg-white/[0.05] text-white placeholder:text-white/30";

/* ── component ──────────────────────────────────────────── */

export default function BetaPortfolioPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function validate(): string | null {
    if (!form.email.trim()) return "We need your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "That email doesn't look right.";
    if (!form.business_name.trim()) return "Please enter your business name.";
    if (!form.photo_use_case.trim()) return "Tell us what you need customer photos for.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Please check the form", description: err, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("beta-welcome-submit", {
        body: {
          email: form.email.trim().toLowerCase(),
          name: form.name.trim() || undefined,
          business_name: form.business_name.trim(),
          photo_use_case: form.photo_use_case.trim(),
        },
      });
      if (error) throw error;
      trackEvent("beta_application_submitted", { business_name: form.business_name });
      setDone(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email hello@photobrief.ai.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        title="Founding Partner Beta — PhotoBrief.ai"
        description="Stop chasing customer photos. Apply to PhotoBrief.ai's founding partner beta and get guided photo requests, AI quality checks, and business-ready briefs."
        canonicalPath="/founding-partner-beta"
        jsonLd={[jsonLd]}
        breadcrumbs={[{ name: "Founding Partner Beta", path: "/founding-partner-beta" }]}
      />

      <main>
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[5.5rem] sm:-mt-[5rem] sm:pt-[6rem]">
          <div className="pb-lens-field" />
          <div className="pb-container pb-section relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-7 inline-flex max-w-full rounded-[2rem] border border-[hsl(var(--pb-lavender)/0.25)] bg-[hsl(var(--pb-panel)/0.78)] p-4 shadow-[0_16px_40px_-28px_hsl(var(--pb-shadow))] backdrop-blur-xl sm:p-5">
                <BrandMark variant="horizontal" tone="light" size={58} eager withGlow />
              </div>
              <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta</span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Stop chasing customer photos.
              </h1>
              <p className="pb-copy mt-6 max-w-2xl text-base sm:text-xl">
                Send one guided PhotoBrief link and get a clean, AI-checked brief back. For teams that need the right photos before they quote, dispatch, approve, review, document, or follow up.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="xl" variant="pb-primary">
                  <a href="#apply" onClick={() => trackEvent("cta_click", { location: "beta_hero", label: "apply_beta" })}>
                    Apply for Founding Partner Beta <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="xl" variant="pb-secondary">
                  <a href="#how-it-works" onClick={() => trackEvent("cta_click", { location: "beta_hero", label: "see_how" })}>
                    See how it works
                  </a>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <InteractiveHeroBriefAssembly />
            </div>
          </div>
        </section>

        {/* ── Mobile interactive demo ──────────────────────── */}
        <section className="pb-section lg:hidden">
          <div className="pb-container">
            <InteractiveHeroBriefAssembly />
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section id="how-it-works" className="pb-section scroll-mt-24">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">How it works</span>
              <h2 className="pb-section-title mt-4 text-white">One workflow. Four simple steps.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                PhotoBrief replaces scattered texts, emails, and voicemails with a single guided link.
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="pb-card rounded-[2rem] p-5">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(var(--pb-line-strong))] bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-lavender))]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">Step {step.number}</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[hsl(var(--pb-muted))]">{step.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Use cases ────────────────────────────────────── */}
        <section className="pb-section">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">Use cases</span>
              <h2 className="pb-section-title mt-4 text-white">Built for the workflows that need photos first.</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((uc) => (
                <article key={uc.title} className="pb-card rounded-[2rem] p-5">
                  <h3 className="text-base font-semibold text-white">{uc.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[hsl(var(--pb-muted))]">{uc.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison ───────────────────────────────────── */}
        <section className="pb-section">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">Why PhotoBrief</span>
              <h2 className="pb-section-title mt-4 text-white">The old way vs. the PhotoBrief way.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                Email threads, generic forms, and file upload portals were never designed for guided photo intake.
              </p>
            </div>
            <div className="mt-10">
              <ComparisonTable />
            </div>
          </div>
        </section>

        {/* ── Beta offer ───────────────────────────────────── */}
        <section className="pb-section">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">Founding Partner Beta</span>
              <h2 className="pb-section-title mt-4 text-white">Early access, real support, exclusive pricing.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                We're inviting a limited number of businesses to use PhotoBrief in real workflows and help shape the product before public launch.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {betaBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="pb-card rounded-[1.75rem] p-5">
                    <Icon className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
                    <h3 className="mt-4 text-base font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[hsl(var(--pb-muted))]">{benefit.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Application form ─────────────────────────────── */}
        <section id="apply" className="pb-section scroll-mt-24">
          <div className="pb-container-narrow">
            {done ? (
              <div className="relative overflow-hidden rounded-[2.4rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-8 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))] sm:p-12">
                <div className="pb-lens-field" />
                <div className="relative z-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)]">
                    <CheckCircle2 className="h-8 w-8 text-[hsl(var(--pb-mint))]" />
                  </div>
                  <h2 className="pb-section-title mt-6 text-white">Application received</h2>
                  <p className="pb-copy mt-4 max-w-md mx-auto">
                    We'll review your application and reach out within 48 hours to set up your founding partner account.
                  </p>
                </div>
              </div>
            ) : (
              <div className="pb-command-panel p-6 sm:p-10">
                <div className="relative z-10">
                  <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Apply now</span>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-4xl">Apply for the Founding Partner Beta</h2>
                  <p className="pb-copy mt-3 max-w-xl">
                    Tell us about your business and how you collect customer photos today. Takes about 60 seconds.
                  </p>

                  <form onSubmit={onSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium text-white/80">Your name</Label>
                      <Input id="name" value={form.name} onChange={update("name")} placeholder="Jane Smith" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-white/80">
                        Work email <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>
                      </Label>
                      <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="jane@company.com" className={inputClass} required />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="business_name" className="text-sm font-medium text-white/80">
                        Business name <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>
                      </Label>
                      <Input id="business_name" value={form.business_name} onChange={update("business_name")} placeholder="Apex Roofing" className={inputClass} required />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="photo_use_case" className="text-sm font-medium text-white/80">
                        What do you need customer photos for? <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>
                      </Label>
                      <Textarea
                        id="photo_use_case"
                        value={form.photo_use_case}
                        onChange={update("photo_use_case")}
                        placeholder="e.g. We need roof damage photos before sending an estimator, but customers always send blurry or incomplete shots..."
                        rows={4}
                        className={textareaClass}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Button type="submit" size="xl" variant="pb-primary" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting…" : "Apply for Founding Partner Beta"}
                        {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Trust / privacy ──────────────────────────────── */}
        <section className="pb-section-tight">
          <div className="pb-container">
            <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-3">
              {trustPoints.map((tp) => {
                const Icon = tp.icon;
                return (
                  <div key={tp.text} className="flex items-start gap-3 rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-panel)/0.6)] p-4">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--pb-mint))]" />
                    <p className="text-sm leading-6 text-[hsl(var(--pb-muted))]">{tp.text}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-center text-xs text-white/40">
              By applying you agree to our{" "}
              <NavLink to="/terms" className="underline hover:text-white/60">Terms</NavLink> and{" "}
              <NavLink to="/privacy" className="underline hover:text-white/60">Privacy Policy</NavLink>.
            </p>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="pb-section">
          <div className="pb-container-narrow">
            <div className="relative overflow-hidden rounded-[2.4rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-8 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))] sm:p-12">
              <div className="pb-lens-field" />
              <div className="relative z-10">
                <BrandMark variant="horizontal" tone="light" size={52} className="justify-center" withGlow />
                <p className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                  Limited spots available.
                </p>
                <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">
                  We're inviting businesses willing to use PhotoBrief in real workflows and share honest feedback along the way.
                </p>
                <Button asChild size="xl" variant="pb-primary" className="mt-8">
                  <a href="#apply" onClick={() => trackEvent("cta_click", { location: "beta_final_cta", label: "apply_beta" })}>
                    Apply to join the beta <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
