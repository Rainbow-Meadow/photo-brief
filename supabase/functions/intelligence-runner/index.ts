// PhotoBrief Intelligence — runner skeleton (PR 2).
//
// Contract:
//   - Polled by pg_cron every minute with the service-role key.
//   - Claims up to BATCH_SIZE queued rows from public.intelligence_jobs.
//   - Dispatches to a per-job-type handler.
//   - Writes job.output / job.error / job.status and any evidence rows
//     into public.intelligence_artifacts.
//
// PR 2 implements ONLY job_type = 'scan_website', and delegates the actual
// scan to the existing supabase/functions/website-intelligence function so
// we do not duplicate logic. Future PRs add real handlers and retire that
// legacy function.
//
// All other job types currently fail with NOT_IMPLEMENTED so they cannot
// silently no-op.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BATCH_SIZE = 5;
const HANDLER_TIMEOUT_MS = 120_000;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type JobType =
  | "scan_website"
  | "analyze_forms"
  | "propose_routes"
  | "propose_photo_policies"
  | "generate_blueprint"
  | "score_intake_brief"
  | "suggest_next_action"
  | "verify_install"
  | "monitor_install"
  | "generate_workspace_digest"
  | "learn_from_outcome";

interface JobRow {
  id: string;
  workspace_id: string;
  job_type: JobType;
  input: Record<string, unknown>;
}

interface HandlerResult {
  output: Record<string, unknown>;
  confidence?: number | null;
  warnings?: Array<{ code: string; message: string; evidence?: unknown }>;
  artifacts?: Array<{
    artifact_type:
      | "page_html"
      | "screenshot"
      | "form_snapshot"
      | "scraped_text"
      | "scoring_trace"
      | "install_probe";
    source_url?: string | null;
    storage_key?: string | null;
    content_excerpt?: string | null;
    metadata?: Record<string, unknown>;
  }>;
}

type Handler = (job: JobRow, admin: ReturnType<typeof createClient>) => Promise<HandlerResult>;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const handlers: Partial<Record<JobType, Handler>> = {
  scan_website: async (job) => {
    const input = job.input ?? {};
    const websiteUrl = (input as { website_url?: string; url?: string }).website_url
      ?? (input as { url?: string }).url;
    if (!websiteUrl || typeof websiteUrl !== "string") {
      throw new Error("INVALID_INPUT: website_url is required");
    }

    // Delegate to the existing legacy function so the scan logic stays in
    // exactly one place during the collapse. The runner records the result
    // and supporting evidence into the canonical job tables.
    const url = `${SUPABASE_URL}/functions/v1/website-intelligence`;
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), HANDLER_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "Content-Type": "application/json",
          // Service role bypasses authenticate(); workspace_id is enforced by
          // the underlying authorizeScan when present.
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          action: "scan_website",
          website_url: websiteUrl,
          workspace_id: job.workspace_id,
          beta_application_id: (input as { beta_application_id?: string }).beta_application_id ?? null,
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    const payload = await res.json().catch(() => ({}));
    if (!res.ok || (payload && (payload as { error?: string }).error)) {
      throw new Error(
        `SCAN_FAILED: ${(payload as { error?: string; message?: string }).error ?? res.status}` +
          ((payload as { message?: string }).message ? ` (${(payload as { message?: string }).message})` : ""),
      );
    }

    const p = payload as Record<string, unknown>;
    return {
      output: {
        profile_id: p.profile_id ?? null,
        scan_job_id: p.scan_job_id ?? null,
        blueprint_id: p.blueprint_id ?? null,
        pages_scanned: p.pages_scanned ?? 0,
        forms_detected: p.forms_detected ?? 0,
        services_detected: p.services_detected ?? 0,
        summary: p.summary ?? null,
        install_recommendation: p.install_recommendation ?? null,
      },
      // Deterministic crawl/parse path — no LLM, so confidence is null.
      confidence: null,
      warnings: [],
      artifacts: [
        {
          artifact_type: "scraped_text",
          source_url: websiteUrl,
          content_excerpt: typeof p.summary === "string" ? p.summary.slice(0, 2000) : null,
          metadata: {
            scan_job_id: p.scan_job_id ?? null,
            pages_scanned: p.pages_scanned ?? 0,
            forms_detected: p.forms_detected ?? 0,
            services_detected: p.services_detected ?? 0,
          },
        },
      ],
    };
  },
};

// ---------------------------------------------------------------------------
// Job loop
// ---------------------------------------------------------------------------

async function claimJobs(admin: ReturnType<typeof createClient>): Promise<JobRow[]> {
  // Atomically claim queued rows. UPDATE...IN(SELECT ... FOR UPDATE SKIP LOCKED)
  // would be ideal, but PostgREST does not expose it directly, so we use a
  // two-step claim with id list + status guard. Concurrent runners are safe
  // because the second UPDATE filters on status='queued' and returns only
  // the rows it actually transitioned.
  const { data: candidates, error: pickErr } = await admin
    .from("intelligence_jobs")
    .select("id")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (pickErr) throw pickErr;
  if (!candidates || candidates.length === 0) return [];

  const ids = candidates.map((r: { id: string }) => r.id);
  const { data: claimed, error: claimErr } = await admin
    .from("intelligence_jobs")
    .update({ status: "running", started_at: new Date().toISOString() })
    .in("id", ids)
    .eq("status", "queued")
    .select("id, workspace_id, job_type, input");
  if (claimErr) throw claimErr;
  return (claimed ?? []) as JobRow[];
}

async function runJob(admin: ReturnType<typeof createClient>, job: JobRow) {
  const handler = handlers[job.job_type];
  if (!handler) {
    await admin
      .from("intelligence_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error: `NOT_IMPLEMENTED: handler for ${job.job_type} ships in a later PR`,
      })
      .eq("id", job.id);
    return { id: job.id, status: "failed" as const, error: "NOT_IMPLEMENTED" };
  }

  try {
    const result = await handler(job, admin);
    await admin
      .from("intelligence_jobs")
      .update({
        status: "succeeded",
        completed_at: new Date().toISOString(),
        output: result.output ?? {},
        confidence: result.confidence ?? null,
        warnings: result.warnings ?? [],
        error: null,
      })
      .eq("id", job.id);

    if (result.artifacts && result.artifacts.length > 0) {
      const rows = result.artifacts.map((a) => ({
        workspace_id: job.workspace_id,
        job_id: job.id,
        artifact_type: a.artifact_type,
        source_url: a.source_url ?? null,
        storage_key: a.storage_key ?? null,
        content_excerpt: a.content_excerpt ?? null,
        metadata: a.metadata ?? {},
      }));
      await admin.from("intelligence_artifacts").insert(rows);
    }
    return { id: job.id, status: "succeeded" as const };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[intelligence-runner] job ${job.id} (${job.job_type}) failed:`, message);
    await admin
      .from("intelligence_jobs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error: message.slice(0, 2000),
      })
      .eq("id", job.id);
    return { id: job.id, status: "failed" as const, error: message };
  }
}

// ---------------------------------------------------------------------------
// HTTP entry
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Auth is enforced at the gateway via verify_jwt = true in supabase/config.toml.
  // pg_cron and any internal caller must present a valid Supabase JWT
  // (typically the service-role key) to reach this point.

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const jobs = await claimJobs(admin);
  const results = [];
  for (const job of jobs) {
    results.push(await runJob(admin, job));
  }
  return json({ ok: true, claimed: jobs.length, results });
});
