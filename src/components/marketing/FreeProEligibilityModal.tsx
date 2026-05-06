import { useState } from "react";
import { CheckCircle2, Info, Target, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FREE_PRO_QUALIFIES,
  FREE_PRO_DOES_NOT_QUALIFY,
  FREE_PRO_FINE_PRINT,
  SCORING_RUBRIC,
} from "@/config/betaProgram";

interface Props {
  children: (open: () => void) => React.ReactNode;
}

export function FreeProEligibilityModal({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-[hsl(var(--pb-lavender)/0.25)] bg-[hsl(var(--pb-ink))] p-5 sm:max-w-xl sm:p-7">
          <DialogTitle className="text-lg font-bold tracking-tight text-white sm:text-xl">
            Free Pro for Life — Terms &amp; Eligibility
          </DialogTitle>
          <DialogDescription className="pb-copy text-sm">
            How the top two founding partner slots are determined.
          </DialogDescription>

          {/* What qualifies */}
          <div className="mt-4">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[hsl(var(--pb-mint))]">
              <CheckCircle2 className="h-4 w-4" /> What qualifies
            </h3>
            <ul className="mt-3 grid gap-2">
              {FREE_PRO_QUALIFIES.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--pb-mint)/0.7)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What doesn't qualify */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-400">
              <XCircle className="h-4 w-4" /> What doesn't qualify
            </h3>
            <ul className="mt-3 grid gap-2">
              {FREE_PRO_DOES_NOT_QUALIFY.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-white/80"
                >
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Scoring rubric */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[hsl(var(--pb-lavender))]">
              <Target className="h-4 w-4" /> Scoring rubric
            </h3>
            <div className="mt-3 grid gap-2.5">
              {SCORING_RUBRIC.map((dim) => (
                <div key={dim.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{dim.label}</span>
                    <span className="rounded-full border border-[hsl(var(--pb-lavender)/0.3)] bg-[hsl(var(--pb-lavender)/0.08)] px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-[hsl(var(--pb-lavender))]">
                      {dim.weight}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{dim.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Fine print */}
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
              <Info className="h-3.5 w-3.5" /> Fine print
            </h3>
            <ul className="mt-2.5 grid gap-1.5">
              {FREE_PRO_FINE_PRINT.map((item) => (
                <li
                  key={item}
                  className="text-xs leading-relaxed text-white/50"
                >
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
