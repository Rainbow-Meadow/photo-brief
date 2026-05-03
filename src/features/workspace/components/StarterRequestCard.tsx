import { NavLink } from "react-router-dom";
import { ArrowRight, Camera, LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";

interface Props {
  industry?: string | null;
}

/**
 * Empty dashboard state for the guideless model.
 *
 * Do not suggest built-in guideTemplates here. Legacy built-in templates are kept
 * only as fallback for older beta links, not as a business-facing creation path.
 */
export function StarterRequestCard(_props: Props) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-[0_30px_80px_-45px_hsl(222_47%_11%/0.45)] backdrop-blur sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-ambient-sky opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-border/70">
            <BrandMark variant="mark" tone="color" size={34} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3 w-3 text-primary" /> Start simple
          </span>

          <h2 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create your first photo request from scratch.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Start with one plain-language photo prompt. Add more photos or questions only when the job needs them.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-1.5 rounded-full px-6">
              <NavLink to="/requests/new">
                Start from scratch <ArrowRight className="h-4 w-4" />
              </NavLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5 rounded-full bg-background/60 px-6">
              <NavLink to="/guides/new">
                <LayoutTemplate className="h-4 w-4" /> Create a template
              </NavLink>
            </Button>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            How it works
          </p>
          <div className="mt-4 space-y-3">
            <GuidelessStep icon={Camera} title="Ask for one photo" copy="Example: “Take a wide photo of the damaged area.”" />
            <GuidelessStep icon={Plus} title="Add only what helps" copy="Add extra photo prompts or questions when they make the request clearer." />
            <GuidelessStep icon={LayoutTemplate} title="Save what you reuse" copy="Turn a polished request into your own template whenever it becomes repeatable." />
          </div>
        </div>
      </div>
    </section>
  );
}

function GuidelessStep({ icon: Icon, title, copy }: { icon: typeof Camera; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-muted/45 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm ring-1 ring-border/70">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{copy}</p>
      </div>
    </div>
  );
}
