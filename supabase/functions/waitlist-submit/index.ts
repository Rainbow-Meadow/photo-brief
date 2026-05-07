// Public endpoint: capture waitlist entries and Founding Partner Beta applications.
// JWT verification is off (anon visitors submit this).
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
  monthly_photo_volume?: string;
  workflow_type?: string;
  interest?: string;
  notes?: string;
  source?: string;
  fit_score?: number;
  agent_segment?: string;
  suggested_template?: string;
  agent_summary?: string;
  agent_concerns?: string[];
  first_request_steps?: string[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
}

function clean(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function cleanStringArray(v: unknown, maxItems = 10, maxLength = 200): string[] | null {
  if (!Array.isArray(v)) return null;
  const cleaned = v
    .map((item) => clean(item, maxLength))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
  return cleaned.length ? cleaned : null;
}

function cleanFitScore(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  const rounded = Math.round(v);
  return Math.max(1, Math.min(5, rounded));
}

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254;
}

function splitName(name: string): { first_name: string | null; last_name: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: null, last_name: null };
  return {
    first_name: parts[0] ?? null,
    last_name: parts.length > 1 ? parts.slice(1).join(" ") : null,
  };
}

function isBetaSource(source: string, interest: string | null): boolean {
  const normalized = source.toLowerCase();
  return (
    normalized === "betalist" ||
    normalized.startsWith("betalist") ||
    normalized.includes("beta") ||
    normalized.startsWith("landing") ||
    interest === "founding-partner"
  );
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
  const source = clean(body.source, 100) ?? "web";
  const interest = clean(body.interest, 100);
  const workflowType = clean(body.workflow_type, 100);
  const monthlyVolume =
    clean(body.monthly_photo_volume, 50) ?? clean(body.estimated_monthly_requests, 50);
  const betaApplication = isBetaSource(source, interest);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const waitlistPayload = {
    name,
    email,
    business_name: clean(body.business_name, 200),
    business_type: clean(body.business_type, 100),
    website: clean(body.website, 300),
    use_case: clean(body.use_case, 1000),
    estimated_monthly_requests: monthlyVolume,
    workflow_type: workflowType,
    interest,
    notes: clean(body.notes, 2000),
    source,
  };

  const { data: existingWaitlist } = await admin
    .from("waitlist_entries")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let entryId = existingWaitlist?.id ?? null;
  let createdAt = new Date().toISOString();
  let waitlistAlready = Boolean(existingWaitlist);

  if (!existingWaitlist) {
    const { data: inserted, error } = await admin
      .from("waitlist_entries")
      .insert(waitlistPayload)
      .select("id, created_at")
      .single();

    if (error && (error as { code?: string }).code !== "23505") {
      console.error("waitlist-submit insert failed", error);
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (error && (error as { code?: string }).code === "23505") {
      waitlistAlready = true;
    } else {
      entryId = inserted?.id ?? null;
      createdAt = inserted?.created_at
        ? new Date(inserted.created_at).toISOString()
        : createdAt;
    }
  }

  let betaAlready = false;
  let betaApplicationId: string | null = null;

  if (betaApplication) {
    const { first_name, last_name } = splitName(name);
    const betaPayload = {
      email,
      first_name,
      last_name,
      business_name: clean(body.business_name, 200),
      website: clean(body.website, 300),
      use_case: clean(body.use_case, 1000),
      workflow_type: workflowType,
      monthly_photo_volume: monthlyVolume,
      source,
      status: "new",
      fit_score: cleanFitScore(body.fit_score),
      agent_segment: clean(body.agent_segment, 100),
      suggested_template: clean(body.suggested_template, 200),
      agent_summary: clean(body.agent_summary, 1000),
      agent_concerns: cleanStringArray(body.agent_concerns),
      first_request_steps: cleanStringArray(body.first_request_steps, 12, 200),
      notes: [
        clean(body.notes, 1500),
        clean(body.business_type, 100) ? `Business type: ${clean(body.business_type, 100)}` : null,
        clean(body.utm_source, 100) ? `utm_source: ${clean(body.utm_source, 100)}` : null,
        clean(body.utm_medium, 100) ? `utm_medium: ${clean(body.utm_medium, 100)}` : null,
        clean(body.utm_campaign, 100) ? `utm_campaign: ${clean(body.utm_campaign, 100)}` : null,
        clean(body.referrer, 300) ? `referrer: ${clean(body.referrer, 300)}` : null,
      ].filter(Boolean).join("\n") || null,
    };

    const { data: betaInserted, error: betaError } = await admin
      .from("beta_applications")
      .upsert(betaPayload, { onConflict: "email", ignoreDuplicates: true })
      .select("id")
      .maybeSingle();

    if (betaError) {
      console.error("waitlist-submit beta application insert failed", betaError);
      return new Response(JSON.stringify({ error: "beta_insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (betaInserted?.id) {
      betaApplicationId = betaInserted.id;
    } else {
      betaAlready = true;
      const { data: existingBeta } = await admin
        .from("beta_applications")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      betaApplicationId = existingBeta?.id ?? null;
    }
  }

  const ADMIN_EMAIL = "hello@rainbow-meadow.org";

  try {
    await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "waitlist-confirmation",
        recipientEmail: email,
        idempotencyKey: `waitlist-confirm-${entryId ?? betaApplicationId ?? email}`,
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
        idempotencyKey: `waitlist-admin-${entryId ?? betaApplicationId ?? email}`,
        templateData: {
          ...waitlistPayload,
          beta_application_id: betaApplicationId,
          created_at: createdAt,
          ...(betaApplication && {
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

  return new Response(
    JSON.stringify({
      ok: true,
      already: betaApplication ? betaAlready : waitlistAlready,
      beta_application_id: betaApplicationId,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
