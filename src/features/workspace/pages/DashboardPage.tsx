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

  // Count refunds (request_credit usage events) granted this billing
  // period — the visible payoff of the First-pass guarantee.
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
          cta: "Send a request",
        };

  return (
    <div className="space-y-7">
      <PageHeader
        title={isEmpty ? "Welcome to PhotoBrief" : "Today"}
        description={isEmpty ? "Let's send your first request." : "A quiet overview of what needs attention."}
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
            <Button asChild size="sm" className="hidden gap-1.5 rounded-full sm:inline-flex">
              <NavLink to="/requests/new">
                <Plus className="h-4 w-4" /> New request
              </NavLink>
            </Button>
          </div>
        }
      />

      {isEmpty ? <StarterRequestCard industry={workspace?.industry} /> : null}
      {!isEmpty ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={cn("space-y-6", assistantOpen ? "lg:col-span-2" : "lg:col-span-3")}>
            <section className="surface-card-elevated relative isolate overflow-hidden p-5 sm:p-7">
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-ambient-sky opacity-75" />
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {primaryFocus.label}
                  </p>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-5xl font-semibold tracking-tight text-foreground tabular-nums sm:text-6xl">
                      {primaryFocus.value}
                    </span>
                    <span className="max-w-xs text-sm text-muted-foreground sm:text-base">
                      {primaryFocus.copy}
                    </span>
                  </div>
                </div>
                <Button asChild size="lg" className="w-full gap-1.5 rounded-full px-6 sm:w-auto">
                  <NavLink to={primaryFocus.href}>
                    {primaryFocus.cta} <ArrowRight className="h-4 w-4" />
                  </NavLink>
                </Button>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                variant="quiet"
                label="Ready"
                value={metrics.readyToReview}
                icon={CheckCircle2}
                hint="Submitted, awaiting review"
              />
              <MetricCard
                variant="quiet"
                label="Waiting"
                value={metrics.needsCustomer}
                icon={AlertCircle}
                hint="Needs customer action"
              />
              <MetricCard
                variant="quiet"
                label="In progress"
                value={metrics.inProgress}
                icon={Clock}
                hint="Recipient capturing now"
              />
              <MetricCard
                variant="quiet"
                label="This month"
                value={metrics.requestsThisMonth}
                icon={Inbox}
                hint="Requests sent since the 1st"
              />
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
    </div>
  );
}

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
      <header className="flex items-center justify-between surface-divider px-5 py-4">
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
                  className="group flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-muted/45"
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
                        className="rounded-full"
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
                        className="rounded-full"
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
