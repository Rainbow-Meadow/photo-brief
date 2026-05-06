import { useEffect, useState } from "react";
import { ArrowLeft, Bug, HelpCircle, Lightbulb, MessageCircle, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { supportService, type SupportTicket } from "@/features/support/supportService";
import { TicketThread } from "@/features/support/components/TicketThread";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const TYPE_META: Record<string, { label: string; icon: typeof Bug }> = {
  bug: { label: "Bug", icon: Bug },
  feature_request: { label: "Feature request", icon: Lightbulb },
  question: { label: "Question", icon: HelpCircle },
  general: { label: "General", icon: MessageCircle },
};

function statusColor(s: string) {
  if (s === "open") return "default" as const;
  if (s === "in_progress") return "secondary" as const;
  if (s === "resolved" || s === "closed") return "outline" as const;
  return "secondary" as const;
}

export default function SupportPage() {
  const { workspace } = useCurrentWorkspace();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Create form state
  const [cType, setCType] = useState("bug");
  const [cSubject, setCSubject] = useState("");
  const [cBody, setCBody] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    if (!workspace?.id) return;
    setLoading(true);
    const data = await supportService.listTickets(workspace.id);
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [workspace?.id]);

  async function handleCreate() {
    if (!cSubject.trim() || !cBody.trim() || !workspace?.id || !user?.id) return;
    setCreating(true);
    try {
      const ticket = await supportService.createTicket({
        workspaceId: workspace.id,
        userId: user.id,
        type: cType,
        subject: cSubject.trim(),
        body: cBody.trim(),
      });
      toast({ title: "Ticket created" });
      setShowCreate(false);
      setCSubject("");
      setCBody("");
      setSelectedId(ticket.id);
      load();
    } catch {
      toast({ title: "Error creating ticket", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  const selected = tickets.find((t) => t.id === selectedId);

  // Thread view
  if (selected) {
    const meta = TYPE_META[selected.type] ?? TYPE_META.general;
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedId(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{selected.subject}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <meta.icon className="h-3 w-3" />
              <span>{meta.label}</span>
              <Badge variant={statusColor(selected.status)} className="text-[10px]">
                {selected.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
        <TicketThread ticketId={selected.id} />
      </div>
    );
  }

  // Create form
  if (showCreate) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => setShowCreate(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">New support ticket</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(TYPE_META).filter(([k]) => k !== "general").map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setCType(key)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                cType === key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              <meta.icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          ))}
        </div>

        <Input
          placeholder="Subject"
          value={cSubject}
          onChange={(e) => setCSubject(e.target.value)}
          className="h-12"
        />
        <Textarea
          placeholder="Describe the issue or request…"
          value={cBody}
          onChange={(e) => setCBody(e.target.value)}
          className="min-h-[120px]"
        />
        <Button
          onClick={handleCreate}
          disabled={!cSubject.trim() || !cBody.trim() || creating}
          loading={creating}
          className="w-full"
        >
          <Send className="mr-1.5 h-4 w-4" />
          Submit
        </Button>
      </div>
    );
  }

  // Ticket list
  return (
    <div className="space-y-4 p-4">
      <PageHeader title="Support" description="Report bugs, request features, or ask questions." />

      <Button onClick={() => setShowCreate(true)} className="w-full sm:w-auto">
        <Plus className="mr-1.5 h-4 w-4" />
        New ticket
      </Button>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <MessageCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No tickets yet. We'd love to hear from you!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((t) => {
            const meta = TYPE_META[t.type] ?? TYPE_META.general;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/50"
              >
                <meta.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={statusColor(t.status)} className="shrink-0 text-[10px]">
                  {t.status.replace("_", " ")}
                </Badge>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
