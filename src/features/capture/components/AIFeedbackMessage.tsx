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
    detail: "This photo should work well.",
    tone: "text-success",
    bg: "bg-success/10",
  },
  warn: {
    Icon: AlertTriangle,
    label: "Usable, but could be clearer",
    detail: "You can keep this photo, or retake it if you want to make it easier to review.",
    tone: "text-warning",
    bg: "bg-warning/10",
  },
  fail: {
    Icon: XCircle,
    label: "This probably needs a retake",
    detail: "The business may not be able to use this photo unless it is clearer.",
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
    <div className={cn("rounded-[0.25rem] p-4", bg)}>
      <div className={cn("flex items-center gap-2 text-[15px] font-semibold", tone)}>
        <Icon className="h-5 w-5" /> {label}
      </div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/80">
        {issue?.message || detail}
      </p>
    </div>
  );
}
