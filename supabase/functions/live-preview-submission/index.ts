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

  if (!supabaseUrl || !serviceKey) {
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

  const record = {
    session_id: sessionId,
    workflow_mode: payload?.workflow_mode || 'capture',
    selected_count: payload?.brief?.selected_count || 0,
    required_count: payload?.brief?.required_count || 4,
    readiness: payload?.brief?.readiness || 'incomplete',
    issue: payload?.brief?.issue || null,
    summary: payload?.brief?.summary || null,
    payload,
    updated_at: new Date().toISOString(),
  }

  await supabase.from('marketing_live_submissions').insert(record)

  // Lead capture
  const lead = payload?.lead
  if (lead?.email) {
    await supabase.from('marketing_live_leads').upsert({
      session_id: sessionId,
      email: lead.email,
      name: lead.name || null,
      company: lead.company || null,
      phone: lead.phone || null,
      readiness: payload?.brief?.readiness || 'incomplete',
      selected_count: payload?.brief?.selected_count || 0,
      required_count: payload?.brief?.required_count || 4,
      issue: payload?.brief?.issue || null,
      summary: payload?.brief?.summary || null,
      payload,
      consented_at: lead.consented ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
  }

  return json({ ok: true, session_id: sessionId })
})
