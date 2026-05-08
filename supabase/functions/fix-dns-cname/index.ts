import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const token = Deno.env.get("CLOUDFLARE_API_TOKEN");
  if (!token) return new Response("Missing CLOUDFLARE_API_TOKEN", { status: 500 });

  const zoneId = await getZoneId(token, "photobrief.ai");
  if (!zoneId) return new Response("Zone not found", { status: 404 });

  // Find ALL records for app.photobrief.ai
  const listRes = await cf(`/zones/${zoneId}/dns_records?name=app.photobrief.ai`, token);
  const records = listRes.result ?? [];

  if (records.length === 0) {
    return Response.json({ error: "No app.photobrief.ai records found" });
  }

  const results = [];
  for (const record of records) {
    // Delete old record
    await cf(`/zones/${zoneId}/dns_records/${record.id}`, token, "DELETE");
    results.push({ deleted: record.type, content: record.content, id: record.id });
  }

  // Create correct CNAME
  const createRes = await cf(`/zones/${zoneId}/dns_records`, token, "POST", {
    type: "CNAME",
    name: "app",
    content: "photo-brief.lovable.app",
    proxied: true,
    ttl: 1,
  });

  return Response.json({
    deleted: results,
    created: {
      success: createRes.success,
      type: "CNAME",
      content: "photo-brief.lovable.app",
      id: createRes.result?.id,
    },
  });
});

async function getZoneId(token: string, domain: string) {
  const res = await cf(`/zones?name=${domain}`, token);
  return res.result?.[0]?.id ?? null;
}

async function cf(path: string, token: string, method = "GET", body?: unknown) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}
