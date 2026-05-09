import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole, MessageSquareText, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface PublicIntakeConfig {
  ok: true;
  sourceName: string;
  businessName: string;
  logoUrl: string | null;
  brandColor: string | null;
  hidePhotobriefBranding: boolean;
  introMessage: string;
  requestTypeOptions: string[];
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  request_type: string;
  message: string;
  address: string;
}

const blank: FormState = {
  name: "",
  email: "",
  phone: "",
  request_type: "",
  message: "",
  address: "",
};

const inputCls =
  "h-12 w-full border border-border bg-background px-3 text-sm text-foreground rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";

export default function PublicIntakePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState<PublicIntakeConfig | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/website-intake/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message ?? json?.error ?? "Could not load intake form");
        if (!cancelled) {
          setConfig(json);
          if (json.requestTypeOptions?.length === 1) {
            setForm((f) => ({ ...f, request_type: json.requestTypeOptions[0] }));
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Could not load intake form");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const canSubmit = form.name.trim() && (form.email.trim() || form.phone.trim()) && (form.request_type.trim() || form.message.trim());

  const submit = async () => {
    if (!token || !canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(`website-intake/${token}`, {
        body: form,
      });
      if (fnError) throw new Error(data?.message ?? fnError.message);
      if (data?.ok && data.requestLink) {
        const next = new URL(data.requestLink).pathname;
        navigate(next);
        return;
      }
      setError(data?.message ?? "We received your request, but could not start the photo steps yet.");
    } catch (e: any) {
      setError(e?.message ?? "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicShell>
        <article className="border border-border bg-card p-7 text-center">
          <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span className="text-[hsl(var(--accent-kinetic))]">[ 00 ]</span>
            <span>Loading</span>
          </p>
          <div className="mx-auto mt-5 h-8 w-8 animate-pulse bg-muted" />
          <p className="mt-4 text-sm text-muted-foreground">Opening intake form…</p>
        </article>
      </PublicShell>
    );
  }

  if (error && !config) {
    return (
      <PublicShell>
        <article className="border border-border bg-card p-7 text-center">
          <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span className="text-[hsl(var(--accent-kinetic))]">[ ER ]</span>
            <span>Form unavailable</span>
          </p>
          <h1 className="mt-5 font-[Geist,Inter,system-ui,sans-serif] text-xl font-semibold tracking-[-0.022em] text-foreground">
            This intake form is not available
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
          <div className="mx-auto mt-5 flex h-10 w-10 items-center justify-center border border-border text-muted-foreground">
            <LockKeyhole className="h-4 w-4" />
          </div>
          <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
            The business can still send you a manual PhotoBrief request link if they are not using Website Intake.
          </p>
        </article>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="border border-border bg-card p-5 sm:p-7">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt=""
              className="h-11 w-11 border border-border bg-background object-contain p-1"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center border border-border text-[hsl(var(--accent-kinetic))]">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {config?.businessName}
            </p>
            <h1 className="mt-1 font-[Geist,Inter,system-ui,sans-serif] text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
              Start your request
            </h1>
          </div>
        </div>

        <p className="mt-5 text-base leading-7 text-muted-foreground">{config?.introMessage}</p>

        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name">
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
                className={inputCls}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone — optional">
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="555-0142"
                className={inputCls}
              />
            </Field>
            <Field label="What do you need help with?">
              {config?.requestTypeOptions?.length ? (
                <select
                  value={form.request_type}
                  onChange={(e) => setForm((f) => ({ ...f, request_type: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">Choose one</option>
                  {config.requestTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              ) : (
                <Input
                  value={form.request_type}
                  onChange={(e) => setForm((f) => ({ ...f, request_type: e.target.value }))}
                  placeholder="Quote, repair, return…"
                  className={inputCls}
                />
              )}
            </Field>
          </div>

          <Field label="Address — optional">
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Service address or location"
              className={inputCls}
            />
          </Field>

          <Field label="Tell us a little more">
            <Textarea
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="A short note is enough."
              rows={4}
              className="w-full rounded-none border border-border bg-background p-3 text-sm text-foreground"
            />
          </Field>
        </div>

        {error ? (
          <p className="mt-4 border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || submitting}
          className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-6 font-[Geist,Inter,system-ui,sans-serif] text-[0.85rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
          {submitting ? "Starting…" : "Start photo request"}
          {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
        </button>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" />
          After this, you may be asked for a few photos so the business can help faster.
        </div>
      </section>

      {!config?.hidePhotobriefBranding ? (
        <p className="mt-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
          Powered by PhotoBrief
        </p>
      ) : null}
    </PublicShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-xl">{children}</div>
    </main>
  );
}
