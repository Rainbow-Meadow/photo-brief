import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import type { CapturedPhoto } from "@/types/chat";
import type { AICheckSeverity } from "@/types/photobrief";

interface AIFeedbackMessageProps {
  photo: CapturedPhoto;
  verdict: AICheckSeverity;
}

const verdictMeta: Record<
  AICheckSeverity,
  { Icon: typeof CheckCircle2; code: string; label: string; detail: string; accent: boolean }
> = {
  pass: {
    Icon: CheckCircle2,
    code: "[ OK ]",
    label: "Looks good",
    detail: "This photo should work well.",
    accent: false,
  },
  warn: {
    Icon: AlertTriangle,
    code: "[ !! ]",
    label: "Usable, but could be clearer",
    detail: "You can keep this photo, or retake it if you want to make it easier to review.",
    accent: true,
  },
  fail: {
    Icon: XCircle,
    code: "[ ER ]",
    label: "This probably needs a retake",
    detail: "The business may not be able to use this photo unless it is clearer.",
    accent: true,
  },
  unavailable: {
    Icon: HelpCircle,
    code: "[ -- ]",
    label: "Photo received",
    detail: "We couldn't check it automatically, but you can continue.",
    accent: false,
  },
};

export function AIFeedbackMessage({ photo, verdict }: AIFeedbackMessageProps) {
  const { Icon, code, label, detail, accent } = verdictMeta[verdict];
  const issue = photo.checks.find((c) => c.severity !== "pass" && c.message.trim().length > 0);
  const accentClass = accent ? "text-[hsl(var(--accent-kinetic))]" : "text-foreground";

  return (
    <div className="border border-border bg-card p-4">
      <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className={`inline-block h-px w-8 -translate-y-[0.25em] ${accent ? "bg-[hsl(var(--accent-kinetic))]" : "bg-border"}`} />
        <span className={accentClass}>{code}</span>
        <span>AI check</span>
      </p>
      <div className={`mt-3 flex items-center gap-2 text-[15px] font-semibold ${accentClass}`}>
        <Icon className="h-5 w-5" /> {label}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {issue?.message || detail}
      </p>
    </div>
  );
}
