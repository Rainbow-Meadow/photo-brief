import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section, Container, Stack } from "@/design-system/schema";
import { GlassPanel } from "@/components/ui/glass-panel";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/utils/format";

interface ExitInterviewRow {
  id: string;
  workspace_id: string;
  user_id: string;
  reason: string;
  details: string | null;
  would_return: string | null;
  created_at: string;
  workspace_name?: string | null;
  user_email?: string | null;
}

export default function AdminExitInterviews() {
  const [rows, setRows] = useState<ExitInterviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Service role required for cross-workspace read; rely on admin RLS bypass via edge function or platform admin policy.
      const { data, error } = await supabase
        .from("exit_interviews")
        .select("id, workspace_id, user_id, reason, details, would_return, created_at, business_workspaces(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (cancelled) return;
      if (error) {
        setRows([]);
      } else {
        setRows(
          (data ?? []).map((r: any) => ({
            ...r,
            workspace_name: r.business_workspaces?.name ?? null,
          })),
        );
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <Section>
      <Container>
        <Stack gap="lg">
          <PageHeader
            title="Exit interviews"
            description="Why customers cancel — newest first. Read-only."
          />
          <GlassPanel>
            {loading ? (
              <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : rows.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground">No exit interviews yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Workspace</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Would return</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {formatRelativeTime(r.created_at)}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {r.workspace_name ?? r.workspace_id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.reason}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{r.would_return ?? "—"}</TableCell>
                      <TableCell className="max-w-[420px] whitespace-pre-wrap text-xs text-muted-foreground">
                        {r.details ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </GlassPanel>
        </Stack>
      </Container>
    </Section>
  );
}
