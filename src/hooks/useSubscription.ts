import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";

export interface SubscriptionRow {
  id: string;
  workspace_id: string;
  paddle_subscription_id: string | null;
  paddle_customer_id: string | null;
  product_id: string | null;
  price_id: string | null;
  plan_tier: "intake" | "intake_team";
  billing_interval: "monthly" | "annual";
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  is_founding_pro: boolean;
  trial_ends_at: string | null;
  environment: "sandbox" | "live";
}

export function useSubscription(workspaceId: string | undefined) {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSub = useCallback(async () => {
    if (!workspaceId) { setSubscription(null); setLoading(false); return; }
    const env = getPaddleEnvironment();
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as SubscriptionRow | null) ?? null);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => { void fetchSub(); }, [fetchSub]);

  useEffect(() => {
    if (!workspaceId) return;
    const ch = supabase
      .channel(`subs-${workspaceId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `workspace_id=eq.${workspaceId}` }, () => { void fetchSub(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [workspaceId, fetchSub]);

  const isPaid = !!subscription?.paddle_subscription_id &&
    ["active", "trialing", "past_due"].includes(subscription.status) &&
    (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

  return { subscription, loading, isPaid, refetch: fetchSub };
}
