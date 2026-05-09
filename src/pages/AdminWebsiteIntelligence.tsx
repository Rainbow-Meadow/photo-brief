import { useEffect, useMemo, useState } from "react";
import { Bot, ExternalLink, Globe2, Loader2, RefreshCw, Route, ScanSearch, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell, PageStack, ResponsiveGrid } from "@/components/layout/primitives";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface BetaApplication {
  id: string;
  email: string;
  business_name: string | null;
  website: string | null;
  workflow_type: string | null;
  use_case: string | null;
  fit_score: number | null;
  created_at: string;
}

interface ScanResult {
  ok: boolean;
  profile_id: string;
  scan_job_id: string;
  blueprint_id: string;
  pages_scanned: number;
  forms_detected: number;
  services_detected: number;
  summary: string;
  install_recommendation: string;
  routing_rules: Array<{
    label: string;
    customer_description: string;
    template_type: string;
    service_names?: string[];
    match_keywords?: string[];
  }>;
  services: Array<{
    name: string;
    category: string;
    template_type: string;
    source_url: string;
    confidence: number;
  }>;
  forms: Array<{
    page_url: string;
    inferred_purpose: string;
    quality_score: number;
    field_names: string[];
  }>;
}

interface RecentScan {
  id: string;
  root_url: string;
  status: string;
  pages_scanned_count: number;
  forms_detected_count: number;
  services_detected_count: number;
  completed_at: string | null;
  created_at: string;
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function scoreTone(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-amber-400";
  return "text-destructive";
}

export default function AdminWebsiteIntelligencePage() {
  const [apps, setApps] = useState<BetaApplication[]>([]);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [{ data: appRows }, { data: scans }] = await Promise.all([
        supabase
          .from("beta_applications")
          .select("id,email,business_name,website,workflow_type,use_case,fit_score,created_at")
          .not("website", "is", null)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("website_scan_jobs" as any)
          .select("id,root_url,status,pages_scanned_count,forms_detected_count,services_detected_count,completed_at,created_at")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      const nextApps = (appRows as BetaApplication[] | null) ?? [];
      setApps(nextApps);
      setRecentScans((scans as unknown as RecentScan[] | null) ?? []);
      if (!selectedId && nextApps[0]?.id) {
        setSelectedId(nextApps[0].id);
        setManualUrl(nextApps[0].website ?? "");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const selected = useMemo(() => apps.find((app) => app.id === selectedId) ?? null, [apps, selectedId]);

  function pickApp(id: string) {
    const app = apps.find((a) => a.id === id) ?? null;
    setSelectedId(id);
    setManualUrl(app?.website ?? "");
    setResult(null);
  }

  async function runScan() {
    const url = manualUrl.trim();
    if (!url) {
      toast({ title: "Website required", description: "Add a website URL before scanning.", variant: "destructive" });
      return;
    }

    setScanning(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("website-intelligence", {
        body: {
          action: "scan_website",
          website_url: url,
          beta_application_id: selected?.id,
        },
      });
      if (error) throw error;
      const payload = data as ScanResult & { error?: string; message?: string };
      if (payload.error) throw new Error(payload.message ?? payload.error);
      setResult(payload);
      toast({ title: "Website scan complete", description: payload.summary });
      await reload();
    } catch (error) {
      toast({ title: "Website scan failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setScanning(false);
    }
  }

  return (
    <PageShell><PageStack>
      <PageHeader
        eyebrow="Platform admin"
        title="Website intelligence"
        description="Scan a beta applicant's website, detect current services/forms, and generate a simplified PhotoBrief intake plan."
        actions={
          <Button variant="outline" size="sm" onClick={reload} disabled={loading || scanning}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <ResponsiveGrid cols="1-2" className="lg:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel variant="card" className="p-5">
          <div className="flex items-center gap-2">
            <ScanSearch className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Run website scan</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a beta applicant or enter a website manually. The scan is shallow, same-site only, and built to generate an admin-reviewed intake blueprint.
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <Label>Beta applicant</Label>
              <select
                value={selectedId}
                onChange={(e) => pickApp(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Manual website only</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.business_name ?? app.email} · {app.website ?? "no site"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Website URL</Label>
              <Input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://example.com" className="mt-1.5" />
            </div>

            {selected ? (
              <div className="rounded-xl border bg-muted/30 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{selected.business_name ?? selected.email}</p>
                    <p className="text-xs text-muted-foreground">{selected.workflow_type ?? "Workflow unknown"}</p>
                  </div>
                  {selected.fit_score ? <Badge variant="outline">Fit {selected.fit_score}/5</Badge> : null}
                </div>
                {selected.use_case ? <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{selected.use_case}</p> : null}
              </div>
            ) : null}

            <Button onClick={runScan} disabled={scanning || !manualUrl.trim()}>
              {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
              {scanning ? "Scanning website…" : "Scan and build intake plan"}
            </Button>
          </div>
        </GlassPanel>

        <GlassPanel variant="card" className="p-5">
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Recent scans</h2>
          </div>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Pages</TableHead>
                  <TableHead className="text-right">Forms</TableHead>
                  <TableHead className="text-right">Services</TableHead>
                  <TableHead>Completed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentScans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No website scans yet.
                    </TableCell>
                  </TableRow>
                ) : recentScans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="max-w-[240px] truncate text-xs">{scan.root_url}</TableCell>
                    <TableCell><Badge variant={scan.status === "completed" ? "default" : scan.status === "failed" ? "destructive" : "secondary"}>{scan.status}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums">{scan.pages_scanned_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{scan.forms_detected_count}</TableCell>
                    <TableCell className="text-right tabular-nums">{scan.services_detected_count}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(scan.completed_at ?? scan.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </GlassPanel>
      </ResponsiveGrid>

      {result ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          <GlassPanel variant="card" className="p-5 lg:col-span-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Recommended intake blueprint</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
                <p className="mt-1 text-sm text-muted-foreground">{result.install_recommendation}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{result.pages_scanned} pages</Badge>
                <Badge variant="outline">{result.forms_detected} forms</Badge>
                <Badge variant="outline">{result.services_detected} services</Badge>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel variant="card" className="p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Route className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">2–3 path customer routing</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {result.routing_rules.map((rule, index) => (
                <div key={`${rule.template_type}-${index}`} className="rounded-xl border bg-background/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{rule.label}</p>
                    <Badge variant="secondary">{rule.template_type.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{rule.customer_description}</p>
                  {rule.service_names?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {rule.service_names.map((service) => <Badge key={service} variant="outline">{service}</Badge>)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel variant="card" className="p-5">
            <h3 className="font-semibold">Detected forms</h3>
            <div className="mt-4 grid gap-3">
              {result.forms.length === 0 ? <p className="text-sm text-muted-foreground">No forms detected in the shallow scan.</p> : result.forms.slice(0, 8).map((form, index) => (
                <div key={`${form.page_url}-${index}`} className="rounded-xl border bg-background/60 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline">{form.inferred_purpose.replace(/_/g, " ")}</Badge>
                    <span className={`text-xs font-semibold ${scoreTone(form.quality_score)}`}>{form.quality_score}/100</span>
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">{form.page_url}</p>
                  {form.field_names?.length ? <p className="mt-1 text-xs text-muted-foreground">Fields: {form.field_names.slice(0, 6).join(", ")}</p> : null}
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel variant="card" className="p-5 lg:col-span-3">
            <h3 className="font-semibold">Detected service catalog signals</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {result.services.length === 0 ? <p className="text-sm text-muted-foreground">No services detected yet. Try a more specific service page URL.</p> : result.services.slice(0, 12).map((service) => (
                <div key={`${service.name}-${service.source_url}`} className="rounded-xl border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.category} · {service.template_type.replace(/_/g, " ")}</p>
                    </div>
                    <Badge variant="outline">{Math.round(service.confidence * 100)}%</Badge>
                  </div>
                  <a href={service.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    Source page <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      ) : null}
    </PageStack></PageShell>
  );
}
