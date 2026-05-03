import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export type IntakeField = "name" | "email" | "phone" | "request_type" | "message" | "address";
export type IntakeRuleMatchType = "exact" | "contains";

export interface IntakeSource {
  id: string;
  workspaceId: string;
  name: string;
  publicToken: string;
  enabled: boolean;
  defaultGuideId: string | null;
  introMessage: string | null;
  autoSend: boolean;
  createdAt: string;
}

export interface IntakeFieldMapping {
  id: string;
  intakeSourceId: string;
  photobriefField: IntakeField;
  externalField: string;
}

export interface IntakeTemplateRule {
  id: string;
  intakeSourceId: string;
  matchType: IntakeRuleMatchType;
  matchValue: string;
  guideId: string;
  priority: number;
  enabled: boolean;
}

export interface IntakeEvent {
  id: string;
  status: "received" | "request_created" | "no_template_match" | "error";
  requestType: string | null;
  message: string | null;
  createdRequestId: string | null;
  matchedGuideId: string | null;
  error: string | null;
  createdAt: string;
  normalizedCustomer: Record<string, unknown>;
}

function toSource(row: any): IntakeSource {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    publicToken: row.public_token,
    enabled: row.enabled,
    defaultGuideId: row.default_guide_id,
    introMessage: row.intro_message,
    autoSend: row.auto_send,
    createdAt: row.created_at,
  };
}

function toMapping(row: any): IntakeFieldMapping {
  return {
    id: row.id,
    intakeSourceId: row.intake_source_id,
    photobriefField: row.photobrief_field,
    externalField: row.external_field,
  };
}

function toRule(row: any): IntakeTemplateRule {
  return {
    id: row.id,
    intakeSourceId: row.intake_source_id,
    matchType: row.match_type,
    matchValue: row.match_value,
    guideId: row.guide_id,
    priority: row.priority,
    enabled: row.enabled,
  };
}

function toEvent(row: any): IntakeEvent {
  return {
    id: row.id,
    status: row.status,
    requestType: row.request_type,
    message: row.message,
    createdRequestId: row.created_request_id,
    matchedGuideId: row.matched_guide_id,
    error: row.error,
    createdAt: row.created_at,
    normalizedCustomer: row.normalized_customer ?? {},
  };
}

export const websiteIntakeService = {
  async getOrCreateSource(workspaceId: string): Promise<IntakeSource> {
    const { data: existing, error: readErr } = await db
      .from("intake_sources")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (readErr) throw readErr;
    if (existing) return toSource(existing);

    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await db
      .from("intake_sources")
      .insert({ workspace_id: workspaceId, name: "Website intake", created_by: user.user?.id ?? null })
      .select("*")
      .single();
    if (error) throw error;

    const source = toSource(data);
    await this.saveMappings(source.id, DEFAULT_MAPPINGS);
    return source;
  },

  async updateSource(id: string, patch: Partial<Pick<IntakeSource, "name" | "enabled" | "defaultGuideId" | "introMessage" | "autoSend">>): Promise<IntakeSource> {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.enabled !== undefined) payload.enabled = patch.enabled;
    if (patch.defaultGuideId !== undefined) payload.default_guide_id = patch.defaultGuideId;
    if (patch.introMessage !== undefined) payload.intro_message = patch.introMessage;
    if (patch.autoSend !== undefined) payload.auto_send = patch.autoSend;
    const { data, error } = await db
      .from("intake_sources")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toSource(data);
  },

  async listMappings(sourceId: string): Promise<IntakeFieldMapping[]> {
    const { data, error } = await db
      .from("intake_field_mappings")
      .select("*")
      .eq("intake_source_id", sourceId)
      .order("photobrief_field", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toMapping);
  },

  async saveMappings(sourceId: string, mappings: Array<{ photobriefField: IntakeField; externalField: string }>): Promise<void> {
    const { error: delErr } = await db.from("intake_field_mappings").delete().eq("intake_source_id", sourceId);
    if (delErr) throw delErr;
    const rows = mappings
      .filter((m) => m.externalField.trim())
      .map((m) => ({ intake_source_id: sourceId, photobrief_field: m.photobriefField, external_field: m.externalField.trim() }));
    if (rows.length === 0) return;
    const { error } = await db.from("intake_field_mappings").insert(rows);
    if (error) throw error;
  },

  async listRules(sourceId: string): Promise<IntakeTemplateRule[]> {
    const { data, error } = await db
      .from("intake_template_rules")
      .select("*")
      .eq("intake_source_id", sourceId)
      .order("priority", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toRule);
  },

  async createRule(input: { sourceId: string; matchType: IntakeRuleMatchType; matchValue: string; guideId: string; priority: number }): Promise<IntakeTemplateRule> {
    const { data, error } = await db
      .from("intake_template_rules")
      .insert({
        intake_source_id: input.sourceId,
        match_type: input.matchType,
        match_value: input.matchValue.trim(),
        guide_id: input.guideId,
        priority: input.priority,
        enabled: true,
      })
      .select("*")
      .single();
    if (error) throw error;
    return toRule(data);
  },

  async deleteRule(id: string): Promise<void> {
    const { error } = await db.from("intake_template_rules").delete().eq("id", id);
    if (error) throw error;
  },

  async listEvents(workspaceId: string): Promise<IntakeEvent[]> {
    const { data, error } = await db
      .from("intake_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    return (data ?? []).map(toEvent);
  },

  async sendTest(publicToken: string, payload: Record<string, unknown>) {
    const { data, error } = await supabase.functions.invoke(`website-intake/${publicToken}`, { body: payload });
    if (error) throw error;
    return data as any;
  },
};

export const DEFAULT_MAPPINGS: Array<{ photobriefField: IntakeField; externalField: string }> = [
  { photobriefField: "name", externalField: "name" },
  { photobriefField: "email", externalField: "email" },
  { photobriefField: "phone", externalField: "phone" },
  { photobriefField: "request_type", externalField: "request_type" },
  { photobriefField: "message", externalField: "message" },
  { photobriefField: "address", externalField: "address" },
];

export function intakeWebhookUrl(publicToken: string) {
  return `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/website-intake/${publicToken}`;
}
