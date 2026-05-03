import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CapturedPhoto } from "@/types/chat";
import type { AICheckSeverity } from "@/types/photobrief";

interface AIFeedbackMessageProps {
  photo: CapturedPhoto;
  verdict: AICheckSeverity;
}

const verdictMeta: Record<
  AICheckSeverity,
  { Icon: typeof CheckCircle2; label: string; detail: string; tone: string; bg: string }
> = {
  pass: {
    Icon: CheckCircle2,
    label: "Looks good",
    detail: "We'll use this photo.",
    tone: "text-success",
    bg: "bg-success/10",
  },
  warn: {
    Icon: AlertTriangle,
    label: "This might work",
    detail: "A clearer photo would help, but you can keep it if needed.",
    tone: "text-warning",
    bg: "bg-warning/10",
  },
  fail: {
    Icon: XCircle,
    label: "Let's retake this one",
    detail: "The business may not be able to use this photo as-is.",
    tone: "text-destructive",
    bg: "bg-destructive/10",
  },
  unavailable: {
    Icon: HelpCircle,
    label: "Photo received",
    detail: "We couldn't check it automatically, but you can continue.",
    tone: "text-muted-foreground",
    bg: "bg-muted",
  },
};

export function AIFeedbackMessage({ photo, verdict }: AIFeedbackMessageProps) {
  const { Icon, label, detail, tone, bg } = verdictMeta[verdict];
  const issue = photo.checks.find((c) => c.severity !== "pass" && c.message.trim().length > 0);

  return (
    <div className={cn("rounded-2xl p-3", bg)}>
      <div className={cn("flex items-center gap-2 text-sm font-semibold", tone)}>
        <Icon className="h-4 w-4" /> {label}
      </div>
      <p className="mt-1 text-sm text-foreground/80">
        {issue?.message || detail}
      </p>
    </div>
  );
}
