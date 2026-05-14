// Sends T-3 and T-1 trial-ending nudges. Idempotent via
// business_workspaces.trial_nudge_t{3,1}_sent_at columns.
// Skips workspaces that already have a paid subscription.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const APP_URL = Deno.env.get('APP_PUBLIC_URL') ?? 'https://photobrief.ai';

interface WorkspaceRow {
  id: string;
  name: string;
  owner_id: string;
  trial_ends_at: string;
  trial_nudge_t3_sent_at: string | null;
  trial_nudge_t1_sent_at: string | null;
}

async function sendNudge(ws: WorkspaceRow, daysLeft: 3 | 1) {
  // Skip if workspace has any active/trialing/past_due subscription with a Paddle ID.
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('paddle_subscription_id, status')
    .eq('workspace_id', ws.id)
    .not('paddle_subscription_id', 'is', null)
    .in('status', ['active', 'trialing', 'past_due'])
    .limit(1)
    .maybeSingle();
  if (sub) return { skipped: 'has_subscription' };

  // Resolve owner email from auth.users.
  const { data: userRes } = await supabase.auth.admin.getUserById(ws.owner_id);
  const email = userRes?.user?.email;
  const fullName =
    (userRes?.user?.user_metadata as any)?.full_name ??
    (userRes?.user?.user_metadata as any)?.name ?? null;
  if (!email) return { skipped: 'no_email' };

  const idempotencyKey = `trial-ending-${ws.id}-t${daysLeft}`;
  const { error } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'trial-ending',
      recipientEmail: email,
      idempotencyKey,
      templateData: {
        name: fullName,
        daysLeft,
        billingUrl: `${APP_URL}/settings/billing`,
      },
    },
  });
  if (error) {
    console.error('send-transactional-email failed', { ws: ws.id, daysLeft, error });
    return { error: error.message };
  }

  const col = daysLeft === 3 ? 'trial_nudge_t3_sent_at' : 'trial_nudge_t1_sent_at';
  await supabase
    .from('business_workspaces')
    .update({ [col]: new Date().toISOString() })
    .eq('id', ws.id);
  return { sent: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const now = Date.now();
    const t3Min = new Date(now + 2 * 24 * 3600 * 1000).toISOString();
    const t3Max = new Date(now + 4 * 24 * 3600 * 1000).toISOString();
    const t1Min = new Date(now + 0).toISOString();
    const t1Max = new Date(now + 36 * 3600 * 1000).toISOString();

    // T-3 candidates: trial ends in ~3 days, not yet sent.
    const { data: t3 } = await supabase
      .from('business_workspaces')
      .select('id, name, owner_id, trial_ends_at, trial_nudge_t3_sent_at, trial_nudge_t1_sent_at')
      .gte('trial_ends_at', t3Min)
      .lte('trial_ends_at', t3Max)
      .is('trial_nudge_t3_sent_at', null)
      .limit(200);

    // T-1 candidates: trial ends within ~36h, not yet sent.
    const { data: t1 } = await supabase
      .from('business_workspaces')
      .select('id, name, owner_id, trial_ends_at, trial_nudge_t3_sent_at, trial_nudge_t1_sent_at')
      .gte('trial_ends_at', t1Min)
      .lte('trial_ends_at', t1Max)
      .is('trial_nudge_t1_sent_at', null)
      .limit(200);

    const results: any[] = [];
    for (const ws of (t3 ?? []) as WorkspaceRow[]) {
      results.push({ ws: ws.id, t: 3, ...(await sendNudge(ws, 3)) });
    }
    for (const ws of (t1 ?? []) as WorkspaceRow[]) {
      results.push({ ws: ws.id, t: 1, ...(await sendNudge(ws, 1)) });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('check-trial-nudges error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
