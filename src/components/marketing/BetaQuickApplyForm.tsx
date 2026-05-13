import { useState, type ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";

import { CTAGroup, Body } from "@/design-system/schema";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { BETA_TOTAL_PARTNERS } from "@/config/betaProgram";

const quickApplySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(254),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  website_url: z.string().max(0).optional().or(z.literal("")),
});

interface Props {
  isFull: boolean;
  source?: string;
  agentAnchor?: string;
}

export function BetaQuickApplyForm({ isFull, source = "landing-final-cta", agentAnchor }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [trap, setTrap] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const submitLabel = isFull ? "Join the waitlist" : "Send my application";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = quickApplySchema.safeParse({ name, email, company, website_url: trap });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name" || key === "email") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (trap) { setDone(true); return; }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("waitlist-submit", {
        body: {
          name: parsed.data.name,
          email: parsed.data.email,
          business_name: parsed.data.company || undefined,
          source,
          interest: "founding-partner",
        },
      });
      if (error) throw error;
      trackEvent("beta_quick_apply_submit", { source, has_company: Boolean(parsed.data.company) });
      setDone(true);
    } catch {
      toast({
        title: "Couldn't submit",
        description: "Something went wrong. Try again or use the full agent.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="border border-border bg-card p-8">
        <p className="ls-eyebrow">[ ✓ ] You're in the queue</p>
        <p className="ls-h3 mt-4">Watch your inbox.</p>
        <Body>
          We read every application by hand. If one of the {BETA_TOTAL_PARTNERS} founding seats has your name on it, you'll hear back within 48 hours.
        </Body>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-border bg-card p-6 sm:p-8" noValidate>
      <p className="ls-eyebrow">{isFull ? "Waitlist" : "Thirty seconds to a founding seat"}</p>
      <div className="mt-6 space-y-5">
        <FormField label="Name" error={errors.name}>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            maxLength={80} required autoComplete="name"
            className="w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition-colors focus:border-[hsl(var(--accent-kinetic))]"
          />
        </FormField>
        <FormField label="Work email" error={errors.email}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            maxLength={254} required autoComplete="email"
            className="w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition-colors focus:border-[hsl(var(--accent-kinetic))]"
          />
        </FormField>
        <FormField label="Company or website" hint="optional">
          <input
            type="text" value={company} onChange={(e) => setCompany(e.target.value)}
            maxLength={120} autoComplete="organization"
            className="w-full border-0 border-b border-border bg-transparent py-2 text-foreground outline-none transition-colors focus:border-[hsl(var(--accent-kinetic))]"
          />
        </FormField>
        <input
          type="text" tabIndex={-1} aria-hidden="true" autoComplete="off"
          value={trap} onChange={(e) => setTrap(e.target.value)}
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
      </div>
      <CTAGroup>
        <button
          type="submit" disabled={submitting}
          className="ls-cta ls-cta--lg ls-cta-primary mt-8 w-full disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {submitting ? "Sending…" : submitLabel}
        </button>
      </CTAGroup>
      {agentAnchor && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Prefer the full 6-min agent?{" "}
          <a
            href={agentAnchor}
            className="text-foreground underline-offset-4 hover:underline"
            onClick={(e) => {
              if (agentAnchor.startsWith("#")) {
                e.preventDefault();
                document.getElementById(agentAnchor.slice(1))?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            Open the onboarding agent
          </a>
        </p>
      )}
    </form>
  );
}

function FormField({
  label, hint, error, children,
}: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
        {hint && <span className="ml-2 normal-case tracking-normal text-muted-foreground/60">({hint})</span>}
      </span>
      <div className="mt-2">{children}</div>
      {error && <span className="mt-1 block text-xs text-[hsl(var(--accent-kinetic))]">{error}</span>}
    </label>
  );
}
