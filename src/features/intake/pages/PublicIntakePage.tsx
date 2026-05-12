// build: refresh hosted bundle so Supabase env vars get baked in (2026-05-12)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole, MessageSquareText, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { photoPolicyShort, photoPolicySentence, type PhotoPolicy } from "@/features/intake/lib/photoPolicy";
import { IntakeAttachmentUploader } from "@/features/intake/components/IntakeAttachmentUploader";

interface SmartIntakeRoute {
  id: string;
  label: string;
  description: string | null;
  photoPolicy: PhotoPolicy;
  photoPolicyReason: string | null;
  readinessGoal: string;
  questions: unknown[];
}

interface PublicIntakeConfig {
  ok: true;
  sourceName: string;
  businessName: string;
  logoUrl: string | null;
  brandColor: string | null;
  hidePhotobriefBranding: boolean;
  introMessage: string;
  requestTypeOptions: string[];
  smartIntake?: {
    blueprintId: string | null;
    routingQuestion: string;
    routes: SmartIntakeRoute[];
  };
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  request_type: string;
  message: string;
  address: string;
}

interface SubmittedIntake {
  briefId?: string;
  sessionId?: string;
  sessionToken?: string;
  readinessStatus?: string;
  photoPolicy?: PhotoPolicy;
  nextAction?: string | null;
  message?: string | null;
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
  const [submitted, setSubmitted] = useState<SubmittedIntake | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const { data: json, error: fnError } = await supabase.functions.invoke(`website-intake/${token}`, {
          method: "GET",
        });
        if (fnError) throw new Error((json as any)?.message ?? (json as any)?.error ?? fnError.message ?? "Could not load intake form");
        if (!cancelled) {
          const cfg = json as PublicIntakeConfig;
          setConfig(cfg);
          const firstRoute = cfg.smartIntake?.routes?.[0]?.label ?? cfg.requestTypeOptions?.[0];
          if (firstRoute && (cfg.smartIntake?.routes?.length === 1 || cfg.requestTypeOptions?.length === 1)) {
            setForm((f) => ({ ...f, request_type: firstRoute }));
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

  const selectedRoute = config?.smartIntake?.routes?.find((route) => route.label === form.request_type) ?? null;
  const canSubmit = form.name.trim() && (form.email.trim() || form.phone.trim()) && (form.request_type.trim() || form.message.trim());

  const submit = async () => {
    if (!token || !canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke(`website-intake/${token}`, {
        body: {
          ...form,
          route_id: selectedRoute?.id ?? null,
        },
      });
      if (fnError) throw new Error(data?.message ?? fnError.message);
      if (data?.ok && data.requestLink) {
        const next = new URL(data.requestLink).pathname;
        navigate(next);
        return;
      }
      if (data?.ok) {
        setSubmitted({
          briefId: data.briefId,
          sessionId: data.sessionId,
          sessionToken: data.sessionToken,
          readinessStatus: data.readiness_status,
          photoPolicy: data.photo_policy,
          nextAction: data.next_action,
          message: data.message,
        });
        return;
      }
      setError(data?.message ?? "We received your request, but could not finish the intake yet.");
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

  if (submitted) {
    return (
      <PublicShell>
        <section className="border border-border bg-card p-6 text-center sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-background text-[hsl(var(--accent-kinetic))]">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <p className="mt-6 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {config?.businessName}
          </p>
          <h1 className="mt-2 font-[Geist,Inter,system-ui,sans-serif] text-[clamp(1.7rem,4.5vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground">
            Thanks — we’ve got it
          </h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-muted-foreground">
            {submitted.message ?? "Your request was sent to the team. They’ll review the brief and follow up shortly."}
          </p>

          <dl className="mx-auto mt-6 grid max-w-md gap-2 text-left">
            {submitted.nextAction ? (
              <div className="border border-border bg-background p-4">
                <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">What happens next</dt>
                <dd className="mt-1.5 text-sm leading-6 text-foreground">{submitted.nextAction}</dd>
              </div>
            ) : null}
            <div className="border border-border bg-background p-4">
              <dt className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">Photos</dt>
              <dd className="mt-1.5 text-sm leading-6 text-foreground">
                {photoPolicyShort(submitted.photoPolicy)}
                <span className="text-muted-foreground"> — {photoPolicySentence(submitted.photoPolicy)}.</span>
              </dd>
            </div>
          </dl>

          <p className="mx-auto mt-6 max-w-sm text-xs leading-5 text-muted-foreground">
            You can close this page. If anything is needed, the business will reach out using the contact details you provided.
          </p>
        </section>

        {!config?.hidePhotobriefBranding ? (
          <p className="mt-4 text-center font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted-foreground">
            Powered by PhotoBrief
          </p>
        ) : null}
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <section className="border border-border bg-card p-4 sm:p-7">
        <div className="flex items-start gap-3 border-b border-border pb-4 sm:items-center sm:pb-5">
          {config?.logoUrl ? (
            <img
              src={config.logoUrl}
              alt=""
              className="h-12 w-12 shrink-0 border border-border bg-background object-contain p-1"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-border text-[hsl(var(--accent-kinetic))]">
              <Sparkles className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.7rem]">
              {config?.businessName}
            </p>
            <h1 className="mt-1 font-[Geist,Inter,system-ui,sans-serif] text-[clamp(1.4rem,6vw,2rem)] font-semibold leading-[1.1] tracking-[-0.022em] text-foreground">
              Start your request
            </h1>
          </div>
        </div>

        <p className="mt-4 text-[15px] leading-7 text-muted-foreground sm:mt-5 sm:text-base">{config?.introMessage}</p>

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
            <Field label={config?.smartIntake?.routingQuestion ?? "What do you need help with?"}>
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

          {selectedRoute ? (
            <div className="border border-border bg-background p-4">
              {selectedRoute.description ? (
                <p className="text-sm leading-6 text-foreground">{selectedRoute.description}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <span className="inline-flex items-center border border-border bg-card px-2 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-foreground">
                  Photos · {photoPolicyShort(selectedRoute.photoPolicy)}
                </span>
                <span className="text-xs leading-5 text-muted-foreground">
                  {selectedRoute.photoPolicyReason ?? photoPolicySentence(selectedRoute.photoPolicy) + "."}
                </span>
              </div>
            </div>
          ) : null}

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
          {submitting ? "Sending…" : "Send request"}
          {!submitting ? <ArrowRight className="h-4 w-4" /> : null}
        </button>

        <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--accent-kinetic))]" />
          Photos are only requested when they help the business understand your request faster.
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
    <main className="min-h-[100dvh] bg-background px-3 py-4 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-xl">{children}</div>
    </main>
  );
}

