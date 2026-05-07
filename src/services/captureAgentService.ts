/**
 * captureAgentService — Client-side service to push capture events
 * to the real-time Cloudflare capture agent.
 *
 * Called from the recipient capture flow as photos are uploaded,
 * checked by AI, and submitted.
 */

const AGENT_BASE_URL = "https://capture-agent.photobrief.ai";

export interface CaptureEventPayload {
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
}

/**
 * Fire-and-forget event push to the capture agent.
 * Failures are silently ignored — the capture flow must work
 * even if the agent is unreachable.
 */
export async function pushCaptureEvent(
  requestId: string,
  event: CaptureEventPayload,
): Promise<void> {
  try {
    await fetch(`${AGENT_BASE_URL}/event/${requestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
      // Short timeout so it doesn't block the capture flow
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Silently fail — agent connectivity is not critical for capture
    console.debug("[capture-agent] Event push failed, continuing silently");
  }
}
