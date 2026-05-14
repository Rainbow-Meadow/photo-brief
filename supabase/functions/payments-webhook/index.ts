import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyWebhook, EventName, type PaddleEnv } from '../_shared/paddle.ts';

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }
  return _supabase;
}

function intervalFromBillingCycle(cycle: any): 'monthly' | 'annual' {
  if (cycle?.interval === 'year') return 'annual';
  return 'monthly';
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData, discount } = data;
  const workspaceId = customData?.workspaceId;
  if (!workspaceId) {
    console.error('No workspaceId in customData', { id });
    return;
  }
  const item = items[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.product?.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn('Skipping subscription: missing importMeta.externalId', {
      rawPriceId: item?.price?.id,
      rawProductId: item?.product?.id,
    });
    return;
  }
  const planTier = productId === 'intake_team' ? 'intake_team' : 'intake';
  const billingInterval = intervalFromBillingCycle(item?.price?.billingCycle);

  const { error } = await getSupabase().from('subscriptions').upsert({
    workspace_id: workspaceId,
    paddle_subscription_id: id,
    paddle_customer_id: customerId,
    product_id: productId,
    price_id: priceId,
    plan_tier: planTier,
    billing_interval: billingInterval,
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    is_founding_pro: !!discount?.id,
    environment: env,
    trial_ends_at: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'paddle_subscription_id' });
  if (error) console.error('upsert subscription error:', error);
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, items, status, currentBillingPeriod, scheduledChange } = data;
  const item = items?.[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.product?.importMeta?.externalId;
  const update: Record<string, unknown> = {
    status,
    current_period_start: currentBillingPeriod?.startsAt,
    current_period_end: currentBillingPeriod?.endsAt,
    cancel_at_period_end: scheduledChange?.action === 'cancel',
    updated_at: new Date().toISOString(),
  };
  if (priceId && productId) {
    update.price_id = priceId;
    update.product_id = productId;
    update.plan_tier = productId === 'intake_team' ? 'intake_team' : 'intake';
    update.billing_interval = intervalFromBillingCycle(item?.price?.billingCycle);
  }
  const { error } = await getSupabase()
    .from('subscriptions')
    .update(update)
    .eq('paddle_subscription_id', id)
    .eq('environment', env);
  if (error) console.error('update subscription error:', error);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  const { error } = await getSupabase()
    .from('subscriptions')
    .update({
      status: 'canceled',
      current_period_end: data.currentBillingPeriod?.endsAt ?? data.canceledAt,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', data.id)
    .eq('environment', env);
  if (error) console.error('cancel subscription error:', error);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const url = new URL(req.url);
  const env = (url.searchParams.get('env') || 'sandbox') as PaddleEnv;
  try {
    const event = await verifyWebhook(req, env);
    switch (event.eventType) {
      case EventName.SubscriptionCreated:
        await handleSubscriptionCreated(event.data, env);
        break;
      case EventName.SubscriptionUpdated:
        await handleSubscriptionUpdated(event.data, env);
        break;
      case EventName.SubscriptionCanceled:
        await handleSubscriptionCanceled(event.data, env);
        break;
      default:
        console.log('Unhandled event:', event.eventType);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Webhook error:', e);
    return new Response('Webhook error', { status: 400 });
  }
});
