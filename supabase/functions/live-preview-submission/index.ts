import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function cleanEmail(value: unknown) {
  const email = String(value ?? '').trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null
}

function asString(value: unknown) {
  const text = String(value ?? '').trim()
  return text.length > 0 ? text : null
}

async function sendReadyEmail(resendKey: string, email: string, requestUrl: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'PhotoBrief <hello@photobrief.ai>',
      to: [email],
      subject: 'Your PhotoBrief is ready',
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#17131f">
          <h1 style="margin:0 0 12px;font-size:24px">Your PhotoBrief is ready</h1>
          <p style="margin:0 0 18px">Open your draft request and try the guided photo intake flow.</p>
          <p><a href="${requestUrl}" style="display:inline-block;background:#8f63ff;color:#fff;text-decoration:none;padding:12px 16px;border-radius:999px;font-weight:700">Open your request</a></p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Resend failed: ${response.status} ${text}`)
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const workspaceId = Deno.env.get('MARKETING_WORKSPACE_ID')
  const resendKey = Deno.env.get('RESEND_API_KEY')

  if (!supabaseUrl || !serviceKey || !workspaceId) {
    return json({ error: 'Server misconfigured' }, 500)
  }

  let payload: any
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const sessionId = asString(payload?.session_id) ?? crypto.randomUUID()
  const email = cleanEmail(payload?.lead?.email)
  const leadName = asString(payload?.lead?.name)
  const company = asString(payload?.lead?.company)
  const phone = asString(payload?.lead?.phone)
  const readiness = asString(payload?.brief?.readiness) ?? 'incomplete'
  const selectedCount = Number(payload?.brief?.selected_count ?? 0)
  const requiredCount = Number(payload?.brief?.required_count ?? 4)
  const summary = asString(payload?.brief?.summary)
  const issue = asString(payload?.brief?.issue)

  const supabase = createClient(supabaseUrl, serviceKey)

  await supabase.from('marketing_live_submissions').insert({
    session_id: sessionId,
    workflow_mode: asString(payload?.workflow_mode) ?? 'capture',
    selected_count: selectedCount,
    required_count: requiredCount,
    readiness,
    issue,
    summary,
    payload,
  })

  let requestUrl: string | null = null
  let requestId: string | null = null
  let requestToken: string | null = null
  let customerId: string | null = null
  let followupSent = false
  let followupError: string | null = null

  if (!email) {
    return json({ ok: true, session_id: sessionId, request_url: null })
  }

  const { data: existingLead } = await supabase
    .from('marketing_live_leads')
    .select('id, customer_id, request_id, request_token, request_url, followup_sent_at')
    .eq('session_id', sessionId)
    .eq('email', email)
    .maybeSingle()

  customerId = existingLead?.customer_id ?? null
  requestId = existingLead?.request_id ?? null
  requestToken = existingLead?.request_token ?? null
  requestUrl = existingLead?.request_url ?? null

  if (!customerId) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id, display_name')
      .eq('workspace_id', workspaceId)
      .ilike('email', email)
      .is('archived_at', null)
      .maybeSingle()

    if (existingCustomer?.id) {
      customerId = existingCustomer.id
    } else {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          workspace_id: workspaceId,
          email,
          phone,
          company_name: company,
          display_name: leadName ?? email,
          preferred_contact_method: phone ? 'sms' : 'email',
          tags: ['marketing-live-preview'],
          metadata: { source: 'marketing_live_preview', session_id: sessionId },
        })
        .select('id')
        .single()

      if (customerError) return json({ error: customerError.message }, 500)
      customerId = customer.id
    }
  }

  if (readiness === 'ready' && !requestId) {
    const { data: request, error: requestError } = await supabase
      .from('photo_brief_requests')
      .insert({
        workspace_id: workspaceId,
        customer_id: customerId,
        recipient_name: leadName ?? email,
        recipient_email: email,
        recipient_phone: phone,
        custom_message: summary,
        status: 'draft',
      })
      .select('id, token')
      .single()

    if (requestError) return json({ error: requestError.message }, 500)
    requestId = request.id
    requestToken = request.token
    requestUrl = `https://photobrief.ai/r/${requestToken}`
  }

  if (requestUrl && resendKey && !existingLead?.followup_sent_at && payload?.lead?.consented !== false) {
    try {
      await sendReadyEmail(resendKey, email, requestUrl)
      followupSent = true
    } catch (err) {
      followupError = err instanceof Error ? err.message : String(err)
      console.error('Marketing live preview follow-up failed', followupError)
    }
  }

  const leadRecord = {
    session_id: sessionId,
    email,
    name: leadName,
    company,
    phone,
    readiness,
    selected_count: selectedCount,
    required_count: requiredCount,
    issue,
    summary,
    payload,
    customer_id: customerId,
    request_id: requestId,
    request_token: requestToken,
    request_url: requestUrl,
    converted_at: requestId ? new Date().toISOString() : null,
    consented_at: payload?.lead?.consented ? new Date().toISOString() : null,
    followup_sent_at: followupSent ? new Date().toISOString() : existingLead?.followup_sent_at ?? null,
    followup_channel: followupSent ? 'email' : null,
    followup_error: followupError,
    updated_at: new Date().toISOString(),
  }

  if (existingLead?.id) {
    const { error } = await supabase.from('marketing_live_leads').update(leadRecord).eq('id', existingLead.id)
    if (error) return json({ error: error.message }, 500)
  } else {
    const { error } = await supabase.from('marketing_live_leads').insert(leadRecord)
    if (error) return json({ error: error.message }, 500)
  }

  return json({ ok: true, session_id: sessionId, request_url: requestUrl })
})
