import { CheckCircle2 } from "lucide-react";
import { microcopy } from "@/config/microcopy";

interface SubmitConfirmationCardProps {
  businessName: string;
  completionCopy?: string;
}

export function SubmitConfirmationCard({ businessName, completionCopy }: SubmitConfirmationCardProps) {
  return (
    <div className="border border-border bg-card p-7 text-center">
      <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
        <span className="text-[hsl(var(--accent-kinetic))]">[ OK ]</span>
        <span>Submission complete</span>
      </p>
      <span className="mx-auto mt-5 flex h-12 w-12 items-center justify-center border border-[hsl(var(--accent-kinetic))] text-[hsl(var(--accent-kinetic))]">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <p className="mt-4 font-[Geist,Inter,system-ui,sans-serif] text-base font-semibold tracking-tight text-foreground">
        {microcopy.recipient.confirmationTitle}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {completionCopy ?? `Your photos are on the way to ${businessName}. You'll hear back shortly.`}
      </p>
    </div>
  );
}
