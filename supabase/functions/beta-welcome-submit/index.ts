import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function clean(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = clean(body.email, 254)?.toLowerCase() ?? null;
  if (!email || !isEmail(email)) {
    return new Response(JSON.stringify({ error: "invalid_email" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const business_name = clean(body.business_name, 200);
  if (!business_name) {
    return new Response(JSON.stringify({ error: "business_name_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const photo_use_case = clean(body.photo_use_case, 2000);
  if (!photo_use_case) {
    return new Response(JSON.stringify({ error: "photo_use_case_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const row = {
    email,
    name: clean(body.name, 100),
    business_name,
    industry: clean(body.industry, 100),
    website: clean(body.website, 300),
    phone: clean(body.phone, 30),
    brand_color: clean(body.brand_color, 20),
    tagline: clean(body.tagline, 300),
    logo_description: clean(body.logo_description, 500),
    photo_use_case,
    monthly_volume: clean(body.monthly_volume, 50),
    reviewer_info: clean(body.reviewer_info, 300),
    preferred_channel: clean(body.preferred_channel, 20),
    template_ideas: clean(body.template_ideas, 2000),
    notes: clean(body.notes, 2000),
  };

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error: insertErr } = await sb
    .from("beta_welcome_submissions")
    .insert(row);

  if (insertErr) {
    console.error("insert error", insertErr);
    return new Response(JSON.stringify({ error: "db_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Send admin notification
  try {
    await sb.functions.invoke("notify-event", {
      body: {
        event_type: "beta_welcome_submission",
        subject: `🎉 Beta welcome: ${business_name} (${email})`,
        details: {
          name: row.name,
          email,
          business_name,
          industry: row.industry,
          website: row.website,
          phone: row.phone,
          brand_color: row.brand_color,
          tagline: row.tagline,
          logo_description: row.logo_description,
          photo_use_case,
          monthly_volume: row.monthly_volume,
          reviewer_info: row.reviewer_info,
          preferred_channel: row.preferred_channel,
          template_ideas: row.template_ideas,
          notes: row.notes,
        },
      },
    });
  } catch (e) {
    console.error("admin notification failed (non-fatal)", e);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
