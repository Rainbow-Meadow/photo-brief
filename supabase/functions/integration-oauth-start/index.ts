import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Provider = 'google' | 'hubspot'

interface Body {
  workspaceId: string
  provider: Provider
  redirectTo?: string
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function randomToken(bytes = 32) {
  const data = new Uint8Array(bytes)
  crypto.getRandomValues(data)
  return btoa(String.fromCharCode(...data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sha256Base64Url(value: string) {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function providerKey(provider: Provider) {
  if (provider === 'google') return 'gmail'
  return 'hubspot'
}

function oauthConfig(provider: Provider) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const appUrl = Deno.env.get('APP_PUBLIC_URL') ?? 'https://photobrief.ai'
  const fallbackBase = supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : `${appUrl.replace(/\/$/, '')}/functions/v1`

  if (provider === 'google') {
    return {
      providerKey: 'gmail',
      clientId: Deno.env.get('GOOGLE_CLIENT_ID'),
      redirectUri: Deno.env.get('GOOGLE_REDIRECT_URI') ?? `${fallbackBase}/integration-oauth-callback/google`,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/gmail.send',
      ],
      extra: {
        access_type: 'offline',
        prompt: 'consent',
        include_granted_scopes: 'true',
      },
    }
  }

  return {
    providerKey: 'hubspot',
    clientId: Deno.env.get('HUBSPOT_CLIENT_ID'),
    redirectUri: Deno.env.get('HUBSPOT_REDIRECT_URI') ?? `${fallbackBase}/integration-oauth-callback/hubspot`,
    authUrl: 'https://app.hubspot.com/oauth/authorize',
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.deals.read', 'crm.objects.deals.write'],
    extra: {},
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const auth = req.headers.get('Authorization') ?? ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: 'Server configuration error' }, 500)

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } })
    const admin = createClient(supabaseUrl, serviceKey)

    const { data: userData } = await userClient.auth.getUser()
    if (!userData.user) return json({ error: 'Unauthorized' }, 401)

    const body = (await req.json()) as Body
    if (!body.workspaceId || !body.provider) return json({ error: 'Missing workspaceId or provider' }, 400)
    if (!['google', 'hubspot'].includes(body.provider)) return json({ error: 'Unsupported provider' }, 400)

    const { data: canManage, error: manageErr } = await userClient.rpc('can_manage_workspace_integrations', {
      p_workspace_id: body.workspaceId,
    })
    if (manageErr || !canManage) return json({ error: 'You do not have permission to manage integrations for this workspace' }, 403)

    const cfg = oauthConfig(body.provider)
    if (!cfg.clientId) {
      await admin.from('integration_logs').insert({
        workspace_id: body.workspaceId,
        provider_key: cfg.providerKey,
        level: 'warn',
        message: 'OAuth start attempted without provider client ID configured',
        context: { provider: body.provider },
      })
      return json({
        error: 'Provider OAuth client is not configured yet',
        missingSecret: body.provider === 'google' ? 'GOOGLE_CLIENT_ID' : 'HUBSPOT_CLIENT_ID',
      }, 400)
    }

    const state = randomToken(32)
    const codeVerifier: string | null = null
    const codeChallenge: string | null = null
    const key = providerKey(body.provider)

    const { error: stateErr } = await admin.from('integration_oauth_states').insert({
      workspace_id: body.workspaceId,
      provider_key: key,
      state,
      code_verifier: codeVerifier,
      redirect_to: body.redirectTo ?? null,
      created_by: userData.user.id,
    })
    if (stateErr) return json({ error: stateErr.message }, 500)

    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: cfg.redirectUri,
      response_type: 'code',
      scope: cfg.scopes.join(' '),
      state,
    })

    if (codeChallenge) {
      params.set('code_challenge', codeChallenge)
      params.set('code_challenge_method', 'S256')
    }

    Object.entries(cfg.extra).forEach(([k, v]) => params.set(k, String(v)))

    return json({ ok: true, provider: body.provider, authorizationUrl: `${cfg.authUrl}?${params.toString()}` })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : String(err) }, 500)
  }
})
