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

  const sessionId = payload?.session_id || crypto.randomUUID()
  const supabase = createClient(supabaseUrl, serviceKey)

  await supabase.from('marketing_live_submissions').insert({
    session_id: sessionId,
    workflow_mode: payload?.workflow_mode || 'capture',
    selected_count: payload?.brief?.selected_count || 0,
    required_count: payload?.brief?.required_count || 4,
    readiness: payload?.brief?.readiness || 'incomplete',
    issue: payload?.brief?.issue || null,
    summary: payload?.brief?.summary || null,
    payload,
  })

  const lead = payload?.lead
  let requestUrl = null

  if (lead?.email) {
    let { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('email', lead.email)
      .maybeSingle()

    if (!customer) {
      const { data } = await supabase
        .from('customers')
        .insert({
          workspace_id: workspaceId,
          email: lead.email,
          display_name: lead.name || null,
        })
        .select()
        .single()
      customer = data
    }

    if (payload?.brief?.readiness === 'ready') {
      const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12)

      const { data: request } = await supabase
        .from('photo_brief_requests')
        .insert({
          workspace_id: workspaceId,
          customer_id: customer.id,
          recipient_name: customer.display_name || lead.email,
          recipient_email: lead.email,
          status: 'draft',
          token,
        })
        .select()
        .single()

      requestUrl = `https://photobrief.ai/r/${request.token}`

      if (resendKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'PhotoBrief <hello@photobrief.ai>',
              to: [lead.email],
              subject: 'Your PhotoBrief is ready',
              html: `<p>Your PhotoBrief is ready:</p><p><a href="${requestUrl}">Open your request</a></p>`,
            }),
          })
        } catch (e) {
          console.error('Email send failed', e)
        }
      }
    }

    await supabase.from('marketing_live_leads').upsert({
      session_id: sessionId,
      email: lead.email,
      readiness: payload?.brief?.readiness,
      payload,
      request_url: requestUrl,
      converted_at: requestUrl ? new Date().toISOString() : null,
    })
  }

  return json({ ok: true, session_id: sessionId, request_url: requestUrl })
})
