/**
 * integration-send-email — Send an email via an OAuth-connected provider inbox.
 *
 * POST body: {
 *   connectionId: string,   // UUID of the integration_connections row
 *   to: string,             // recipient email
 *   subject: string,
 *   htmlBody?: string,
 *   textBody?: string,
 *   cc?: string,
 *   bcc?: string,
 *   replyTo?: string,
 * }
 *
 * Supports provider_key: "gmail" (Google Gmail API) and "microsoft-365" (Microsoft Graph).
 * Decrypts the stored access token, auto-refreshes if expired, then sends.
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

interface SendPayload {
  connectionId: string
  to: string
  subject: string
  htmlBody?: string
  textBody?: string
  cc?: string
  bcc?: string
  replyTo?: string
}

// ── Token helpers ──────────────────────────────────────────────────────

async function getAccessToken(
  admin: ReturnType<typeof createClient>,
  conn: Record<string, unknown>,
): Promise<string> {
  // Check if token is still valid (with 2-minute buffer)
  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at as string) : null
  const isExpired = !expiresAt || expiresAt.getTime() < Date.now() + 120_000

  if (!isExpired && conn.access_token_ciphertext) {
    const decrypted = await decryptJson<{ access_token: string }>(conn.access_token_ciphertext as string)
    return decrypted.access_token
  }

  // Token is expired — refresh it
  if (!conn.refresh_token_ciphertext) {
    throw new Error('Access token expired and no refresh token available. Please reconnect.')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const refreshRes = await fetch(`${supabaseUrl}/functions/v1/integration-token-refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ connectionId: conn.id }),
  })
  const refreshJson = await refreshRes.json() as Record<string, unknown>
  if (!refreshRes.ok) {
    throw new Error(`Token refresh failed: ${refreshJson.error ?? 'Unknown error'}`)
  }

  // Re-read the updated access token
  const { data: updated } = await admin
    .from('integration_connections')
    .select('access_token_ciphertext')
    .eq('id', conn.id)
    .single()

  if (!updated?.access_token_ciphertext) {
    throw new Error('Token refresh succeeded but no access token found')
  }
  const decrypted = await decryptJson<{ access_token: string }>(updated.access_token_ciphertext)
  return decrypted.access_token
}

// ── Gmail sender ───────────────────────────────────────────────────────

function buildRfc2822(payload: SendPayload): string {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const headers = [
    `To: ${payload.to}`,
    `Subject: ${payload.subject}`,
    `MIME-Version: 1.0`,
  ]
  if (payload.cc) headers.push(`Cc: ${payload.cc}`)
  if (payload.bcc) headers.push(`Bcc: ${payload.bcc}`)
  if (payload.replyTo) headers.push(`Reply-To: ${payload.replyTo}`)

  if (payload.htmlBody && payload.textBody) {
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`)
    const body = [
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      payload.textBody,
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      '',
      payload.htmlBody,
      `--${boundary}--`,
    ].join('\r\n')
    return headers.join('\r\n') + '\r\n\r\n' + body
  }

  if (payload.htmlBody) {
    headers.push('Content-Type: text/html; charset="UTF-8"')
    return headers.join('\r\n') + '\r\n\r\n' + payload.htmlBody
  }

  headers.push('Content-Type: text/plain; charset="UTF-8"')
  return headers.join('\r\n') + '\r\n\r\n' + (payload.textBody ?? '')
}

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

async function sendViaGmail(accessToken: string, payload: SendPayload): Promise<{ messageId: string }> {
  const raw = base64UrlEncode(buildRfc2822(payload))

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })
  const data = await res.json() as Record<string, unknown>
  if (!res.ok) {
    const err = (data.error as Record<string, unknown>)?.message ?? JSON.stringify(data)
    throw new Error(`Gmail API error [${res.status}]: ${err}`)
  }
  return { messageId: data.id as string }
}

// ── Microsoft Graph sender ─────────────────────────────────────────────

async function sendViaMicrosoft(accessToken: string, payload: SendPayload): Promise<{ messageId: string }> {
  const toRecipients = payload.to.split(',').map((e) => ({
    emailAddress: { address: e.trim() },
  }))
  const ccRecipients = payload.cc
    ? payload.cc.split(',').map((e) => ({ emailAddress: { address: e.trim() } }))
    : []
  const bccRecipients = payload.bcc
    ? payload.bcc.split(',').map((e) => ({ emailAddress: { address: e.trim() } }))
    : []

  const message: Record<string, unknown> = {
    subject: payload.subject,
    body: {
      contentType: payload.htmlBody ? 'HTML' : 'Text',
      content: payload.htmlBody ?? payload.textBody ?? '',
    },
    toRecipients,
  }
  if (ccRecipients.length) message.ccRecipients = ccRecipients
  if (bccRecipients.length) message.bccRecipients = bccRecipients
  if (payload.replyTo) {
    message.replyTo = [{ emailAddress: { address: payload.replyTo } }]
  }

  const res = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, saveToSentItems: true }),
  })

  if (res.status === 202 || res.status === 200) {
    return { messageId: `ms-${Date.now()}` }
  }
  const data = await res.json() as Record<string, unknown>
  const errObj = data.error as Record<string, unknown> | undefined
  throw new Error(`Graph API error [${res.status}]: ${errObj?.message ?? JSON.stringify(data)}`)
}

// ── Main handler ───────────────────────────────────────────────────────

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

  const isServiceRole = auth.includes(serviceKey)
  const { data: userData } = await userClient.auth.getUser()
  if (!userData.user && !isServiceRole) return json({ error: 'Unauthorized' }, 401)

  let payload: SendPayload
  try {
    payload = await req.json() as SendPayload
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }
  if (!payload.connectionId || !payload.to || !payload.subject) {
    return json({ error: 'Missing required fields: connectionId, to, subject' }, 400)
  }

  // Load connection
  const { data: conn, error: connErr } = await admin
    .from('integration_connections')
    .select('id, workspace_id, provider_key, status, access_token_ciphertext, refresh_token_ciphertext, token_expires_at, connected_account')
    .eq('id', payload.connectionId)
    .maybeSingle()

  if (connErr || !conn) return json({ error: 'Connection not found' }, 404)
  if (conn.status === 'disabled') return json({ error: 'Connection is disabled' }, 400)

  // Verify workspace access
  if (!isServiceRole) {
    const { data: isMember } = await userClient.rpc('is_workspace_member', {
      _workspace_id: conn.workspace_id,
    })
    if (!isMember) return json({ error: 'Not authorized for this workspace' }, 403)
  }

  // Check provider is an email provider
  if (conn.provider_key !== 'gmail' && conn.provider_key !== 'microsoft-365') {
    return json({ error: `Provider "${conn.provider_key}" does not support email sending` }, 400)
  }

  try {
    const accessToken = await getAccessToken(admin, conn)
    let result: { messageId: string }

    if (conn.provider_key === 'gmail') {
      result = await sendViaGmail(accessToken, payload)
    } else {
      result = await sendViaMicrosoft(accessToken, payload)
    }

    // Log success
    await admin.from('integration_action_runs').insert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      provider_key: conn.provider_key,
      action_type: 'send_email',
      input: { to: payload.to, subject: payload.subject },
      output: { messageId: result.messageId, sentFrom: conn.connected_account },
      status: 'succeeded',
      completed_at: new Date().toISOString(),
    })

    await admin.from('integration_connections').update({
      last_success_at: new Date().toISOString(),
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq('id', conn.id)

    return json({
      ok: true,
      messageId: result.messageId,
      sentFrom: conn.connected_account,
      provider: conn.provider_key,
    })
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)

    await admin.from('integration_action_runs').insert({
      workspace_id: conn.workspace_id,
      connection_id: conn.id,
      provider_key: conn.provider_key,
      action_type: 'send_email',
      input: { to: payload.to, subject: payload.subject },
      status: 'failed',
      error: errMsg,
      completed_at: new Date().toISOString(),
    })

    await admin.from('integration_connections').update({
      last_error: errMsg,
      updated_at: new Date().toISOString(),
    }).eq('id', conn.id)

    return json({ error: errMsg }, 502)
  }
})
