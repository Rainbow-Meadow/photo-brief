import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Crown,
  Gift,
  Headphones,
  MessageSquare,
  Rocket,
  Send,
  Settings,
  Star,
  Zap,
} from "lucide-react";

import { SEOHead } from "@/components/seo/SEOHead";
import { BrandMark } from "@/components/layout/BrandMark";
import { Section, Container, Card } from "@/design-system/schema";
import { Input } from "@/components/ui/input";
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

/* ── shared editorial classes ───────────────────────────── */

const eyebrowCls =
  "inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground";
const accentCodeCls = "text-[hsl(var(--accent-kinetic))]";
const sectionLabelCls =
  "font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]";
const fieldLabelCls =
  "block font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground";
const inputCls =
  "h-12 rounded-none border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";
const textareaCls =
  "rounded-none border border-border bg-background p-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";
const selectCls =
  "h-12 w-full rounded-none border border-border bg-background px-3 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-6 font-[Geist,Inter,system-ui,sans-serif] text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";

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
  website: "", phone: "", brand_color: "#F2A33A", tagline: "",
  logo_description: "", photo_use_case: "", monthly_volume: "",
  reviewer_info: "", preferred_channel: "email", template_ideas: "",
  notes: "",
};

/* ── helpers ────────────────────────────────────────────── */

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className={fieldLabelCls}>
        {label}
        {required && <span className="ml-1 text-[hsl(var(--accent-kinetic))]">*</span>}
      </label>
      {children}
    </div>
  );
}

function Eyebrow({ code, children }: { code: string; children: React.ReactNode }) {
  return (
    <p className={eyebrowCls}>
      <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
      <span className={accentCodeCls}>[ {code} ]</span>
      <span className="inline-flex items-center gap-1.5">{children}</span>
    </p>
  );
}

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
        <main className="relative isolate min-h-screen bg-background px-4 py-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-ambient-sky" aria-hidden />
          <div className="mx-auto max-w-lg">
            <div className="mb-8 flex justify-center">
              <BrandMark variant="stacked" tone="dark" size={72} eager />
            </div>
            <Card variant="paper" padding="lg">
              <div className="text-center">
                <Eyebrow code="OK">Founding Partner Beta</Eyebrow>
                <span className="mx-auto mt-6 flex h-14 w-14 items-center justify-center border border-[hsl(var(--accent-kinetic))] text-[hsl(var(--accent-kinetic))]">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <h1 className="mt-5 text-[clamp(1.6rem,3vw,2rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
                  We've got everything we need
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Your concierge setup is in the queue. We'll configure your account and reach out via email or chat to walk you through everything — usually within 48 hours.
                </p>
              </div>

              <div className="mt-7 border-t border-border pt-6 text-left">
                <p className={sectionLabelCls}>What happens now</p>
                <ol className="mt-4 grid gap-3">
                  {[
                    "We set up your workspace, brand, and first templates.",
                    "You'll receive an email when your account is ready.",
                    "We'll walk you through everything via chat or email — no call needed.",
                    "You send your first guided PhotoBrief to a real customer.",
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="font-mono text-[0.7rem] font-semibold tabular-nums uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm leading-6 text-foreground">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="mt-6 border-t border-border pt-5 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
                Questions?{" "}
                <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--accent-kinetic))] hover:underline">
                  hello@photobrief.ai
                </a>
              </p>
            </Card>
          </div>
        </main>
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

      <main className="relative isolate bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-ambient-sky" aria-hidden />

        {/* HERO */}
        <Section size="tight">
          <Container width="reading">
            <div className="text-center">
            <div className="mb-6 flex justify-center">
              <BrandMark variant="stacked" tone="dark" size={72} eager />
            </div>
            <Eyebrow code="00"><Crown className="h-3.5 w-3.5" /> Founding Partner Beta</Eyebrow>
            <h1 className="mx-auto mt-5 max-w-xl text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              You're in.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              You've been selected for the PhotoBrief.ai Founding Partner Beta — a small, hand-picked group of businesses getting early access with concierge setup and direct support.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {["Hand-picked cohort", "Concierge setup", "Direct support"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center border border-border bg-card px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("setup")?.scrollIntoView({ behavior: "smooth" })}
              className={`${primaryBtn} mt-8 h-14 px-7 rounded-[0.25rem]`}
            >
              Let's set up your account <ArrowRight className="h-4 w-4" />
            </button>
            </div>
          </Container>
        </Section>

        {/* BENEFITS */}
        <Section size="tight">
          <Container width="reading">
            <div className="text-center">
              <Eyebrow code="01">What's included</Eyebrow>
              <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.25rem)] font-semibold tracking-tight text-foreground">
                Founding Partner benefits
              </h2>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, text }, i) => (
                <Card key={text} variant="paper" padding="md">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
                      [ {String(i + 1).padStart(2, "0")} ]
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-snug text-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </Container>
        </Section>

        {/* TIMELINE */}
        <Section size="tight">
          <Container width="reading">
            <div className="text-center">
              <Eyebrow code="02">How it works</Eyebrow>
              <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.25rem)] font-semibold tracking-tight text-foreground">
                From here to your first PhotoBrief
              </h2>
            </div>
            <ol className="mt-8 border-l border-border">
              {timelineSteps.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="relative grid grid-cols-[auto_1fr] gap-4 pb-8 pl-6 last:pb-0">
                  <span className="absolute -left-px top-0 h-px w-4 bg-[hsl(var(--accent-kinetic))]" aria-hidden />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
                      [ {String(i + 1).padStart(2, "0")} ]
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </Section>

        {/* CONCIERGE INTAKE FORM */}
        <Section id="setup" size="tight">
          <Container width="reading">
            <div className="mx-auto max-w-xl">
            <Card variant="paper" padding="lg">
              <Eyebrow code="03">Concierge setup</Eyebrow>
              <h2 className="mt-5 text-[clamp(1.4rem,2.5vw,2rem)] font-semibold tracking-tight text-foreground">
                Tell us about your business
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                We'll use this to configure your account, brand settings, and first templates before your concierge walkthrough.
              </p>

              <form onSubmit={onSubmit} className="mt-7 space-y-8">
                {/* Section 1 */}
                <div className="space-y-4">
                  <p className={sectionLabelCls}>[ A ] Business basics</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="bw-name" label="Your name">
                      <Input id="bw-name" value={form.name} onChange={update("name")} autoComplete="name" placeholder="Alex Johnson" className={inputCls} />
                    </Field>
                    <Field id="bw-email" label="Email" required>
                      <Input id="bw-email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required placeholder="you@company.com" className={inputCls} />
                    </Field>
                  </div>
                  <Field id="bw-biz" label="Business name" required>
                    <Input id="bw-biz" value={form.business_name} onChange={update("business_name")} autoComplete="organization" required className={inputCls} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="bw-industry" label="Industry">
                      <select id="bw-industry" value={form.industry} onChange={update("industry")} className={selectCls}>
                        <option value="">Select…</option>
                        {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </Field>
                    <Field id="bw-phone" label="Phone">
                      <Input id="bw-phone" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" placeholder="(555) 123-4567" className={inputCls} />
                    </Field>
                  </div>
                  <Field id="bw-web" label="Website">
                    <Input id="bw-web" value={form.website} onChange={update("website")} placeholder="https://" autoComplete="url" className={inputCls} />
                  </Field>
                </div>

                {/* Section 2 */}
                <div className="space-y-4 border-t border-border pt-7">
                  <div>
                    <p className={sectionLabelCls}>[ B ] Brand & identity</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">We'll use these to customize how PhotoBrief looks to your customers.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="bw-color" label="Primary brand color">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="bw-color-picker"
                          value={form.brand_color}
                          onChange={(e) => setForm((prev) => ({ ...prev, brand_color: e.target.value }))}
                          className="h-12 w-12 shrink-0 cursor-pointer rounded-none border border-border bg-transparent p-1"
                        />
                        <Input id="bw-color" value={form.brand_color} onChange={update("brand_color")} placeholder="#F2A33A" className={`${inputCls} flex-1`} />
                      </div>
                    </Field>
                    <Field id="bw-tagline" label="Tagline or short description">
                      <Input id="bw-tagline" value={form.tagline} onChange={update("tagline")} placeholder="Reliable plumbing since 2005" className={inputCls} />
                    </Field>
                  </div>
                  <Field id="bw-logo" label="Logo description">
                    <Input id="bw-logo" value={form.logo_description} onChange={update("logo_description")} placeholder="Describe your logo or paste a link to it" className={inputCls} />
                  </Field>
                </div>

                {/* Section 3 */}
                <div className="space-y-4 border-t border-border pt-7">
                  <div>
                    <p className={sectionLabelCls}>[ C ] Photo workflow</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">Help us understand how you'll use PhotoBrief so we can tailor your templates.</p>
                  </div>
                  <Field id="bw-usecase" label="What do you need customer photos for?" required>
                    <Textarea
                      id="bw-usecase"
                      value={form.photo_use_case}
                      onChange={update("photo_use_case")}
                      rows={3}
                      required
                      placeholder="e.g. We need roof damage photos before sending a quote — close-ups of the damage, full roof overview, and any visible flashing or gutter issues."
                      className={textareaCls}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="bw-vol" label="Monthly photo requests (approx.)">
                      <select id="bw-vol" value={form.monthly_volume} onChange={update("monthly_volume")} className={selectCls}>
                        <option value="">Select…</option>
                        {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </Field>
                    <Field id="bw-channel" label="How do you reach customers?">
                      <select id="bw-channel" value={form.preferred_channel} onChange={update("preferred_channel")} className={selectCls}>
                        {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field id="bw-reviewer" label="Who reviews incoming photos?">
                    <Input id="bw-reviewer" value={form.reviewer_info} onChange={update("reviewer_info")} placeholder="e.g. Office manager Sarah, or the estimating team" className={inputCls} />
                  </Field>
                </div>

                {/* Section 4 */}
                <div className="space-y-4 border-t border-border pt-7">
                  <div>
                    <p className={sectionLabelCls}>[ D ] First template ideas</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">We'll build your first templates based on this. Don't overthink it — we'll refine together over chat or email.</p>
                  </div>
                  <Field id="bw-templates" label="What should your first 1–2 templates cover?">
                    <Textarea
                      id="bw-templates"
                      value={form.template_ideas}
                      onChange={update("template_ideas")}
                      rows={4}
                      placeholder="e.g. Roof damage assessment — need overall roof shot, close-up of damage area, photos of gutters and flashing, and any interior water stains."
                      className={textareaCls}
                    />
                  </Field>
                  <Field id="bw-notes" label="Anything else we should know?">
                    <Textarea
                      id="bw-notes"
                      value={form.notes}
                      onChange={update("notes")}
                      rows={3}
                      placeholder="Special requirements, team size, preferred communication channel, etc."
                      className={textareaCls}
                    />
                  </Field>
                </div>

                <button type="submit" disabled={submitting} className={`${primaryBtn} h-14 w-full rounded-[0.25rem]`}>
                  {submitting ? "Submitting…" : "Submit for concierge setup"}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </button>

                <p className="text-center font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground">
                  Questions?{" "}
                  <a href="mailto:hello@photobrief.ai" className="text-[hsl(var(--accent-kinetic))] hover:underline">
                    hello@photobrief.ai
                  </a>
                </p>
              </form>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
