import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, NavLink } from "react-router-dom";
import { Sparkles, ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageMeta } from "@/hooks/seo/usePageMeta";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/design-system/schema";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { getPaddleEnvironment } from "@/lib/paddle";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionStatusBanner } from "@/features/billing/components/SubscriptionStatusBanner";

type Tier = "intake" | "intake_team";
type Interval = "monthly" | "annual";

const PRICES: Record<Tier, Record<Interval, { id: string; amount: number; suffix: string }>> = {
  intake: {
    monthly: { id: "intake_monthly", amount: 79, suffix: "/mo" },
    annual: { id: "intake_annual", amount: 790, suffix: "/yr" },
  },
  intake_team: {
    monthly: { id: "intake_team_monthly", amount: 199, suffix: "/mo" },
    annual: { id: "intake_team_annual", amount: 1990, suffix: "/yr" },
  },
};

const TIER_LABEL: Record<Tier, string> = {
  intake: "Smart Intake",
  intake_team: "Smart Intake Team",
};

export default function BillingSettingsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { workspace } = useCurrentWorkspace();
  const { user } = useAuth();
  const workspaceId = workspace?.id;
  const { subscription, isPaid, refetch } = useSubscription(workspaceId);
  const { openCheckout } = usePaddleCheckout();

  const [interval, setInterval] = useState<Interval>(
    (subscription?.billing_interval as Interval) ?? "monthly",
  );
  const [pendingTier, setPendingTier] = useState<Tier | null>(null);
  const [busy, setBusy] = useState<null | "portal" | "change" | "cancel">(null);
  const [showCancel, setShowCancel] = useState(false);
  const env = getPaddleEnvironment();

  // Success toast + cleanup of ?checkout=success
  useEffect(() => {
    if (params.get("checkout") === "success") {
      toast.success("You're in. Welcome to PhotoBrief.");
      params.delete("checkout");
      setParams(params, { replace: true });
      const t = window.setInterval(() => { void refetch(); }, 1500);
      const stop = window.setTimeout(() => window.clearInterval(t), 12_000);
      return () => { window.clearInterval(t); window.clearTimeout(stop); };
    }
  }, [params, setParams, refetch]);

  // Auto-redirect to dashboard after subscription appears
  useEffect(() => {
    if (isPaid && params.get("from") === "checkout") navigate("/dashboard");
  }, [isPaid, navigate, params]);

  const currentTier: Tier = (subscription?.plan_tier as Tier) ?? (workspace?.plan as Tier) ?? "intake";
  const currentInterval: Interval = (subscription?.billing_interval as Interval) ?? "monthly";

  const handleCheckout = async (tier: Tier) => {
    if (!workspaceId) return;
    setPendingTier(tier);
    try {
      await openCheckout({
        priceId: PRICES[tier][interval].id,
        workspaceId,
        customerEmail: user?.email ?? undefined,
        successUrl: `${window.location.origin}/settings/billing?checkout=success&from=checkout`,
      });
    } catch (e) {
      console.error(e);
      toast.error("Couldn't open checkout. Try again.");
    } finally {
      setPendingTier(null);
    }
  };

  const handleChangePlan = async (tier: Tier, nextInterval: Interval) => {
    if (!workspaceId) return;
    setBusy("change");
    try {
      const { data, error } = await supabase.functions.invoke("change-subscription", {
        body: { workspaceId, newPriceId: PRICES[tier][nextInterval].id, environment: env },
      });
      if (error) throw error;
      const mode = (data as { mode?: string } | null)?.mode;
      if (mode === "downgrade") {
        toast.success("Plan change scheduled — takes effect at your next renewal.");
      } else {
        toast.success("Plan updated. You only paid the difference.");
      }
      void refetch();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't update plan.");
    } finally {
      setBusy(null);
    }
  };

  const handlePortal = async () => {
    if (!workspaceId) return;
    setBusy("portal");
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: { workspaceId, environment: env },
      });
      if (error) throw error;
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't open billing portal.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageMeta title="Billing | PhotoBrief" description="Manage your plan" canonicalPath="/settings/billing" />
      <Section>
        <Container width="narrow">
          {showCancel && workspaceId ? (
            <ExitInterview
              workspaceId={workspaceId}
              userId={user?.id ?? ""}
              onClose={() => setShowCancel(false)}
              onCanceled={() => { setShowCancel(false); void refetch(); }}
              env={env}
            />
          ) : !isPaid ? (
            <PickPlanCard
              interval={interval}
              setInterval={setInterval}
              pendingTier={pendingTier}
              onCheckout={handleCheckout}
            />
          ) : (
            <ManagePlanCard
              currentTier={currentTier}
              currentInterval={currentInterval}
              cancelAtPeriodEnd={subscription?.cancel_at_period_end ?? false}
              currentPeriodEnd={subscription?.current_period_end}
              onChangePlan={handleChangePlan}
              onPortal={handlePortal}
              onStartCancel={() => setShowCancel(true)}
              busy={busy}
            />
          )}
        </Container>
      </Section>
    </>
  );
}

function PickPlanCard({
  interval,
  setInterval,
  pendingTier,
  onCheckout,
}: {
  interval: Interval;
  setInterval: (i: Interval) => void;
  pendingTier: Tier | null;
  onCheckout: (t: Tier) => void;
}) {
  return (
    <div className="border border-border bg-card p-8">
      <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
        <Sparkles className="h-3.5 w-3.5" /> Pick your plan
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        Stop chasing. Start closing.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Replace your dumb form with a guided intake that drops a complete brief in your inbox. Cancel anytime.
      </p>

      <div className="mt-6 inline-flex rounded-[0.25rem] border border-border bg-background p-1">
        {(["monthly", "annual"] as Interval[]).map((i) => (
          <button
            key={i}
            onClick={() => setInterval(i)}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition ${
              interval === i ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {i === "monthly" ? "Monthly" : "Annual · save 17%"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(Object.keys(PRICES) as Tier[]).map((tier) => {
          const p = PRICES[tier][interval];
          return (
            <div key={tier} className="border border-border bg-background p-5">
              <p className="text-sm font-semibold text-foreground">{TIER_LABEL[tier]}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                ${p.amount}
                <span className="text-sm font-normal text-muted-foreground">{p.suffix}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Founding partners: use code{" "}
                <code className="text-foreground">
                  {tier === "intake" ? "FOUNDINGPRO" : "FOUNDINGTEAM"}
                </code>{" "}
                at checkout for 25% off forever.
              </p>
              <Button
                onClick={() => onCheckout(tier)}
                disabled={pendingTier === tier}
                className="mt-4 w-full rounded-[0.25rem] uppercase tracking-[0.14em]"
              >
                {pendingTier === tier ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Start {TIER_LABEL[tier]} <ArrowRight className="ml-1 h-4 w-4" /></>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Payments are handled by Paddle (our reseller and Merchant of Record). Need help?{" "}
        <a className="underline underline-offset-4" href="mailto:hello@photobrief.ai">hello@photobrief.ai</a>.
      </p>
    </div>
  );
}

function ManagePlanCard({
  currentTier,
  currentInterval,
  cancelAtPeriodEnd,
  currentPeriodEnd,
  onChangePlan,
  onPortal,
  onStartCancel,
  busy,
}: {
  currentTier: Tier;
  currentInterval: Interval;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null | undefined;
  onChangePlan: (t: Tier, i: Interval) => void;
  onPortal: () => void;
  onStartCancel: () => void;
  busy: null | "portal" | "change" | "cancel";
}) {
  const otherTier: Tier = currentTier === "intake" ? "intake_team" : "intake";
  const otherInterval: Interval = currentInterval === "monthly" ? "annual" : "monthly";
  const renewLabel = useMemo(() => {
    if (!currentPeriodEnd) return null;
    return new Date(currentPeriodEnd).toLocaleDateString();
  }, [currentPeriodEnd]);

  return (
    <div className="border border-border bg-card p-8">
      <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
        <Sparkles className="h-3.5 w-3.5" /> Your plan
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {TIER_LABEL[currentTier]} · {currentInterval === "monthly" ? "Monthly" : "Annual"}
      </h1>
      {cancelAtPeriodEnd && renewLabel ? (
        <p className="mt-3 text-sm leading-6 text-[hsl(var(--accent-kinetic))]">
          Canceling — you keep access until {renewLabel}.
        </p>
      ) : renewLabel ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Renews {renewLabel}.</p>
      ) : null}

      <div className="mt-6 space-y-3">
        <Button
          onClick={() => onChangePlan(otherTier, currentInterval)}
          disabled={busy !== null}
          variant="outline"
          className="w-full justify-between rounded-[0.25rem]"
        >
          <span>
            {currentTier === "intake" ? "Upgrade to " : "Switch to "}
            {TIER_LABEL[otherTier]}
          </span>
          <span className="text-xs text-muted-foreground">
            ${PRICES[otherTier][currentInterval].amount}{PRICES[otherTier][currentInterval].suffix} · prorated
          </span>
        </Button>
        <Button
          onClick={() => onChangePlan(currentTier, otherInterval)}
          disabled={busy !== null}
          variant="outline"
          className="w-full justify-between rounded-[0.25rem]"
        >
          <span>Switch to {otherInterval === "annual" ? "annual (save 17%)" : "monthly"}</span>
          <span className="text-xs text-muted-foreground">
            ${PRICES[currentTier][otherInterval].amount}{PRICES[currentTier][otherInterval].suffix}
          </span>
        </Button>
        <Button onClick={onPortal} disabled={busy !== null} variant="outline" className="w-full justify-between rounded-[0.25rem]">
          <span>Manage payment method & invoices</span>
          {busy === "portal" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
        </Button>
      </div>

      {!cancelAtPeriodEnd ? (
        <button
          onClick={onStartCancel}
          className="mt-6 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Cancel my plan
        </button>
      ) : null}

      <p className="mt-6 text-xs text-muted-foreground">
        Need help?{" "}
        <NavLink to="/pricing" className="underline underline-offset-4">See plan details</NavLink>{" · "}
        <a className="underline underline-offset-4" href="mailto:hello@photobrief.ai">hello@photobrief.ai</a>.
      </p>
    </div>
  );
}

const REASONS = [
  { v: "too_expensive", l: "Too expensive" },
  { v: "missing_feature", l: "Missing a feature I need" },
  { v: "not_using", l: "Not using it enough" },
  { v: "switched", l: "Switched to something else" },
  { v: "temporary", l: "Just pausing for a bit" },
  { v: "other", l: "Other" },
];

function ExitInterview({
  workspaceId,
  userId,
  onClose,
  onCanceled,
  env,
}: {
  workspaceId: string;
  userId: string;
  onClose: () => void;
  onCanceled: () => void;
  env: "sandbox" | "live";
}) {
  const [reason, setReason] = useState<string>("");
  const [details, setDetails] = useState("");
  const [wouldReturn, setWouldReturn] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) {
      toast.error("Pick a reason so we can do better.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: insertErr } = await supabase.from("exit_interviews").insert({
        workspace_id: workspaceId,
        user_id: userId,
        reason,
        details: details || null,
        would_return: wouldReturn || null,
      });
      if (insertErr) throw insertErr;
      const { error } = await supabase.functions.invoke("cancel-subscription", {
        body: { workspaceId, environment: env },
      });
      if (error) throw error;
      toast.success("Cancellation scheduled. You keep access until period end.");
      onCanceled();
    } catch (e: any) {
      toast.error(e?.message ?? "Couldn't cancel. Try again or email us.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-border bg-card p-8">
      <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
        <Sparkles className="h-3.5 w-3.5" /> Before you go
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        What didn't land?
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Three quick questions. Honest answers help us fix the thing that broke for you.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Reason</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r.v}
                type="button"
                onClick={() => setReason(r.v)}
                className={`rounded-[0.25rem] border px-3 py-1.5 text-xs ${
                  reason === r.v ? "border-foreground bg-foreground text-background" : "border-border text-foreground"
                }`}
              >
                {r.l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            What specifically? (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-[0.25rem] border border-border bg-background p-3 text-sm text-foreground"
            placeholder="The most useful answer is the one that names the thing that frustrated you."
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            What would bring you back? (optional)
          </label>
          <input
            value={wouldReturn}
            onChange={(e) => setWouldReturn(e.target.value)}
            className="mt-2 w-full rounded-[0.25rem] border border-border bg-background p-3 text-sm text-foreground"
            placeholder="e.g. CRM integration, lower price, fewer steps"
          />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={submit}
          disabled={submitting}
          className="rounded-[0.25rem] uppercase tracking-[0.14em]"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit and cancel"}
        </Button>
        <Button onClick={onClose} variant="outline" className="rounded-[0.25rem] uppercase tracking-[0.14em]">
          Keep my plan
        </Button>
      </div>
    </div>
  );
}
