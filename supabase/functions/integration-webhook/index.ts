import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-photobrief-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function parseRoute(req: Request) {
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const fnIndex = parts.indexOf('integration-webhook')
  const offset = fnIndex >= 0 ? fnIndex + 1 : 0
  return {
    workspaceId: parts[offset] ?? '',
    connectionKey: parts[offset + 1] ?? '',
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !supabaseServiceKey) {
    return json({ error: 'Server configuration error' }, 500)
  }

  const { workspaceId, connectionKey } = parseRoute(req)
  if (!isUuid(workspaceId) || !connectionKey) {
    return json({ error: 'Invalid webhook URL' }, 400)
  }

  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON payload' }, 400)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: connection, error: connectionError } = await supabase
    .from('integration_connections')
    .select('id, provider_key, status')
    .eq('workspace_id', workspaceId)
    .eq('connection_key', connectionKey)
    .maybeSingle()

  if (connectionError) {
    console.error('Failed to load integration connection', connectionError)
    return json({ error: 'Could not verify integration connection' }, 500)
  }

  if (!connection || connection.status === 'disabled') {
    return json({ error: 'Integration connection not found' }, 404)
  }

  const providerKey = connection.provider_key ?? 'webhook-bridge'
  const externalId =
    typeof payload.id === 'string'
      ? payload.id
      : typeof payload.submission_id === 'string'
        ? payload.submission_id
        : null

  const normalizedPayload = {
    customer: {
      name: payload.name ?? payload.customer_name ?? payload.full_name ?? null,
      email: payload.email ?? payload.customer_email ?? null,
      phone: payload.phone ?? payload.customer_phone ?? null,
      company: payload.company ?? payload.company_name ?? null,
    },
    request: {
      type: payload.request_type ?? payload.service ?? payload.project_type ?? null,
      message: payload.message ?? payload.notes ?? payload.description ?? null,
      guide_id: payload.guide_id ?? null,
    },
    source: payload.source ?? 'external_form',
  }

  const { data: event, error: eventError } = await supabase
    .from('integration_events')
    .insert({
      workspace_id: workspaceId,
      connection_id: connection.id,
      provider_key: providerKey,
      event_type: 'external_form_submitted',
      external_id: externalId,
      payload,
      normalized_payload: normalizedPayload,
      status: 'received',
    })
    .select('id')
    .single()

  if (eventError) {
    console.error('Failed to insert integration event', eventError)
    return json({ error: 'Could not record integration event' }, 500)
  }

  await supabase.from('integration_logs').insert({
    workspace_id: workspaceId,
    connection_id: connection.id,
    provider_key: providerKey,
    level: 'info',
    message: 'External form payload received',
    context: { event_id: event.id },
  })

  return json({ ok: true, event_id: event.id, status: 'received' })
})
