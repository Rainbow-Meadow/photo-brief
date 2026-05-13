/**
 * AgentTeamPage — workspace settings panel that surfaces the multi-agent
 * coordination model: per-role status, recent cross-agent handoffs, and a
 * brand voice editor that writes back to the Orchestrator's KV.
 */
import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { toast } from "@/hooks/use-toast";
import {
  fetchAgentContext,
  fetchAgentHistory,
  fetchCharters,
  runDigestNow,
  updateWorkspaceBrand,
  type AgentCharter,
  type AgentContext,
  type AgentRole,
  type HistoryEntry,
} from "@/services/agentTeamService";

const ROLE_ORDER: AgentRole[] = [
  "conductor",
  "account_strategist",
  "capture_coach",
  "install_engineer",
  "growth_steward",
  "agent_gateway",
  "edge_traffic",
];

export default function AgentTeamPage() {
  const { workspace, loading: wsLoading } = useCurrentWorkspace();
  const [context, setContext] = useState<AgentContext | null>(null);
  const [charters, setCharters] = useState<Record<string, AgentCharter>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tone, setTone] = useState("");
  const [signature, setSignature] = useState("");
  const [language, setLanguage] = useState("en");

  const reload = async () => {
    if (!workspace?.id) return;
    setLoading(true);
    try {
      const [ctx, hist, ch] = await Promise.all([
        fetchAgentContext(workspace.id).catch(() => null),
        fetchAgentHistory(workspace.id).catch(() => []),
        fetchCharters().catch(() => ({}) as Record<string, AgentCharter>),
      ]);
      setContext(ctx);
      setHistory(hist);
      setCharters(ch);
      const v = ctx?.brand?.voice;
      if (v) {
        setTone(v.tone ?? "");
        setSignature(v.signature ?? "");
        setLanguage(v.language ?? "en");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wsLoading || !workspace?.id) return;
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsLoading, workspace?.id]);

  const onSaveVoice = async () => {
    if (!workspace?.id) return;
    setSaving(true);
    try {
      const { brand } = await updateWorkspaceBrand(workspace.id, {
        voice: { tone, signature, language },
      });
      setContext((c) => (c ? { ...c, brand } : c));
      toast({ title: "Voice updated", description: "All agents will use the new tone on their next message." });
    } catch (e) {
      toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const onRunDigest = async () => {
    if (!workspace?.id) return;
    await runDigestNow(workspace.id);
    toast({ title: "Standup queued", description: "The Conductor is fanning out a fresh digest." });
    setTimeout(reload, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agent team"
        description="Coordinated agents that share your workspace's brand voice and hand off work between each other."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={onRunDigest} disabled={!workspace?.id}>
              <Sparkles className="mr-2 h-4 w-4" />
              Run standup
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Brand voice</CardTitle>
          <CardDescription>
            Every outbound message — assistant nudges, capture coaching, install confirmations — is wrapped with this voice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                placeholder="warm-professional"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lang">Language (BCP-47)</Label>
              <Input
                id="lang"
                placeholder="en"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sig">Signature</Label>
            <Textarea
              id="sig"
              placeholder="— The Acme Roofing team"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={onSaveVoice} disabled={saving || !workspace?.id}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save voice
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>What each agent owns and where it hands off.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLE_ORDER.map((role) => {
              const charter = charters[role];
              const status = context?.roleStatus?.[role];
              if (!charter) return null;
              return (
                <div key={role} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{charter.displayName}</div>
                      <div className="text-xs text-muted-foreground">{charter.worker}</div>
                    </div>
                    <Badge variant={status?.state === "working" ? "default" : "secondary"}>
                      {status?.state ?? "idle"}
                    </Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="text-xs text-muted-foreground">Owns</div>
                  <ul className="mt-1 list-inside list-disc text-sm">
                    {charter.owns.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                  {charter.handsOffTo.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Hands off to: {charter.handsOffTo.join(", ")}
                    </div>
                  )}
                  {status?.lastEventType && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Last: {status.lastEventType} ·{" "}
                      {new Date(status.lastEventAt).toLocaleString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent handoffs</CardTitle>
          <CardDescription>The last 100 events and dispatches the Conductor recorded.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground">No activity yet.</div>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 25).map((h, i) => (
                <div
                  key={`${h.at}-${i}`}
                  className="flex items-start justify-between gap-3 rounded-md border border-border/60 px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium">{h.summary}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(h.at).toLocaleString()} · {h.kind}
                      {h.correlationId ? ` · ${h.correlationId}` : ""}
                    </div>
                  </div>
                  {h.ok === false && <Badge variant="destructive">failed</Badge>}
                  {h.kind === "digest" && <Badge variant="outline">digest</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
