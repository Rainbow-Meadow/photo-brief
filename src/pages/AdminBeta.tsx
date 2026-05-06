import { useEffect, useMemo, useState, useCallback } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Star,
  X,
  XCircle,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassPanel } from "@/components/ui/glass-panel";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const STATUSES = [
  "new",
  "reviewing",
  "accepted",
  "invited",
  "activated",
  "active",
  "stalled",
  "graduated",
  "not_fit",
] as const;

type AppStatus = (typeof STATUSES)[number];

interface BetaApplication {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  business_name: string | null;
  website: string | null;
  use_case: string | null;
  workflow_type: string | null;
  monthly_photo_volume: string | null;
  source: string | null;
  status: AppStatus;
  fit_score: number | null;
  notes: string | null;
  last_contacted_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "active" || s === "activated" || s === "accepted") return "default";
  if (s === "not_fit") return "destructive";
  if (s === "graduated") return "outline";
  return "secondary";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminBetaPage() {
  const [apps, setApps] = useState<BetaApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [workflowFilter, setWorkflowFilter] = useState<string>("all");
  const [fitFilter, setFitFilter] = useState<string>("all");

  // Detail drawer
  const [selected, setSelected] = useState<BetaApplication | null>(null);
  const [drawerNotes, setDrawerNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // ------ Data fetching ------
  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("beta_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApps((data as BetaApplication[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ------ Derived filter options ------
  const sources = useMemo(() => {
    const s = new Set<string>();
    apps.forEach((a) => a.source && s.add(a.source));
    return Array.from(s).sort();
  }, [apps]);

  const workflowTypes = useMemo(() => {
    const s = new Set<string>();
    apps.forEach((a) => a.workflow_type && s.add(a.workflow_type));
    return Array.from(s).sort();
  }, [apps]);

  // ------ Funnel metrics ------
  const metrics = useMemo(() => {
    const m: Record<string, number> = {};
    STATUSES.forEach((s) => (m[s] = 0));
    apps.forEach((a) => { m[a.status] = (m[a.status] ?? 0) + 1; });
    return m;
  }, [apps]);

  const funnelCards: { label: string; key: string; color: string }[] = [
    { label: "New", key: "new", color: "text-blue-400" },
    { label: "Accepted", key: "accepted", color: "text-emerald-400" },
    { label: "Invited", key: "invited", color: "text-violet-400" },
    { label: "Activated", key: "activated", color: "text-amber-400" },
    { label: "Active", key: "active", color: "text-green-400" },
    { label: "Stalled", key: "stalled", color: "text-orange-400" },
    { label: "Graduated", key: "graduated", color: "text-cyan-400" },
  ];

  // ------ Filtered list ------
  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (sourceFilter !== "all" && a.source !== sourceFilter) return false;
      if (workflowFilter !== "all" && a.workflow_type !== workflowFilter) return false;
      if (fitFilter !== "all") {
        const fv = Number(fitFilter);
        if (a.fit_score !== fv) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const hay = [a.email, a.business_name, a.first_name, a.last_name, a.use_case]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [apps, statusFilter, sourceFilter, workflowFilter, fitFilter, search]);

  // ------ Mutations ------
  async function updateApp(id: string, patch: Record<string, unknown>) {
    setSaving(true);
    const { error } = await supabase
      .from("beta_applications")
      .update(patch as any)
      .eq("id", id);
    setSaving(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Updated" });
    // Optimistic update
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...(patch as Partial<BetaApplication>) } : a))
    );
    if (selected?.id === id) {
      setSelected((s) => (s ? { ...s, ...(patch as Partial<BetaApplication>) } : s));
    }
  }

  function openDrawer(app: BetaApplication) {
    setSelected(app);
    setDrawerNotes(app.notes ?? "");
  }

  async function saveNotes() {
    if (!selected) return;
    await updateApp(selected.id, { notes: drawerNotes });
  }

  async function setStatus(id: string, status: AppStatus) {
    const extra: Record<string, unknown> = { status };
    if (status === "accepted") extra.accepted_at = new Date().toISOString();
    if (status === "not_fit") extra.rejected_at = new Date().toISOString();
    await updateApp(id, extra);
  }

  async function setFitScore(id: string, score: number) {
    await updateApp(id, { fit_score: score });
  }

  // ------ Render ------
  return (
    <div className="container max-w-7xl py-8">
      <PageHeader
        eyebrow="Platform admin"
        title="Beta applications"
        description="Review, score, and manage Founding Partner Beta applications."
        actions={
          <Button variant="outline" size="sm" onClick={reload} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Funnel metrics */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {funnelCards.map((c) => (
          <GlassPanel key={c.key} variant="card" className="flex flex-col items-center gap-1 px-3 py-4">
            <span className={`text-2xl font-bold tabular-nums ${c.color}`}>{metrics[c.key] ?? 0}</span>
            <span className="text-[11px] text-muted-foreground">{c.label}</span>
          </GlassPanel>
        ))}
      </div>

      {/* Filters */}
      <GlassPanel variant="card" className="mt-6 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, business…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={STATUSES as unknown as string[]} />
          <FilterSelect label="Source" value={sourceFilter} onChange={setSourceFilter} options={sources} />
          <FilterSelect label="Workflow" value={workflowFilter} onChange={setWorkflowFilter} options={workflowTypes} />
          <FilterSelect label="Fit" value={fitFilter} onChange={setFitFilter} options={["1","2","3","4","5"]} />
          <span className="text-xs text-muted-foreground">{filtered.length} of {apps.length}</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Fit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-12">
                      No applications match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((a) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => openDrawer(a)}
                  >
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {fmtDate(a.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{a.business_name ?? "—"}</div>
                      {(a.first_name || a.last_name) && (
                        <div className="text-xs text-muted-foreground">
                          {[a.first_name, a.last_name].filter(Boolean).join(" ")}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{a.email}</TableCell>
                    <TableCell className="text-xs">{a.workflow_type ?? "—"}</TableCell>
                    <TableCell className="text-xs">{a.monthly_photo_volume ?? "—"}</TableCell>
                    <TableCell className="text-xs">{a.source ?? "—"}</TableCell>
                    <TableCell>
                      <FitDots score={a.fit_score} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(a.status)} className="text-[10px]">
                        {a.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </GlassPanel>

      {/* Detail drawer */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{selected.business_name ?? selected.email}</SheetTitle>
                <SheetDescription>
                  {[selected.first_name, selected.last_name].filter(Boolean).join(" ") || selected.email}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status & quick actions */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Status</Label>
                  <select
                    value={selected.status}
                    disabled={saving}
                    onChange={(e) => setStatus(selected.id, e.target.value as AppStatus)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={saving || selected.status === "accepted"}
                      onClick={() => setStatus(selected.id, "accepted")}
                    >
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving || selected.status === "invited"}
                      onClick={() => setStatus(selected.id, "invited")}
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Mark invited
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={saving || selected.status === "not_fit"}
                      onClick={() => setStatus(selected.id, "not_fit")}
                    >
                      <XCircle className="mr-1.5 h-3.5 w-3.5" /> Not fit
                    </Button>
                  </div>
                </div>

                {/* Fit score */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Fit score</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        disabled={saving}
                        onClick={() => setFitScore(selected.id, n)}
                        className="p-1 rounded hover:bg-muted/60 transition-colors"
                      >
                        <Star
                          className={`h-5 w-5 ${
                            (selected.fit_score ?? 0) >= n
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      </button>
                    ))}
                    {selected.fit_score && (
                      <button
                        className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => setFitScore(selected.id, 0)}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <Detail label="Email" value={selected.email} />
                  <Detail label="Website" value={selected.website} link />
                  <Detail label="Workflow" value={selected.workflow_type} />
                  <Detail label="Volume" value={selected.monthly_photo_volume} />
                  <Detail label="Source" value={selected.source} />
                  <Detail label="Applied" value={fmtDate(selected.created_at)} />
                  {selected.accepted_at && <Detail label="Accepted" value={fmtDate(selected.accepted_at)} />}
                  {selected.rejected_at && <Detail label="Rejected" value={fmtDate(selected.rejected_at)} />}
                </div>

                {/* Use case */}
                {selected.use_case && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Use case</Label>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.use_case}</p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Admin notes</Label>
                  <Textarea
                    value={drawerNotes}
                    onChange={(e) => setDrawerNotes(e.target.value)}
                    rows={4}
                    placeholder="Internal notes about this applicant…"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    disabled={saving || drawerNotes === (selected.notes ?? "")}
                    onClick={saveNotes}
                  >
                    Save notes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Label className="text-[11px] text-muted-foreground whitespace-nowrap">{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-input bg-background px-2 text-xs"
      >
        <option value="all">All</option>
        {options.map((o) => (
          <option key={o} value={o}>{o.replace("_", " ")}</option>
        ))}
      </select>
    </div>
  );
}

function FitDots({ score }: { score: number | null }) {
  if (!score) return <span className="text-xs text-muted-foreground/40">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3 w-3 ${
            score >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function Detail({ label, value, link }: { label: string; value: string | null | undefined; link?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-[11px] text-muted-foreground block">{label}</span>
      {link ? (
        <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
          {value}
        </a>
      ) : (
        <span className="break-all">{value}</span>
      )}
    </div>
  );
}
