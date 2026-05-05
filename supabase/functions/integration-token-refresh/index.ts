/**
 * integration-token-refresh — Refresh OAuth access tokens for connected providers.
 *
 * POST body: { connectionId: string }
 * Only callable with service-role or authenticated workspace admin.
 */

import { createClient } from 'npm:@supabase/supabase-js@2'
import { decryptJson, encryptJson } from '../_shared/integration-crypto.ts'

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

interface TokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  scope?: string
  error?: string
  error_description?: string
}

function providerTokenConfig(providerKey: string) {
  if (providerKey === 'gmail' || providerKey === 'google-sheets') {
    return {
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: Deno.env.get('GOOGLE_CLIENT_ID'),
      clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
    }
  }

  if (providerKey === 'microsoft-365') {
    const tenant = Deno.env.get('MICROSOFT_TENANT_ID') ?? 'common'
    return {
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      clientId: Deno.env.get('MICROSOFT_CLIENT_ID'),
      clientSecret: Deno.env.get('MICROSOFT_CLIENT_SECRET'),
    }
  }

  if (providerKey === 'hubspot') {
    return {
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      clientId: Deno.env.get('HUBSPOT_CLIENT_ID'),
      clientSecret: Deno.env.get('HUBSPOT_CLIENT_SECRET'),
    }
  }

  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return json({ error: 'Server configuration error' }, 500)

  const auth = req.headers.get('Authorization') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } })
  const admin = createClient(supabaseUrl, serviceKey)

  // Verify caller is authenticated
  const { data: userData } = await userClient.auth.getUser()
  const isServiceRole = auth.includes(serviceKey)
  if (!userData.user && !isServiceRole) return json({ error: 'Unauthorized' }, 401)

  const { connectionId } = await req.json() as { connectionId?: string }
  if (!connectionId) return json({ error: 'Missing connectionId' }, 400)

  // Load connection
  const { data: conn, error: connErr } = await admin
    .from('integration_connections')
    .select('id, workspace_id, provider_key, refresh_token_ciphertext, token_expires_at, status')
    .eq('id', connectionId)
    .maybeSingle()

  if (connErr || !conn) return json({ error: 'Connection not found' }, 404)

  // Verify workspace access (unless service role)
  if (!isServiceRole) {
    const { data: canManage } = await userClient.rpc('can_manage_workspace_integrations', {
      p_workspace_id: conn.workspace_id,
    })
    if (!canManage) return json({ error: 'Not authorized for this workspace' }, 403)
  }

  if (!conn.refresh_token_ciphertext) {
    return json({ error: 'No refresh token stored for this connection' }, 400)
  }

  const cfg = providerTokenConfig(conn.provider_key)
  if (!cfg) return json({ error: `Unsupported provider: ${conn.provider_key}` }, 400)
  if (!cfg.clientId || !cfg.clientSecret) {
    return json({ error: 'OAuth client credentials not configured for this provider' }, 400)
  }

  // Decrypt refresh token
  let refreshToken: string
  try {
    const decrypted = await decryptJson<{ refresh_token: string }>(conn.refresh_token_ciphertext)
    refreshToken = decrypted.refresh_token
    if (!refreshToken) throw new Error('Empty refresh_token in decrypted payload')
  } catch (e) {
    await admin.from('integration_logs').insert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      provider_key: conn.provider_key,
      level: 'error',
      message: 'Failed to decrypt refresh token',
      context: { error: e instanceof Error ? e.message : String(e) },
    })
    return json({ error: 'Failed to decrypt refresh token' }, 500)
  }

  // Exchange refresh token
  const form = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: cfg.clientId,
  })
  if (cfg.clientSecret) {
    form.set('client_secret', cfg.clientSecret)
  }

  const tokenRes = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const tokenJson = await tokenRes.json() as TokenResponse

  if (!tokenRes.ok || !tokenJson.access_token) {
    const errMsg = tokenJson.error_description ?? tokenJson.error ?? 'Token refresh failed'
    await admin.from('integration_connections').update({
      status: 'needs_attention',
      last_error: errMsg,
      updated_at: new Date().toISOString(),
    }).eq('id', conn.id)

    await admin.from('integration_logs').insert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      provider_key: conn.provider_key,
      level: 'error',
      message: 'Token refresh failed',
      context: { error: errMsg, http_status: tokenRes.status },
    })

    return json({ error: errMsg }, 502)
  }

  // Encrypt and store new tokens
  const newAccessCipher = await encryptJson({
    access_token: tokenJson.access_token,
    token_type: tokenJson.token_type,
  })
  const newExpiresAt = tokenJson.expires_in
    ? new Date(Date.now() + Number(tokenJson.expires_in) * 1000).toISOString()
    : null

  // Some providers rotate refresh tokens; store new one if provided
  const updatePayload: Record<string, unknown> = {
    access_token_ciphertext: newAccessCipher,
    token_expires_at: newExpiresAt,
    last_success_at: new Date().toISOString(),
    last_error: null,
    status: 'connected',
    updated_at: new Date().toISOString(),
  }
  if (tokenJson.refresh_token) {
    updatePayload.refresh_token_ciphertext = await encryptJson({
      refresh_token: tokenJson.refresh_token,
    })
  }

  await admin.from('integration_connections').update(updatePayload).eq('id', conn.id)

  await admin.from('integration_logs').insert({
    workspace_id: conn.workspace_id,
    connection_id: conn.id,
    provider_key: conn.provider_key,
    level: 'info',
    message: 'Token refreshed successfully',
    context: { expires_at: newExpiresAt },
  })

  return json({ ok: true, expires_at: newExpiresAt })
})
