const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function cfApi(path: string, method = 'GET', body?: unknown) {
  const token = Deno.env.get('CLOUDFLARE_API_TOKEN')
  if (!token) throw new Error('CLOUDFLARE_API_TOKEN not set')
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  return res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const log: string[] = []
  try {
    // Step 1: Get zone
    log.push('Step 1: Finding zone for photobrief.ai')
    const zones = await cfApi('/zones?name=photobrief.ai')
    if (!zones.result?.length) return json({ error: 'Zone not found', zones }, 404)
    const zoneId = zones.result[0].id
    const accountId = zones.result[0].account.id
    log.push(`Zone ID: ${zoneId}, Account ID: ${accountId}`)

    // Step 2: Check existing destination addresses
    log.push('Step 2: Checking destination addresses')
    const addresses = await cfApi(`/accounts/${accountId}/email/routing/addresses`)
    const existing = addresses.result?.find((a: any) => a.email === 'hello@rainbow-meadow.org')
    log.push(`Existing destinations: ${JSON.stringify(addresses.result?.map((a: any) => ({ email: a.email, verified: a.verified })))}`)

    // Step 3: Create destination if not exists
    let destAddress = existing
    if (!existing) {
      log.push('Step 3: Creating destination address hello@rainbow-meadow.org')
      const created = await cfApi(`/accounts/${accountId}/email/routing/addresses`, 'POST', {
        email: 'hello@rainbow-meadow.org',
      })
      log.push(`Create result: ${JSON.stringify(created)}`)
      destAddress = created.result
    } else {
      log.push(`Step 3: Destination already exists (verified: ${existing.verified})`)
    }

    // Step 4: Check email routing status
    log.push('Step 4: Checking email routing status')
    const erStatus = await cfApi(`/zones/${zoneId}/email/routing`)
    log.push(`Email routing enabled: ${erStatus.result?.enabled}`)

    // Step 5: Enable email routing if needed
    if (!erStatus.result?.enabled) {
      log.push('Step 5: Enabling email routing')
      const enable = await cfApi(`/zones/${zoneId}/email/routing/enable`, 'POST')
      log.push(`Enable result: success=${enable.success}, errors=${JSON.stringify(enable.errors)}`)
    } else {
      log.push('Step 5: Email routing already enabled')
    }

    // Step 6: Set catch-all rule
    log.push('Step 6: Setting catch-all forwarding rule')
    const catchAll = await cfApi(`/zones/${zoneId}/email/routing/rules/catch_all`, 'PUT', {
      actions: [{ type: 'forward', value: ['hello@rainbow-meadow.org'] }],
      matchers: [{ type: 'all' }],
      enabled: true,
      name: 'Forward all to hello@rainbow-meadow.org',
    })
    log.push(`Catch-all result: ${JSON.stringify(catchAll)}`)

    return json({
      success: true,
      log,
      destAddress,
      catchAll: catchAll.result,
    })
  } catch (err) {
    return json({ error: String(err), log }, 500)
  }
})
