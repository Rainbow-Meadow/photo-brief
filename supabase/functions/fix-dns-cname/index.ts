import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const token = Deno.env.get("CLOUDFLARE_API_TOKEN");
  if (!token) return new Response("Missing CLOUDFLARE_API_TOKEN", { status: 500 });

  const zoneId = await getZoneId(token, "photobrief.ai");
  if (!zoneId) return new Response("Zone not found", { status: 404 });

  // Find the existing app CNAME
  const listRes = await cf(`/zones/${zoneId}/dns_records?type=CNAME&name=app.photobrief.ai`, token);
  const records = listRes.result ?? [];

  if (records.length === 0) {
    return Response.json({ error: "No app.photobrief.ai CNAME found" });
  }

  const record = records[0];
  const currentContent = record.content;

  if (currentContent === "photo-brief.lovable.app") {
    return Response.json({ status: "already_correct", content: currentContent });
  }

  // Update to correct hostname
  const updateRes = await cf(`/zones/${zoneId}/dns_records/${record.id}`, token, "PATCH", {
    content: "photo-brief.lovable.app",
  });

  return Response.json({
    status: "updated",
    old: currentContent,
    new: "photo-brief.lovable.app",
    success: updateRes.success,
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
