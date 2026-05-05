/**
 * integration-disconnect — Disconnect an OAuth provider, revoke tokens, clear ciphertext.
 *
 * POST body: { connectionId: string }
 */

import { createClient } from 'npm:@supabase/supabase-js@2'
import { decryptJson } from '../_shared/integration-crypto.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function revokeGoogle(accessToken: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

async function revokeHubSpot(refreshToken: string): Promise<void> {
  await fetch(`https://api.hubapi.com/oauth/v1/refresh-tokens/${encodeURIComponent(refreshToken)}`, {
    method: 'DELETE',
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'Server configuration error' }, 500)

  const auth = req.headers.get('Authorization') ?? ''
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } })
  const admin = createClient(supabaseUrl, serviceKey)

  const { data: userData } = await userClient.auth.getUser()
  if (!userData.user) return json({ error: 'Unauthorized' }, 401)

  const { connectionId } = await req.json() as { connectionId?: string }
  if (!connectionId) return json({ error: 'Missing connectionId' }, 400)

  const { data: conn, error: connErr } = await admin
    .from('integration_connections')
    .select('id, workspace_id, provider_key, access_token_ciphertext, refresh_token_ciphertext, connected_account')
    .eq('id', connectionId)
    .maybeSingle()

  if (connErr || !conn) return json({ error: 'Connection not found' }, 404)

  // Verify admin access
  const { data: canManage } = await userClient.rpc('can_manage_workspace_integrations', {
    p_workspace_id: conn.workspace_id,
  })
  if (!canManage) return json({ error: 'Not authorized for this workspace' }, 403)

  // Best-effort token revocation
  const revocationErrors: string[] = []

  if (conn.access_token_ciphertext) {
    try {
      const { access_token } = await decryptJson<{ access_token: string }>(conn.access_token_ciphertext)
      if (conn.provider_key === 'gmail' || conn.provider_key === 'google-sheets') {
        await revokeGoogle(access_token)
      }
      
    } catch (e) {
      revocationErrors.push(`access_token revocation: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  if (conn.refresh_token_ciphertext && conn.provider_key === 'hubspot') {
    try {
      const { refresh_token } = await decryptJson<{ refresh_token: string }>(conn.refresh_token_ciphertext)
      await revokeHubSpot(refresh_token)
    } catch (e) {
      revocationErrors.push(`refresh_token revocation: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  // Clear tokens and mark disabled
  await admin.from('integration_connections').update({
    status: 'disabled',
    access_token_ciphertext: null,
    refresh_token_ciphertext: null,
    token_expires_at: null,
    connected_account: null,
    scopes: [],
    last_error: null,
    updated_at: new Date().toISOString(),
  }).eq('id', conn.id)

  await admin.from('integration_logs').insert({
    workspace_id: conn.workspace_id,
    connection_id: conn.id,
    provider_key: conn.provider_key,
    level: 'info',
    message: 'Connector disconnected',
    context: {
      disconnected_by: userData.user.id,
      previous_account: conn.connected_account,
      revocation_errors: revocationErrors.length ? revocationErrors : undefined,
    },
  })

  return json({ ok: true, revocation_errors: revocationErrors.length ? revocationErrors : undefined })
})
