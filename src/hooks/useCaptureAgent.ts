/**
 * useCaptureAgent — React hook that connects the business dashboard to
 * the real-time capture agent via WebSocket.
 *
 * Provides live capture progress for a specific photo request,
 * including per-step status, photo upload events, AI check results,
 * and submission progress.
 */

import { useEffect, useRef, useState, useCallback } from "react";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface StepProgress {
  stepId: string;
  stepTitle: string;
  status: "pending" | "uploaded" | "checking" | "pass" | "warning" | "fail";
  mediaId?: string;
  checkResult?: string;
  updatedAt: string;
}

export interface CaptureAgentState {
  requestId: string;
  sessionActive: boolean;
  totalSteps: number;
  steps: Record<string, StepProgress>;
  questionsAnswered: number;
  submissionStarted: boolean;
  submissionCompleted: boolean;
  lastActivityAt: string;
}

export interface CaptureAgentEvent {
  type: string;
  stepId?: string;
  stepTitle?: string;
  mediaId?: string;
  checkResult?: string;
  timestamp?: string;
}

interface AgentMessage {
  type: "state_sync" | "event" | "nudge" | "pong";
  state?: CaptureAgentState;
  event?: CaptureAgentEvent;
  message?: string;
}

/* ── Constants ─────────────────────────────────────────────────────── */

const AGENT_BASE_URL = "wss://capture-agent.photobrief.ai";
const RECONNECT_DELAY_MS = 3000;
const PING_INTERVAL_MS = 30_000;

/* ── Hook ──────────────────────────────────────────────────────────── */

export function useCaptureAgent(requestId: string | undefined) {
  const [state, setState] = useState<CaptureAgentState | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<CaptureAgentEvent | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (pingRef.current) clearInterval(pingRef.current);
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!requestId) return;

    function connect() {
      cleanup();

      const ws = new WebSocket(`${AGENT_BASE_URL}/ws/${requestId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setConnected(true);

        // Start ping/keepalive
        pingRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, PING_INTERVAL_MS);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg: AgentMessage = JSON.parse(event.data);

          switch (msg.type) {
            case "state_sync":
              if (msg.state) setState(msg.state);
              break;

            case "event":
              if (msg.state) setState(msg.state);
              if (msg.event) setLastEvent(msg.event);
              break;

            case "nudge":
              setNudgeMessage(msg.message ?? "Recipient is inactive");
              break;

            case "pong":
              // keepalive response, no action
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setConnected(false);

        // Auto-reconnect
        reconnectRef.current = setTimeout(() => {
          if (mountedRef.current) connect();
        }, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        // onclose will fire after this
      };
    }

    connect();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [requestId, cleanup]);

  // Derived progress
  const completedSteps = state
    ? Object.values(state.steps).filter(
        (s) => s.status === "pass" || s.status === "warning",
      ).length
    : 0;

  const progressPercent =
    state && state.totalSteps > 0
      ? Math.round((completedSteps / state.totalSteps) * 100)
      : 0;

  const dismissNudge = useCallback(() => setNudgeMessage(null), []);

  return {
    /** Current capture state from the agent */
    state,
    /** Whether the WebSocket is connected */
    connected,
    /** Last event received */
    lastEvent,
    /** Nudge message if recipient is inactive */
    nudgeMessage,
    /** Dismiss the nudge message */
    dismissNudge,
    /** Number of steps that passed AI checks */
    completedSteps,
    /** Capture progress as a percentage */
    progressPercent,
    /** Whether the recipient is actively capturing */
    isLive: state?.sessionActive ?? false,
    /** Whether submission is complete */
    isComplete: state?.submissionCompleted ?? false,
  };
}
