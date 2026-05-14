// Upgrade or downgrade a subscription with proration.
// Customer pays the difference immediately; tier switches on the spot.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { getPaddleClient, gatewayFetch, type PaddleEnv } from '../_shared/paddle.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function resolvePriceId(env: PaddleEnv, externalId: string): Promise<string> {
  const res = await gatewayFetch(env, `/prices?external_id=${encodeURIComponent(externalId)}`);
  const data = await res.json();
  if (!data.data?.length) throw new Error(`Price not found: ${externalId}`);
  return data.data[0].id;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const { workspaceId, newPriceId, environment } = await req.json();
    const env: PaddleEnv = environment === 'live' ? 'live' : 'sandbox';

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: sub } = await admin
      .from('subscriptions')
      .select('paddle_subscription_id, plan_tier, billing_interval')
      .eq('workspace_id', workspaceId)
      .eq('environment', env)
      .not('paddle_subscription_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.paddle_subscription_id) {
      return new Response(JSON.stringify({ error: 'No active subscription' }), { status: 404, headers: corsHeaders });
    }

    // Determine direction: upgrade = bill the difference now (prorated_immediately).
    // Downgrade = take effect at next renewal (no refund), per product policy.
    const TIER_RANK: Record<string, number> = { intake: 1, intake_team: 2 };
    const INTERVAL_RANK: Record<string, number> = { monthly: 1, annual: 2 };
    const newTier = newPriceId.startsWith('intake_team') ? 'intake_team' : 'intake';
    const newInterval = newPriceId.endsWith('_annual') ? 'annual' : 'monthly';
    const currentRank = (TIER_RANK[(sub as any).plan_tier] ?? 1) * 10 + (INTERVAL_RANK[(sub as any).billing_interval] ?? 1);
    const nextRank = (TIER_RANK[newTier] ?? 1) * 10 + (INTERVAL_RANK[newInterval] ?? 1);
    const isUpgrade = nextRank > currentRank;

    const paddlePriceId = await resolvePriceId(env, newPriceId);
    const paddle = getPaddleClient(env);
    const updated = await paddle.subscriptions.update(sub.paddle_subscription_id as string, {
      items: [{ priceId: paddlePriceId, quantity: 1 }],
      prorationBillingMode: isUpgrade ? 'prorated_immediately' : 'do_not_bill',
      ...(isUpgrade ? {} : { billingCycle: { effectiveFrom: 'next_billing_period' } }),
    } as any);
    return new Response(JSON.stringify({ ok: true, status: updated.status, mode: isUpgrade ? 'upgrade' : 'downgrade' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('change-subscription error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});
