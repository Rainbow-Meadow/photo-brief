/**
 * Recipient bundle assembly.
 *
 * The recipient capture page (/r/:token) is fully public. The static portion
 * of its payload — request row + workspace name + brand profile + guide +
 * steps + questions — changes rarely (until the contractor edits the
 * request), so we cache the assembled bundle in Workers KV with a 1h TTL.
 *
 * Live portions (latest submission, in-flight rework state) stay on the
 * direct token-scoped Supabase queries, so a recipient who just got
 * rejected sees fresh feedback immediately.
 *
 * Schema mirrors what `src/features/capture/recipientContext.ts` already
 * fetches client-side, so the frontend can drop this in as a fast path.
 */

export interface RecipientBundleStep {
  id: string;
  order_index: number;
  title: string | null;
  instructions: string | null;
  shot_type: string | null;
  overlay_type: string | null;
  ai_checks: unknown;
  required: boolean | null;
}

export interface RecipientBundleQuestion {
  id: string;
  order_index: number;
  prompt: string | null;
  question_type: string | null;
  required: boolean | null;
  options: unknown;
}

export interface RecipientBundleGuide {
  id: string;
  name: string | null;
  category: string | null;
  description: string | null;
  is_template: boolean | null;
  steps: RecipientBundleStep[];
  questions: RecipientBundleQuestion[];
}

export interface RecipientBundleBrand {
  logo_url: string | null;
  primary_color: string | null;
  intro_message: string | null;
  completion_message: string | null;
  hide_photobrief_branding: boolean | null;
}

export interface RecipientBundleRequest {
  id: string;
  workspace_id: string;
  guide_id: string | null;
  recipient_name: string | null;
  status: string | null;
}

export interface RecipientBundle {
  request: RecipientBundleRequest;
  workspace_name: string | null;
  brand: RecipientBundleBrand | null;
  guide: RecipientBundleGuide | null;
  /** Server time when the bundle was assembled. */
  cached_at: string;
}

interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

async function sbGet(env: SupabaseEnv, path: string): Promise<unknown> {
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY not bound");
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase REST ${path} failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Assemble the bundle for a token by hitting Supabase REST with the service
 * role. Intentionally mirrors the queries in recipientContext.ts so the
 * shape is interchangeable with the frontend's existing context loader.
 */
export async function assembleRecipientBundle(
  env: SupabaseEnv,
  token: string,
): Promise<RecipientBundle | null> {
  const reqRows = (await sbGet(
    env,
    `photo_brief_requests?token=eq.${encodeURIComponent(token)}&select=id,workspace_id,guide_id,recipient_name,status&limit=1`,
  )) as RecipientBundleRequest[];
  const request = reqRows[0];
  if (!request) return null;

  const [wsRows, brandRows, guideRows] = await Promise.all([
    sbGet(
      env,
      `business_workspaces?id=eq.${request.workspace_id}&select=name&limit=1`,
    ) as Promise<{ name: string | null }[]>,
    sbGet(
      env,
      `brand_profiles?workspace_id=eq.${request.workspace_id}&select=logo_url,primary_color,intro_message,completion_message,hide_photobrief_branding&limit=1`,
    ) as Promise<RecipientBundleBrand[]>,
    request.guide_id
      ? (sbGet(
          env,
          `photo_guides?id=eq.${request.guide_id}&select=id,name,category,description,is_template,guide_steps(id,order_index,title,instructions,shot_type,overlay_type,ai_checks,required),context_questions(id,order_index,prompt,question_type,required,options)&limit=1`,
        ) as Promise<any[]>)
      : Promise.resolve([]),
  ]);

  const guideRow = guideRows[0];
  const guide: RecipientBundleGuide | null = guideRow
    ? {
        id: guideRow.id,
        name: guideRow.name ?? null,
        category: guideRow.category ?? null,
        description: guideRow.description ?? null,
        is_template: guideRow.is_template ?? null,
        steps: Array.isArray(guideRow.guide_steps)
          ? [...guideRow.guide_steps].sort(
              (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0),
            )
          : [],
        questions: Array.isArray(guideRow.context_questions)
          ? [...guideRow.context_questions].sort(
              (a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0),
            )
          : [],
      }
    : null;

  return {
    request,
    workspace_name: wsRows[0]?.name ?? null,
    brand: brandRows[0] ?? null,
    guide,
    cached_at: new Date().toISOString(),
  };
}
