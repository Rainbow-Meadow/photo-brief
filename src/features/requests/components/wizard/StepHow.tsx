import { BookOpen, PenLine, Sparkles, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuildChoice = "template" | "ai" | "blank";

interface StepHowProps {
  aiUnlocked: boolean;
  onChoose: (choice: BuildChoice) => void;
}

const choices: Array<{
  id: BuildChoice;
  icon: typeof Sparkles;
  title: string;
  description: string;
  requiresAi?: boolean;
}> = [
  {
    id: "template",
    icon: BookOpen,
    title: "Use a saved template",
    description: "Pick from your reusable photo setups",
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "Build with AI",
    description: "Describe what you need — AI drafts it for you",
    requiresAi: true,
  },
  {
    id: "blank",
    icon: PenLine,
    title: "Start from scratch",
    description: "Add your own photos and questions manually",
  },
];

export function StepHow({ aiUnlocked, onChoose }: StepHowProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[0.25rem] bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-foreground">
        New photo request
      </h1>
      <p className="mt-2 text-center text-[15px] leading-7 text-muted-foreground">
        How do you want to build this request?
      </p>

      <div className="mt-8 w-full space-y-3">
        {choices.map((c) => {
          const locked = c.requiresAi && !aiUnlocked;
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => onChoose(c.id)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-[0.25rem] border bg-card p-5 text-left transition active:scale-[0.98]",
                locked
                  ? "cursor-not-allowed border-border/50 opacity-60"
                  : "border-border/70 hover:border-primary/40 hover:shadow-elev-sm",
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-base font-semibold text-foreground">
                  {c.title}
                  {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
              </div>
              {!locked && (
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:text-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
