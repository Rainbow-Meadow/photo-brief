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

  // -------------------------------------------------------------------------
  // analyze_forms — read scanned forms for a workspace and classify them.
  //
  // Input: { scan_job_id?: uuid, workspace_id? } — defaults to the latest
  //   scan job for the workspace.
  // Output: { forms: [{ id, page_url, inferred_purpose, quality_score,
  //   classification, replace_with_intake, reason }], summary }
  //
  // Deterministic. No LLM. Classification is a simple rule pass over field
  // names + button text + nearby copy. The purpose is to flag which legacy
  // website forms Smart Intake should replace.
  // -------------------------------------------------------------------------
  analyze_forms: async (job, admin) => {
    const input = job.input ?? {};
    const scanJobId = (input as { scan_job_id?: string }).scan_job_id ?? null;

    let q = admin
      .from("website_forms")
      .select("id, page_url, field_names, field_labels, required_fields, button_text, nearby_heading, nearby_copy, inferred_purpose, quality_score, scan_job_id")
      .eq("workspace_id", job.workspace_id)
      .order("quality_score", { ascending: false })
      .limit(100);
    if (scanJobId) q = q.eq("scan_job_id", scanJobId);
    const { data: forms, error } = await q;
    if (error) throw new Error(`READ_FORMS_FAILED: ${error.message}`);

    const classified = (forms ?? []).map((f: Record<string, unknown>) => {
      const fields = ([] as string[])
        .concat((f.field_names as string[]) ?? [])
        .concat((f.field_labels as string[]) ?? [])
        .map((s) => (s ?? "").toLowerCase());
      const text = `${f.button_text ?? ""} ${f.nearby_heading ?? ""} ${f.nearby_copy ?? ""}`.toLowerCase();
      const all = fields.join(" ") + " " + text;

      const has = (...needles: string[]) => needles.some((n) => all.includes(n));

      let classification: "contact" | "quote" | "booking" | "newsletter" | "support" | "other" = "other";
      if (has("newsletter", "subscribe", "signup for")) classification = "newsletter";
      else if (has("estimate", "quote", "pricing", "get a price")) classification = "quote";
      else if (has("appointment", "book ", "schedule")) classification = "booking";
      else if (has("support", "ticket", "help")) classification = "support";
      else if (has("contact", "message", "get in touch", "reach out", "name", "email")) classification = "contact";

      // Anything that captures customer intent for service work should be
      // replaced with Smart Intake. Newsletters and pure support tickets stay.
      const replace = classification === "contact"
        || classification === "quote"
        || classification === "booking";

      const reason = replace
        ? `Captures customer intent (${classification}) — Smart Intake collects the same fields plus job-specific routing.`
        : `Not a service-intake form (${classification}).`;

      return {
        id: f.id,
        page_url: f.page_url,
        inferred_purpose: f.inferred_purpose,
        quality_score: f.quality_score,
        classification,
        replace_with_intake: replace,
        reason,
      };
    });

    const replaceCount = classified.filter((c) => c.replace_with_intake).length;
    return {
      output: {
        scan_job_id: scanJobId,
        forms_total: classified.length,
        forms_to_replace: replaceCount,
        forms: classified,
        summary: replaceCount === 0
          ? "No service-intake forms detected on this site."
          : `${replaceCount} of ${classified.length} forms should be replaced by Smart Intake.`,
      },
      confidence: null,
      warnings: classified.length === 0
        ? [{ code: "NO_FORMS", message: "No website_forms rows found for this workspace/scan." }]
        : [],
      artifacts: classified.slice(0, 10).map((c) => ({
        artifact_type: "form_snapshot" as const,
        source_url: typeof c.page_url === "string" ? c.page_url : null,
        metadata: {
          form_id: c.id,
          classification: c.classification,
          replace_with_intake: c.replace_with_intake,
          quality_score: c.quality_score,
        },
      })),
    };
  },

  // -------------------------------------------------------------------------
  // propose_routes — read the routing rules currently attached to a
  // workspace's latest blueprint and surface them as a proposal payload
  // (label, customer_description, match_keywords, template_type, fallback).
  //
  // Input: { blueprint_id?: uuid } — defaults to the latest draft/active
  //   blueprint for the workspace.
  // Output: { blueprint_id, routes: [...], coverage_warnings }
  //
  // Deterministic. PR 4 will swap the source from legacy generation to a
  // first-class job that derives routes from website_pages + service_catalog.
  // -------------------------------------------------------------------------
  propose_routes: async (job, admin) => {
    const input = job.input ?? {};
    let blueprintId = (input as { blueprint_id?: string }).blueprint_id ?? null;

    if (!blueprintId) {
      const { data: bp } = await admin
        .from("intake_blueprints")
        .select("id")
        .eq("workspace_id", job.workspace_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      blueprintId = (bp as { id?: string } | null)?.id ?? null;
    }
    if (!blueprintId) {
      throw new Error("NO_BLUEPRINT: workspace has no intake_blueprint to propose routes for");
    }

    const { data: rules, error } = await admin
      .from("intake_routing_rules")
      .select("id, label, customer_description, match_keywords, template_type, photo_policy, readiness_goal, sort_order, is_fallback")
      .eq("blueprint_id", blueprintId)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(`READ_ROUTES_FAILED: ${error.message}`);

    const list = rules ?? [];
    const warnings: Array<{ code: string; message: string }> = [];
    if (list.length === 0) warnings.push({ code: "NO_ROUTES", message: "Blueprint has no routes." });
    if (list.length > 0 && !list.some((r: Record<string, unknown>) => r.is_fallback)) {
      warnings.push({ code: "NO_FALLBACK", message: "No fallback route defined — recipients who don't match a route will be stuck." });
    }
    const dupes = new Set<string>();
    const seen = new Set<string>();
    for (const r of list) {
      const key = (r as { label?: string }).label?.toLowerCase().trim() ?? "";
      if (!key) continue;
      if (seen.has(key)) dupes.add(key);
      seen.add(key);
    }
    if (dupes.size > 0) {
      warnings.push({ code: "DUPLICATE_LABELS", message: `Duplicate route labels: ${Array.from(dupes).join(", ")}` });
    }

    return {
      output: {
        blueprint_id: blueprintId,
        routes_total: list.length,
        routes: list,
      },
      confidence: null,
      warnings,
    };
  },

  // -------------------------------------------------------------------------
  // propose_photo_policies — for each route on a blueprint, recommend one of
  // the four canonical photo policies based on template_type + readiness_goal.
  //
  // The default answer to "should we ask for a photo?" is no. Photos are
  // only required when the job literally cannot be quoted/dispatched without
  // visual evidence (damage, install conditions).
  //
  // Input: { blueprint_id?: uuid }
  // Output: { blueprint_id, recommendations: [{ route_id, label,
  //   current_policy, recommended_policy, reason }] }
  // -------------------------------------------------------------------------
  propose_photo_policies: async (job, admin) => {
    const input = job.input ?? {};
    let blueprintId = (input as { blueprint_id?: string }).blueprint_id ?? null;
    if (!blueprintId) {
      const { data: bp } = await admin
        .from("intake_blueprints")
        .select("id")
        .eq("workspace_id", job.workspace_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      blueprintId = (bp as { id?: string } | null)?.id ?? null;
    }
    if (!blueprintId) {
      throw new Error("NO_BLUEPRINT: workspace has no intake_blueprint to propose photo policies for");
    }

    const { data: rules, error } = await admin
      .from("intake_routing_rules")
      .select("id, label, template_type, readiness_goal, photo_policy")
      .eq("blueprint_id", blueprintId);
    if (error) throw new Error(`READ_ROUTES_FAILED: ${error.message}`);

    type Policy = "not_needed" | "optional" | "recommended" | "required";
    const recommendations = (rules ?? []).map((r: Record<string, unknown>) => {
      const tmpl = String(r.template_type ?? "").toLowerCase();
      const goal = String(r.readiness_goal ?? "").toLowerCase();
      const label = String(r.label ?? "").toLowerCase();
      const blob = `${tmpl} ${goal} ${label}`;

      let recommended: Policy = "optional";
      let reason = "Default: photos help but don't block — operator can decide per lead.";

      if (/\b(damage|leak|repair|insurance|claim|storm|roof|hvac|plumb|electric)\b/.test(blob)) {
        recommended = "required";
        reason = "Damage/repair/insurance work cannot be quoted without visual evidence.";
      } else if (/\b(install|replace|measur|estimate|quote)\b/.test(blob)) {
        recommended = "recommended";
        reason = "Install/replace estimates are much faster with photos but a callback can fill the gap.";
      } else if (/\b(callback|call|talk|consult|question|info)\b/.test(blob)) {
        recommended = "not_needed";
        reason = "Information / callback request — no photos needed.";
      } else if (/\b(book|appoint|schedule|maintenance|tune)\b/.test(blob)) {
        recommended = "not_needed";
        reason = "Scheduled service / maintenance — photos add friction without changing the dispatch.";
      }

      return {
        route_id: r.id,
        label: r.label,
        current_policy: r.photo_policy,
        recommended_policy: recommended,
        changed: r.photo_policy !== recommended,
        reason,
      };
    });

    const changes = recommendations.filter((r) => r.changed).length;
    return {
      output: {
        blueprint_id: blueprintId,
        routes_total: recommendations.length,
        changes_proposed: changes,
        recommendations,
      },
      confidence: null,
      warnings: recommendations.length === 0
        ? [{ code: "NO_ROUTES", message: "Blueprint has no routes to recommend policies for." }]
        : [],
    };
  },

  // -------------------------------------------------------------------------
  // score_intake_brief — read a submitted brief, compute completeness +
  // readiness, recommend a next action, and write the result back onto the
  // intake_briefs row. Deterministic rule pass (no LLM) so it is cheap and
  // safe to run on every brief insert via DB trigger.
  //
  // Input: { brief_id: uuid }
  // Output: { brief_id, readiness_score, readiness_status, missing_items[],
  //   next_action, summary }
  // Side effects: UPDATE intake_briefs SET readiness_score, readiness_status,
  //   missing_items, next_action; insert scoring_trace artifact.
  // -------------------------------------------------------------------------
  score_intake_brief: async (job, admin) => {
    const briefId = (job.input as { brief_id?: string }).brief_id;
    if (!briefId) throw new Error("INVALID_INPUT: brief_id is required");

    const { data: brief, error } = await admin
      .from("intake_briefs")
      .select("id, workspace_id, customer_contact, answers, photo_policy, photos_provided, photo_count, route_label, service_label, readiness_status")
      .eq("id", briefId)
      .eq("workspace_id", job.workspace_id)
      .maybeSingle();
    if (error) throw new Error(`READ_BRIEF_FAILED: ${error.message}`);
    if (!brief) throw new Error("NOT_FOUND: intake brief not found in workspace");

    const b = brief as Record<string, unknown>;
    const contact = (b.customer_contact ?? {}) as Record<string, unknown>;
    const answers = (b.answers ?? {}) as Record<string, unknown>;
    const policy = String(b.photo_policy ?? "optional");
    const photosProvided = Boolean(b.photos_provided);
    const photoCount = Number(b.photo_count ?? 0);

    const missing: string[] = [];
    let score = 0;
    const trace: Array<{ check: string; ok: boolean; weight: number }> = [];
    const add = (check: string, ok: boolean, weight: number) => {
      trace.push({ check, ok, weight });
      if (ok) score += weight;
      else missing.push(check);
    };

    const hasName = typeof contact.name === "string" && (contact.name as string).trim().length > 1;
    const hasContactChan = (typeof contact.email === "string" && (contact.email as string).includes("@"))
      || (typeof contact.phone === "string" && (contact.phone as string).replace(/\D/g, "").length >= 7);
    const hasAddress = typeof contact.address === "string" && (contact.address as string).trim().length > 4;
    const answerCount = Object.values(answers).filter((v) => v !== null && v !== "" && v !== undefined).length;

    add("customer_name", hasName, 15);
    add("contact_channel (email or phone)", hasContactChan, 25);
    add("service_address", hasAddress, 15);
    add("at_least_2_route_answers", answerCount >= 2, 20);
    add("at_least_4_route_answers", answerCount >= 4, 10);

    if (policy === "required") add("required_photos", photosProvided && photoCount > 0, 15);
    else if (policy === "recommended") add("recommended_photos", photosProvided, 5);
    else score += 0; // not_needed / optional contribute nothing extra

    let readiness: string;
    if (policy === "required" && !photosProvided) readiness = "needs_photos";
    else if (!hasContactChan) readiness = "needs_more_info";
    else if (score >= 75) readiness = "ready_to_quote";
    else if (score >= 55) readiness = "ready_for_callback";
    else if (score >= 30) readiness = "needs_more_info";
    else readiness = "needs_review";

    let nextAction: string;
    if (readiness === "ready_to_quote") nextAction = "Send a written quote — you have what you need.";
    else if (readiness === "ready_for_callback") nextAction = "Call the customer to confirm details before quoting.";
    else if (readiness === "needs_photos") nextAction = "Send a guided photo request to get the missing visual evidence.";
    else if (readiness === "needs_more_info") nextAction = `Ask the customer for: ${missing.slice(0, 3).join(", ")}.`;
    else nextAction = "Review this lead manually — not enough info to auto-route.";

    await admin
      .from("intake_briefs")
      .update({
        readiness_score: Math.min(100, score),
        readiness_status: readiness,
        missing_items: missing,
        next_action: nextAction,
      })
      .eq("id", briefId);

    return {
      output: {
        brief_id: briefId,
        readiness_score: Math.min(100, score),
        readiness_status: readiness,
        missing_items: missing,
        next_action: nextAction,
        summary: `${b.route_label ?? "Lead"} — ${readiness} (${score}/100).`,
      },
      confidence: null,
      warnings: [],
      artifacts: [{
        artifact_type: "scoring_trace" as const,
        content_excerpt: JSON.stringify(trace).slice(0, 2000),
        metadata: { brief_id: briefId, score, readiness, photo_policy: policy, photo_count: photoCount },
      }],
    };
  },

  // -------------------------------------------------------------------------
  // suggest_next_action — thin wrapper that returns the latest scoring's
  // next_action for a brief, scoring it on demand if missing. Intended for
  // operator UI "what should I do next?" affordance without re-scoring.
  // -------------------------------------------------------------------------
  suggest_next_action: async (job, admin) => {
    const briefId = (job.input as { brief_id?: string }).brief_id;
    if (!briefId) throw new Error("INVALID_INPUT: brief_id is required");
    const { data: brief, error } = await admin
      .from("intake_briefs")
      .select("id, next_action, readiness_status, readiness_score, missing_items")
      .eq("id", briefId)
      .eq("workspace_id", job.workspace_id)
      .maybeSingle();
    if (error) throw new Error(`READ_BRIEF_FAILED: ${error.message}`);
    if (!brief) throw new Error("NOT_FOUND: intake brief not found in workspace");
    const b = brief as Record<string, unknown>;
    return {
      output: {
        brief_id: briefId,
        next_action: b.next_action ?? "Score this brief first.",
        readiness_status: b.readiness_status ?? null,
        readiness_score: b.readiness_score ?? null,
        missing_items: b.missing_items ?? [],
      },
      confidence: null,
      warnings: b.next_action ? [] : [{ code: "NOT_SCORED", message: "Brief has not been scored yet — enqueue score_intake_brief." }],
    };
  },

  // -------------------------------------------------------------------------
  // generate_workspace_digest — daily standup for an operator. Aggregates the
  // last 24 hours of intake briefs and surfaces what needs attention.
  // Replaces orchestrator-agent nightly standup + assistant-agent digest.
  //
  // Input: { hours?: number = 24 }
  // Output: { window_hours, totals, top_missing, digest_md }
  // -------------------------------------------------------------------------
  generate_workspace_digest: async (job, admin) => {
    const hours = Math.max(1, Math.min(168, Number((job.input as { hours?: number }).hours ?? 24)));
    const since = new Date(Date.now() - hours * 3600_000).toISOString();

    const { data: briefs, error } = await admin
      .from("intake_briefs")
      .select("id, route_label, readiness_status, readiness_score, missing_items, next_action, created_at")
      .eq("workspace_id", job.workspace_id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(`READ_BRIEFS_FAILED: ${error.message}`);

    const list = (briefs ?? []) as Array<Record<string, unknown>>;
    const totals = {
      total: list.length,
      ready_to_quote: 0,
      ready_for_callback: 0,
      needs_photos: 0,
      needs_more_info: 0,
      needs_review: 0,
      other: 0,
    } as Record<string, number>;
    const missingTally: Record<string, number> = {};
    for (const b of list) {
      const r = String(b.readiness_status ?? "other");
      totals[r in totals ? r : "other"] = (totals[r in totals ? r : "other"] ?? 0) + 1;
      for (const m of ((b.missing_items as string[]) ?? [])) {
        missingTally[m] = (missingTally[m] ?? 0) + 1;
      }
    }
    const topMissing = Object.entries(missingTally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));

    const lines: string[] = [];
    lines.push(`# Last ${hours}h — ${totals.total} new brief${totals.total === 1 ? "" : "s"}`);
    if (totals.total === 0) {
      lines.push("");
      lines.push("No new intake briefs in this window.");
    } else {
      lines.push("");
      lines.push(`- ${totals.ready_to_quote} ready to quote`);
      lines.push(`- ${totals.ready_for_callback} ready for callback`);
      lines.push(`- ${totals.needs_photos} waiting on photos`);
      lines.push(`- ${totals.needs_more_info} need more info`);
      lines.push(`- ${totals.needs_review} need manual review`);
      if (topMissing.length > 0) {
        lines.push("");
        lines.push("Most common missing items:");
        for (const m of topMissing) lines.push(`- ${m.item} (${m.count})`);
      }
    }

    return {
      output: {
        window_hours: hours,
        totals,
        top_missing: topMissing,
        digest_md: lines.join("\n"),
      },
      confidence: null,
      warnings: [],
    };
  },

  // -------------------------------------------------------------------------
  // verify_install — confirm Smart Intake is installed on the operator's
  // public website. Deterministic. No LLM.
  //
  // Input: { site_url: string, expected_token?: string,
  //   intake_source_id?: uuid, expected_host?: string }
  //   - If expected_token is omitted, looks up the workspace's intake source
  //     (or the row matching intake_source_id).
  // Output: { installed, platform, found_links[], expected_url, fix_steps?[] }
  // Side effect: install_probe artifact with the fetched HTML excerpt.
  // -------------------------------------------------------------------------
  verify_install: async (job, admin) => {
    const input = (job.input ?? {}) as {
      site_url?: string;
      expected_token?: string;
      intake_source_id?: string;
      expected_host?: string;
    };
    const siteUrl = input.site_url;
    if (!siteUrl || typeof siteUrl !== "string") {
      throw new Error("INVALID_INPUT: site_url is required");
    }
    const expectedHost = (input.expected_host ?? "photobrief.ai").toLowerCase();

    let expectedToken = input.expected_token ?? null;
    let intakeSourceId = input.intake_source_id ?? null;
    if (!expectedToken) {
      let q = admin
        .from("intake_sources")
        .select("id, public_token")
        .eq("workspace_id", job.workspace_id)
        .eq("enabled", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (intakeSourceId) q = q.eq("id", intakeSourceId);
      const { data: src } = await q.maybeSingle();
      if (src) {
        expectedToken = (src as { public_token?: string }).public_token ?? null;
        intakeSourceId = (src as { id?: string }).id ?? intakeSourceId;
      }
    }
    if (!expectedToken) {
      throw new Error("NO_INTAKE_TOKEN: workspace has no intake_source to verify against");
    }

    const probe = await probeSite(siteUrl);
    const platform = detectPlatform(probe.html);
    const expectedPath = `/i/${expectedToken}`;
    const linkPattern = /https?:\/\/[^"'<> )]+\/i\/[A-Za-z0-9_-]+/g;
    const allLinks = probe.html.match(linkPattern) ?? [];
    const foundLinks = allLinks.filter((l) =>
      l.toLowerCase().includes(expectedHost) && l.includes(expectedPath)
    );
    const installed = foundLinks.length > 0;
    const expectedUrl = `https://${expectedHost}${expectedPath}`;
    const fixSteps = installed ? undefined : buildFixSteps(platform, expectedUrl);

    return {
      output: {
        installed,
        platform,
        site_url: siteUrl,
        expected_url: expectedUrl,
        intake_source_id: intakeSourceId,
        found_links: foundLinks.slice(0, 10),
        fix_steps: fixSteps,
        fetch_status: probe.status,
      },
      confidence: null,
      warnings: probe.error
        ? [{ code: "FETCH_FAILED", message: probe.error }]
        : (installed ? [] : [{ code: "NOT_FOUND", message: `No link to ${expectedUrl} found in the page HTML.` }]),
      artifacts: [{
        artifact_type: "install_probe" as const,
        source_url: siteUrl,
        content_excerpt: probe.html.slice(0, 2000),
        metadata: {
          platform,
          installed,
          fetch_status: probe.status,
          found_count: foundLinks.length,
          expected_url: expectedUrl,
          intake_source_id: intakeSourceId,
        },
      }],
    };
  },

  // -------------------------------------------------------------------------
  // monitor_install — daily health check. Iterates each enabled intake source
  // for the workspace and re-runs verify on its last known site URL (read
  // from the most recent install_probe artifact). Returns a healthy/drift
  // summary the operator can act on.
  // -------------------------------------------------------------------------
  monitor_install: async (job, admin) => {
    const input = (job.input ?? {}) as { intake_source_id?: string; site_url?: string };
    let sourcesQ = admin
      .from("intake_sources")
      .select("id, public_token, name")
      .eq("workspace_id", job.workspace_id)
      .eq("enabled", true);
    if (input.intake_source_id) sourcesQ = sourcesQ.eq("id", input.intake_source_id);
    const { data: sources, error: srcErr } = await sourcesQ;
    if (srcErr) throw new Error(`READ_SOURCES_FAILED: ${srcErr.message}`);

    const checks: Array<Record<string, unknown>> = [];
    let healthy = 0, drifted = 0, skipped = 0;

    for (const s of (sources ?? []) as Array<Record<string, unknown>>) {
      let siteUrl = input.site_url ?? null;
      if (!siteUrl) {
        const { data: lastProbe } = await admin
          .from("intelligence_artifacts")
          .select("source_url, metadata, created_at")
          .eq("workspace_id", job.workspace_id)
          .eq("artifact_type", "install_probe")
          .contains("metadata", { intake_source_id: s.id })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        siteUrl = ((lastProbe as { source_url?: string } | null)?.source_url) ?? null;
      }
      if (!siteUrl) {
        skipped += 1;
        checks.push({ intake_source_id: s.id, name: s.name, status: "skipped", reason: "no known site_url" });
        continue;
      }
      const probe = await probeSite(siteUrl);
      const platform = detectPlatform(probe.html);
      const expectedPath = `/i/${s.public_token}`;
      const matches = (probe.html.match(/https?:\/\/[^"'<> )]+\/i\/[A-Za-z0-9_-]+/g) ?? [])
        .filter((l) => l.toLowerCase().includes("photobrief.ai") && l.includes(expectedPath));
      const ok = matches.length > 0;
      if (ok) healthy += 1; else drifted += 1;
      checks.push({
        intake_source_id: s.id,
        name: s.name,
        site_url: siteUrl,
        platform,
        status: ok ? "healthy" : "drift",
        fetch_status: probe.status,
        found_links: matches.slice(0, 3),
      });
    }

    return {
      output: { sources_checked: checks.length, healthy, drifted, skipped, checks },
      confidence: null,
      warnings: drifted > 0
        ? [{ code: "INSTALL_DRIFT", message: `${drifted} intake source(s) no longer linked from the live site.` }]
        : [],
    };
  },
};

// ---------------------------------------------------------------------------
// Install Intelligence helpers (ported from workers/site-installer-agent).
// ---------------------------------------------------------------------------

const PLATFORM_FINGERPRINTS: Array<{ platform: string; needles: string[] }> = [
  { platform: "webflow", needles: ["webflow.com", "data-wf-page", "wf-domain"] },
  { platform: "shopify", needles: ["cdn.shopify.com", "shopify.theme", "shopify-section"] },
  { platform: "wix_studio", needles: ["wixstudio", "static.wixstatic.com"] },
  { platform: "wix", needles: ["wix.com", "wixstatic.com", "_wixCIDX"] },
  { platform: "squarespace", needles: ["squarespace.com", "static1.squarespace.com"] },
  { platform: "wordpress", needles: ["wp-content", "wp-includes", "wp-json"] },
  { platform: "carrd", needles: ["carrd.co", "/carrd/"] },
  { platform: "godaddy", needles: ["godaddy", "img1.wsimg.com"] },
  { platform: "framer", needles: ["framer.com", "framerusercontent.com"] },
];

function detectPlatform(html: string): string {
  if (!html) return "unknown";
  const lower = html.toLowerCase();
  for (const fp of PLATFORM_FINGERPRINTS) {
    if (fp.needles.some((n) => lower.includes(n.toLowerCase()))) return fp.platform;
  }
  return /<html/i.test(lower) ? "static_html" : "unknown";
}

async function probeSite(url: string): Promise<{ html: string; status: number; error?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "user-agent": "Mozilla/5.0 PhotoBriefIntelligence/1.0" },
      redirect: "follow",
    });
    const html = (await res.text()).slice(0, 200_000);
    return { html, status: res.status };
  } catch (e) {
    return { html: "", status: 0, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

function buildFixSteps(platform: string, expectedUrl: string): string[] {
  const generic = [
    `Add a button or link to ${expectedUrl} on your homepage.`,
    "Use anchor text the customer recognizes (Get a quote, Book a job, Send photos).",
    "Republish the page and wait ~30 seconds for the CDN to refresh.",
  ];
  switch (platform) {
    case "webflow":
      return [
        "In Webflow Designer, drop a Button element where you want the CTA.",
        `Set its link target to URL → ${expectedUrl} (open in new tab).`,
        "Publish to your live domain. CDN refresh takes ~30s.",
      ];
    case "shopify":
      return [
        "In Shopify Admin → Online Store → Themes → Customize.",
        `Add a Button block (or edit your hero) and set the link to ${expectedUrl}.`,
        "Save. Confirm on the live storefront.",
      ];
    case "wix":
    case "wix_studio":
      return [
        "In the Wix Editor, add a Button to your homepage header.",
        `Link it to a Web Address → ${expectedUrl}.`,
        "Publish the site.",
      ];
    case "wordpress":
      return [
        "Edit the page where you want the CTA in the WordPress block editor.",
        `Insert a Buttons block linking to ${expectedUrl}.`,
        "Update / publish. Clear any caching plugin if the link doesn't appear.",
      ];
    case "carrd":
      return [
        "In Carrd, add a Button element to your site.",
        `Set the URL to ${expectedUrl}.`,
        "Publish.",
      ];
    case "squarespace":
      return [
        "In Squarespace, edit the section where you want the CTA.",
        `Add a Button block linking to ${expectedUrl}.`,
        "Save.",
      ];
    default:
      return generic;
  }
}

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
