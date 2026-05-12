/**
 * Shared Cloudflare Analytics Engine writer.
 *
 * Mirror append-only telemetry (usage_events, AI checks, SMS log) here so
 * dashboards can run without scanning Postgres. Postgres remains the system
 * of record for billing — AE is best-effort.
 *
 * Add to wrangler.toml:
 *   [[analytics_engine_datasets]]
 *   binding = "AE_USAGE"
 *   dataset = "pb_usage_events"
 */

export interface AnalyticsEngineBinding {
  writeDataPoint(point: {
    indexes?: string[];
    blobs?: string[];
    doubles?: number[];
  }): void;
}

export interface UsageEventPoint {
  workspace_id: string;
  event_type: string;
  related_id?: string | null;
  credit_cost?: number | null;
  metadata?: Record<string, unknown>;
}

/**
 * Mirror a usage event to Analytics Engine. Never throws — telemetry must
 * never break the write of record.
 *
 * Index: workspace_id (max 32 bytes, AE will truncate UUIDs are fine).
 * Blobs: [event_type, related_id, metadata_json] (each ≤ 5120 bytes).
 * Doubles: [credit_cost].
 */
export function recordUsage(ae: AnalyticsEngineBinding | undefined, point: UsageEventPoint): void {
  if (!ae) return;
  try {
    ae.writeDataPoint({
      indexes: [point.workspace_id],
      blobs: [
        point.event_type,
        point.related_id ?? "",
        point.metadata ? JSON.stringify(point.metadata).slice(0, 5000) : "",
      ],
      doubles: [Number(point.credit_cost ?? 0)],
    });
  } catch (err) {
    console.warn("AE recordUsage failed", err);
  }
}
