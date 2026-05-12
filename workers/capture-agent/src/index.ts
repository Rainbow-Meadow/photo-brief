/**
 * photobrief-capture-agent — Per-request Durable Object that tracks
 * a recipient's photo capture session in real time.
 *
 * Architecture:
 *   - One DO instance per photo_brief_request (keyed by request_id).
 *   - The capture flow POSTs events (photo_uploaded, photo_checked,
 *     question_answered, submission_started, submission_completed).
 *   - Business dashboard connects via WebSocket and receives live
 *     state updates (photos captured, AI check results, progress %).
 *   - The agent can schedule nudge reminders if no activity after N hours.
 *
 * Endpoints:
 *   POST /event/:requestId  — capture flow pushes events
 *   GET  /ws/:requestId     — business dashboard WebSocket
 *   GET  /status/:requestId — poll-based status (fallback)
 *   GET  /health            — health check
 */

import { Agent, type Connection } from "agents";

/* ── Types ─────────────────────────────────────────────────────────── */

interface Env {
  CAPTURE_AGENT: DurableObjectNamespace;
  CAPTURE_SESSION: DurableObjectNamespace;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SITE_URL: string;
}

interface CaptureEvent {
  type:
    | "session_started"
    | "photo_uploaded"
    | "photo_checked"
    | "question_answered"
    | "submission_started"
    | "submission_completed";
  stepId?: string;
  stepTitle?: string;
  mediaId?: string;
  checkResult?: "pass" | "warning" | "fail";
  questionPrompt?: string;
  answer?: string;
  totalSteps?: number;
  completedSteps?: number;
  timestamp?: string;
}

interface StepProgress {
  stepId: string;
  stepTitle: string;
  status: "pending" | "uploaded" | "checking" | "pass" | "warning" | "fail";
  mediaId?: string;
  checkResult?: string;
  updatedAt: string;
}

interface CaptureState {
  requestId: string;
  sessionActive: boolean;
  totalSteps: number;
  steps: Record<string, StepProgress>;
  questionsAnswered: number;
  submissionStarted: boolean;
  submissionCompleted: boolean;
  lastActivityAt: string;
  events: CaptureEvent[];
}

/* ── Agent ─────────────────────────────────────────────────────────── */

export class CaptureAgent extends Agent<Env, CaptureState> {
  initialState: CaptureState = {
    requestId: "",
    sessionActive: false,
    totalSteps: 0,
    steps: {},
    questionsAnswered: 0,
    submissionStarted: false,
    submissionCompleted: false,
    lastActivityAt: new Date().toISOString(),
    events: [],
  };

  /* ── WebSocket lifecycle ─────────────────────────────────────────── */

  onConnect(connection: Connection, ctx: ConnectionContext) {
    // Send current state to new dashboard viewer
    connection.send(JSON.stringify({
      type: "state_sync",
      state: this.state,
    }));
  }

  onMessage(connection: Connection, message: string | ArrayBuffer) {
    // Dashboard can send ping/keepalive; no action needed
    if (typeof message === "string") {
      try {
        const msg = JSON.parse(message);
        if (msg.type === "ping") {
          connection.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // ignore
      }
    }
  }

  onClose(connection: Connection, code: number, reason: string, wasClean: boolean) {
    // Connection cleanup handled by framework
  }

  onError(connection: Connection, error: unknown) {
    console.error("WebSocket error on capture agent", error);
  }

  /* ── HTTP handler ────────────────────────────────────────────────── */

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET /status — return current state
    if (request.method === "GET" && (path === "/status" || path === "/")) {
      return json(this.state);
    }

    // POST /event — ingest a capture event
    if (request.method === "POST" && path === "/event") {
      try {
        const event = (await request.json()) as CaptureEvent;
        this.processEvent(event);
        return json({ ok: true });
      } catch (e) {
        return json({ error: (e as Error).message }, 400);
      }
    }

    return json({ error: "Not found" }, 404);
  }

  /* ── Event processing ────────────────────────────────────────────── */

  private processEvent(event: CaptureEvent) {
    const now = new Date().toISOString();
    event.timestamp = event.timestamp ?? now;

    // Keep last 100 events
    const events = [...this.state.events, event].slice(-100);

    const patch: Partial<CaptureState> = {
      lastActivityAt: now,
      events,
    };

    switch (event.type) {
      case "session_started":
        patch.sessionActive = true;
        patch.requestId = this.state.requestId || (this.name ?? "");
        if (event.totalSteps) patch.totalSteps = event.totalSteps;
        break;

      case "photo_uploaded":
        if (event.stepId) {
          patch.steps = {
            ...this.state.steps,
            [event.stepId]: {
              stepId: event.stepId,
              stepTitle: event.stepTitle ?? event.stepId,
              status: "uploaded",
              mediaId: event.mediaId,
              updatedAt: now,
            },
          };
        }
        break;

      case "photo_checked":
        if (event.stepId && this.state.steps[event.stepId]) {
          const checkStatus =
            event.checkResult === "pass"
              ? "pass"
              : event.checkResult === "warning"
                ? "warning"
                : "fail";
          patch.steps = {
            ...this.state.steps,
            [event.stepId]: {
              ...this.state.steps[event.stepId],
              status: checkStatus,
              checkResult: event.checkResult,
              updatedAt: now,
            },
          };
        }
        break;

      case "question_answered":
        patch.questionsAnswered = (this.state.questionsAnswered ?? 0) + 1;
        break;

      case "submission_started":
        patch.submissionStarted = true;
        break;

      case "submission_completed":
        patch.submissionCompleted = true;
        patch.sessionActive = false;
        // Cancel any pending nudge
        this.cancelSchedule("nudge_reminder");
        break;
    }

    this.setState({ ...this.state, ...patch });

    // Broadcast to all connected dashboard viewers
    this.broadcast(
      JSON.stringify({
        type: "event",
        event,
        state: { ...this.state, ...patch },
      }),
    );

    // Schedule a nudge if session is active and no completion
    if (
      patch.sessionActive !== false &&
      this.state.sessionActive &&
      !this.state.submissionCompleted
    ) {
      // Nudge after 2 hours of inactivity
      this.schedule("nudge_reminder", "2h");
    }
  }

  /* ── Scheduled tasks ─────────────────────────────────────────────── */

  async onSchedule(
    schedule: { name: string; scheduledAt: Date },
  ) {
    if (schedule.name === "nudge_reminder") {
      // Only nudge if still active and not completed
      if (this.state.sessionActive && !this.state.submissionCompleted) {
        this.broadcast(
          JSON.stringify({
            type: "nudge",
            message: "Recipient has been inactive for 2 hours",
            requestId: this.state.requestId,
            lastActivityAt: this.state.lastActivityAt,
          }),
        );

        // TODO: In a future iteration, call the send-recipient-message
        // edge function to send an actual SMS/email nudge to the recipient.
      }
    }
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */

  private broadcast(message: string) {
    for (const connection of this.getConnections()) {
      try {
        connection.send(message);
      } catch {
        // Connection might be closing
      }
    }
  }

  private cancelSchedule(name: string) {
    try {
      this.deleteSchedule(name);
    } catch {
      // Ignore if schedule doesn't exist
    }
  }
}

/* ── Worker entrypoint (routes to DOs) ─────────────────────────────── */

interface ConnectionContext {
  request: Request;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === "/" || path === "/health") {
      return json({
        ok: true,
        name: "PhotoBrief Capture Agent",
        version: "1.0.0",
      });
    }

    // Extract request ID from path: /event/:requestId, /ws/:requestId, /status/:requestId
    const match = path.match(/^\/(event|ws|status)\/([a-f0-9-]+)$/i);
    if (!match) {
      return json({ error: "Invalid path. Use /event/:requestId, /ws/:requestId, or /status/:requestId" }, 404);
    }

    const [, action, requestId] = match;

    // Get or create the DO for this request
    const id = env.CAPTURE_AGENT.idFromName(requestId);
    const stub = env.CAPTURE_AGENT.get(id);

    if (action === "ws") {
      // WebSocket upgrade
      if (request.headers.get("Upgrade") !== "websocket") {
        return json({ error: "Expected WebSocket upgrade" }, 426);
      }
      // Forward to the DO — it handles WebSocket via Agent base class
      return stub.fetch(request);
    }

    // Rewrite path for the DO's onRequest handler
    const doUrl = new URL(request.url);
    doUrl.pathname = `/${action}`;

    return stub.fetch(
      new Request(doUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }),
    );
  },
};

/* ── Utility ───────────────────────────────────────────────────────── */

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}
