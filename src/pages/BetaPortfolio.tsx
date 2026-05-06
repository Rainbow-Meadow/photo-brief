import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  HeartHandshake,
  Link2,
  Lock,
  MessageSquareText,
  Moon,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const messyPhotos = [
  { label: "Blurry", icon: Eye, rotation: -6, x: 8, y: 12 },
  { label: "Too dark", icon: Moon, rotation: 4, x: 52, y: 6 },
  { label: "Wrong angle", icon: ScanLine, rotation: -3, x: 28, y: 48 },
  { label: "Label unreadable", icon: AlertTriangle, rotation: 7, x: 62, y: 44 },
];

const briefSlots = [
  { label: "Front exterior", status: "Accepted", color: "mint" as const },
  { label: "Damage close-up", status: "Accepted", color: "mint" as const },
  { label: "Roof overview", status: "Needs retake", color: "amber" as const },
  { label: "Serial number", status: "Accepted", color: "mint" as const },
];

const workflowSteps = [
  { icon: Link2, number: "1", title: "Request", body: "Send one guided link to your customer." },
  { icon: Camera, number: "2", title: "Capture", body: "Mobile-first photo prompts — no app, no login." },
  { icon: Sparkles, number: "3", title: "Check", body: "AI flags blurry, dark, or incomplete shots." },
  { icon: ClipboardList, number: "4", title: "Brief", body: "Get an organized brief ready to act on." },
];

const useCases = [
  { title: "Quotes & estimates", body: "See the job before sending a crew or pricing a project." },
  { title: "Dispatch prep", body: "Know what tools, parts, or crew to send before arriving." },
  { title: "Approvals & sign-offs", body: "Share visual proof of completed work for customer sign-off." },
  { title: "Returns & warranty", body: "Get clear damage or defect photos before approving a return." },
  { title: "Documentation", body: "Collect structured photo evidence for compliance and records." },
  { title: "Review workflows", body: "Request progress photos without another phone call or visit." },
];

const betaBenefits = [
  { icon: Clock3, title: "60–90 days free access", body: "Enough time to use PhotoBrief in real workflows — not just poke around once." },
  { icon: HeartHandshake, title: "Concierge setup", body: "We build your first templates and configure your workspace together." },
  { icon: MessageSquareText, title: "Priority support", body: "A direct human support path for questions, workflow fit, and setup." },
  { icon: Sparkles, title: "Roadmap input", body: "Your feedback decides what gets built before public launch." },
  { icon: WandSparkles, title: "Early access", body: "See new capture, routing, AI, and review features before anyone else." },
  { icon: BadgeCheck, title: "50% off first year", body: "Founding partners lock in launch-year savings after beta ends." },
  { icon: Star, title: "Founding Partner recognition", body: "Optional listing as an early adopter who helped shape the product." },
];

const trustPoints = [
  { icon: ShieldCheck, title: "Private & secure", body: "Your data is never shared with third parties. All uploads use secure, expiring links." },
  { icon: Lock, title: "Business-owned requests", body: "Every request belongs to your workspace. You control access, retention, and export." },
  { icon: Camera, title: "No spammy customer experience", body: "Customers get one clear, branded link — no app download, no account creation, no marketing emails." },
];

const VOLUMES = ["Fewer than 10", "10–50", "51–200", "200+"];

/* ── form state ─────────────────────────────────────────── */

interface FormState {
  email: string;
  business_name: string;
  website: string;
  photo_use_case: string;
  monthly_volume: string;
}

const EMPTY: FormState = { email: "", business_name: "", website: "", photo_use_case: "", monthly_volume: "" };

const inputClass = "h-11 rounded-xl border-white/12 bg-white/[0.05] text-white placeholder:text-white/30 text-sm";
const textareaClass = "rounded-xl border-white/12 bg-white/[0.05] text-white placeholder:text-white/30 text-sm";
const selectClass = "flex h-11 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 text-sm text-white outline-none focus:ring-2 focus:ring-[hsl(var(--pb-lavender)/0.5)]";

/* ── component ──────────────────────────────────────────── */

export default function BetaPortfolioPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function validate(): string | null {
    if (!form.email.trim()) return "We need your work email.";
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
          business_name: form.business_name.trim(),
          website: form.website.trim() || undefined,
          photo_use_case: form.photo_use_case.trim(),
          monthly_volume: form.monthly_volume || undefined,
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

  /* ── confirmation panel ──────────────────────────────── */
  const confirmationPanel = (
    <div className="relative overflow-hidden rounded-[2rem] border border-[hsl(var(--pb-lavender)/0.35)] bg-[hsl(var(--pb-panel)/0.84)] p-8 text-center shadow-[0_36px_100px_-64px_hsl(var(--pb-violet))] sm:p-12">
      <div className="pb-lens-field" />
      <div className="relative z-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)]">
          <CheckCircle2 className="h-8 w-8 text-[hsl(var(--pb-mint))]" />
        </div>
        <h2 className="pb-section-title mt-6 text-white">Application received</h2>
        <p className="pb-copy mx-auto mt-4 max-w-md">
          We'll review your application and reach out within 48 hours to set up your founding partner account.
        </p>
      </div>
    </div>
  );

  /* ── form panel ──────────────────────────────────────── */
  const formPanel = (
    <div className="pb-command-panel rounded-[2rem] p-5 sm:p-8">
      <div className="relative z-10">
        <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Apply now</span>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-white sm:text-2xl">Apply for the Founding Partner Beta</h2>
        <p className="mt-2 text-sm leading-6 text-[hsl(var(--pb-muted))]">Takes about 60 seconds.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-white/80">
              Work email <span className="text-[hsl(var(--pb-lavender))]">*</span>
            </Label>
            <Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="jane@company.com" className={inputClass} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="business_name" className="text-xs font-medium text-white/80">
              Business name <span className="text-[hsl(var(--pb-lavender))]">*</span>
            </Label>
            <Input id="business_name" value={form.business_name} onChange={update("business_name")} placeholder="Apex Roofing" className={inputClass} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-xs font-medium text-white/80">Website</Label>
            <Input id="website" value={form.website} onChange={update("website")} placeholder="apexroofing.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monthly_volume" className="text-xs font-medium text-white/80">Monthly photo requests</Label>
            <select id="monthly_volume" value={form.monthly_volume} onChange={update("monthly_volume")} className={selectClass}>
              <option value="" className="bg-[hsl(var(--pb-ink))]">Select range</option>
              {VOLUMES.map((v) => <option key={v} value={v} className="bg-[hsl(var(--pb-ink))]">{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="photo_use_case" className="text-xs font-medium text-white/80">
              What do you need customer photos for? <span className="text-[hsl(var(--pb-lavender))]">*</span>
            </Label>
            <Textarea
              id="photo_use_case"
              value={form.photo_use_case}
              onChange={update("photo_use_case")}
              placeholder="e.g. We need roof damage photos before sending an estimator, but customers always send blurry or incomplete shots…"
              rows={3}
              className={textareaClass}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" variant="pb-primary" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Apply for Founding Partner Beta"}
              {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
            <p className="mt-3 text-center text-[11px] leading-4 text-white/35">
              No credit card required. By applying you agree to our{" "}
              <NavLink to="/terms" className="underline hover:text-white/55">Terms</NavLink> and{" "}
              <NavLink to="/privacy" className="underline hover:text-white/55">Privacy Policy</NavLink>.
            </p>
          </div>
        </form>
      </div>
    </div>
  );

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
        {/* ═══════════════════════════════════════════════════
            1. HERO — pain + mechanism + outcome + CTA + form
            ═══════════════════════════════════════════════════ */}
        <section className="relative isolate overflow-hidden -mt-[4.5rem] pt-[5.5rem] sm:-mt-[5rem] sm:pt-[6rem]">
          <div className="pb-lens-field" />
          <div className="pb-container relative z-10 pb-8 pt-6 sm:pb-14 sm:pt-10">
            {/* hero copy + visual */}
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="mb-6 inline-flex max-w-full rounded-[2rem] border border-[hsl(var(--pb-lavender)/0.25)] bg-[hsl(var(--pb-panel)/0.78)] p-4 shadow-[0_16px_40px_-28px_hsl(var(--pb-shadow))] backdrop-blur-xl">
                  <BrandMark variant="horizontal" tone="light" size={52} eager withGlow />
                </div>
                <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> Founding Partner Beta</span>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Stop chasing customer photos.
                </h1>
                <p className="pb-copy mt-5 max-w-xl text-base sm:text-lg">
                  Send one guided PhotoBrief link and get a clean, AI-checked brief back.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
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

              {/* hero visual — desktop */}
              <div className="hidden lg:block">
                <HeroTransformVisual />
              </div>
            </div>

            {/* form immediately after hero */}
            <div id="apply" className="mt-10 scroll-mt-24 lg:mt-14">
              {done ? confirmationPanel : formPanel}
            </div>
          </div>
        </section>

        {/* hero visual — mobile (below form) */}
        <section className="pb-section-tight lg:hidden">
          <div className="pb-container">
            <HeroTransformVisual />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            2. HOW IT WORKS — product visual
            ═══════════════════════════════════════════════════ */}
        <section id="how-it-works" className="pb-section scroll-mt-24">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">How it works</span>
              <h2 className="pb-section-title mt-4 text-white">One link. Guided photos. Organized brief.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                PhotoBrief replaces scattered texts, emails, and voicemails with a single guided workflow.
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

        {/* ═══════════════════════════════════════════════════
            3. USE CASES
            ═══════════════════════════════════════════════════ */}
        <section className="pb-section">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">Use cases</span>
              <h2 className="pb-section-title mt-4 text-white">Built for moments when photos decide the next step.</h2>
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

        {/* ═══════════════════════════════════════════════════
            4. OLD WAY vs PHOTOBRIEF WAY
            ═══════════════════════════════════════════════════ */}
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

        {/* ═══════════════════════════════════════════════════
            5. FOUNDING PARTNER BETA OFFER
            ═══════════════════════════════════════════════════ */}
        <section className="pb-section">
          <div className="pb-container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="pb-eyebrow">Founding Partner Beta</span>
              <h2 className="pb-section-title mt-4 text-white">Early access, real support, exclusive pricing.</h2>
              <p className="pb-copy mt-4 text-base sm:text-lg">
                Free access for 60–90 days, concierge setup, priority support, direct input on the roadmap, early access to future tools, and 50% off the first year after launch.
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

        {/* ═══════════════════════════════════════════════════
            6. REPEATED FORM (for users who scrolled past)
            ═══════════════════════════════════════════════════ */}
        <section className="pb-section">
          <div className="pb-container-narrow">
            {done ? confirmationPanel : formPanel}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            7. TRUST NOTES
            ═══════════════════════════════════════════════════ */}
        <section className="pb-section-tight">
          <div className="pb-container">
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
              {trustPoints.map((tp) => {
                const Icon = tp.icon;
                return (
                  <div key={tp.title} className="rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-panel)/0.6)] p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--pb-mint)/0.1)]">
                        <Icon className="h-4 w-4 text-[hsl(var(--pb-mint))]" />
                      </span>
                      <h3 className="text-sm font-semibold text-white">{tp.title}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[hsl(var(--pb-muted))]">{tp.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            8. FINAL CTA
            ═══════════════════════════════════════════════════ */}
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

/* ── Hero transform visual ──────────────────────────────── */

function HeroTransformVisual() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Messy side */}
      <div className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-red-400/80 text-center">What you get now</p>
        <div className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-4 min-h-[240px]">
          {messyPhotos.map((photo) => {
            const Icon = photo.icon;
            return (
              <div
                key={photo.label}
                className="absolute"
                style={{
                  left: `${photo.x}%`,
                  top: `${photo.y}%`,
                  transform: `rotate(${photo.rotation}deg)`,
                }}
              >
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2.5 shadow-lg backdrop-blur-sm">
                  <div className="h-10 w-14 rounded-lg bg-white/[0.04] sm:h-12 sm:w-16" />
                  <span className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-red-400/90">
                    <Icon className="h-3 w-3" />
                    {photo.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clean side */}
      <div className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-mint))] text-center">What PhotoBrief delivers</p>
        <div className="rounded-2xl border border-[hsl(var(--pb-lavender)/0.2)] bg-[hsl(var(--pb-panel)/0.5)] p-4 space-y-2.5">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
            <span className="text-xs font-semibold text-white">Organized Brief</span>
          </div>
          {briefSlots.map((slot) => (
            <div key={slot.label} className="flex items-center justify-between gap-2 rounded-xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-ink))] px-3 py-2.5">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
                <span className="text-xs font-medium text-white/80">{slot.label}</span>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                slot.color === "mint"
                  ? "bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]"
                  : "bg-amber-500/12 text-amber-400"
              }`}>
                {slot.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
