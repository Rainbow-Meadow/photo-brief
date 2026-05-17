ALTER TABLE public.demo_sessions
  ADD COLUMN IF NOT EXISTS scan_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS pages_scanned integer;

CREATE OR REPLACE VIEW public.demo_session_metrics AS
WITH base AS (
  SELECT
    id, status, created_at, scan_completed_at, claimed_at, pages_scanned,
    EXTRACT(EPOCH FROM (scan_completed_at - created_at)) AS scrape_seconds
  FROM public.demo_sessions
),
windowed AS (
  SELECT '24h'::text AS window_label, base.* FROM base WHERE created_at >= now() - interval '24 hours'
  UNION ALL
  SELECT '7d'::text,  base.* FROM base WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT '30d'::text, base.* FROM base WHERE created_at >= now() - interval '30 days'
)
SELECT
  window_label,
  count(*)::int                                                       AS scans_total,
  count(*) FILTER (WHERE status IN ('ready','claimed'))::int          AS scans_succeeded,
  count(*) FILTER (WHERE status = 'failed')::int                      AS scans_failed,
  count(*) FILTER (WHERE status = 'scanning')::int                    AS scans_in_progress,
  ROUND(
    100.0 * count(*) FILTER (WHERE status IN ('ready','claimed'))::numeric
    / NULLIF(count(*) FILTER (WHERE status IN ('ready','claimed','failed')), 0),
    1
  )                                                                    AS success_rate_pct,
  ROUND(AVG(scrape_seconds) FILTER (WHERE scrape_seconds IS NOT NULL)::numeric, 1) AS avg_scrape_seconds,
  ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY scrape_seconds))::numeric, 1) AS p50_scrape_seconds,
  ROUND((percentile_cont(0.95) WITHIN GROUP (ORDER BY scrape_seconds))::numeric, 1) AS p95_scrape_seconds,
  ROUND(AVG(pages_scanned) FILTER (WHERE pages_scanned IS NOT NULL)::numeric, 1)   AS avg_pages_scanned,
  count(*) FILTER (WHERE claimed_at IS NOT NULL)::int                 AS scans_claimed,
  ROUND(
    100.0 * count(*) FILTER (WHERE claimed_at IS NOT NULL)::numeric
    / NULLIF(count(*) FILTER (WHERE status IN ('ready','claimed')), 0),
    1
  )                                                                    AS claim_conversion_pct
FROM windowed
GROUP BY window_label
ORDER BY CASE window_label WHEN '24h' THEN 1 WHEN '7d' THEN 2 WHEN '30d' THEN 3 END;

CREATE OR REPLACE VIEW public.demo_session_daily_metrics AS
SELECT
  date_trunc('day', created_at)::date                                  AS day,
  count(*)::int                                                        AS scans_total,
  count(*) FILTER (WHERE status IN ('ready','claimed'))::int           AS scans_succeeded,
  count(*) FILTER (WHERE status = 'failed')::int                       AS scans_failed,
  count(*) FILTER (WHERE claimed_at IS NOT NULL)::int                  AS scans_claimed,
  ROUND(AVG(EXTRACT(EPOCH FROM (scan_completed_at - created_at)))::numeric, 1) AS avg_scrape_seconds
FROM public.demo_sessions
WHERE created_at >= now() - interval '30 days'
GROUP BY 1
ORDER BY 1 DESC;

REVOKE ALL ON public.demo_session_metrics       FROM PUBLIC;
REVOKE ALL ON public.demo_session_daily_metrics FROM PUBLIC;
GRANT  SELECT ON public.demo_session_metrics       TO authenticated;
GRANT  SELECT ON public.demo_session_daily_metrics TO authenticated;

ALTER VIEW public.demo_session_metrics       SET (security_invoker = true);
ALTER VIEW public.demo_session_daily_metrics SET (security_invoker = true);