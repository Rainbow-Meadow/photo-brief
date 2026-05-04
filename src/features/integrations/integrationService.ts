import { supabase } from "@/integrations/supabase/client";

export interface IntegrationConnection {
  id: string;
  workspaceId: string;
  providerKey: string;
  status: "not_connected" | "connected" | "needs_attention" | "disabled";
  connectionKey: string;
  displayName: string | null;
  connectedAccount: string | null;
  config: Record<string, unknown>;
  lastSuccessAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

type IntegrationConnectionRow = {
  id: string;
  workspace_id: string;
  provider_key: string;
  status: IntegrationConnection["status"];
  connection_key: string;
  display_name: string | null;
  connected_account: string | null;
  config: Record<string, unknown> | null;
  last_success_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
};

function mapConnection(row: IntegrationConnectionRow): IntegrationConnection {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    providerKey: row.provider_key,
    status: row.status,
    connectionKey: row.connection_key,
    displayName: row.display_name,
    connectedAccount: row.connected_account,
    config: row.config ?? {},
    lastSuccessAt: row.last_success_at,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// The generated Supabase types will not include these new tables until the
// database migration is applied and types are regenerated. Keep the table calls
// isolated here so the rest of the app remains typed and easy to clean up later.
const db = supabase as unknown as {
  from: (table: string) => {
    select: (columns: string) => any;
    upsert: (values: Record<string, unknown>, options?: Record<string, unknown>) => any;
    update: (values: Record<string, unknown>) => any;
  };
};

export const integrationService = {
  async listConnections(workspaceId: string): Promise<IntegrationConnection[]> {
    const { data, error } = await db
      .from("integration_connections")
      .select("id, workspace_id, provider_key, status, connection_key, display_name, connected_account, config, last_success_at, last_error, created_at, updated_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as IntegrationConnectionRow[]).map(mapConnection);
  },

  async createOrEnableConnection(input: {
    workspaceId: string;
    providerKey: string;
    displayName?: string;
    config?: Record<string, unknown>;
  }): Promise<IntegrationConnection> {
    const { data, error } = await db
      .from("integration_connections")
      .upsert(
        {
          workspace_id: input.workspaceId,
          provider_key: input.providerKey,
          status: "connected",
          display_name: input.displayName ?? null,
          config: input.config ?? {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_id,provider_key" },
      )
      .select("id, workspace_id, provider_key, status, connection_key, display_name, connected_account, config, last_success_at, last_error, created_at, updated_at")
      .single();

    if (error) throw error;
    return mapConnection(data as IntegrationConnectionRow);
  },

  async disableConnection(connectionId: string): Promise<void> {
    const { error } = await db
      .from("integration_connections")
      .update({ status: "disabled", updated_at: new Date().toISOString() })
      .eq("id", connectionId);

    if (error) throw error;
  },
};

export function buildIntegrationWebhookUrl(connection: IntegrationConnection) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const base = supabaseUrl ? `${supabaseUrl.replace(/\/$/, "")}/functions/v1` : `${window.location.origin}/functions/v1`;
  return `${base}/integration-webhook/${connection.workspaceId}/${connection.connectionKey}`;
}
