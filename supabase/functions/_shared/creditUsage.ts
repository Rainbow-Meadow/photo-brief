import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export const CREDIT_COST = {
  submittedPhoto: 1,
  firstPassFollowupPhoto: 0,
  aiPhotoCheck: 1,
  aiSubmissionSummary: 0,
  aiRequestBuilder: 0,
  aiGuideGeneration: 0,
  aiFollowupGeneration: 0,
  aiAdminRerun: 0,
} as const;

export function creditErrorResponse(requiredCredits: number, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: "PhotoBrief Credits exhausted. Add credits or upgrade your plan in Billing.",
      code: "credits_exhausted",
      requiredCredits,
    }),
    {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
}

export async function workspaceHasCredits(workspaceId: string, credits: number): Promise<boolean> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data, error } = await admin.rpc("workspace_has_credits", {
    _workspace_id: workspaceId,
    _credits: credits,
  });
  if (error) {
    console.error("workspace_has_credits failed", error);
    return false;
  }
  return data === true;
}

export async function logCreditUsage(args: {
  workspaceId: string;
  eventType: string;
  relatedType?: string | null;
  relatedId?: string | null;
  credits?: number | null;
  source?: "usage" | "guarantee" | "refund" | "adjustment" | "topup" | "plan_allowance";
  metadata?: Record<string, unknown>;
}) {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { error } = await admin.rpc("log_credit_usage", {
    _workspace_id: args.workspaceId,
    _event_type: args.eventType,
    _related_type: args.relatedType ?? null,
    _related_id: args.relatedId ?? null,
    _metadata: args.metadata ?? {},
    _credits: args.credits ?? null,
    _source: args.source ?? "usage",
  });
  if (error) console.error("log_credit_usage failed", error);
}
