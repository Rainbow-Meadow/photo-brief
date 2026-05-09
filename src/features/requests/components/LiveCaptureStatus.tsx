/**
 * LiveCaptureStatus — Shows real-time capture progress on the request
 * detail page when a recipient is actively photographing.
 *
 * Connects to the Cloudflare capture agent via WebSocket and displays:
 * - Live progress bar
 * - Per-step status indicators
 * - Activity timestamps
 * - Inactivity nudge alerts
 */

import { useCaptureAgent } from "@/hooks/useCaptureAgent";
import { AlertCircle, Camera, CheckCircle2, Clock, Loader2, Wifi, WifiOff, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/utils/format";

interface LiveCaptureStatusProps {
  requestId: string;
}

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
  uploaded: <Camera className="h-3.5 w-3.5 text-[hsl(var(--pb-lavender))]" />,
  checking: <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--pb-lavender))]" />,
  pass: <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--pb-mint))]" />,
  warning: <AlertCircle className="h-3.5 w-3.5 text-yellow-400" />,
  fail: <X className="h-3.5 w-3.5 text-destructive" />,
};

const statusLabel: Record<string, string> = {
  pending: "Waiting",
  uploaded: "Uploaded",
  checking: "AI checking…",
  pass: "Looks good",
  warning: "Usable",
  fail: "Needs retake",
};

export function LiveCaptureStatus({ requestId }: LiveCaptureStatusProps) {
  const {
    state,
    connected,
    nudgeMessage,
    dismissNudge,
    completedSteps,
    progressPercent,
    isLive,
    isComplete,
  } = useCaptureAgent(requestId);

  // Don't render anything if no session has started
  if (!state || (!state.sessionActive && !state.submissionCompleted && Object.keys(state.steps).length === 0)) {
    return null;
  }

  const steps = Object.values(state.steps).sort((a, b) =>
    a.stepId.localeCompare(b.stepId),
  );

  return (
    <div className="rounded-[0.25rem] border border-[hsl(var(--pb-line))] bg-[hsl(var(--pb-panel)/0.88)] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--pb-mint))] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[hsl(var(--pb-mint))]" />
            </span>
          ) : isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--pb-mint))]" />
          ) : (
            <Clock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-semibold text-foreground">
            {isLive
              ? "Live capture in progress"
              : isComplete
                ? "Capture complete"
                : "Capture paused"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {connected ? (
            <Wifi className="h-3.5 w-3.5 text-[hsl(var(--pb-mint))]" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {connected ? "Connected" : "Reconnecting…"}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {completedSteps} of {state.totalSteps} photos checked
          </span>
          <span>{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Per-step status */}
      {steps.length > 0 && (
        <div className="space-y-1.5">
          {steps.map((step) => (
            <div
              key={step.stepId}
              className="flex items-center gap-2 rounded-lg bg-background/50 px-3 py-2"
            >
              {statusIcon[step.status] ?? statusIcon.pending}
              <span className="flex-1 text-xs font-medium text-foreground truncate">
                {step.stepTitle}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0"
              >
                {statusLabel[step.status] ?? step.status}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Questions answered */}
      {state.questionsAnswered > 0 && (
        <p className="text-xs text-muted-foreground">
          {state.questionsAnswered} question{state.questionsAnswered !== 1 ? "s" : ""} answered
        </p>
      )}

      {/* Last activity */}
      {state.lastActivityAt && (
        <p className="text-xs text-muted-foreground">
          Last activity: {formatRelativeTime(state.lastActivityAt)}
        </p>
      )}

      {/* Nudge alert */}
      {nudgeMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
          <div className="flex-1">
            <p className="text-xs font-medium text-yellow-300">{nudgeMessage}</p>
            <p className="mt-0.5 text-[10px] text-yellow-400/70">
              Consider sending a reminder to the recipient.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={dismissNudge}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
