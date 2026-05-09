import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Inbox,
  ShieldCheck,
  Plus,
  Sparkles,
  Bell,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell, PageStack } from "@/components/layout/primitives";
import { MetricCard } from "@/components/shared/MetricCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ReadinessScoreBadge } from "@/components/shared/ReadinessScoreBadge";
import { Button } from "@/components/ui/button";
import { useRequests } from "@/hooks/useRequests";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { requestStatusOptions } from "@/config/statusOptions";
import { formatRelativeTime } from "@/utils/format";
import { AssistantPanel } from "@/features/workspace/components/AssistantPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { messagingService } from "@/services/messagingService";
import { StarterRequestCard } from "@/features/workspace/components/StarterRequestCard";
import { usePlan } from "@/hooks/usePlan";
import { getPlanLimit, minPlanFor } from "@/config/planLimits";

async function sendReminder(requestId: string, recipientName: string) {
  const t = toast.loading(`Sending reminder to ${recipientName}…`);
  try {
    const result = await messagingService.send({ requestId, kind: "reminder" });
    toast.dismiss(t);
    if (result.delivery === "sent") {
      toast.success(`Reminder sent to ${recipientName}`);
    } else {
      toast.message("Reminder logged", {
        description: "We couldn't deliver an email this time, but we recorded the nudge.",
      });
    }
  } catch (err: any) {
    toast.dismiss(t);
    toast.error(err?.message ?? "Could not send reminder");
  }
}

export default function DashboardPage() {
  const requests = useRequests();
  const [assistantOpen, setAssistantOpen] = useState(false);
  const { can } = usePlan();
  const { workspace } = useCurrentWorkspace();
  const canRemind = can("reminders");

  const [refundedThisPeriod, setRefundedThisPeriod] = useState<number | null>(null);
  useEffect(() => {
    let cancelled = false;
    const wsId = workspace?.id;
    if (!wsId) {
      setRefundedThisPeriod(null);
      return;
    }
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    supabase
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", wsId)
      .eq("event_type", "request_credit")
      .gte("created_at", monthStart.toISOString())
      .then(({ count }) => {
        if (!cancelled) setRefundedThisPeriod(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [workspace?.id]);

  const metrics = useMemo(() => {
    const readyToReview = requests.filter((r) => r.status === "submitted").length;
    const needsCustomer = requests.filter((r) => r.status === "needs_customer_action" || r.status === "sent").length;
    const inProgress = requests.filter((r) => r.status === "in_progress").length;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const requestsThisMonth = requests.filter(
      (r) => new Date(r.createdAt).getTime() >= monthStart.getTime(),
    ).length;

    const firstDecided = requests.filter(
      (r) => r.firstPassStatus === "accepted" || r.firstPassStatus === "rework",
    );
    const firstAccepted = firstDecided.filter((r) => r.firstPassStatus === "accepted").length;
    const reworked = firstDecided.length - firstAccepted;
    const firstPassPct = firstDecided.length
      ? Math.round((firstAccepted / firstDecided.length) * 100)
      : null;

    const secondDecided = requests.filter(
      (r) => r.secondPassStatus === "accepted" || r.secondPassStatus === "rework",
    );
    const secondAccepted = secondDecided.filter((r) => r.secondPassStatus === "accepted").length;
    const secondPassPct = secondDecided.length
      ? Math.round((secondAccepted / secondDecided.length) * 100)
      : null;

    return {
      readyToReview,
      needsCustomer,
      inProgress,
      requestsThisMonth,
      firstPassPct,
      reworked,
      secondPassPct,
      secondAccepted,
      secondDecidedCount: secondDecided.length,
    };
  }, [requests]);

  const readyList = useMemo(
    () => requests.filter((r) => r.status === "submitted").slice(0, 4),
    [requests],
  );
  const needsActionList = useMemo(
    () => requests.filter((r) => r.status === "needs_customer_action" || r.status === "sent").slice(0, 4),
    [requests],
  );

  const isEmpty = requests.length === 0;
  const primaryFocus = metrics.readyToReview > 0
    ? {
        label: "Ready to review",
        value: `${metrics.readyToReview}`,
        copy: metrics.readyToReview === 1 ? "submission is waiting for you." : "submissions are waiting for you.",
        href: "/requests?status=submitted",
        cta: "Review now",
      }
    : metrics.needsCustomer > 0
      ? {
          label: "Waiting on customers",
          value: `${metrics.needsCustomer}`,
          copy: metrics.needsCustomer === 1 ? "request needs a customer nudge." : "requests may need a customer nudge.",
          href: "/requests?status=needs_customer_action",
          cta: "View open requests",
        }
      : {
          label: "All clear",
          value: "0",
          copy: "items need your attention right now.",
          href: "/requests/new",
          cta: "New request",
        };

  return (
    <PageShell><PageStack>
      <PageHeader
        title={isEmpty ? "Welcome to PhotoBrief" : "Today"}
        description={isEmpty ? "Send your first request and get a PhotoBrief back in minutes." : "A quiet overview of what needs attention."}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={assistantOpen ? "secondary" : "outline"}
              size="sm"
              className="gap-1.5 rounded-full bg-background/60"
              onClick={() => setAssistantOpen((o) => !o)}
              aria-label="Toggle assistant"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Assistant</span>
            </Button>
          </div>
        }
      />

      {isEmpty ? <StarterRequestCard industry={workspace?.industry} /> : null}
      {!isEmpty ? (
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          <div className={cn("space-y-5 sm:space-y-6", assistantOpen ? "lg:col-span-2" : "lg:col-span-3")}>
            {/* Primary focus card */}
            <section className="relative border border-border bg-card p-5 sm:p-7">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
                    <span className="text-[hsl(var(--accent-kinetic))]">[ 01 ]</span>
                    <span>{primaryFocus.label}</span>
                  </p>
                  <div className="mt-4 flex items-baseline gap-4">
                    <span className="font-[Geist,Inter,system-ui,sans-serif] text-5xl font-semibold leading-none tracking-[-0.025em] text-foreground tabular-nums">
                      {primaryFocus.value}
                    </span>
                    <span className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {primaryFocus.copy}
                    </span>
                  </div>
                </div>
                <NavLink
                  to={primaryFocus.href}
                  className="inline-flex h-12 items-center justify-center gap-2 self-start bg-[hsl(var(--accent-kinetic))] px-6 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110"
                >
                  {primaryFocus.cta} <ArrowRight className="h-4 w-4" />
                </NavLink>
              </div>
            </section>

            {/* Metric cards – horizontal scroll on mobile, grid on desktop */}
            <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
              <div className="min-w-[140px] snap-start sm:min-w-0">
                <MetricCard variant="quiet" label="Ready" value={metrics.readyToReview} icon={CheckCircle2} hint="Submitted, awaiting review" />
              </div>
              <div className="min-w-[140px] snap-start sm:min-w-0">
                <MetricCard variant="quiet" label="Waiting" value={metrics.needsCustomer} icon={AlertCircle} hint="Needs customer action" />
              </div>
              <div className="min-w-[140px] snap-start sm:min-w-0">
                <MetricCard variant="quiet" label="In progress" value={metrics.inProgress} icon={Clock} hint="Recipient capturing now" />
              </div>
              <div className="min-w-[140px] snap-start sm:min-w-0">
                <MetricCard variant="quiet" label="This month" value={metrics.requestsThisMonth} icon={Inbox} hint="Requests sent since the 1st" />
              </div>
            </div>

            <MetricCard
              variant="quiet"
              label="First-pass acceptance"
              value={metrics.firstPassPct === null ? "—" : `${metrics.firstPassPct}%`}
              icon={ShieldCheck}
              hint={
                metrics.firstPassPct === null
                  ? "No reviews yet"
                  : `${metrics.reworked} sent back for resubmission`
              }
              subStat={
                metrics.firstPassPct === null
                  ? undefined
                  : metrics.secondPassPct === null
                    ? { label: "No second-pass reviews yet", tone: "muted" }
                    : {
                        label: `${metrics.secondPassPct}% accepted on second pass · ${metrics.secondAccepted} of ${metrics.secondDecidedCount}`,
                        tone: "success",
                      }
              }
              footnote={
                refundedThisPeriod !== null && refundedThisPeriod > 0
                  ? {
                      label: `↻ ${refundedThisPeriod} ${refundedThisPeriod === 1 ? "request" : "requests"} refunded this period`,
                      tooltip:
                        "First-pass guarantee: when a submission needs rework, the request is refunded to your monthly allowance.",
                      tone: "primary",
                    }
                  : refundedThisPeriod === 0
                    ? {
                        label: "✓ First-pass guarantee active — no refunds needed",
                        tooltip:
                          "Every submission landed on the first try this period. If one ever needs rework, that request is refunded automatically.",
                        tone: "success",
                      }
                    : undefined
              }
            />

            <div className="grid gap-5 xl:grid-cols-2">
              <DashboardList
                title="Ready to review"
                emptyLabel="Nothing waiting on you."
                items={readyList}
                ctaLabel="View submitted"
                ctaHref="/requests?status=submitted"
              />
              <DashboardList
                title="Needs customer action"
                emptyLabel="Everyone's caught up."
                items={needsActionList}
                ctaLabel="View open"
                ctaHref="/requests?status=needs_customer_action"
                showReminder={canRemind}
              />
            </div>
          </div>

          {assistantOpen ? (
            <div className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-4 h-[calc(100vh-6rem)]">
                <AssistantPanel open onClose={() => setAssistantOpen(false)} />
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <Sheet open={assistantOpen} onOpenChange={setAssistantOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 lg:hidden">
          <AssistantPanel open onClose={() => setAssistantOpen(false)} />
        </SheetContent>
      </Sheet>
    </PageStack></PageShell>
  );
}

/* ─── Dashboard list ─── */

interface DashboardListProps {
  title: string;
  emptyLabel: string;
  items: ReturnType<typeof useRequests>;
  ctaLabel: string;
  ctaHref: string;
  showReminder?: boolean;
}

function DashboardList({ title, emptyLabel, items, ctaLabel, ctaHref, showReminder }: DashboardListProps) {
  return (
    <section className="surface-card overflow-hidden">
      <header className="flex items-center justify-between surface-divider px-4 py-3 sm:px-5 sm:py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{items.length} visible</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="-mr-2 gap-1 rounded-full">
          <NavLink to={ctaHref}>
            {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </NavLink>
        </Button>
      </header>
      {items.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">{emptyLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">New activity will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[hsl(var(--glass-border))]">
          {items.map((r) => {
            const tone = requestStatusOptions[r.status].tone;
            return (
              <li key={r.id}>
                <NavLink
                  to={`/requests/${r.id}`}
                  className="group flex min-h-[52px] items-center justify-between gap-3 px-4 py-3 transition active:bg-muted/40 hover:bg-muted/45 sm:px-5 sm:py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {r.recipientName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.guideName} · {formatRelativeTime(r.lastActivityAt ?? r.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {r.readinessScore !== undefined ? <ReadinessScoreBadge score={r.readinessScore} /> : null}
                    <StatusBadge label={requestStatusOptions[r.status].label} tone={tone} />
                    {showReminder ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          sendReminder(r.id, r.recipientName);
                        }}
                        aria-label="Send reminder"
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    ) : null}
                    {showReminder === false ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          const plan = minPlanFor("reminders");
                          toast.error(
                            `Reminders are on ${plan ? getPlanLimit(plan).name : "a higher plan"}`,
                          );
                        }}
                        aria-label="Send reminder (upgrade required)"
                        title="Available on Pro and above"
                      >
                        <Bell className="h-4 w-4 opacity-40" />
                      </Button>
                    ) : null}
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
