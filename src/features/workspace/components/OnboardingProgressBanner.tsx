import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { Check, Circle, ArrowUpRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useRequests } from "@/hooks/useRequests";
import { useWorkspaceGuides } from "@/hooks/useGuides";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "pb.dashboard.health-strip.dismissed.v1";

interface Step {
  id: string;
  label: string;
  done: boolean;
  href: string;
  cta: string;
}

export function OnboardingProgressBanner() {
  const { workspace } = useCurrentWorkspace();
  const requests = useRequests();
  const { data: guides = [] } = useWorkspaceGuides(workspace?.id);

  const [brandSet, setBrandSet] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let cancelled = false;
    if (!workspace?.id) {
      setBrandSet(null);
      return;
    }
    supabase
      .from("brand_profiles")
      .select("id, logo_url, primary_color")
      .eq("workspace_id", workspace.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setBrandSet(!!(data && (data.logo_url || data.primary_color)));
      });
    return () => {
      cancelled = true;
    };
  }, [workspace?.id]);

  const steps: Step[] = useMemo(
    () => [
      {
        id: "brand",
        label: "Set your brand",
        done: brandSet === true,
        href: "/settings/brand",
        cta: "Open brand",
      },
      {
        id: "guide",
        label: "Create your first guide",
        done: guides.length > 0,
        href: "/guides",
        cta: "New guide",
      },
      {
        id: "request",
        label: "Send your first request",
        done: requests.length > 0,
        href: "/requests/new",
        cta: "New request",
      },
      {
        id: "review",
        label: "Review a submission",
        done: requests.some((r) => r.firstPassStatus),
        href: "/requests?status=submitted",
        cta: "Open inbox",
      },
    ],
    [brandSet, guides.length, requests],
  );

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const allDone = completed === total;

  if (allDone && dismissed) return null;

  if (allDone) {
    return (
      <section className="relative -mx-3 border-y border-border bg-card px-3 py-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
            <Check className="h-3.5 w-3.5" /> Workspace ready
          </span>
          <span className="text-muted-foreground">
            {requests.length} {requests.length === 1 ? "request" : "requests"} ·{" "}
            {guides.length} {guides.length === 1 ? "guide" : "guides"} ·{" "}
            <span className="capitalize">{workspace?.plan ?? "free"}</span> plan
          </span>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.setItem(DISMISS_KEY, "1");
              } catch {
                // localStorage can be unavailable in private browsing or restricted embeds.
              }
              setDismissed(true);
            }}
            className="ml-auto inline-flex h-7 items-center gap-1 px-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground transition hover:text-foreground"
            aria-label="Dismiss workspace status"
          >
            <X className="h-3 w-3" /> Dismiss
          </button>
        </div>
      </section>
    );
  }

  const pct = Math.round((completed / total) * 100);

  return (
    <section className="relative -mx-3 border-y border-border bg-card sm:-mx-6 lg:-mx-10">
      {/* Top hairline progress bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-border">
        <div
          className="h-full bg-[hsl(var(--accent-kinetic))] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="grid gap-6 px-3 py-6 sm:grid-cols-12 sm:gap-8 sm:px-6 sm:py-8 lg:px-10">
        {/* Left rail: oversized count */}
        <div className="sm:col-span-4 lg:col-span-3">
          <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-6 bg-[hsl(var(--accent-kinetic))]" />
            Get set up
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-[Geist,Inter,system-ui,sans-serif] text-5xl font-semibold leading-none tracking-[-0.025em] tabular-nums text-foreground sm:text-6xl">
              {completed}
            </span>
            <span className="font-[Geist,Inter,system-ui,sans-serif] text-2xl font-light leading-none text-muted-foreground sm:text-3xl">
              / {total}
            </span>
          </div>
          <p className="mt-3 max-w-[18ch] text-sm leading-relaxed text-muted-foreground">
            {total - completed === 1
              ? "One step left to a fully wired workspace."
              : `${total - completed} steps left to a fully wired workspace.`}
          </p>
        </div>

        {/* Right rail: step rows */}
        <ol className="sm:col-span-8 lg:col-span-9">
          {steps.map((step, idx) => (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3 py-2.5",
                idx > 0 && "border-t border-border/60",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center",
                  step.done
                    ? "text-[hsl(var(--accent-kinetic))]"
                    : "text-muted-foreground/50",
                )}
                aria-hidden="true"
              >
                {step.done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm",
                  step.done
                    ? "text-muted-foreground line-through decoration-muted-foreground/40"
                    : "text-foreground",
                )}
              >
                {step.label}
              </span>
              {!step.done ? (
                <NavLink
                  to={step.href}
                  className="inline-flex items-center gap-1 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground transition hover:text-[hsl(var(--accent-kinetic))]"
                >
                  {step.cta} <ArrowUpRight className="h-3 w-3" />
                </NavLink>
              ) : (
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground/60">
                  Done
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
