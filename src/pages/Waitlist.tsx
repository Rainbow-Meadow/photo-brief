import { useEffect, useState } from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import { BadgeCheck, CheckCircle2, MailCheck, Sparkles } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/components/layout/BrandMark";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { conversions, trackEvent } from "@/lib/analytics";

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

const partnerBenefits = [
  "90-day free beta access",
  "Concierge setup for first briefs and templates",
  "Biweekly feedback check-ins",
  "50% off first year after launch",
  "Optional Founding Partner recognition",
];

interface FormState {
  name: string;
  business_name: string;
  email: string;
  business_type: string;
  website: string;
  use_case: string;
  estimated_monthly_requests: string;
  notes: string;
}

const EMPTY: FormState = {
  name: "",
  business_name: "",
  email: "",
  business_type: "",
  website: "",
  use_case: "",
  estimated_monthly_requests: "",
  notes: "",
};

export default function WaitlistPage() {
  const [params] = useSearchParams();
  const interest = params.get("interest");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<"new" | "already" | null>(null);

  useEffect(() => {
    trackEvent("waitlist_viewed", interest ? { interest } : undefined);
  }, [interest]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function validate(): string | null {
    if (!form.name.trim()) return "Please share your name.";
    if (!form.email.trim()) return "We need a work email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "That email doesn't look right.";
    }
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
          notes: interest ? `${form.notes ? form.notes + "\n\n" : ""}interest=${interest}` : form.notes,
          source: interest ? `founding-partner-beta:${interest}` : "founding-partner-beta",
        },
      });
      if (error) throw error;
      const payload = data as { ok?: boolean; already?: boolean } | null;
      if (payload?.already) {
        trackEvent("waitlist_duplicate");
        setDone("already");
      } else {
        trackEvent("waitlist_submitted", {
          interest: interest ?? undefined,
          business_type: form.business_type || undefined,
          estimated_monthly_requests: form.estimated_monthly_requests || undefined,
        });
        conversions.waitlistSubmitted({
          interest: interest ?? undefined,
          business_type: form.business_type || undefined,
          estimated_monthly_requests: form.estimated_monthly_requests || undefined,
        });
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
    <div className="relative isolate overflow-hidden">
      <SEOHead
        title="Apply for the PhotoBrief.ai Founding Partner Beta"
        description="Apply for PhotoBrief.ai founding partner beta access: 90 days free, concierge setup, direct support, feature influence, and first-year founding partner pricing."
        canonicalPath="/waitlist"
      />
      <div className="pb-lens-field" />

      <div className="pb-container pb-section relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="text-center lg:sticky lg:top-28 lg:text-left">
          <div className="flex justify-center lg:justify-start">
            <BrandMark variant="stacked" tone="light" size={112} eager withGlow />
          </div>
          <span className="pb-eyebrow mt-6 inline-flex">
            <Sparkles className="h-3.5 w-3.5" /> Limited Founding Partner Beta
          </span>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Apply to become a PhotoBrief founding partner.
          </h1>
          <p className="pb-copy mt-4 max-w-xl text-balance text-base sm:text-lg lg:max-w-none">
            We're inviting a small group of businesses to get early access, hands-on setup, direct support, and the chance to shape PhotoBrief before public launch.
          </p>

          <div className="mt-6 grid gap-3 text-left">
            {partnerBenefits.map((benefit) => (
              <div key={benefit} className="flex gap-3 rounded-2xl border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-panel)/0.88)] p-3 text-sm text-[hsl(var(--pb-muted))]">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint))]" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <p className="pb-copy mt-5 text-sm leading-6">
            In return, we ask that beta partners use PhotoBrief in real workflows and share honest feedback every two weeks.
          </p>
        </div>

        <div>
          {done === "new" && (
            <div className="pb-command-panel p-8 text-center">
              <div className="relative z-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">Application received</h2>
                <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">
                  Thanks — we'll review your request and reach out if PhotoBrief is a fit for the Founding Partner Beta.
                </p>
                <Button asChild variant="outline" className="mt-6 rounded-full border-white/16 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white">
                  <NavLink to="/founding-partner-beta">View the beta program</NavLink>
                </Button>
              </div>
            </div>
          )}

          {done === "already" && (
            <div className="pb-command-panel p-8 text-center">
              <div className="relative z-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]">
                  <MailCheck className="h-7 w-7" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">Looks like you already applied</h2>
                <p className="mt-2 text-sm text-[hsl(var(--pb-muted))]">
                  We've got your details. We'll reach out as soon as a spot opens up for your workspace.
                </p>
                <Button asChild variant="outline" className="mt-6 rounded-full border-white/16 bg-white/[0.03] text-white hover:bg-white/10 hover:text-white">
                  <NavLink to="/founding-partner-beta">View the beta program</NavLink>
                </Button>
              </div>
            </div>
          )}

          {done === null && (
            <div className="pb-command-panel p-6 sm:p-8">
              <div className="relative z-10">
                <div className="mb-6 rounded-2xl border border-[hsl(var(--pb-lavender)/0.3)] bg-[hsl(var(--pb-lavender)/0.06)] p-4">
                  <p className="text-sm font-semibold text-[hsl(var(--pb-lavender))]">This is an application, not a public signup.</p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--pb-muted))]">
                    We're onboarding carefully so founding partners get useful setup help and the product gets feedback from real workflows.
                  </p>
                </div>
                <form onSubmit={onSubmit} className="grid gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="name" label="Your name" required>
                      <Input id="name" value={form.name} onChange={update("name")} autoComplete="name" required className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                    </Field>
                    <Field id="business_name" label="Business name">
                      <Input id="business_name" value={form.business_name} onChange={update("business_name")} autoComplete="organization" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                    </Field>
                  </div>

                  <Field id="email" label="Work email" required>
                    <Input id="email" type="email" value={form.email} onChange={update("email")} autoComplete="email" required className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="business_type" label="Business type">
                      <select
                        id="business_type"
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
                    <Field id="website" label="Website">
                      <Input id="website" value={form.website} onChange={update("website")} placeholder="https://" autoComplete="url" className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                    </Field>
                  </div>

                  <Field id="use_case" label="What real workflow would you use PhotoBrief for?">
                    <Textarea id="use_case" value={form.use_case} onChange={update("use_case")} rows={3} placeholder="e.g. Roof inspection photos before we send a quote." className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                  </Field>

                  <Field id="estimated_monthly_requests" label="Estimated monthly customer photo requests">
                    <select
                      id="estimated_monthly_requests"
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

                  <Field id="notes" label="Why would your business be a good founding partner? (optional)">
                    <Textarea id="notes" value={form.notes} onChange={update("notes")} rows={3} placeholder="Anything that would help us prioritize your spot." className="border-white/12 bg-white/[0.05] text-white placeholder:text-white/30" />
                  </Field>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs text-[hsl(var(--pb-muted))]">
                      Limited spots. We typically reply within a few days.
                    </p>
                    <Button type="submit" size="lg" disabled={submitting} variant="pb-primary">
                      {submitting ? "Submitting…" : "Apply to join"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-[hsl(var(--pb-muted))]">
            Already have an account?{" "}
            <NavLink to="/auth" className="font-medium text-[hsl(var(--pb-lavender))] hover:underline">
              Sign in
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}

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
    <div>
      <Label htmlFor={id} className="mb-1.5 inline-block text-white/80">
        {label}
        {required && <span className="ml-0.5 text-[hsl(var(--pb-lavender))]">*</span>}
      </Label>
      {children}
    </div>
  );
}
