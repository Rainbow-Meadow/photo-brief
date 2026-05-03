import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole, MessageSquareText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <div className="rounded-[2rem] border bg-card/80 p-8 text-center shadow-sm backdrop-blur">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-muted" />
          <p className="mt-4 text-sm text-muted-foreground">Opening intake form…</p>
        </div>
      </PublicShell>
    );
  }

  if (error && !config) {
    return (
      <PublicShell>
        <div className="rounded-[2rem] border bg-card/80 p-8 text-center shadow-sm backdrop-blur">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-foreground">This intake form is not available</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
          <p className="mt-4 rounded-2xl bg-muted/45 p-3 text-xs leading-5 text-muted-foreground">
            The business can still send you a manual PhotoBrief request link if they are not using Website Intake.
          </p>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_30px_90px_-55px_hsl(222_47%_11%/0.55)] backdrop-blur sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-ambient-sky opacity-80" />
        <div className="flex items-center gap-3">
          {config?.logoUrl ? (
            <img src={config.logoUrl} alt="" className="h-11 w-11 rounded-2xl object-contain bg-background/70 p-1 ring-1 ring-border/60" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">{config?.businessName}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Start your request</h1>
          </div>
        </div>

        <p className="mt-5 text-base leading-7 text-muted-foreground">
          {config?.introMessage}
        </p>

        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" className="h-12 rounded-2xl bg-background/80" />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="h-12 rounded-2xl bg-background/80" />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Phone optional">
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="555-0142" className="h-12 rounded-2xl bg-background/80" />
            </Field>
            <Field label="What do you need help with?">
              {config?.requestTypeOptions?.length ? (
                <select
                  value={form.request_type}
                  onChange={(e) => setForm((f) => ({ ...f, request_type: e.target.value }))}
                  className="h-12 w-full rounded-2xl border bg-background/80 px-3 text-sm"
                >
                  <option value="">Choose one</option>
                  {config.requestTypeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              ) : (
                <Input value={form.request_type} onChange={(e) => setForm((f) => ({ ...f, request_type: e.target.value }))} placeholder="Quote, repair, return…" className="h-12 rounded-2xl bg-background/80" />
              )}
            </Field>
          </div>

          <Field label="Address optional">
            <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Service address or location" className="h-12 rounded-2xl bg-background/80" />
          </Field>

          <Field label="Tell us a little more">
            <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="A short note is enough." rows={4} className="rounded-2xl bg-background/80" />
          </Field>
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

        <Button size="lg" className="mt-6 h-14 w-full rounded-2xl text-base shadow-glow" disabled={!canSubmit || submitting} onClick={submit}>
          {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquareText className="mr-2 h-5 w-5" />}
          {submitting ? "Starting…" : "Start photo request"}
          {!submitting ? <ArrowRight className="ml-2 h-5 w-5" /> : null}
        </Button>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          After this, you may be asked for a few photos so the business can help faster.
        </div>
      </section>

      {!config?.hidePhotobriefBranding ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">Powered by PhotoBrief</p>
      ) : null}
    </PublicShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
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
