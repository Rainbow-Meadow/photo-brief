// Public endpoint: insert a row into waitlist_entries.
// JWT verification is off (anon visitors submit this).
// Accepts beta applications from /betalist with interest + workflow_type fields.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  name?: string;
  business_name?: string;
  email?: string;
  business_type?: string;
  website?: string;
  use_case?: string;
  estimated_monthly_requests?: string;
  workflow_type?: string;
  interest?: string;
  notes?: string;
  source?: string;
}

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

  let body: Payload;
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
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const name = clean(body.name, 200) ?? email.split("@")[0];

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Dedupe: friendly response if already on the list.
  const { data: existing } = await admin
    .from("waitlist_entries")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ ok: true, already: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const source = clean(body.source, 100) ?? "web";
  const interest = clean(body.interest, 100);
  const workflowType = clean(body.workflow_type, 100);

  const insertPayload = {
    name,
    email,
    business_name: clean(body.business_name, 200),
    business_type: clean(body.business_type, 100),
    website: clean(body.website, 300),
    use_case: clean(body.use_case, 1000),
    estimated_monthly_requests: clean(body.estimated_monthly_requests, 50),
    workflow_type: workflowType,
    interest,
    notes: clean(body.notes, 2000),
    source,
  };

  const { data: inserted, error } = await admin
    .from("waitlist_entries")
    .insert(insertPayload)
    .select("id, created_at")
    .single();

  if (error) {
    // Unique violation race
    if ((error as { code?: string }).code === "23505") {
      return new Response(JSON.stringify({ ok: true, already: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.error("waitlist-submit insert failed", error);
    return new Response(JSON.stringify({ error: "insert_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Fire-and-forget transactional emails. Email failures must NOT fail the
  // waitlist submission — the user is already on the list at this point.
  const entryId = inserted?.id;
  const createdAt = inserted?.created_at
    ? new Date(inserted.created_at).toISOString()
    : new Date().toISOString();
  const ADMIN_EMAIL = "hello@rainbow-meadow.org";

  // Pick the right confirmation template based on source
  const isBetaApplication = source.startsWith("betalist");
  const confirmationTemplate = isBetaApplication
    ? "waitlist-confirmation"
    : "waitlist-confirmation";

  try {
    await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: confirmationTemplate,
        recipientEmail: email,
        idempotencyKey: `waitlist-confirm-${entryId ?? email}`,
        templateData: { name },
      },
    });
  } catch (e) {
    console.error("waitlist-submit: confirmation email failed", e);
  }

  try {
    await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "waitlist-admin-notification",
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `waitlist-admin-${entryId ?? email}`,
        templateData: {
          ...insertPayload,
          created_at: createdAt,
          // Surface beta-specific fields for admin context
          ...(isBetaApplication && {
            application_type: "Beta Application",
            interest: interest ?? "founding-partner",
            workflow_type: workflowType ?? "not specified",
          }),
        },
      },
    });
  } catch (e) {
    console.error("waitlist-submit: admin email failed", e);
  }

  return new Response(JSON.stringify({ ok: true, already: false }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
