/**
 * integration-health-check — Test that an OAuth connection's token is still valid.
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

interface ProfileResult {
  healthy: boolean
  account?: string
  error?: string
}

async function checkGoogle(accessToken: string): Promise<ProfileResult> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return { healthy: false, error: `Google API returned ${res.status}` }
  const data = await res.json() as { email?: string }
  return { healthy: true, account: data.email }
}

async function checkMicrosoft(accessToken: string): Promise<ProfileResult> {
  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return { healthy: false, error: `Graph API returned ${res.status}` }
  const data = await res.json() as { userPrincipalName?: string; mail?: string }
  return { healthy: true, account: data.mail ?? data.userPrincipalName }
}

async function checkHubSpot(accessToken: string): Promise<ProfileResult> {
  const res = await fetch(`https://api.hubapi.com/oauth/v1/access-tokens/${encodeURIComponent(accessToken)}`)
  if (!res.ok) return { healthy: false, error: `HubSpot API returned ${res.status}` }
  const data = await res.json() as { user?: string; hub_domain?: string }
  return { healthy: true, account: String(data.user ?? data.hub_domain ?? 'HubSpot') }
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
    .select('id, workspace_id, provider_key, access_token_ciphertext, refresh_token_ciphertext, token_expires_at, status')
    .eq('id', connectionId)
    .maybeSingle()

  if (connErr || !conn) return json({ error: 'Connection not found' }, 404)

  const { data: canManage } = await userClient.rpc('can_manage_workspace_integrations', {
    p_workspace_id: conn.workspace_id,
  })
  if (!canManage) return json({ error: 'Not authorized for this workspace' }, 403)

  if (!conn.access_token_ciphertext) {
    return json({ healthy: false, error: 'No access token stored' })
  }

  // Check if token is expired; try refresh first
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at) : null
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now() + 60_000

  if (isExpired && conn.refresh_token_ciphertext) {
    const refreshRes = await fetch(`${supabaseUrl}/functions/v1/integration-token-refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ connectionId: conn.id }),
    })
    if (!refreshRes.ok) {
      const errData = await refreshRes.json() as { error?: string }
      return json({ healthy: false, error: errData.error ?? 'Token refresh failed during health check' })
    }
    // Re-load token
    const { data: updated } = await admin
      .from('integration_connections')
      .select('access_token_ciphertext')
      .eq('id', conn.id)
      .single()
    if (updated?.access_token_ciphertext) {
      conn.access_token_ciphertext = updated.access_token_ciphertext
    }
  }

  let accessToken: string
  try {
    const decrypted = await decryptJson<{ access_token: string }>(conn.access_token_ciphertext as string)
    accessToken = decrypted.access_token
  } catch (e) {
    return json({ healthy: false, error: `Failed to decrypt token: ${e instanceof Error ? e.message : String(e)}` })
  }

  let result: ProfileResult
  switch (conn.provider_key) {
    case 'gmail':
    case 'google-sheets':
      result = await checkGoogle(accessToken)
      break
    case 'microsoft-365':
      result = await checkMicrosoft(accessToken)
      break
    case 'hubspot':
      result = await checkHubSpot(accessToken)
      break
    default:
      result = { healthy: false, error: `Unsupported provider: ${conn.provider_key}` }
  }

  // Update connection status
  await admin.from('integration_connections').update({
    last_health_check_at: new Date().toISOString(),
    status: result.healthy ? 'connected' : 'needs_attention',
    last_error: result.error ?? null,
    connected_account: result.account ?? conn.connected_account ?? null,
    updated_at: new Date().toISOString(),
  }).eq('id', conn.id)

  return json(result)
})
