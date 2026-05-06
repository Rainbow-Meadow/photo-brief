import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Focus,
  ImagePlus,
  MailCheck,
  MessageSquareWarning,
  Shield,
  Sparkles,
  TimerReset,
  Zap,
} from "lucide-react";

import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/components/layout/BrandMark";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { conversions, trackEvent } from "@/lib/analytics";

/* ── Form state ─────────────────────────────────────────── */

const BUSINESS_TYPES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "General contractor",
  "Junk removal / hauling",
  "Pest control",
  "Insurance / claims",
  "Property management",
  "Landscaping",
  "Appliance repair",
  "Other home services",
  "Other",
];

interface FormState {
  name: string;
  business_name: string;
  email: string;
  business_type: string;
  website: string;
  use_case: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  business_name: "",
  email: "",
  business_type: "",
  website: "",
  use_case: "",
  notes: "",
};

/* ── Use cases ──────────────────────────────────────────── */

const useCases = [
  { icon: Camera, label: "Before-quote photos", desc: "Get the right shots before you price the job." },
  { icon: Focus, label: "Inspection documentation", desc: "Guided photo capture for field inspections." },
  { icon: ImagePlus, label: "Service follow-ups", desc: "Collect completion photos from crews or customers." },
  { icon: Zap, label: "Claims & approvals", desc: "Photo evidence packages for insurance or review." },
];

/* ── Old way vs PhotoBrief ──────────────────────────────── */

const comparisonRows = [
  { old: "\"Can you send me some photos?\"", pb: "Guided link with exactly what to shoot" },
  { old: "Blurry, wrong-angle photos over text", pb: "AI-checked brief with quality scores" },
  { old: "Chase 3-4 times for missing shots", pb: "One submission, one clean brief" },
  { old: "Photos scattered across texts & email", pb: "Organized brief in your dashboard" },
  { old: "Manual follow-up per customer", pb: "Automated links, reminders, intake" },
];

/* ── Partner benefits ───────────────────────────────────── */

const partnerBenefits = [
  "90 days free beta access",
  "Concierge setup — we build your first templates",
  "Biweekly feedback sessions with the team",
  "50% off your first year after launch",
  "Founding Partner recognition (optional)",
];

/* ── Main component ─────────────────────────────────────── */

export default function BetaListPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"new" | "already" | null>(null);

  useEffect(() => {
    trackEvent("betalist_page_viewed");
  }, []);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function validate(): string | null {
    if (!form.name.trim()) return "Please share your name.";
    if (!form.email.trim()) return "We need a work email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "That email doesn't look right.";
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
      const { data, error } = await supabase.functions.invoke("waitlist-submit", {
        body: {
          ...form,
          email: form.email.trim().toLowerCase(),
          notes: form.notes ? `${form.notes}\n\nsource=betalist` : "source=betalist",
          source: "betalist",
        },
      });
      if (error) throw error;
      const payload = data as { ok?: boolean; already?: boolean } | null;
      if (payload?.already) {
        trackEvent("betalist_duplicate");
        setDone("already");
      } else {
        trackEvent("betalist_submitted", { business_type: form.business_type || undefined });
        conversions.waitlistSubmitted({ interest: "betalist", business_type: form.business_type || undefined });
        setDone("new");
      }
    } catch (e) {
      toast({
        title: "Something went wrong",
        description: (e as Error).message ?? "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--pb-night))] text-white">
      <SEOHead
        title="PhotoBrief.ai — Stop chasing customer photos"
        description="Send one guided PhotoBrief link and get a clean, AI-checked photo brief back. Apply for the Founding Partner Beta."
        canonicalPath="/betalist"
      />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-[hsl(var(--pb-violet)/0.12)] blur-[120px]" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <BrandMark variant="stacked" tone="light" size={80} eager withGlow />
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--pb-violet)/0.35)] bg-[hsl(var(--pb-violet)/0.08)] px-3.5 py-1.5 text-xs font-medium tracking-wide text-[hsl(var(--pb-lavender))] uppercase">
            <Sparkles className="h-3 w-3" /> Founding Partner Beta
          </p>

          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Stop chasing customer photos.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-[hsl(var(--pb-muted))] sm:text-xl">
            Send one guided PhotoBrief link and get a clean, AI-checked brief back.
          </p>

          <p className="mx-auto mt-3 max-w-lg text-sm text-[hsl(var(--pb-muted)/0.7)]">
            For teams that need the right photos before they quote, dispatch, approve, review, document, or follow up.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="pb-primary"
              size="xl"
              onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
            >
              Apply for Founding Partner Beta <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="pb-ghost"
              size="lg"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — product workflow ───────────────── */}
      <section id="how-it-works" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-[hsl(var(--pb-violet))]">How it works</p>
          <h2 className="mt-3 text-center text-2xl font-semibold sm:text-3xl">Three steps. One clean brief.</h2>

          <div className="mt-12 grid gap-6">
            {[
              { step: "1", title: "Create a guided request", desc: "Pick a template or describe what you need. PhotoBrief generates a step-by-step photo guide tailored to the job." },
              { step: "2", title: "Send the link", desc: "Your customer opens the link on their phone — no app, no login. They follow the guided steps to capture every required shot." },
              { step: "3", title: "Get an AI-checked brief", desc: "Photos are scored for quality and completeness. You get a clean, organized brief in your dashboard — ready for quoting, dispatch, or approval." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 rounded-2xl border border-[hsl(var(--pb-line)/0.5)] bg-[hsl(var(--pb-panel)/0.6)] p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--pb-violet)/0.15)] text-sm font-bold text-[hsl(var(--pb-violet))]">
                  {s.step}
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--pb-muted))]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-[hsl(var(--pb-violet))]">Use cases</p>
          <h2 className="mt-3 text-center text-2xl font-semibold sm:text-3xl">
            Built for real service workflows
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {useCases.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-2xl border border-[hsl(var(--pb-line)/0.4)] bg-[hsl(var(--pb-ink)/0.6)] p-5">
                <Icon className="h-5 w-5 text-[hsl(var(--pb-lavender))]" />
                <p className="mt-3 font-semibold">{label}</p>
                <p className="mt-1 text-sm text-[hsl(var(--pb-muted))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OLD WAY VS PHOTOBRIEF ─────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">The old way vs. PhotoBrief</h2>
          <div className="mt-10 overflow-hidden rounded-2xl border border-[hsl(var(--pb-line)/0.4)]">
            {/* Header */}
            <div className="grid grid-cols-2 border-b border-[hsl(var(--pb-line)/0.4)] bg-[hsl(var(--pb-panel)/0.8)]">
              <div className="p-3 text-center text-xs font-semibold uppercase tracking-wider text-[hsl(var(--pb-muted))]">
                <MessageSquareWarning className="mx-auto mb-1 h-4 w-4 text-red-400/60" /> Today
              </div>
              <div className="border-l border-[hsl(var(--pb-line)/0.4)] p-3 text-center text-xs font-semibold uppercase tracking-wider text-[hsl(var(--pb-lavender))]">
                <CheckCircle2 className="mx-auto mb-1 h-4 w-4" /> PhotoBrief
              </div>
            </div>
            {comparisonRows.map(({ old, pb }, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 ${i < comparisonRows.length - 1 ? "border-b border-[hsl(var(--pb-line)/0.25)]" : ""}`}
              >
                <div className="p-3.5 text-sm text-[hsl(var(--pb-muted)/0.7)]">{old}</div>
                <div className="border-l border-[hsl(var(--pb-line)/0.25)] p-3.5 text-sm text-white/90">{pb}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOUNDING PARTNER BETA OFFER ───────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[hsl(var(--pb-violet)/0.3)] bg-[hsl(var(--pb-violet)/0.06)] p-6 sm:p-8">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-[hsl(var(--pb-violet))]">
            <Sparkles className="h-3 w-3" /> Limited spots
          </p>
          <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Founding Partner Beta</h2>
          <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--pb-muted))]">
            We're inviting a small group of service businesses to shape PhotoBrief before public launch. In exchange for real-world usage and honest feedback, founding partners get:
          </p>
          <div className="mt-5 grid gap-2.5">
            {partnerBenefits.map((b) => (
              <div key={b} className="flex items-start gap-2.5 text-sm">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" />
                <span className="text-white/90">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ──────────────────────────────── */}
      <section id="apply" className="scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Apply for beta access</h2>
          <p className="mt-2 text-center text-sm text-[hsl(var(--pb-muted))]">
            Limited spots. We typically reply within a few days.
          </p>

          {done === "new" && (
            <div className="mt-8 rounded-2xl border border-[hsl(var(--pb-line)/0.5)] bg-[hsl(var(--pb-panel)/0.6)] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Application received</h3>
              <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">
                Thanks — we'll review your request and reach out if PhotoBrief is a fit.
              </p>
            </div>
          )}

          {done === "already" && (
            <div className="mt-8 rounded-2xl border border-[hsl(var(--pb-line)/0.5)] bg-[hsl(var(--pb-panel)/0.6)] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]">
                <MailCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">You already applied</h3>
              <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">
                We've got your details. We'll reach out as soon as a spot opens.
              </p>
            </div>
          )}

          {done === null && (
            <form onSubmit={onSubmit} className="mt-8 grid gap-5 rounded-2xl border border-[hsl(var(--pb-line)/0.5)] bg-[hsl(var(--pb-panel)/0.6)] p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="bl-name" label="Your name" required>
                  <Input id="bl-name" value={form.name} onChange={update("name")} autoComplete="name" required className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <Field id="bl-biz" label="Business name">
                  <Input id="bl-biz" value={form.business_name} onChange={update("business_name")} autoComplete="organization" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
              </div>
              <Field id="bl-email" label="Work email" required>
                <Input id="bl-email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="bl-type" label="Business type">
                  <select
                    id="bl-type"
                    value={form.business_type}
                    onChange={update("business_type")}
                    className="flex h-11 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]"
                  >
                    <option value="" className="bg-[hsl(var(--pb-ink))]">Select…</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-[hsl(var(--pb-ink))]">{t}</option>
                    ))}
                  </select>
                </Field>
                <Field id="bl-web" label="Website">
                  <Input id="bl-web" value={form.website} onChange={update("website")} placeholder="https://" autoComplete="url" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
              </div>
              <Field id="bl-usecase" label="What workflow would you use PhotoBrief for?">
                <Textarea id="bl-usecase" value={form.use_case} onChange={update("use_case")} rows={3} placeholder="e.g. Getting roof damage photos before we send a quote." className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
              </Field>
              <Button type="submit" size="lg" disabled={submitting} variant="pb-primary" className="w-full">
                {submitting ? "Submitting…" : "Apply for Founding Partner Beta"}
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* ── TRUST / PRIVACY ───────────────────────────────── */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-3">
          {[
            { icon: Shield, title: "Your data stays yours", desc: "Photos and briefs are never shared or used for training." },
            { icon: TimerReset, title: "Cancel anytime", desc: "No contracts. Beta partners can opt out at any time." },
            { icon: BadgeCheck, title: "SOC 2-ready infra", desc: "Built on enterprise-grade cloud infrastructure." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[hsl(var(--pb-line)/0.3)] bg-[hsl(var(--pb-panel)/0.4)] p-4 text-center">
              <Icon className="mx-auto h-5 w-5 text-[hsl(var(--pb-muted))]" />
              <p className="mt-2 text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs text-[hsl(var(--pb-muted))]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to stop chasing photos?</h2>
          <p className="mt-3 text-sm text-[hsl(var(--pb-muted))]">
            Join the founding partner beta and be one of the first to turn messy photo requests into clean, AI-checked briefs.
          </p>
          <Button
            variant="pb-primary"
            size="xl"
            className="mt-6"
            onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
          >
            Apply for Founding Partner Beta <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <p className="mt-6 text-xs text-[hsl(var(--pb-muted)/0.6)]">
            Already have an account?{" "}
            <NavLink to="/auth" className="text-[hsl(var(--pb-lavender))] hover:underline">
              Sign in
            </NavLink>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--pb-line)/0.2)] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center text-xs text-[hsl(var(--pb-muted)/0.5)]">
          <BrandMark variant="inline" tone="light" size={28} />
          <p>© {new Date().getFullYear()} PhotoBrief.ai · <NavLink to="/privacy" className="hover:text-white/60">Privacy</NavLink> · <NavLink to="/terms" className="hover:text-white/60">Terms</NavLink></p>
        </div>
      </footer>
    </div>
  );
}

/* ── Field helper ───────────────────────────────────────── */

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 inline-block text-white/80">
        {label}
        {required && <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>}
      </Label>
      {children}
    </div>
  );
}
