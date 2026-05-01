import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CF_API = "https://api.cloudflare.com/client/v4";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get("CLOUDFLARE_API_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "CLOUDFLARE_API_TOKEN not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const { action, zone_id, records } = await req.json();

  try {
    if (action === "list_zones") {
      const res = await fetch(`${CF_API}/zones?name=photobrief.ai`, { headers });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list_records") {
      const res = await fetch(`${CF_API}/zones/${zone_id}/dns_records?per_page=100`, { headers });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_record") {
      const { type, name, content, proxied, priority, ttl } = records;
      const body: any = { type, name, content, proxied: proxied ?? false };
      if (priority !== undefined) body.priority = priority;
      if (ttl !== undefined) body.ttl = ttl;
      const res = await fetch(`${CF_API}/zones/${zone_id}/dns_records`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update_record") {
      const { record_id, type, name, content, proxied, priority, ttl } = records;
      const body: any = { type, name, content, proxied: proxied ?? false };
      if (priority !== undefined) body.priority = priority;
      if (ttl !== undefined) body.ttl = ttl;
      const res = await fetch(`${CF_API}/zones/${zone_id}/dns_records/${record_id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete_record") {
      const { record_id } = records;
      const res = await fetch(`${CF_API}/zones/${zone_id}/dns_records/${record_id}`, {
        method: "DELETE",
        headers,
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "bulk_create") {
      // records is an array
      const results = [];
      for (const rec of records) {
        const body: any = { type: rec.type, name: rec.name, content: rec.content, proxied: rec.proxied ?? false };
        if (rec.priority !== undefined) body.priority = rec.priority;
        if (rec.ttl !== undefined) body.ttl = rec.ttl;
        const res = await fetch(`${CF_API}/zones/${zone_id}/dns_records`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        const data = await res.json();
        results.push(data);
      }
      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
