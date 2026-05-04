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

function isUuid(value: unknown) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function asString(value: unknown) {
  if (value === null || value === undefined) return null
  const next = String(value).trim()
  return next.length > 0 ? next : null
}

function preferredContact(email: string | null, phone: string | null) {
  if (phone) return 'sms'
  if (email) return 'email'
  return 'unknown'
}

async function upsertCustomer(supabase: any, workspaceId: string, normalizedCustomer: Record<string, string | null>, payload: Record<string, unknown>) {
  const name = normalizedCustomer.name ?? normalizedCustomer.email ?? normalizedCustomer.phone ?? 'Website lead'
  const email = normalizedCustomer.email
  const phone = normalizedCustomer.phone

  let existing: { id: string } | null = null
  if (email) {
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('workspace_id', workspaceId)
      .ilike('email', email)
      .is('archived_at', null)
      .maybeSingle()
    existing = data
  }
  if (!existing && phone) {
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('phone', phone)
      .is('archived_at', null)
      .maybeSingle()
    existing = data
  }

  if (existing?.id) {
    await supabase.from('customers').update({
      display_name: name,
      company_name: normalizedCustomer.company,
      email,
      phone,
      preferred_contact_method: preferredContact(email, phone),
      metadata: { last_integration_payload: payload },
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id)
    return existing.id as string
  }

  const { data, error } = await supabase.from('customers').insert({
    workspace_id: workspaceId,
    display_name: name,
    company_name: normalizedCustomer.company,
    email,
    phone,
    preferred_contact_method: preferredContact(email, phone),
    tags: ['integration-lead'],
    metadata: { source: 'integration_webhook', last_integration_payload: payload },
  }).select('id').single()

  if (error) throw error
  return data.id as string
}

async function createDraftRequest(supabase: any, workspaceId: string, normalizedPayload: any, customerId: string | null) {
  const customer = normalizedPayload.customer ?? {}
  const request = normalizedPayload.request ?? {}
  const recipientName = customer.name ?? customer.email ?? customer.phone ?? 'Website lead'
  const guideId = isUuid(request.guide_id) ? request.guide_id : null
  const requestType = request.type ? `Request type: ${request.type}` : null
  const message = request.message ? String(request.message) : null
  const customMessage = [requestType, message].filter(Boolean).join('\n\n') || null

  const { data, error } = await supabase.from('photo_brief_requests').insert({
    workspace_id: workspaceId,
    guide_id: guideId,
    recipient_name: recipientName,
    recipient_email: customer.email ?? null,
    recipient_phone: customer.phone ?? null,
    customer_id: customerId,
    custom_message: customMessage,
    status: 'draft',
  }).select('id, token').single()

  if (error) throw error

  if (customerId) {
    await supabase.from('customers').update({ last_request_at: new Date().toISOString() }).eq('id', customerId)
  }

  return data as { id: string; token: string }
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
    .select('id, provider_key, status, config')
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
    asString(payload.id) ??
    asString(payload.submission_id) ??
    asString(payload.lead_id) ??
    asString(payload.email) ??
    null

  const normalizedPayload = {
    customer: {
      name: asString(payload.name) ?? asString(payload.customer_name) ?? asString(payload.full_name) ?? asString(payload.contact_name),
      email: asString(payload.email) ?? asString(payload.customer_email) ?? asString(payload.contact_email),
      phone: asString(payload.phone) ?? asString(payload.customer_phone) ?? asString(payload.contact_phone),
      company: asString(payload.company) ?? asString(payload.company_name) ?? asString(payload.business_name),
    },
    request: {
      type: asString(payload.request_type) ?? asString(payload.service) ?? asString(payload.project_type) ?? asString(payload.job_type),
      message: asString(payload.message) ?? asString(payload.notes) ?? asString(payload.description) ?? asString(payload.details),
      guide_id: asString(payload.guide_id),
    },
    source: asString(payload.source) ?? 'external_form',
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

  const shouldCreateRequest = connection.config?.auto_create_request !== false
  let customerId: string | null = null
  let requestResult: { id: string; token: string } | null = null

  if (shouldCreateRequest) {
    try {
      customerId = await upsertCustomer(supabase, workspaceId, normalizedPayload.customer, payload)
      requestResult = await createDraftRequest(supabase, workspaceId, normalizedPayload, customerId)
      await supabase.from('integration_events').update({
        status: 'processed',
        processed_at: new Date().toISOString(),
        normalized_payload: {
          ...normalizedPayload,
          photobrief: {
            customer_id: customerId,
            request_id: requestResult.id,
            request_token: requestResult.token,
            mode: 'draft_request_created',
          },
        },
      }).eq('id', event.id)
      await supabase.from('integration_action_runs').insert({
        workspace_id: workspaceId,
        connection_id: connection.id,
        provider_key: providerKey,
        action_type: 'create_request',
        request_id: requestResult.id,
        customer_id: customerId,
        input: { event_id: event.id, normalized_payload: normalizedPayload },
        output: { request_id: requestResult.id, token: requestResult.token, customer_id: customerId },
        status: 'succeeded',
        completed_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to process integration event', err)
      await supabase.from('integration_events').update({
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
      }).eq('id', event.id)
      await supabase.from('integration_action_runs').insert({
        workspace_id: workspaceId,
        connection_id: connection.id,
        provider_key: providerKey,
        action_type: 'create_request',
        input: { event_id: event.id, normalized_payload: normalizedPayload },
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        completed_at: new Date().toISOString(),
      })
      await supabase.from('integration_logs').insert({
        workspace_id: workspaceId,
        connection_id: connection.id,
        provider_key: providerKey,
        level: 'error',
        message: 'External form payload received but request creation failed',
        context: { event_id: event.id, error: err instanceof Error ? err.message : String(err) },
      })
      return json({ ok: false, event_id: event.id, status: 'failed', error: err instanceof Error ? err.message : String(err) }, 202)
    }
  }

  await supabase.from('integration_logs').insert({
    workspace_id: workspaceId,
    connection_id: connection.id,
    provider_key: providerKey,
    level: 'info',
    message: shouldCreateRequest ? 'External form payload received and draft request created' : 'External form payload received',
    context: { event_id: event.id, customer_id: customerId, request_id: requestResult?.id ?? null },
  })

  await supabase.from('integration_connections').update({
    last_success_at: new Date().toISOString(),
    last_error: null,
    status: connection.status === 'not_connected' ? 'connected' : connection.status,
    updated_at: new Date().toISOString(),
  }).eq('id', connection.id)

  return json({
    ok: true,
    event_id: event.id,
    status: shouldCreateRequest ? 'processed' : 'received',
    customer_id: customerId,
    request_id: requestResult?.id ?? null,
    request_token: requestResult?.token ?? null,
  })
})
