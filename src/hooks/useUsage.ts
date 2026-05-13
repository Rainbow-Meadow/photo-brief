// Per-workspace usage counters for the current billing period.
// Reads request/AI diagnostic counts plus the primary PhotoBrief Credit balance.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { getPlanLimit } from "@/config/planLimits";
import { useTopupBalance } from "@/hooks/useTopupBalance";

export type UsageEventType =
  | "request_created"
  | "ai_check_run"
  | "ai_photo_check"
  | "ai_submission_summary"
  | "ai_guide_generation"
  | "ai_request_builder"
  | "ai_followup_generation"
  | "ai_admin_rerun"
  | "manual_request_created";

export interface UsageSnapshot {
  requests: number;
  aiChecks: number;
  creditsUsed: number;
  creditsIncluded: number;
  creditsRemaining: number;
  topupCreditsRemaining: number;
  creditPeriodStart?: string | null;
  topupCreditsExpireAt?: string | null;
}

const emptyUsage: UsageSnapshot = {
  requests: 0,
  aiChecks: 0,
  creditsUsed: 0,
  creditsIncluded: 0,
  creditsRemaining: 0,
  topupCreditsRemaining: 0,
};

export function useUsage() {
  const { workspace, loading: wsLoading } = useCurrentWorkspace();
  const [usage, setUsage] = useState<UsageSnapshot>(emptyUsage);
  const [loading, setLoading] = useState(true);
  const { balance: topup, refetch: refetchTopup, loading: topupLoading } = useTopupBalance();

  const refetch = useCallback(async () => {
    if (!workspace?.id) return;
    setLoading(true);
    const [{ data: req }, { data: ai }, { data: creditRows, error: creditErr }] = await Promise.all([
      supabase.rpc("current_period_usage", {
        _workspace_id: workspace.id,
        _event_type: "request_created",
      }),
      supabase.rpc("current_period_usage", {
        _workspace_id: workspace.id,
        _event_type: "ai_photo_check",
      }),
      (supabase as any).rpc("current_credit_balance", {
        _workspace_id: workspace.id,
      }),
    ]);

    const creditRow = Array.isArray(creditRows) ? creditRows[0] : creditRows;
    const fallbackLimit = getPlanLimit(workspace.plan ?? "intake");
    const fallbackCredits = fallbackLimit.quotas.creditsPerMonth === "unlimited"
      ? Number.POSITIVE_INFINITY
      : fallbackLimit.quotas.creditsPerMonth;

    if (creditErr) {
      console.error("current_credit_balance error", creditErr);
    }

    setUsage({
      requests: typeof req === "number" ? req : 0,
      aiChecks: typeof ai === "number" ? ai : 0,
      creditsUsed: Number(creditRow?.used ?? 0),
      creditsIncluded: Number(creditRow?.included ?? fallbackCredits ?? 0),
      creditsRemaining: Number(creditRow?.remaining ?? fallbackCredits ?? 0),
      topupCreditsRemaining: Number(creditRow?.topup_remaining ?? topup.remaining ?? 0),
      creditPeriodStart: creditRow?.period_start ?? null,
      topupCreditsExpireAt: creditRow?.topup_expires_at ?? null,
    });
    await refetchTopup();
    setLoading(false);
  }, [workspace?.id, workspace?.plan, refetchTopup, topup.remaining]);

  useEffect(() => {
    if (wsLoading) return;
    refetch();
  }, [wsLoading, refetch]);

  const limit = getPlanLimit(workspace?.plan ?? "intake");
  const requestCap = limit.quotas.requestsPerMonth;
  const creditCap = limit.quotas.creditsPerMonth;

  const planRequestsRemaining =
    requestCap === "unlimited" ? Infinity : Math.max(0, requestCap - usage.requests);
  const requestsRemaining =
    requestCap === "unlimited" ? Infinity : planRequestsRemaining + topup.remaining;
  const planAtLimit = requestCap !== "unlimited" && usage.requests >= requestCap;
  const requestsAtLimit = planAtLimit && topup.remaining === 0;

  const creditsRemaining =
    creditCap === "unlimited" ? Infinity : usage.creditsRemaining;
  const creditsAtLimit = creditCap !== "unlimited" && creditsRemaining <= 0;

  return {
    usage,
    loading: loading || wsLoading || topupLoading,
    refetch,
    requestsRemaining,
    requestsAtLimit,
    creditsRemaining,
    creditsAtLimit,
    onTopupCredits: planAtLimit && topup.remaining > 0,
    topup: {
      ...topup,
      remaining: usage.topupCreditsRemaining || topup.remaining,
      expiresAt: usage.topupCreditsExpireAt ?? topup.expiresAt,
    },
    quotas: limit.quotas,
  };
}

/** Log a usage event manually. Edge Functions should use DB RPC `log_credit_usage`. */
export async function logUsageEvent(
  workspaceId: string,
  eventType: UsageEventType,
  relatedId?: string,
  metadata: Record<string, unknown> = {},
  creditCost = 0,
) {
  await supabase.from("usage_events").insert({
    workspace_id: workspaceId,
    event_type: eventType,
    related_id: relatedId ?? null,
    metadata: metadata as never,
    credit_cost: creditCost,
  } as never);
}
