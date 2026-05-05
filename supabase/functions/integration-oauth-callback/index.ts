import { createClient } from 'npm:@supabase/supabase-js@2'
import { encryptJson as sharedEncryptJson, getTokenSecret } from '../_shared/integration-crypto.ts'

type Provider = 'google' | 'microsoft' | 'hubspot'

type TokenJson = Record<string, unknown> & {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
  token_type?: string
}

function html(title: string, body: string, redirectTo?: string | null, status = 200) {
  const safeRedirect = redirectTo ? JSON.stringify(redirectTo) : 'null'
  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${title}</title>
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07060a;color:#f8f5ff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.card{width:min(92vw,520px);border:1px solid rgba(196,162,255,.25);border-radius:28px;padding:32px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.035));box-shadow:0 30px 90px rgba(0,0,0,.45)}h1{margin:0 0 12px;font-size:28px;letter-spacing:-.04em}p{margin:0;color:rgba(248,245,255,.72);line-height:1.6}.btn{display:inline-block;margin-top:22px;border-radius:999px;background:#a985ff;color:#09070f;padding:12px 18px;font-weight:700;text-decoration:none}
    </style>
  </head>
  <body>
    <main class="card">
      <h1>${title}</h1>
      <p>${body}</p>
      ${redirectTo ? `<a class="btn" href="${redirectTo}">Back to PhotoBrief</a>` : ''}
    </main>
    <script>
      const redirectTo = ${safeRedirect};
      if (redirectTo && window.opener) {
        window.opener.postMessage({ type: 'photobrief:integration-connected' }, '*');
      }
      if (redirectTo) setTimeout(() => { window.location.href = redirectTo; }, 1400);
    </script>
  </body>
</html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

function providerFromUrl(req: Request): Provider | null {
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const fnIndex = parts.indexOf('integration-oauth-callback')
  const value = parts[fnIndex >= 0 ? fnIndex + 1 : parts.length - 1]
  if (value === 'google' || value === 'microsoft' || value === 'hubspot') return value
  return null
}

function providerKey(provider: Provider) {
  if (provider === 'google') return 'gmail'
  if (provider === 'microsoft') return 'microsoft-365'
  return 'hubspot'
}

function callbackConfig(provider: Provider, supabaseUrl: string) {
  const appUrl = Deno.env.get('APP_PUBLIC_URL') ?? 'https://photobrief.ai'
  const fallbackBase = `${supabaseUrl.replace(/\/$/, '')}/functions/v1`

  if (provider === 'google') {
    return {
      providerKey: 'gmail',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      profileUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      clientId: Deno.env.get('GOOGLE_CLIENT_ID'),
      clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET'),
      redirectUri: Deno.env.get('GOOGLE_REDIRECT_URI') ?? `${fallbackBase}/integration-oauth-callback/google`,
      appReturn: `${appUrl.replace(/\/$/, '')}/settings/integrations`,
    }
  }

  if (provider === 'microsoft') {
    const tenant = Deno.env.get('MICROSOFT_TENANT_ID') ?? 'common'
    return {
      providerKey: 'microsoft-365',
      tokenUrl: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      profileUrl: 'https://graph.microsoft.com/v1.0/me',
      clientId: Deno.env.get('MICROSOFT_CLIENT_ID'),
      clientSecret: Deno.env.get('MICROSOFT_CLIENT_SECRET'),
      redirectUri: Deno.env.get('MICROSOFT_REDIRECT_URI') ?? `${fallbackBase}/integration-oauth-callback/microsoft`,
      appReturn: `${appUrl.replace(/\/$/, '')}/settings/integrations`,
    }
  }

  return {
    providerKey: 'hubspot',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    profileUrl: 'https://api.hubapi.com/oauth/v1/access-tokens',
    clientId: Deno.env.get('HUBSPOT_CLIENT_ID'),
    clientSecret: Deno.env.get('HUBSPOT_CLIENT_SECRET'),
    redirectUri: Deno.env.get('HUBSPOT_REDIRECT_URI') ?? `${fallbackBase}/integration-oauth-callback/hubspot`,
    appReturn: `${appUrl.replace(/\/$/, '')}/settings/integrations`,
  }
}

// Use shared crypto from _shared/integration-crypto.ts
const encryptJson = sharedEncryptJson

async function fetchProfile(provider: Provider, accessToken: string, profileUrl: string) {
  if (provider === 'hubspot') {
    const res = await fetch(`${profileUrl}/${encodeURIComponent(accessToken)}`)
    if (!res.ok) return { connectedAccount: null, profile: null }
    const json = await res.json() as Record<string, unknown>
    return {
      connectedAccount: String(json.user ?? json.hub_domain ?? json.hub_id ?? 'HubSpot account'),
      profile: json,
    }
  }

  const res = await fetch(profileUrl, { headers: { Authorization: `Bearer ${accessToken}` } })
  if (!res.ok) return { connectedAccount: null, profile: null }
  const json = await res.json() as Record<string, unknown>
  const connectedAccount = String(json.email ?? json.userPrincipalName ?? json.mail ?? json.displayName ?? 'Connected account')
  return { connectedAccount, profile: json }
}

Deno.serve(async (req) => {
  const provider = providerFromUrl(req)
  if (!provider) return html('Unsupported connector', 'PhotoBrief could not identify this connector callback.', null, 400)

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) return html('Connector setup failed', 'Server configuration is missing.', null, 500)

  const admin = createClient(supabaseUrl, serviceKey)

  if (!state) return html('Connector setup failed', 'OAuth state was missing.', null, 400)

  const { data: stateRow, error: stateErr } = await admin
    .from('integration_oauth_states')
    .select('*')
    .eq('state', state)
    .maybeSingle()

  const redirectTo = stateRow?.redirect_to ?? callbackConfig(provider, supabaseUrl).appReturn

  if (stateErr || !stateRow) return html('Connector setup failed', 'OAuth state was not found or has expired.', null, 400)
  if (stateRow.consumed_at) return html('Connector already used', 'This connector authorization link has already been used.', redirectTo, 400)
  if (new Date(stateRow.expires_at).getTime() < Date.now()) return html('Connector setup expired', 'Start the connector setup again from PhotoBrief.', redirectTo, 400)
  if (error) return html('Connector setup cancelled', errorDescription ?? error, redirectTo, 400)
  if (!code) return html('Connector setup failed', 'OAuth authorization code was missing.', redirectTo, 400)

  const cfg = callbackConfig(provider, supabaseUrl)
  // Google and Microsoft support public clients (no secret needed)
  const requiresSecret = provider === 'hubspot'
  if (!cfg.clientId || (requiresSecret && !cfg.clientSecret)) {
    await admin.from('integration_connections').upsert({
      workspace_id: stateRow.workspace_id,
      provider_key: cfg.providerKey,
      status: 'needs_attention',
      display_name: cfg.providerKey,
      last_error: 'OAuth client credentials are not configured',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,provider_key' })
    return html('Connector needs setup', 'The OAuth client credentials are not configured yet. Add the provider credentials and try again.', redirectTo, 400)
  }

  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
  })
  if (cfg.clientSecret) {
    form.set('client_secret', cfg.clientSecret)
  }

  if (provider === 'microsoft' && stateRow.code_verifier) {
    form.set('code_verifier', stateRow.code_verifier)
  }

  const tokenRes = await fetch(cfg.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  })
  const tokenJson = await tokenRes.json() as TokenJson

  if (!tokenRes.ok || !tokenJson.access_token) {
    await admin.from('integration_connections').upsert({
      workspace_id: stateRow.workspace_id,
      provider_key: cfg.providerKey,
      status: 'needs_attention',
      display_name: cfg.providerKey,
      last_error: String(tokenJson.error_description ?? tokenJson.error ?? 'Token exchange failed'),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,provider_key' })
    await admin.from('integration_oauth_states').update({ consumed_at: new Date().toISOString() }).eq('id', stateRow.id)
    return html('Connector setup failed', String(tokenJson.error_description ?? tokenJson.error ?? 'Token exchange failed'), redirectTo, 400)
  }

  const tokenSecret = Deno.env.get('INTEGRATION_TOKEN_SECRET') ?? serviceKey
  const encryptedAccess = await encryptJson({ access_token: tokenJson.access_token, token_type: tokenJson.token_type }, tokenSecret)
  const encryptedRefresh = tokenJson.refresh_token ? await encryptJson({ refresh_token: tokenJson.refresh_token }, tokenSecret) : null
  const expiresAt = tokenJson.expires_in ? new Date(Date.now() + Number(tokenJson.expires_in) * 1000).toISOString() : null
  const { connectedAccount, profile } = await fetchProfile(provider, tokenJson.access_token, cfg.profileUrl)

  const { data: connection, error: connErr } = await admin.from('integration_connections').upsert({
    workspace_id: stateRow.workspace_id,
    provider_key: cfg.providerKey,
    status: 'connected',
    display_name: provider === 'google' ? 'Gmail' : provider === 'microsoft' ? 'Microsoft 365 Outlook' : 'HubSpot',
    connected_account: connectedAccount,
    scopes: typeof tokenJson.scope === 'string' ? tokenJson.scope.split(' ') : [],
    config: {
      provider,
      connectedAccount,
      profile,
      token_storage: 'edge_encrypted',
    },
    access_token_ciphertext: encryptedAccess,
    refresh_token_ciphertext: encryptedRefresh,
    token_expires_at: expiresAt,
    last_health_check_at: new Date().toISOString(),
    last_success_at: new Date().toISOString(),
    last_error: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'workspace_id,provider_key' }).select('id').single()

  if (connErr) return html('Connector setup failed', connErr.message, redirectTo, 500)

  await admin.from('integration_oauth_states').update({ consumed_at: new Date().toISOString() }).eq('id', stateRow.id)
  await admin.from('integration_logs').insert({
    workspace_id: stateRow.workspace_id,
    connection_id: connection?.id ?? null,
    provider_key: cfg.providerKey,
    level: 'info',
    message: 'OAuth connector connected',
    context: { provider, connectedAccount },
  })

  return html('Connector connected', `${provider === 'google' ? 'Gmail' : provider === 'microsoft' ? 'Microsoft 365' : 'HubSpot'} is now connected to PhotoBrief.`, redirectTo)
})
