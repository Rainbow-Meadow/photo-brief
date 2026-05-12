/**
 * Recipient bundle assembly.
 *
 * The recipient capture page (/r/:token) is fully public. The static portion
 * of its payload — request row + workspace name + brand profile + guide +
 * steps + questions — changes rarely (until the contractor edits the
 * request), so we cache the assembled bundle in Workers KV with a 1h TTL.
 *
 * Live portions (latest submission, in-flight rework state) stay on the
 * direct token-scoped Supabase queries so a recipient who just got rejected
 * sees fresh feedback immediately.
 *
 * Column names mirror `public.guide_steps` and `public.context_questions`
 * exactly: `instruction` (singular), `capture_type`, `overlay_type`,
 * `ai_checks`, `label`, `input_type`, `options`. The frontend mapper
 * (`rowToGuide` in guidesService) understands this snake_case shape.
 */

export interface RecipientBundleStepRow {
  id: string;
  guide_id: string;
  order_index: number;
  title: string | null;
  instruction: string | null;
  capture_type: string | null;
  overlay_type: string | null;
  ai_checks: unknown;
  required: boolean | null;
}

export interface RecipientBundleQuestionRow {
  id: string;
  guide_id: string;
  order_index: number;
  label: string | null;
  input_type: string | null;
  required: boolean | null;
  options: unknown;
}

export interface RecipientBundleGuideRow {
  id: string;
  workspace_id: string | null;
  name: string | null;
  category: string | null;
  description: string | null;
  steps: RecipientBundleStepRow[];
  questions: RecipientBundleQuestionRow[];
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
  guide: RecipientBundleGuideRow | null;
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
          `photo_guides?id=eq.${request.guide_id}&select=id,workspace_id,name,category,description,guide_steps(id,guide_id,order_index,title,instruction,capture_type,overlay_type,ai_checks,required),context_questions(id,guide_id,order_index,label,input_type,required,options)&limit=1`,
        ) as Promise<any[]>)
      : Promise.resolve([]),
  ]);

  const guideRow = guideRows[0];
  const guide: RecipientBundleGuideRow | null = guideRow
    ? {
        id: guideRow.id,
        workspace_id: guideRow.workspace_id ?? null,
        name: guideRow.name ?? null,
        category: guideRow.category ?? null,
        description: guideRow.description ?? null,
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
