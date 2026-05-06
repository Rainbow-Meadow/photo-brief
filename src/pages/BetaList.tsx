import { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Focus,
  ImagePlus,
  Link2,
  Lock,
  MailCheck,
  MessageSquareWarning,
  PackageCheck,
  Shield,
  Smartphone,
  Sparkles,
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

/* ── constants ──────────────────────────────────────────── */

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

const VOLUMES = [
  "Under 25 / month",
  "25 – 100 / month",
  "100 – 500 / month",
  "500 – 2,000 / month",
  "2,000+ / month",
];

const useCases = [
  { icon: Camera, label: "Before-quote photos", desc: "Get the right shots before you price the job." },
  { icon: Focus, label: "Inspection documentation", desc: "Guided photo capture for field inspections." },
  { icon: ClipboardCheck, label: "Dispatch prep", desc: "Know what your crew needs before they roll." },
  { icon: ImagePlus, label: "Service follow-ups", desc: "Collect completion photos from crews or customers." },
  { icon: PackageCheck, label: "Returns & warranty", desc: "Structured damage photos for claims decisions." },
  { icon: FileCheck2, label: "Review & approvals", desc: "Photo evidence packages for sign-off workflows." },
];

const comparisonRows = [
  { old: "\"Can you send me some photos?\"", pb: "Guided link with exactly what to shoot" },
  { old: "Blurry, wrong-angle photos over text", pb: "AI-checked brief with quality scores" },
  { old: "Chase 3-4 times for missing shots", pb: "One submission, one clean brief" },
  { old: "Photos scattered across texts & email", pb: "Organized brief in your dashboard" },
  { old: "Manual follow-up per customer", pb: "Automated links, reminders, intake" },
];

const partnerBenefits = [
  "60–90 days free beta access",
  "Concierge setup — we build your first templates",
  "Biweekly feedback sessions with the team",
  "Early access to future tools",
  "50% off your first year after launch",
  "Founding Partner recognition (optional)",
];

const trustPoints = [
  { icon: Link2, title: "Secure, expiring upload links", desc: "Customers never see your dashboard or internal data." },
  { icon: Shield, title: "Business-owned requests", desc: "You control every brief and its data. Delete anytime." },
  { icon: Smartphone, title: "No spammy customer experience", desc: "Clean mobile capture. No app install. No account required." },
  { icon: Lock, title: "Your data stays yours", desc: "Photos and briefs are never shared or used for training." },
];

/* ── form state ─────────────────────────────────────────── */

interface FormState {
  name: string;
  business_name: string;
  email: string;
  business_type: string;
  website: string;
  use_case: string;
  estimated_monthly_requests: string;
}

const EMPTY: FormState = {
  name: "",
  business_name: "",
  email: "",
  business_type: "",
  website: "",
  use_case: "",
  estimated_monthly_requests: "",
};

/* ── Hero visual — messy→brief ──────────────────────────── */

function HeroBriefVisual() {
  return (
    <div className="relative mx-auto mt-10 flex max-w-md flex-col items-center gap-4 sm:max-w-xl sm:flex-row sm:gap-6" aria-hidden="true">
      {/* Messy incoming photos */}
      <div className="relative h-44 w-48 shrink-0 sm:h-52 sm:w-56">
        {/* Photo thumbnails — tilted, overlapping */}
        <div className="absolute left-2 top-4 h-24 w-20 rotate-[-8deg] rounded-lg bg-[hsl(var(--pb-panel-2))] shadow-lg ring-1 ring-white/[0.06]">
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.04] to-transparent">
            <Camera className="h-5 w-5 text-[hsl(var(--pb-muted)/0.4)]" />
          </div>
          <span className="absolute -bottom-2 -right-1 rounded-full bg-red-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
            Blurry
          </span>
        </div>
        <div className="absolute left-14 top-0 h-24 w-20 rotate-[4deg] rounded-lg bg-[hsl(var(--pb-panel-2))] shadow-lg ring-1 ring-white/[0.06]">
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.04] to-transparent">
            <Camera className="h-5 w-5 text-[hsl(var(--pb-muted)/0.4)]" />
          </div>
          <span className="absolute -bottom-2 left-1 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
            Too dark
          </span>
        </div>
        <div className="absolute bottom-2 left-6 h-24 w-20 rotate-[-3deg] rounded-lg bg-[hsl(var(--pb-panel-2))] shadow-lg ring-1 ring-white/[0.06]">
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-white/[0.04] to-transparent">
            <Camera className="h-5 w-5 text-[hsl(var(--pb-muted)/0.4)]" />
          </div>
          <span className="absolute -right-3 top-2 rounded-full bg-red-500/80 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow">
            Wrong angle
          </span>
        </div>
        <p className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-medium text-[hsl(var(--pb-muted)/0.5)]">
          What you get today
        </p>
      </div>

      {/* Arrow */}
      <div className="flex shrink-0 items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--pb-violet)/0.15)] text-[hsl(var(--pb-violet))] ring-1 ring-[hsl(var(--pb-violet)/0.3)]">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>

      {/* Clean brief card */}
      <div className="relative w-52 shrink-0 rounded-xl border border-[hsl(var(--pb-line)/0.5)] bg-[hsl(var(--pb-panel)/0.8)] p-3 shadow-xl sm:w-56">
        <div className="flex items-center gap-2 border-b border-[hsl(var(--pb-line)/0.3)] pb-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-[hsl(var(--pb-violet)/0.2)]">
            <FileCheck2 className="h-3 w-3 text-[hsl(var(--pb-violet))]" />
          </div>
          <span className="text-[11px] font-semibold text-white/90">PhotoBrief</span>
          <span className="ml-auto rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-400">
            4/4 shots
          </span>
        </div>
        {/* Mini photo grid */}
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {["Wide area", "Close-up", "Damage", "Access"].map((label) => (
            <div key={label} className="rounded-md bg-[hsl(var(--pb-panel-2))] p-1.5">
              <div className="flex h-8 items-center justify-center rounded bg-white/[0.03]">
                <Camera className="h-3 w-3 text-[hsl(var(--pb-muted)/0.3)]" />
              </div>
              <div className="mt-1 flex items-center gap-0.5">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" />
                <span className="text-[8px] text-[hsl(var(--pb-muted))]">{label}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Status chips */}
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-medium text-emerald-400">Verified</span>
          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-medium text-emerald-400">Complete</span>
          <span className="rounded-full bg-[hsl(var(--pb-violet)/0.15)] px-1.5 py-0.5 text-[8px] font-medium text-[hsl(var(--pb-lavender))]">Ready to quote</span>
        </div>
        <p className="absolute -bottom-6 left-0 right-0 text-center text-[11px] font-medium text-[hsl(var(--pb-muted)/0.5)]">
          What you get with PhotoBrief
        </p>
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */

export default function BetaListPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") || "";
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"new" | "already" | null>(null);

  useEffect(() => {
    trackEvent("betalist_page_viewed", ref ? { ref } : undefined);
  }, [ref]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function validate(): string | null {
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
    const source = ref ? `betalist:${ref}` : "betalist";
    try {
      const { data, error } = await supabase.functions.invoke("waitlist-submit", {
        body: {
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          notes: `source=${source}`,
          source,
        },
      });
      if (error) throw error;
      const payload = data as { ok?: boolean; already?: boolean } | null;
      if (payload?.already) {
        trackEvent("betalist_duplicate", { ref });
        setDone("already");
      } else {
        trackEvent("betalist_submitted", { ref, business_type: form.business_type || undefined });
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

  /* ── Full-page thank-you after submission ─────────────── */
  if (done) {
    return (
      <div className="min-h-screen bg-[hsl(var(--pb-night))] text-white">
        <SEOHead
          title="Application received — PhotoBrief.ai"
          description="Your Founding Partner Beta application has been received. We'll review it and reach out."
          canonicalPath="/betalist"
        />
        <div className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[hsl(var(--pb-violet)/0.08)] blur-[120px]" />
          </div>
          <div className="mx-auto max-w-md text-center">
            <div className="flex justify-center">
              <BrandMark variant="stacked" tone="light" size={64} eager withGlow />
            </div>

            {done === "new" ? (
              <>
                <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)]">
                  <CheckCircle2 className="h-8 w-8 text-[hsl(var(--pb-mint))]" />
                </div>
                <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Application received</h1>
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--pb-muted))]">
                  Thanks for applying to the Founding Partner Beta. PhotoBrief is invite-only right now — we review every application by hand.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.12)]">
                  <MailCheck className="h-8 w-8 text-[hsl(var(--pb-lavender))]" />
                </div>
                <h1 className="mt-6 text-2xl font-bold sm:text-3xl">You're already on the list</h1>
                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--pb-muted))]">
                  We already have your application. No need to resubmit — we'll be in touch as soon as a spot opens.
                </p>
              </>
            )}

            {/* Next steps */}
            <div className="mt-8 rounded-2xl border border-[hsl(var(--pb-line)/0.4)] bg-[hsl(var(--pb-panel)/0.5)] p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-[hsl(var(--pb-violet))]">What happens next</p>
              <ol className="mt-4 grid gap-3.5">
                {[
                  { step: "1", text: "We review your application within a few business days." },
                  { step: "2", text: "If it's a fit, we send a personal invite with your login link." },
                  { step: "3", text: "We set up your first templates together in a concierge onboarding call." },
                  { step: "4", text: "You start sending guided PhotoBrief links to real customers." },
                ].map((s) => (
                  <li key={s.step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--pb-violet)/0.15)] text-[11px] font-bold text-[hsl(var(--pb-violet))]">
                      {s.step}
                    </span>
                    <span className="text-sm leading-relaxed text-[hsl(var(--pb-muted))]">{s.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Founding partner reminder */}
            <div className="mt-5 rounded-xl border border-[hsl(var(--pb-violet)/0.2)] bg-[hsl(var(--pb-violet)/0.04)] p-4">
              <p className="text-sm font-semibold text-white/90">Founding Partner Beta includes:</p>
              <p className="mt-1.5 text-xs leading-relaxed text-[hsl(var(--pb-muted))]">
                60–90 days free · concierge setup · priority support · direct roadmap input · early access to future tools · 50% off your first year
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
              <Button asChild variant="pb-secondary" size="lg">
                <NavLink to="/founding-partner-beta">Learn more about the beta program</NavLink>
              </Button>
              <p className="text-xs text-[hsl(var(--pb-muted)/0.5)]">
                Questions?{" "}
                <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--pb-lavender))] hover:underline">
                  hello@photobrief.ai
                </a>
              </p>
            </div>
          </div>
        </div>
        <footer className="border-t border-[hsl(var(--pb-line)/0.15)] px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2.5 text-center text-xs text-[hsl(var(--pb-muted)/0.45)]">
            <BrandMark variant="horizontal" tone="light" size={26} />
            <p>© {new Date().getFullYear()} PhotoBrief.ai · <NavLink to="/privacy" className="hover:text-white/60">Privacy</NavLink> · <NavLink to="/terms" className="hover:text-white/60">Terms</NavLink></p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--pb-night))] text-white">
      <SEOHead
        title="PhotoBrief.ai — Stop chasing customer photos"
        description="Send one guided PhotoBrief link and get a clean, AI-checked photo brief back. Apply for the Founding Partner Beta."
        canonicalPath="/betalist"
      />

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative isolate overflow-hidden px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-[hsl(var(--pb-violet)/0.10)] blur-[120px]" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <div className="flex justify-center">
            <BrandMark variant="stacked" tone="light" size={72} eager withGlow />
          </div>

          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--pb-violet)/0.35)] bg-[hsl(var(--pb-violet)/0.08)] px-3.5 py-1.5 text-[11px] font-semibold tracking-wider text-[hsl(var(--pb-lavender))] uppercase">
            <Sparkles className="h-3 w-3" /> Founding Partner Beta
          </p>

          <h1 className="mt-5 text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Stop chasing customer photos.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-balance text-lg leading-relaxed text-[hsl(var(--pb-muted))] sm:text-xl">
            Send one guided PhotoBrief link and get a clean, AI&#8209;checked brief back.
          </p>

          <p className="mx-auto mt-2.5 max-w-lg text-[13px] leading-relaxed text-[hsl(var(--pb-muted)/0.65)]">
            For teams that need the right photos before they quote, dispatch, approve, review, document, or follow up.
          </p>

          {/* Hero visual */}
          <HeroBriefVisual />

          <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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

      {/* ━━ APPLICATION FORM (front-and-center) ━━━━━━━━━━━━ */}
      <section id="apply" className="scroll-mt-8 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Apply for beta access</h2>
          <p className="mt-2 text-center text-sm text-[hsl(var(--pb-muted))]">
            Limited spots · We typically reply within a few days
          </p>


            <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-[hsl(var(--pb-line)/0.5)] bg-[hsl(var(--pb-panel)/0.55)] p-5 sm:p-6">
              <Field id="bl-email" label="Work email" required>
                <Input id="bl-email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required placeholder="you@company.com" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="bl-name" label="Your name">
                  <Input id="bl-name" value={form.name} onChange={update("name")} autoComplete="name" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
                <Field id="bl-biz" label="Business name">
                  <Input id="bl-biz" value={form.business_name} onChange={update("business_name")} autoComplete="organization" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <Textarea id="bl-usecase" value={form.use_case} onChange={update("use_case")} rows={2} placeholder="e.g. Getting roof damage photos before we send a quote." className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
              </Field>
              <Field id="bl-vol" label="Approx. monthly photo requests">
                <select
                  id="bl-vol"
                  value={form.estimated_monthly_requests}
                  onChange={update("estimated_monthly_requests")}
                  className="flex h-11 w-full rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-sm text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))]"
                >
                  <option value="" className="bg-[hsl(var(--pb-ink))]">Select…</option>
                  {VOLUMES.map((v) => (
                    <option key={v} value={v} className="bg-[hsl(var(--pb-ink))]">{v}</option>
                  ))}
                </select>
              </Field>
              <Button type="submit" size="lg" disabled={submitting} variant="pb-primary" className="w-full">
                {submitting ? "Submitting…" : "Apply for Founding Partner Beta"}
              </Button>
            </form>
        </div>
      </section>

      {/* ━━ HOW IT WORKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="how-it-works" className="px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--pb-violet))]">How it works</p>
          <h2 className="mt-3 text-center text-2xl font-semibold sm:text-3xl">One link → one clean brief.</h2>

          <div className="mt-10 grid gap-5">
            {[
              { step: "1", title: "Create a guided request", desc: "Pick a template or describe what you need. PhotoBrief generates a step-by-step photo guide tailored to the job." },
              { step: "2", title: "Send the link", desc: "Your customer opens the link on their phone — no app, no login. They follow guided steps to capture every required shot." },
              { step: "3", title: "Get an AI-checked brief", desc: "Photos are scored for quality and completeness. You get a clean, organized brief — ready for quoting, dispatch, or approval." },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 rounded-2xl border border-[hsl(var(--pb-line)/0.4)] bg-[hsl(var(--pb-panel)/0.5)] p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--pb-violet)/0.15)] text-sm font-bold text-[hsl(var(--pb-violet))]">
                  {s.step}
                </span>
                <div>
                  <p className="text-[15px] font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--pb-muted))]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ USE CASES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--pb-violet))]">Use cases</p>
          <h2 className="mt-3 text-center text-balance text-2xl font-semibold sm:text-3xl">
            Built for moments when photos decide the next step.
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {useCases.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl border border-[hsl(var(--pb-line)/0.35)] bg-[hsl(var(--pb-ink)/0.5)] p-4">
                <Icon className="h-4.5 w-4.5 text-[hsl(var(--pb-lavender))]" />
                <p className="mt-2 text-[15px] font-semibold">{label}</p>
                <p className="mt-0.5 text-sm text-[hsl(var(--pb-muted))]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ OLD WAY VS PHOTOBRIEF ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">The old way vs. PhotoBrief</h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[hsl(var(--pb-line)/0.4)]">
            <div className="grid grid-cols-2 border-b border-[hsl(var(--pb-line)/0.4)] bg-[hsl(var(--pb-panel)/0.7)]">
              <div className="flex items-center justify-center gap-1.5 p-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--pb-muted))]">
                <MessageSquareWarning className="h-3.5 w-3.5 text-red-400/60" /> Today
              </div>
              <div className="flex items-center justify-center gap-1.5 border-l border-[hsl(var(--pb-line)/0.4)] p-3 text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--pb-lavender))]">
                <CheckCircle2 className="h-3.5 w-3.5" /> PhotoBrief
              </div>
            </div>
            {comparisonRows.map(({ old, pb }, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 ${i < comparisonRows.length - 1 ? "border-b border-[hsl(var(--pb-line)/0.2)]" : ""}`}
              >
                <div className="p-3 text-[13px] leading-snug text-[hsl(var(--pb-muted)/0.65)]">{old}</div>
                <div className="border-l border-[hsl(var(--pb-line)/0.2)] p-3 text-[13px] leading-snug text-white/90">{pb}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ FOUNDING PARTNER BETA OFFER ━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--pb-violet)/0.25)] bg-[hsl(var(--pb-violet)/0.05)] p-5 sm:p-7">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--pb-violet))]">
            <Sparkles className="h-3 w-3" /> Limited spots
          </p>
          <h2 className="mt-3 text-xl font-semibold sm:text-2xl">Founding Partner Beta</h2>
          <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--pb-muted))]">
            We're inviting a small group of service businesses to shape PhotoBrief before public launch. In exchange for real-world usage and honest feedback, founding partners get:
          </p>
          <div className="mt-4 grid gap-2">
            {partnerBenefits.map((b) => (
              <div key={b} className="flex items-start gap-2 text-sm">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" />
                <span className="text-white/90">{b}</span>
              </div>
            ))}
          </div>
          <Button
            variant="pb-primary"
            size="lg"
            className="mt-5 w-full"
            onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
          >
            Apply now <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ━━ TRUST / PRIVACY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-xl gap-3 sm:grid-cols-2">
          {trustPoints.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[hsl(var(--pb-line)/0.25)] bg-[hsl(var(--pb-panel)/0.35)] p-4">
              <Icon className="h-4 w-4 text-[hsl(var(--pb-muted)/0.7)]" />
              <p className="mt-2 text-sm font-semibold">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[hsl(var(--pb-muted))]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ━━ FINAL CTA ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="px-4 py-14 sm:px-6 sm:py-18">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Ready to stop chasing photos?</h2>
          <p className="mt-3 text-sm text-[hsl(var(--pb-muted))]">
            Join the founding partner beta and be one of the first to turn messy photo requests into clean, AI&#8209;checked briefs.
          </p>
          <Button
            variant="pb-primary"
            size="xl"
            className="mt-6"
            onClick={() => document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" })}
          >
            Apply for Founding Partner Beta <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <p className="mt-5 text-xs text-[hsl(var(--pb-muted)/0.5)]">
            Already have an account?{" "}
            <NavLink to="/auth" className="text-[hsl(var(--pb-lavender))] hover:underline">
              Sign in
            </NavLink>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--pb-line)/0.15)] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2.5 text-center text-xs text-[hsl(var(--pb-muted)/0.45)]">
          <BrandMark variant="horizontal" tone="light" size={26} />
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
      <Label htmlFor={id} className="mb-1 inline-block text-[13px] text-white/75">
        {label}
        {required && <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>}
      </Label>
      {children}
    </div>
  );
}
