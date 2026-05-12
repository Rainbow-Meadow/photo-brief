/**
 * photobrief-assistant-agent — Per-workspace Durable Object that acts as
 * a proactive business assistant.
 *
 * Capabilities:
 *   - Scheduled daily digest of submission quality and activity
 *   - RAG-style guide/template search using built-in SQL storage
 *   - Workspace health monitoring (stale requests, low credit warnings)
 *   - WebSocket connection for real-time dashboard notifications
 *   - Callable RPC methods for the dashboard to invoke
 *
 * One instance per workspace_id.
 */

import { Agent, type Connection, callable } from "agents";
import {
  assembleRecipientBundle,
  type RecipientBundle,
} from "../../_shared/recipient-bundle";
import {
  invalidateRecipientBundle,
  readRecipientBundle,
  writeRecipientBundle,
  type KvNamespace,
} from "../../_shared/kv-bundle";

/* ── Types ─────────────────────────────────────────────────────────── */

interface Env {
  ASSISTANT_AGENT: DurableObjectNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SITE_URL: string;
  RECIPIENT_BUNDLES?: KvNamespace;
}

interface WorkspaceStats {
  pendingRequests: number;
  staleRequests: number;
  submissionsToday: number;
  submissionsThisWeek: number;
  avgReadinessScore: number | null;
  lowCreditWarning: boolean;
  lastDigestAt: string | null;
}

interface GuideEntry {
  id: string;
  name: string;
  category: string;
  stepCount: number;
  questionCount: number;
  indexedAt: string;
}

interface AssistantState {
  workspaceId: string;
  stats: WorkspaceStats;
  guides: GuideEntry[];
  insights: string[];
  digestScheduled: boolean;
  lastActivityAt: string;
}

/* ── Agent ─────────────────────────────────────────────────────────── */

export class AssistantAgent extends Agent<Env, AssistantState> {
  initialState: AssistantState = {
    workspaceId: "",
    stats: {
      pendingRequests: 0,
      staleRequests: 0,
      submissionsToday: 0,
      submissionsThisWeek: 0,
      avgReadinessScore: null,
      lowCreditWarning: false,
      lastDigestAt: null,
    },
    guides: [],
    insights: [],
    digestScheduled: false,
    lastActivityAt: new Date().toISOString(),
  };

  /* ── WebSocket lifecycle ─────────────────────────────────────────── */

  onConnect(connection: Connection) {
    connection.send(JSON.stringify({
      type: "state_sync",
      state: this.state,
    }));
  }

  onMessage(connection: Connection, message: string | ArrayBuffer) {
    if (typeof message === "string") {
      try {
        const msg = JSON.parse(message);
        if (msg.type === "ping") {
          connection.send(JSON.stringify({ type: "pong" }));
        }
      } catch { /* ignore */ }
    }
  }

  /* ── Callable RPC methods ────────────────────────────────────────── */

  /**
   * Initialize the agent for a workspace — indexes guides and schedules
   * the daily digest.
   */
  @callable()
  async initialize(args: { workspaceId: string }) {
    this.setState({
      ...this.state,
      workspaceId: args.workspaceId,
      lastActivityAt: new Date().toISOString(),
    });

    // Index guides into local SQL storage for RAG
    await this.indexGuides();

    // Schedule daily digest at 8 AM UTC
    if (!this.state.digestScheduled) {
      this.schedule("daily_digest", { cron: "0 8 * * *" });
      this.setState({ ...this.state, digestScheduled: true });
    }

    // Run initial stats fetch
    await this.refreshStats();

    return { ok: true, guidesIndexed: this.state.guides.length };
  }

  /**
   * Search indexed guides by keyword.
   */
  @callable()
  searchGuides(args: { query: string }) {
    const q = args.query.toLowerCase();
    const matches = this.state.guides.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q),
    );
    return matches;
  }

  /**
   * Get current workspace health stats.
   */
  @callable()
  getStats() {
    return this.state.stats;
  }

  /**
   * Get AI-generated insights based on current workspace data.
   */
  @callable()
  getInsights() {
    return this.state.insights;
  }

  /**
   * Force a stats refresh.
   */
  @callable()
  async refreshNow() {
    await this.refreshStats();
    return this.state.stats;
  }

  /**
   * Ingest an event from the app (submission received, request created, etc.)
   * and update stats in real time.
   */
  @callable()
  async ingestEvent(args: {
    type: "submission_received" | "request_created" | "request_stale" | "credit_low";
    metadata?: Record<string, unknown>;
  }) {
    const now = new Date().toISOString();
    const stats = { ...this.state.stats };

    switch (args.type) {
      case "submission_received":
        stats.submissionsToday += 1;
        stats.submissionsThisWeek += 1;
        break;
      case "request_created":
        stats.pendingRequests += 1;
        break;
      case "request_stale":
        stats.staleRequests += 1;
        break;
      case "credit_low":
        stats.lowCreditWarning = true;
        break;
    }

    this.setState({ ...this.state, stats, lastActivityAt: now });

    // Broadcast to connected dashboard viewers
    this.broadcast(JSON.stringify({
      type: "event",
      event: args,
      stats,
    }));

    return { ok: true };
  }

  /* ── Scheduled tasks ─────────────────────────────────────────────── */

  async onSchedule(schedule: { name: string }) {
    if (schedule.name === "daily_digest") {
      await this.generateDailyDigest();
    }
  }

  /* ── Internal methods ────────────────────────────────────────────── */

  private async indexGuides() {
    if (!this.state.workspaceId) return;

    try {
      const url = `${this.env.SUPABASE_URL}/rest/v1/photo_guides?workspace_id=eq.${this.state.workspaceId}&select=id,name,category,guide_steps(id),context_questions(id)`;
      const key = this.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!key) return;

      const res = await fetch(url, {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      });

      if (!res.ok) return;
      const guides = (await res.json()) as any[];

      const indexed: GuideEntry[] = guides.map((g: any) => ({
        id: g.id,
        name: g.name ?? "Untitled",
        category: g.category ?? "Custom",
        stepCount: Array.isArray(g.guide_steps) ? g.guide_steps.length : 0,
        questionCount: Array.isArray(g.context_questions) ? g.context_questions.length : 0,
        indexedAt: new Date().toISOString(),
      }));

      // Store in agent SQL for fast local queries
      this.sql`
        CREATE TABLE IF NOT EXISTS guides (
          id TEXT PRIMARY KEY,
          name TEXT,
          category TEXT,
          step_count INTEGER,
          question_count INTEGER,
          indexed_at TEXT
        )
      `;

      for (const g of indexed) {
        this.sql`
          INSERT OR REPLACE INTO guides (id, name, category, step_count, question_count, indexed_at)
          VALUES (${g.id}, ${g.name}, ${g.category}, ${g.stepCount}, ${g.questionCount}, ${g.indexedAt})
        `;
      }

      this.setState({ ...this.state, guides: indexed });
    } catch (e) {
      console.error("Guide indexing failed", e);
    }
  }

  private async refreshStats() {
    if (!this.state.workspaceId) return;

    const key = this.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return;

    try {
      const baseHeaders = {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
      };
      const baseUrl = `${this.env.SUPABASE_URL}/rest/v1`;
      const wsId = this.state.workspaceId;

      // Fetch pending requests
      const pendingRes = await fetch(
        `${baseUrl}/photo_brief_requests?workspace_id=eq.${wsId}&status=in.(sent,opened)&select=id`,
        { headers: { ...baseHeaders, Range: "0-0" } },
      );
      const pendingCount = parseInt(pendingRes.headers.get("content-range")?.split("/")[1] ?? "0", 10);

      // Fetch stale requests (needs_customer_action)
      const staleRes = await fetch(
        `${baseUrl}/photo_brief_requests?workspace_id=eq.${wsId}&status=eq.needs_customer_action&select=id`,
        { headers: { ...baseHeaders, Range: "0-0" } },
      );
      const staleCount = parseInt(staleRes.headers.get("content-range")?.split("/")[1] ?? "0", 10);

      // Fetch submissions this week
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const weekRes = await fetch(
        `${baseUrl}/submissions?workspace_id=eq.${wsId}&submitted_at=gte.${weekAgo}&select=id,readiness_score`,
        { headers: baseHeaders },
      );
      const weekSubmissions = weekRes.ok ? ((await weekRes.json()) as any[]) : [];

      const todaySubmissions = weekSubmissions.filter(
        (s: any) => s.submitted_at && new Date(s.submitted_at) >= todayStart,
      );

      const scores = weekSubmissions
        .map((s: any) => s.readiness_score)
        .filter((s: any) => typeof s === "number");
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
          : null;

      const stats: WorkspaceStats = {
        pendingRequests: pendingCount,
        staleRequests: staleCount,
        submissionsToday: todaySubmissions.length,
        submissionsThisWeek: weekSubmissions.length,
        avgReadinessScore: avgScore,
        lowCreditWarning: this.state.stats.lowCreditWarning,
        lastDigestAt: this.state.stats.lastDigestAt,
      };

      // Generate insights
      const insights: string[] = [];
      if (staleCount > 0) {
        insights.push(
          `${staleCount} request${staleCount > 1 ? "s" : ""} haven't received photos in 48+ hours. Consider sending reminders.`,
        );
      }
      if (avgScore !== null && avgScore < 60) {
        insights.push(
          `Average readiness score this week is ${avgScore}%. Your guides may need clearer instructions.`,
        );
      }
      if (weekSubmissions.length === 0) {
        insights.push("No submissions this week. Check that your request links are reaching customers.");
      }
      if (stats.lowCreditWarning) {
        insights.push("Your photo credit balance is running low. Consider upgrading or purchasing a top-up pack.");
      }
      if (this.state.guides.length === 0) {
        insights.push("No templates saved yet. Create a template to speed up repeat request types.");
      }

      this.setState({ ...this.state, stats, insights, lastActivityAt: new Date().toISOString() });

      // Broadcast updated stats
      this.broadcast(JSON.stringify({ type: "stats_update", stats, insights }));
    } catch (e) {
      console.error("Stats refresh failed", e);
    }
  }

  private async generateDailyDigest() {
    await this.refreshStats();

    const { stats, insights } = this.state;
    const digestMessage = [
      `📊 Daily Digest — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`,
      "",
      `• ${stats.submissionsToday} submissions today, ${stats.submissionsThisWeek} this week`,
      `• ${stats.pendingRequests} pending requests`,
      stats.staleRequests > 0 ? `• ⚠️ ${stats.staleRequests} stale (no response in 48h+)` : null,
      stats.avgReadinessScore !== null ? `• Avg readiness: ${stats.avgReadinessScore}%` : null,
      "",
      ...insights.map((i) => `💡 ${i}`),
    ]
      .filter(Boolean)
      .join("\n");

    this.setState({
      ...this.state,
      stats: { ...this.state.stats, lastDigestAt: new Date().toISOString() },
    });

    // Broadcast digest to connected dashboards
    this.broadcast(JSON.stringify({
      type: "daily_digest",
      message: digestMessage,
      stats,
      insights,
    }));
  }

  private broadcast(message: string) {
    for (const connection of this.getConnections()) {
      try {
        connection.send(message);
      } catch { /* ignore */ }
    }
  }
}

/* ── Worker entrypoint ─────────────────────────────────────────────── */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (path === "/" || path === "/health") {
      return json({ ok: true, name: "PhotoBrief Assistant Agent", version: "1.0.0" });
    }

    // Routes: /ws/:workspaceId, /rpc/:workspaceId, /event/:workspaceId
    const match = path.match(/^\/(ws|rpc|event)\/([a-f0-9-]+)$/i);
    if (!match) {
      return json({ error: "Use /ws/:workspaceId, /rpc/:workspaceId, or /event/:workspaceId" }, 404);
    }

    const [, action, workspaceId] = match;
    const id = env.ASSISTANT_AGENT.idFromName(workspaceId);
    const stub = env.ASSISTANT_AGENT.get(id);

    if (action === "ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return json({ error: "Expected WebSocket upgrade" }, 426);
      }
      return stub.fetch(request);
    }

    // Forward RPC and event requests to the DO
    return stub.fetch(request);
  },
};

/* ── Utility ───────────────────────────────────────────────────────── */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
