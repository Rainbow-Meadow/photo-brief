import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { Surface } from "./Surface";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: string;
  shortTitle: string;
  title?: string;
  icon?: LucideIcon;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentIndex: number;
  onStepChange?: (index: number) => void;
  /** Optional intro block above the stepper (rail). */
  intro?: ReactNode;
  /** Optional title rendered inside the rail above the steps. */
  railTitle?: ReactNode;
  /** Optional description below the rail title. */
  railDescription?: ReactNode;
  /** Sticky footer with prev/next actions. */
  footer?: ReactNode;
  /** Right-side step header content (eyebrow, title, description, icon). */
  header?: ReactNode;
  children: ReactNode;
}

/**
 * WizardLayout — standard guided-flow scaffold.
 * Desktop: left rail with stepper + right content panel.
 * Mobile: stacked stepper + content + footer actions.
 *
 * The rail/content/footer slots are intentionally generic — wizard
 * pages decide what they render inside them.
 */
export function WizardLayout({
  steps,
  currentIndex,
  onStepChange,
  intro,
  railTitle,
  railDescription,
  footer,
  header,
  children,
}: WizardLayoutProps) {
  const progress = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <div className="space-y-6">
      {intro}

      <Surface variant="elevated" radius="lg" padding="none" className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="relative isolate border-b border-border/70 bg-gradient-to-br from-primary/12 via-background to-cyan-400/10 p-5 lg:border-b-0 lg:border-r lg:p-6">
            {railTitle ? (
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">{railTitle}</h2>
            ) : null}
            {railDescription ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{railDescription}</p>
            ) : null}

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <nav className="mt-5 space-y-2" aria-label="Wizard steps">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentIndex;
                const isDone = index < currentIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepChange?.(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                      isActive
                        ? "border-primary/50 bg-primary/10 shadow-sm"
                        : "bg-background/60 hover:border-primary/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                        isDone
                          ? "bg-primary text-primary-foreground"
                          : isActive
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : Icon ? <Icon className="h-4 w-4" /> : index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{step.shortTitle}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Step {index + 1}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="p-5 sm:p-6 lg:p-7">
            {header ? <div className="mb-6">{header}</div> : null}
            <div>{children}</div>
            {footer ? (
              <div className="mt-7 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </Surface>
    </div>
  );
}
