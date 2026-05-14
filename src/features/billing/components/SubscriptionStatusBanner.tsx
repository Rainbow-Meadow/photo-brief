// Surfaces trial countdown and past_due / dunning state above billing UI
// and on the dashboard. Read-only; never modifies subscription state.
import { AlertTriangle, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useSubscription } from "@/hooks/useSubscription";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

interface Props {
  /** Hide the "go to billing" link (e.g. when already on the billing page). */
  hideCta?: boolean;
}

export function SubscriptionStatusBanner({ hideCta }: Props) {
  const { workspace } = useCurrentWorkspace();
  const { subscription } = useSubscription(workspace?.id);

  // 1. Past-due / dunning beats trial.
  if (subscription?.status === "past_due") {
    return (
      <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 p-4">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Your last payment failed.</p>
          <p className="mt-1 text-muted-foreground">
            We're retrying for a few days. Update your card before your account is paused.{" "}
            {!hideCta && (
              <NavLink to="/settings/billing" className="underline underline-offset-4">
                Update payment method
              </NavLink>
            )}
          </p>
        </div>
      </div>
    );
  }

  // 2. Trial countdown — only when no paid sub yet.
  const isPaid = !!subscription?.paddle_subscription_id &&
    ["active", "trialing"].includes(subscription.status);
  if (isPaid) return null;

  const days = daysUntil(workspace?.trialEndsAt ?? null);
  if (days === null || days > 3) return null;

  if (days <= 0) {
    return (
      <div className="flex items-start gap-3 border border-border bg-card p-4">
        <Clock className="mt-0.5 h-4 w-4 text-[hsl(var(--accent-kinetic))]" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Your free trial ended.</p>
          <p className="mt-1 text-muted-foreground">
            Pick a plan to keep sending intake briefs.{" "}
            {!hideCta && (
              <NavLink to="/settings/billing" className="underline underline-offset-4">
                Pick a plan
              </NavLink>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 border border-border bg-card p-4">
      <Clock className="mt-0.5 h-4 w-4 text-[hsl(var(--accent-kinetic))]" />
      <div className="text-sm">
        <p className="font-medium text-foreground">
          {days === 1 ? "1 day left in your trial." : `${days} days left in your trial.`}
        </p>
        <p className="mt-1 text-muted-foreground">
          Lock in your founding-partner price before the trial ends.{" "}
          {!hideCta && (
            <NavLink to="/settings/billing" className="underline underline-offset-4">
              Pick a plan
            </NavLink>
          )}
        </p>
      </div>
    </div>
  );
}
