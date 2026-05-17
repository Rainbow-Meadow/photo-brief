import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Section, Container } from "@/design-system/schema";
import { PageMeta } from "@/hooks/seo/usePageMeta";

interface WindowRow {
  window_label: string;
  scans_total: number;
  scans_succeeded: number;
  scans_failed: number;
  scans_in_progress: number;
  success_rate_pct: number | null;
  avg_scrape_seconds: number | null;
  p50_scrape_seconds: number | null;
  p95_scrape_seconds: number | null;
  avg_pages_scanned: number | null;
  scans_claimed: number;
  claim_conversion_pct: number | null;
}

interface DayRow {
  day: string;
  scans_total: number;
  scans_succeeded: number;
  scans_failed: number;
  scans_claimed: number;
  avg_scrape_seconds: number | null;
}

const WINDOW_LABEL: Record<string, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export default function AdminDemoMetricsPage() {
  const [windows, setWindows] = useState<WindowRow[]>([]);
  const [days, setDays] = useState<DayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [w, d] = await Promise.all([
        (supabase as any).from("demo_session_metrics").select("*"),
        (supabase as any).from("demo_session_daily_metrics").select("*"),
      ]);
      if (w.error) setError(w.error.message);
      else setWindows((w.data ?? []) as WindowRow[]);
      if (!d.error) setDays((d.data ?? []) as DayRow[]);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <PageMeta title="Demo metrics · Admin" description="Demo scan success and claim conversion." canonicalPath="/admin/demo-metrics" />
      <Section>
        <Container width="wide">
          <header className="mb-8">
            <p className="ls-eyebrow">Admin</p>
            <h1 className="ls-h2 mt-4">Demo performance</h1>
            <p className="ls-subtitle mt-3 max-w-2xl">
              Scan success rate, average scrape time, and how often visitors convert their demo into a trial.
            </p>
          </header>

          {error ? (
            <p className="text-sm text-destructive">Couldn't load metrics: {error}</p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {windows.map((w) => (
                  <MetricCard key={w.window_label} row={w} />
                ))}
              </div>

              <div className="mt-10">
                <h2 className="text-lg font-semibold text-foreground">Daily trend (30 days)</h2>
                <div className="mt-3 overflow-x-auto border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-background/40 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2">Day</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-right">Succeeded</th>
                        <th className="px-3 py-2 text-right">Failed</th>
                        <th className="px-3 py-2 text-right">Claimed</th>
                        <th className="px-3 py-2 text-right">Avg scrape (s)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((d) => (
                        <tr key={d.day} className="border-t border-border">
                          <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{d.day}</td>
                          <td className="px-3 py-2 text-right">{d.scans_total}</td>
                          <td className="px-3 py-2 text-right text-accent">{d.scans_succeeded}</td>
                          <td className="px-3 py-2 text-right">{d.scans_failed}</td>
                          <td className="px-3 py-2 text-right">{d.scans_claimed}</td>
                          <td className="px-3 py-2 text-right">{d.avg_scrape_seconds ?? "—"}</td>
                        </tr>
                      ))}
                      {days.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-sm text-muted-foreground">
                            No demo scans yet.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </Container>
      </Section>
    </>
  );
}

function MetricCard({ row }: { row: WindowRow }) {
  return (
    <div className="border border-border bg-background/40 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">{WINDOW_LABEL[row.window_label] ?? row.window_label}</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Stat label="Scans" value={row.scans_total} />
        <Stat label="Success" value={row.success_rate_pct != null ? `${row.success_rate_pct}%` : "—"} />
        <Stat label="Avg scrape" value={row.avg_scrape_seconds != null ? `${row.avg_scrape_seconds}s` : "—"} />
        <Stat label="p95 scrape" value={row.p95_scrape_seconds != null ? `${row.p95_scrape_seconds}s` : "—"} />
        <Stat label="Claimed" value={row.scans_claimed} />
        <Stat label="Claim rate" value={row.claim_conversion_pct != null ? `${row.claim_conversion_pct}%` : "—"} />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {row.scans_failed} failed · {row.scans_in_progress} in progress · avg {row.avg_pages_scanned ?? "—"} pages
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
