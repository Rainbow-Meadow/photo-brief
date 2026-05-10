import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Bug,
  ChevronRight,
  Copy,
  HelpCircle,
  Inbox,
  Lightbulb,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Container, Stack } from "@/design-system/schema";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { supportService, type SupportTicket, type SupportMessage } from "@/features/support/supportService";
import { TicketThread } from "@/features/support/components/TicketThread";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WaitlistEntry {
  id: string;
  name: string;
  business_name: string | null;
  email: string;
  business_type: string | null;
  website: string | null;
  use_case: string | null;
  estimated_monthly_requests: string | null;
  notes: string | null;
  status: string;
  source: string;
  created_at: string;
}

interface BetaInvite {
  id: string;
  email: string;
  business_name: string | null;
  status: string;
  expires_at: string;
  accepted_at: string | null;
  token_prefix: string;
  created_at: string;
}

interface TicketWithProfile extends SupportTicket {
  email?: string;
  workspace_name?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusBadge(status: string) {
  const v =
    status === "open" || status === "new"
      ? ("default" as const)
      : status === "in_progress" || status === "reviewed" || status === "contacted"
        ? ("secondary" as const)
        : status === "invited" || status === "accepted" || status === "resolved"
          ? ("outline" as const)
          : ("destructive" as const);
  return <Badge variant={v} className="shrink-0 text-[10px]">{status.replace("_", " ")}</Badge>;
}

const TICKET_TYPES: Record<string, { icon: typeof Bug; label: string }> = {
  bug: { icon: Bug, label: "Bug" },
  feature_request: { icon: Lightbulb, label: "Idea" },
  question: { icon: HelpCircle, label: "Question" },
  general: { icon: MessageCircle, label: "General" },
};

function relativeTime(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminCommandCenter() {
  const { user } = useAuth();
  const [tab, setTab] = useState("support");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Data
  const [tickets, setTickets] = useState<TicketWithProfile[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [invites, setInvites] = useState<BetaInvite[]>([]);

  // Drill-in
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedWaitlistId, setSelectedWaitlistId] = useState<string | null>(null);

  // Stats
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const newApps = waitlist.filter((w) => w.status === "new").length;
  const activeInvites = invites.filter(
    (i) => i.status === "invited" && new Date(i.expires_at) > new Date(),
  ).length;

  async function reload() {
    setLoading(true);
    try {
      const [ticketsRes, waitlistRes, invitesRes, profilesRes, workspacesRes] = await Promise.all([
        supportService.listAllTickets(),
        supabase.from("waitlist_entries").select("*").order("created_at", { ascending: false }),
        supabase.from("beta_invites").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, email"),
        supabase.from("business_workspaces").select("id, name"),
      ]);

      const profileMap = new Map<string, string>();
      (profilesRes.data ?? []).forEach((p: any) => profileMap.set(p.id, p.email));
      const wsMap = new Map<string, string>();
      (workspacesRes.data ?? []).forEach((w: any) => wsMap.set(w.id, w.name));

      setTickets(
        ticketsRes.map((t) => ({
          ...t,
          email: profileMap.get(t.user_id),
          workspace_name: wsMap.get(t.workspace_id),
        })),
      );
      setWaitlist((waitlistRes.data as WaitlistEntry[]) ?? []);
      setInvites((invitesRes.data as BetaInvite[]) ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  // Filter by search
  const q = search.toLowerCase();
  const filteredTickets = useMemo(
    () =>
      tickets.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          (t.email ?? "").toLowerCase().includes(q) ||
          (t.workspace_name ?? "").toLowerCase().includes(q),
      ),
    [tickets, q],
  );
  const filteredWaitlist = useMemo(
    () =>
      waitlist.filter(
        (w) =>
          w.email.toLowerCase().includes(q) ||
          w.name.toLowerCase().includes(q) ||
          (w.business_name ?? "").toLowerCase().includes(q),
      ),
    [waitlist, q],
  );
  const filteredInvites = useMemo(
    () =>
      invites.filter(
        (i) =>
          i.email.toLowerCase().includes(q) ||
          (i.business_name ?? "").toLowerCase().includes(q),
      ),
    [invites, q],
  );

  // Waitlist status update
  async function updateWaitlistStatus(id: string, status: string) {
    await supabase.from("waitlist_entries").update({ status }).eq("id", id);
    setWaitlist((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    toast({ title: `Marked as ${status}` });
  }

  // Ticket status update
  async function updateTicketStatus(id: string, status: string) {
    await supportService.updateTicketStatus(id, status);
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    toast({ title: `Ticket ${status.replace("_", " ")}` });
  }

  // -----------------------------------------------------------------------
  // Ticket detail
  // -----------------------------------------------------------------------
  if (selectedTicketId) {
    const ticket = tickets.find((t) => t.id === selectedTicketId);
    if (!ticket) return null;
    const meta = TICKET_TYPES[ticket.type] ?? TICKET_TYPES.general;
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedTicketId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{ticket.subject}</p>
            <p className="text-xs text-muted-foreground">
              {ticket.email} · {ticket.workspace_name}
            </p>
          </div>
          <div className="flex gap-1">
            {["open", "in_progress", "resolved", "closed"].map((s) => (
              <button
                key={s}
                onClick={() => updateTicketStatus(ticket.id, s)}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                  ticket.status === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        <TicketThread ticketId={ticket.id} isAdmin />
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Waitlist detail
  // -----------------------------------------------------------------------
  if (selectedWaitlistId) {
    const entry = waitlist.find((w) => w.id === selectedWaitlistId);
    if (!entry) return null;
    return (
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedWaitlistId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{entry.name}</h2>
          {statusBadge(entry.status)}
        </div>

        <div className="space-y-3 rounded-lg border bg-card p-4">
          <Row label="Email" value={entry.email} copyable />
          <Row label="Business" value={entry.business_name} />
          <Row label="Website" value={entry.website} />
          <Row label="Type" value={entry.business_type} />
          <Row label="Use case" value={entry.use_case} />
          <Row label="Volume" value={entry.estimated_monthly_requests} />
          <Row label="Source" value={entry.source} />
          <Row label="Notes" value={entry.notes} />
          <Row label="Applied" value={new Date(entry.created_at).toLocaleString()} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["new", "reviewed", "contacted", "invited", "rejected"].map((s) => (
            <Button
              key={s}
              size="sm"
              variant={entry.status === s ? "default" : "outline"}
              onClick={() => updateWaitlistStatus(entry.id, s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Main dashboard
  // -----------------------------------------------------------------------
  return (
    <Section density="page"><Container><Stack><div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Command Center"
          description="Support, applications & invites — all in one place."
        />
        <Button variant="ghost" size="icon" onClick={reload} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={MessageCircle}
          label="Open tickets"
          value={openTickets}
          onClick={() => setTab("support")}
          active={tab === "support"}
        />
        <StatCard
          icon={Users}
          label="New apps"
          value={newApps}
          onClick={() => setTab("waitlist")}
          active={tab === "waitlist"}
        />
        <StatCard
          icon={ShieldCheck}
          label="Active invites"
          value={activeInvites}
          onClick={() => setTab("invites")}
          active={tab === "invites"}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search across everything…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 pl-10"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="support" className="flex-1 gap-1.5 text-xs">
            <MessageCircle className="h-3.5 w-3.5" />
            Support
            {openTickets > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {openTickets}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="flex-1 gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Waitlist
            {newApps > 0 && (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {newApps}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex-1 gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            Invites
          </TabsTrigger>
        </TabsList>

        {/* Support tickets */}
        <TabsContent value="support" className="mt-3 space-y-2">
          {loading ? (
            <Loading />
          ) : filteredTickets.length === 0 ? (
            <Empty text="No support tickets yet" />
          ) : (
            filteredTickets.map((t) => {
              const meta = TICKET_TYPES[t.type] ?? TICKET_TYPES.general;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <meta.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.email ?? "Unknown"} · {relativeTime(t.created_at)}
                    </p>
                  </div>
                  {statusBadge(t.status)}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                </button>
              );
            })
          )}
        </TabsContent>

        {/* Waitlist */}
        <TabsContent value="waitlist" className="mt-3 space-y-2">
          {loading ? (
            <Loading />
          ) : filteredWaitlist.length === 0 ? (
            <Empty text="No applications yet" />
          ) : (
            filteredWaitlist.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWaitlistId(w.id)}
                className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {w.business_name || w.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {w.email} · {w.source} · {relativeTime(w.created_at)}
                  </p>
                </div>
                {statusBadge(w.status)}
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
              </button>
            ))
          )}
        </TabsContent>

        {/* Invites */}
        <TabsContent value="invites" className="mt-3 space-y-2">
          {loading ? (
            <Loading />
          ) : filteredInvites.length === 0 ? (
            <Empty text="No invites yet" />
          ) : (
            filteredInvites.map((i) => {
              const eff =
                i.status === "invited" && new Date(i.expires_at) < new Date()
                  ? "expired"
                  : i.status;
              return (
                <div
                  key={i.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {i.business_name || i.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {i.email} · {relativeTime(i.created_at)}
                    </p>
                  </div>
                  {statusBadge(eff)}
                </div>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  onClick,
  active,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: number;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/50",
      )}
    >
      <Icon className="mb-1 h-4 w-4 text-muted-foreground" />
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </button>
  );
}

function Row({
  label,
  value,
  copyable,
}: {
  label: string;
  value: string | null | undefined;
  copyable?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-2 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 text-right font-medium">
        {value}
        {copyable && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast({ title: "Copied" });
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </span>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center">
      <Inbox className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
