import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import type { IntakeBrief } from "@/types/intake";

type Row = Record<string, unknown>;

const db = supabase as unknown as {
  from: (table: string) => {
    select: (columns: string) => any;
  };
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function mapBrief(row: Row): IntakeBrief {
  const customer = record(row.customer_contact);
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    intakeSessionId: String(row.intake_session_id),
    intakeSourceId: text(row.intake_source_id),
    blueprintId: text(row.blueprint_id),
    routingRuleId: text(row.routing_rule_id),
    customerId: text(row.customer_id),
    linkedPhotoBriefRequestId: text(row.linked_photo_brief_request_id),
    title: text(row.title) ?? "Intake brief",
    summary: text(row.summary),
    routeLabel: text(row.route_label),
    serviceLabel: text(row.service_label),
    customer: {
      name: text(customer.name),
      email: text(customer.email),
      phone: text(customer.phone),
      address: text(customer.address),
      preferredContactMethod: text(customer.preferredContactMethod) as IntakeBrief["customer"]["preferredContactMethod"],
    },
    answers: record(row.answers),
    brief: record(row.brief),
    photoPolicy: (text(row.photo_policy) ?? "optional") as IntakeBrief["photoPolicy"],
    photosProvided: Boolean(row.photos_provided),
    photoCount: typeof row.photo_count === "number" ? row.photo_count : 0,
    readinessStatus: (text(row.readiness_status) ?? "needs_review") as IntakeBrief["readinessStatus"],
    readinessScore: typeof row.readiness_score === "number" ? row.readiness_score : null,
    nextAction: text(row.next_action),
    missingItems: Array.isArray(row.missing_items) ? row.missing_items.map(String) : [],
    status: (text(row.status) ?? "new") as IntakeBrief["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

async function fetchBriefs(workspaceId: string) {
  const query = db
    .from("intake_briefs")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as Row[]).map(mapBrief);
}

async function fetchBrief(id: string, workspaceId: string) {
  const query = db
    .from("intake_briefs")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  const { data, error } = await query;
  if (error) throw error;
  return data ? mapBrief(data as Row) : null;
}

export function useIntakeBriefs() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["intake-briefs", workspace?.id],
    queryFn: () => fetchBriefs(workspace!.id),
    enabled: Boolean(workspace?.id),
  });
}

export function useIntakeBrief(id: string | undefined) {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["intake-brief", workspace?.id, id],
    queryFn: () => fetchBrief(id!, workspace!.id),
    enabled: Boolean(workspace?.id && id),
  });
}

export type IntakeAttachment = {
  id: string;
  mimeType: string;
  sizeBytes: number | null;
  originalFilename: string | null;
  createdAt: string;
  url: string;
};

export function useIntakeBriefAttachments(briefId: string | undefined) {
  return useQuery({
    queryKey: ["intake-brief-attachments", briefId],
    queryFn: async (): Promise<IntakeAttachment[]> => {
      const { data, error } = await supabase.functions.invoke("list-intake-attachments", {
        body: { briefId },
      });
      if (error) throw error;
      return (data?.attachments ?? []) as IntakeAttachment[];
    },
    enabled: Boolean(briefId),
    staleTime: 5 * 60 * 1000, // signed URLs valid 10m, refresh well before
  });
}

