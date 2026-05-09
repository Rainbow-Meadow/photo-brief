import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { PoweredByBadge } from "@/components/shared/PoweredByBadge";
import { loadRecipientContext, type RecipientContext } from "@/features/capture/recipientContext";

export default function RecipientConfirmationPage() {
  const { token } = useParams();
  const [ctx, setCtx] = useState<RecipientContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRecipientContext(token)
      .then((c) => {
        if (!cancelled) setCtx(c);
      })
      .catch(() => {});
    if (token) {
      try {
        sessionStorage.removeItem(`pb:recipient:${token}`);
      } catch {
        // Non-fatal — private mode may block sessionStorage.
      }
    }
    return () => {
      cancelled = true;
    };
  }, [token]);

  const businessName = ctx?.businessName ?? "the team";
  const message =
    ctx?.completionBody ??
    `Your photos are on the way to ${businessName}. They'll review and reach out shortly with next steps.`;
  const canResubmit = !!ctx?.resubmit;
  const showLogo = !!ctx?.logoUrl;
  const showPhotobriefMark = !ctx?.hidePhotobriefBranding;

  const steps = [
    `${businessName} reviews your photos.`,
    "If anything is missing, they'll reach out using the contact info they have for you.",
    "You can close this tab — no account or app needed.",
  ];

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <article className="border border-border bg-card p-7">
        <div className="flex flex-col items-center text-center">
          {showLogo ? (
            <img
              src={ctx!.logoUrl}
              alt={businessName}
              className="mb-4 h-12 w-auto max-w-[180px] object-contain"
            />
          ) : null}
          <span className="flex h-12 w-12 items-center justify-center border border-[hsl(var(--accent-kinetic))] text-[hsl(var(--accent-kinetic))]">
            <CheckCircle2 className="h-6 w-6" />
          </span>
        </div>

        <p className="mt-6 inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
          <span className="text-[hsl(var(--accent-kinetic))]">[ OK ]</span>
          <span>Submission complete</span>
        </p>
        <h1 className="mt-3 font-[Geist,Inter,system-ui,sans-serif] text-[clamp(1.5rem,3vw,1.85rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
          Photos delivered to {businessName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>

        <div className="mt-6 border-t border-border pt-5">
          <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            What happens next
          </p>
          <ol className="mt-3 space-y-3">
            {steps.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-[0.7rem] font-semibold tabular-nums uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-6 text-foreground">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        {canResubmit && token ? (
          <NavLink
            to={`/r/${token}`}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 border border-foreground/30 px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-foreground hover:text-background"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Add or retake photos
          </NavLink>
        ) : null}

        {showPhotobriefMark ? (
          <div className="mt-6 flex justify-center border-t border-border pt-5">
            <PoweredByBadge size={48} />
          </div>
        ) : null}
      </article>
    </div>
  );
}
