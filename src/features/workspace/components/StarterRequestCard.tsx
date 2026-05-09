import { NavLink } from "react-router-dom";
import { ArrowRight, Camera, LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";

interface Props {
  industry?: string | null;
}

export function StarterRequestCard(_props: Props) {
  return (
    <section className="relative isolate overflow-hidden rounded-[0.25rem] border border-border/70 bg-card/75 p-6 shadow-[0_30px_80px_-45px_hsl(222_47%_11%/0.45)] backdrop-blur sm:p-10">
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
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[0.25rem] bg-background shadow-sm ring-1 ring-border/70">
            <BrandMark variant="mark" tone="color" size={34} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3 w-3 text-primary" /> Get started
          </span>

          <h2 className="mt-5 max-w-xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Get your first PhotoBrief back in minutes.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Send a photo request to your customer. AI coaches them through every shot, and you receive a complete PhotoBrief ready to review.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-1.5 rounded-full px-6">
              <NavLink to="/requests/new">
                New photo request <ArrowRight className="h-4 w-4" />
              </NavLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5 rounded-full bg-background/60 px-6">
              <NavLink to="/guides/new">
                <LayoutTemplate className="h-4 w-4" /> Build a template
              </NavLink>
            </Button>
          </div>
        </div>

        <div className="rounded-[0.25rem] border border-border/70 bg-background p-4 shadow-sm backdrop-blur sm:p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            How it works
          </p>
          <div className="mt-4 space-y-3">
            <GuidelessStep icon={Camera} title="Describe the photos you need" copy="Plain language: &ldquo;Take a wide shot of the damaged area.&rdquo;" />
            <GuidelessStep icon={Plus} title="AI checks every photo" copy="Blurry, dark, or wrong angle? Your customer gets instant feedback to reshoot." />
            <GuidelessStep icon={LayoutTemplate} title="Save & reuse as a template" copy="Turn any request into a one-tap template for repeat jobs." />
          </div>
        </div>
      </div>
    </section>
  );
}

function GuidelessStep({ icon: Icon, title, copy }: { icon: typeof Camera; title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-[0.25rem] bg-muted/45 p-3">
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
