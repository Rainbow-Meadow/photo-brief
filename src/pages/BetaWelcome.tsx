import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Crown,
  Gift,
  Headphones,
  MessageSquare,
  Palette,
  Rocket,
  Send,
  Settings,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

import { SEOHead } from "@/components/seo/SEOHead";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { PARTNER_BENEFITS } from "@/config/betaProgram";

/* ── constants ──────────────────────────────────────────── */

const INDUSTRIES = [
  "Plumbing", "HVAC", "Electrical", "Roofing", "Landscaping",
  "General contracting", "Cleaning", "Junk removal", "Real estate",
  "Insurance / claims", "Property management", "Other",
];

const VOLUMES = ["Fewer than 10", "10–50", "51–200", "200+"];

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS / text" },
  { value: "both", label: "Both" },
];

const benefits = PARTNER_BENEFITS.map((text, i) => {
  const icons = [Headphones, Zap, Crown, MessageSquare, Star, Gift];
  return { icon: icons[i] ?? Gift, text };
});

const timelineSteps = [
  { icon: Send, title: "You fill out this page", body: "Tell us about your business and what you need — takes about 3 minutes." },
  { icon: Settings, title: "We configure your account", body: "Your workspace, brand settings, and first templates are set up by our team." },
  { icon: Calendar, title: "Concierge setup via chat or email", body: "We walk through everything async — chat, email, or in-app — on your schedule." },
  { icon: Rocket, title: "Send your first PhotoBrief", body: "You're live — send a real guided photo request to a customer." },
];

/* ── form state ─────────────────────────────────────────── */

interface FormState {
  email: string;
  name: string;
  business_name: string;
  industry: string;
  website: string;
  phone: string;
  brand_color: string;
  tagline: string;
  logo_description: string;
  photo_use_case: string;
  monthly_volume: string;
  reviewer_info: string;
  preferred_channel: string;
  template_ideas: string;
  notes: string;
}

const EMPTY: FormState = {
  email: "", name: "", business_name: "", industry: "",
  website: "", phone: "", brand_color: "#0A6BFF", tagline: "",
  logo_description: "", photo_use_case: "", monthly_volume: "",
  reviewer_info: "", preferred_channel: "email", template_ideas: "",
  notes: "",
};

/* ── helpers ────────────────────────────────────────────── */

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-white/80">
        {label}{required && <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>}
      </Label>
      {children}
    </div>
  );
}

const inputClass = "h-12 border-white/12 bg-white/[0.05] text-white placeholder:text-white/30";
const textareaClass = "border-white/12 bg-white/[0.05] text-white placeholder:text-white/30";

/* ── main component ─────────────────────────────────────── */

export default function BetaWelcomePage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
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
          ...form,
          email: form.email.trim().toLowerCase(),
          name: form.name.trim() || undefined,
          business_name: form.business_name.trim(),
        },
      });
      if (error) throw error;
      trackEvent("beta_welcome_submitted", { business_name: form.business_name });
      setDone(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or email hello@photobrief.ai.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Post-submission confirmation ──────────────────────── */
  if (done) {
    return (
      <>
        <SEOHead title="We've got everything — PhotoBrief.ai" description="Your concierge setup details have been received." canonicalPath="/welcome" />
        <section className="pb-section relative isolate">
          <div className="pb-lens-field" />
          <div className="pb-container relative z-10 mx-auto max-w-lg text-center">
            <BrandMark variant="stacked" tone="light" size={72} eager withGlow />
            <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)]">
              <CheckCircle2 className="h-8 w-8 text-[hsl(var(--pb-mint))]" />
            </div>
            <h1 className="pb-section-title mt-6 text-white">We've got everything we need</h1>
            <p className="pb-copy mt-4">
              Your concierge setup is in the queue. We'll configure your account and reach out via email or chat to walk you through everything — usually within 48 hours.
            </p>

            <div className="pb-card mt-8 p-5 text-left sm:p-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">What happens now</p>
              <ol className="mt-4 grid gap-3">
                {[
                  "We set up your workspace, brand, and first templates.",
                  "You'll receive an email when your account is ready.",
                  "We'll walk you through everything via chat or email — no call needed.",
                  "You send your first guided PhotoBrief to a real customer.",
                ].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.13)] text-xs font-black text-[hsl(var(--pb-lavender))]">{i + 1}</span>
                    <span className="pb-copy text-sm">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-6 text-xs text-white/40">
              Questions? <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--pb-lavender))] hover:underline">hello@photobrief.ai</a> — replies go straight to the team.
            </p>
          </div>
        </section>
      </>
    );
  }

  /* ── Main welcome page ─────────────────────────────────── */
  return (
    <>
      <SEOHead
        title="Welcome to the Founding Partner Beta — PhotoBrief.ai"
        description="You've been accepted into the PhotoBrief.ai Founding Partner Beta. Tell us about your business so we can set everything up for you."
        canonicalPath="/welcome"
      />

      {/* ━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative isolate overflow-hidden pt-8 sm:pt-14">
        <div className="pb-lens-field" />
        <div className="pb-container relative z-10 pb-4 sm:pb-10">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-3 sm:mb-5">
              <div className="relative inline-flex items-center justify-center">
                <div aria-hidden className="pointer-events-none absolute h-28 w-28 rounded-full bg-[hsl(var(--pb-violet)/0.35)] blur-[50px] sm:h-48 sm:w-48 sm:blur-[80px]" />
                <BrandMark variant="mark" size={56} withGlow eager className="relative sm:hidden" />
                <BrandMark variant="mark" size={120} withGlow eager className="relative hidden sm:inline-flex" />
              </div>
            </div>

            <span className="pb-eyebrow"><Crown className="h-3.5 w-3.5" /> Founding Partner Beta</span>

            <h1 className="pb-hero-title mx-auto mt-2 max-w-xl text-white sm:mt-4">
              You're in.
            </h1>

            <p className="pb-copy mx-auto mt-3 max-w-xl text-[0.938rem] leading-[1.6] sm:mt-4 sm:text-lg sm:leading-8">
              You've been selected for the PhotoBrief.ai Founding Partner Beta — a small, hand-picked group of businesses getting early access with concierge setup and direct support.
            </p>

            <div className="mx-auto mt-4 flex max-w-md justify-center gap-2 sm:mt-5 sm:gap-2.5">
              {["Hand-picked cohort", "Concierge setup", "Direct support"].map((item) => (
                <span key={item} className="pb-route-chip whitespace-nowrap px-2 py-1 text-center text-[0.6rem] font-semibold sm:px-3 sm:py-2 sm:text-xs">{item}</span>
              ))}
            </div>

            <Button size="xl" variant="pb-primary" className="mt-6" onClick={() => document.getElementById("setup")?.scrollIntoView({ behavior: "smooth" })}>
              Let's set up your account <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ━━ WHAT YOU GET ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="pb-eyebrow"><BadgeCheck className="h-3.5 w-3.5" /> What's included</span>
              <h2 className="pb-section-title mt-3 text-white">Founding Partner benefits</h2>
            </div>

            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="pb-card flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--pb-lavender)/0.12)]">
                    <Icon className="h-4.5 w-4.5 text-[hsl(var(--pb-lavender))]" />
                  </div>
                  <p className="pb-copy text-sm leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ TIMELINE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pb-section-tight">
        <div className="pb-container">
          <div className="mx-auto max-w-2xl">
            <div className="text-center">
              <span className="pb-eyebrow"><Sparkles className="h-3.5 w-3.5" /> How it works</span>
              <h2 className="pb-section-title mt-3 text-white">From here to your first PhotoBrief</h2>
            </div>

            <div className="mt-6 sm:mt-8">
              {timelineSteps.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* Vertical connector line */}
                  {i < timelineSteps.length - 1 && (
                    <div className="absolute left-[17px] top-10 bottom-0 w-px bg-[hsl(var(--pb-lavender)/0.18)]" />
                  )}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.12)] ring-2 ring-[hsl(var(--pb-lavender)/0.25)]">
                    <Icon className="h-4 w-4 text-[hsl(var(--pb-lavender))]" />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="pb-copy mt-0.5 text-sm">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ━━ CONCIERGE INTAKE FORM ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="setup" className="pb-section-tight scroll-mt-8">
        <div className="pb-container">
          <div className="pb-command-panel mx-auto max-w-xl p-4 sm:p-6 lg:p-8">
            <div className="relative z-10">
              <span className="pb-eyebrow"><Users className="h-3.5 w-3.5" /> Concierge setup</span>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-white sm:mt-4 sm:text-2xl">
                Tell us about your business
              </h2>
              <p className="pb-copy mt-1.5 text-sm">
                We'll use this to configure your account, brand settings, and first templates before your concierge walkthrough.
              </p>

              <form onSubmit={onSubmit} className="mt-5 space-y-6 sm:mt-6">
                {/* ── Section 1: Business basics ── */}
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">Business basics</p>
                  <div className="mt-3 grid gap-3.5 sm:gap-4">
                    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                      <Field id="bw-name" label="Your name">
                        <Input id="bw-name" value={form.name} onChange={update("name")} autoComplete="name" placeholder="Alex Johnson" className={inputClass} />
                      </Field>
                      <Field id="bw-email" label="Email" required>
                        <Input id="bw-email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required placeholder="you@company.com" className={inputClass} />
                      </Field>
                    </div>
                    <Field id="bw-biz" label="Business name" required>
                      <Input id="bw-biz" value={form.business_name} onChange={update("business_name")} autoComplete="organization" required className={inputClass} />
                    </Field>
                    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                      <Field id="bw-industry" label="Industry">
                        <select id="bw-industry" value={form.industry} onChange={update("industry")} className={`flex w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] ${inputClass}`}>
                          <option value="">Select…</option>
                          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </Field>
                      <Field id="bw-phone" label="Phone">
                        <Input id="bw-phone" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" placeholder="(555) 123-4567" className={inputClass} />
                      </Field>
                    </div>
                    <Field id="bw-web" label="Website">
                      <Input id="bw-web" value={form.website} onChange={update("website")} placeholder="https://" autoComplete="url" className={inputClass} />
                    </Field>
                  </div>
                </div>

                {/* ── Section 2: Brand & identity ── */}
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">Brand & identity</p>
                  <p className="pb-copy mt-1 text-xs">We'll use these to customize how PhotoBrief looks to your customers.</p>
                  <div className="mt-3 grid gap-3.5 sm:gap-4">
                    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                      <Field id="bw-color" label="Primary brand color">
                        <div className="flex items-center gap-2">
                          <input type="color" id="bw-color-picker" value={form.brand_color} onChange={(e) => setForm(prev => ({ ...prev, brand_color: e.target.value }))} className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-white/12 bg-transparent" />
                          <Input id="bw-color" value={form.brand_color} onChange={update("brand_color")} placeholder="#0A6BFF" className={`flex-1 ${inputClass}`} />
                        </div>
                      </Field>
                      <Field id="bw-tagline" label="Tagline or short description">
                        <Input id="bw-tagline" value={form.tagline} onChange={update("tagline")} placeholder="Reliable plumbing since 2005" className={inputClass} />
                      </Field>
                    </div>
                    <Field id="bw-logo" label="Logo description">
                      <Input id="bw-logo" value={form.logo_description} onChange={update("logo_description")} placeholder="Describe your logo or paste a link to it" className={inputClass} />
                    </Field>
                  </div>
                </div>

                {/* ── Section 3: Photo workflow ── */}
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">Photo workflow</p>
                  <p className="pb-copy mt-1 text-xs">Help us understand how you'll use PhotoBrief so we can tailor your templates.</p>
                  <div className="mt-3 grid gap-3.5 sm:gap-4">
                    <Field id="bw-usecase" label="What do you need customer photos for?" required>
                      <Textarea id="bw-usecase" value={form.photo_use_case} onChange={update("photo_use_case")} rows={2} required placeholder="e.g. We need roof damage photos before sending a quote — close-ups of the damage, full roof overview, and any visible flashing or gutter issues." className={textareaClass} />
                    </Field>
                    <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                      <Field id="bw-vol" label="Monthly photo requests (approx.)">
                        <select id="bw-vol" value={form.monthly_volume} onChange={update("monthly_volume")} className={`flex w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] ${inputClass}`}>
                          <option value="">Select…</option>
                          {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </Field>
                      <Field id="bw-channel" label="How do you reach customers?">
                        <select id="bw-channel" value={form.preferred_channel} onChange={update("preferred_channel")} className={`flex w-full rounded-xl border px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--pb-lavender))] ${inputClass}`}>
                          {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field id="bw-reviewer" label="Who reviews incoming photos?">
                      <Input id="bw-reviewer" value={form.reviewer_info} onChange={update("reviewer_info")} placeholder="e.g. Office manager Sarah, or the estimating team" className={inputClass} />
                    </Field>
                  </div>
                </div>

                {/* ── Section 4: First templates ── */}
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[hsl(var(--pb-lavender))]">First template ideas</p>
                  <p className="pb-copy mt-1 text-xs">We'll build your first templates based on this. Don't overthink it — we'll refine together over chat or email.</p>
                  <div className="mt-3 grid gap-3.5 sm:gap-4">
                    <Field id="bw-templates" label="What should your first 1–2 templates cover?">
                      <Textarea id="bw-templates" value={form.template_ideas} onChange={update("template_ideas")} rows={3} placeholder="e.g. Roof damage assessment — need overall roof shot, close-up of damage area, photos of gutters and flashing, and any interior water stains." className={textareaClass} />
                    </Field>
                    <Field id="bw-notes" label="Anything else we should know?">
                      <Textarea id="bw-notes" value={form.notes} onChange={update("notes")} rows={2} placeholder="Special requirements, team size, preferred communication channel, etc." className={textareaClass} />
                    </Field>
                  </div>
                </div>

                <Button type="submit" size="xl" variant="pb-primary" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit for concierge setup"}
                  {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
                </Button>

                <p className="text-center text-xs text-white/40">
                  Questions? <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--pb-lavender))] hover:underline">hello@photobrief.ai</a> — replies go straight to the team.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
