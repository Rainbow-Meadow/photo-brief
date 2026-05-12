// Submissions service — thin Supabase wrapper.
// Combines submissions + captured_media + extracted_details + internal_notes
// + submission_answers into the legacy Submission shape so existing UI keeps working.

import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { withSupabaseRetry as withRetry } from "@/lib/supabaseRetry";
import { getTokenClient } from "@/integrations/supabase/tokenClient";
import { r2MediaService } from "@/services/r2MediaService";

/** Strict shape we expect back from `submitFromRecipient`. */
export const RecipientSubmitResponseSchema = z.object({
  id: z.string().uuid({ message: "submission id is not a uuid" }),
});
export type RecipientSubmitResponse = z.infer<typeof RecipientSubmitResponseSchema>;

/** Thrown when the response payload is missing/malformed. UI treats as PB-500. */
export class InvalidSubmitResponseError extends Error {
  readonly code = "INVALID_SUBMIT_RESPONSE";
  readonly raw: unknown;
  readonly issues: unknown;
  constructor(raw: unknown, issues: unknown) {
    super("submitFromRecipient returned an unexpected payload");
    this.name = "InvalidSubmitResponseError";
    this.raw = raw;
    this.issues = issues;
  }
}
import type {
  Submission,
  SubmissionShot,
  SubmissionStatus,
  ExtractedDetail,
  InternalNote,
  CustomerAnswer,
} from "@/types/photobrief";

async function mediaUrl(row: any): Promise<string | undefined> {
  if (row?.storage_provider === "r2" && row?.id) {
    try {
      const { data, error } = await supabase.functions.invoke("get-media-url", {
        body: { capturedMediaId: row.id, variant: "preview" },
      });
      if (!error && data?.url) return data.url;
    } catch (err) {
      console.warn("get-media-url failed; falling back", err);
    }
  }

  const path = row?.file_url as string | null;
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  const { data } = supabase.storage.from("submission-media").getPublicUrl(path);
  return data.publicUrl;
}

async function hydrate(
  row: any,
  shotsRows: any[],
  detailsRows: any[],
  notesRows: any[],
  answerRows: any[] = [],
): Promise<Submission> {
  const shots: SubmissionShot[] = await Promise.all((shotsRows ?? []).map(async (m) => ({
    id: m.id,
    stepId: m.step_id ?? undefined,
    orderIndex: 0,
    title: m.guide_steps?.title ?? m.note ?? "Photo",
    shotType: "wide",
    imageUrl: await mediaUrl(m),
    capturedAt: m.created_at,
    feedback: m.ai_feedback ?? undefined,
    reviewStatus: (m.status === "approved" || m.status === "rejected" || m.status === "resubmitted")
      ? m.status
      : "pending",
    reviewComment: m.review_comment ?? undefined,
    reviewedAt: m.reviewed_at ?? undefined,
  })));
  const extractedDetails: ExtractedDetail[] = (detailsRows ?? []).map((d) => ({
    label: d.label,
    value: d.value ?? "",
    confidence: d.confidence ?? undefined,
  }));
  const internalNotes: InternalNote[] = (notesRows ?? []).map((n) => ({
    id: n.id,
    authorName: "Team member",
    authorInitials: "TM",
    body: n.note,
    createdAt: n.created_at,
  }));
  const customerAnswers: CustomerAnswer[] = (answerRows ?? [])
    .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
    .map((a) => ({
      questionId: a.question_id ?? undefined,
      prompt: a.prompt,
      answer: a.answer,
    }));

  return {
    id: row.id,
    requestId: row.request_id,
    recipientName: row.submitter_name ?? "Recipient",
    recipientContact: row.submitter_contact ?? undefined,
    guideName: row.guide_name ?? "",
    requestType: row.guide_name ?? undefined,
    status: row.status as SubmissionStatus,
    readinessScore: row.readiness_score ?? 0,
    aiSummary: row.ai_summary ?? "",
    suggestedNextAction: row.next_action ?? "",
    submittedAt: row.submitted_at ?? row.created_at,
    missingItems: Array.isArray(row.missing_items) ? (row.missing_items as string[]) : [],
    shots,
    extractedDetails,
    internalNotes,
    activity: [],
    customerAnswers,
  };
}

export const submissionsService = {
  async list(workspaceId: string): Promise<Submission[]> {
    const { data, error } = await withRetry(async () =>
      await supabase
        .from("submissions")
        .select("*, photo_brief_requests!inner(guide_id, photo_guides(name))")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
    );
    if (error) throw error;

    const rows = (data ?? []).map((r: any) => ({
      ...r,
      guide_name: r.photo_brief_requests?.photo_guides?.name ?? "",
    }));

    return Promise.all(rows.map((r: any) => hydrate(r, [], [], [], [])));
  },

  async getById(id: string): Promise<Submission | null> {
    const { data, error } = await withRetry(async () =>
      await supabase
        .from("submissions")
        .select("*, photo_brief_requests!inner(guide_id, photo_guides(name))")
        .eq("id", id)
        .maybeSingle(),
    );
    if (error) throw error;
    if (!data) return null;

    const [shotsRes, detailsRes, notesRes, answersRes] = await Promise.all([
      withRetry(async () => await supabase.from("captured_media").select("*, guide_steps(title)").eq("submission_id", id)),
      withRetry(async () => await supabase.from("extracted_details").select("*").eq("submission_id", id)),
      withRetry(async () => await supabase.from("internal_notes").select("*").eq("submission_id", id)),
      withRetry(async () => await (supabase as any)
        .from("submission_answers")
        .select("*")
        .eq("submission_id", id)
        .order("order_index", { ascending: true })) as Promise<{ data: any[] | null; error: any }>,
    ]);

    return hydrate(
      { ...data, guide_name: (data as any).photo_brief_requests?.photo_guides?.name ?? "" },
      shotsRes.data ?? [],
      detailsRes.data ?? [],
      notesRes.data ?? [],
      (answersRes.data ?? []) as any[],
    );
  },

  async countByStatus(workspaceId: string, status: SubmissionStatus): Promise<number> {
    const { count, error } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", status);
    if (error) throw error;
    return count ?? 0;
  },

  async updateStatus(id: string, status: SubmissionStatus): Promise<void> {
    const patch: { status: SubmissionStatus; reviewed_at?: string } = { status };
    if (status === "reviewed") patch.reviewed_at = new Date().toISOString();
    const { error } = await supabase.from("submissions").update(patch).eq("id", id);
    if (error) throw error;
  },

  async assignViaRequest(requestId: string, userId: string | null): Promise<void> {
    const { error } = await supabase
      .from("photo_brief_requests")
      .update({ assigned_to: userId })
      .eq("id", requestId);
    if (error) throw error;
  },

  async addInternalNote(args: {
    submissionId: string;
    workspaceId: string;
    body: string;
  }): Promise<InternalNote> {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("internal_notes")
      .insert({
        submission_id: args.submissionId,
        workspace_id: args.workspaceId,
        user_id: user.user?.id ?? null,
        note: args.body,
      })
      .select()
      .single();
    if (error) throw error;
    const meta = (user.user?.user_metadata ?? {}) as Record<string, unknown>;
    const profileName =
      (typeof meta.name === "string" && meta.name) ||
      (typeof meta.full_name === "string" && meta.full_name) ||
      user.user?.email ||
      "You";
    const initials = String(profileName)
      .split(/\s+/)
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .slice(0, 2)
      .toUpperCase();
    return {
      id: data.id,
      authorName: String(profileName),
      authorInitials: initials || "YO",
      body: data.note,
      createdAt: data.created_at,
    };
  },

  async rejectShots(args: {
    submissionId: string;
    workspaceId: string;
    items: { mediaId: string; comment: string }[];
    summaryMessage: string;
  }): Promise<void> {
    if (args.items.length === 0) return;
    const reviewedAt = new Date().toISOString();

    for (const item of args.items) {
      const { error: medErr } = await supabase
        .from("captured_media")
        .update({
          status: "rejected",
          review_comment: item.comment || null,
          reviewed_at: reviewedAt,
        })
        .eq("id", item.mediaId);
      if (medErr) throw medErr;
    }

    const { data: prior, error: roundErr } = await supabase
      .from("submission_reviews")
      .select("round")
      .eq("submission_id", args.submissionId)
      .order("round", { ascending: false })
      .limit(1);
    if (roundErr) throw roundErr;
    const nextRound = (prior?.[0]?.round ?? 0) + 1;

    const { data: user } = await supabase.auth.getUser();
    const { error: revErr } = await supabase.from("submission_reviews").insert({
      submission_id: args.submissionId,
      workspace_id: args.workspaceId,
      reviewer_id: user.user?.id ?? null,
      action: "rejected",
      round: nextRound,
      summary_message: args.summaryMessage,
      rejected_media_ids: args.items.map((i) => i.mediaId),
    });
    if (revErr) throw revErr;

    const { error: statusErr } = await supabase
      .from("submissions")
      .update({ status: "needs_more" })
      .eq("id", args.submissionId);
    if (statusErr) throw statusErr;
  },

  async updateShotFeedbackText(args: {
    mediaId: string;
    businessSummary?: string | null;
    suggestedNextAction?: string | null;
  }): Promise<void> {
    const { data: row, error: readErr } = await supabase
      .from("captured_media")
      .select("ai_feedback")
      .eq("id", args.mediaId)
      .maybeSingle();
    if (readErr) throw readErr;

    const current = (row?.ai_feedback ?? {}) as Record<string, unknown>;
    const next: Record<string, unknown> = { ...current };
    if (args.businessSummary !== undefined) {
      next.businessSummary = args.businessSummary === "" ? null : args.businessSummary;
    }
    if (args.suggestedNextAction !== undefined) {
      next.suggestedNextAction = args.suggestedNextAction === "" ? null : args.suggestedNextAction;
    }
    next.editedAt = new Date().toISOString();

    const { error } = await supabase
      .from("captured_media")
      .update({ ai_feedback: next as any })
      .eq("id", args.mediaId);
    if (error) throw error;
  },

  async submitFromRecipient(args: {
    token: string;
    requestId: string;
    workspaceId: string;
    recipientName?: string;
    recipientContact?: string;
    existingSubmissionId?: string;
    photos: { stepId?: string; blob: Blob; ext: string; note?: string }[];
    answers: { questionId?: string; prompt: string; answer: string }[];
  }) {
    const client = getTokenClient(args.token);

    let submissionId = args.existingSubmissionId ?? null;
    if (submissionId) {
      const { error: updErr } = await client
        .from("submissions")
        .update({
          submitter_name: args.recipientName ?? null,
          submitter_contact: args.recipientContact ?? null,
          submitted_at: new Date().toISOString(),
        })
        .eq("id", submissionId);
      if (updErr) throw updErr;
    } else {
      const { data: subRow, error: subErr } = await client
        .from("submissions")
        .insert({
          request_id: args.requestId,
          workspace_id: args.workspaceId,
          submitter_name: args.recipientName ?? null,
          submitter_contact: args.recipientContact ?? null,
          status: "new",
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (subErr) throw subErr;
      submissionId = subRow.id;
    }

    for (const p of args.photos) {
      const uploaded = await r2MediaService.uploadOriginalForAnalysis({
        token: args.token,
        requestId: args.requestId,
        workspaceId: args.workspaceId,
        stepId: p.stepId ?? null,
        submissionId,
        recipientName: args.recipientName ?? null,
        file: p.blob,
        ext: p.ext,
      });
      await r2MediaService.promoteAcceptedPhotoToWebp({
        token: args.token,
        capturedMediaId: uploaded.capturedMediaId,
        file: p.blob,
      }).catch((err) => console.warn("fallback WebP promotion failed", err));
    }

    const answerClient = client as any;
    const normalizedAnswers = (args.answers ?? [])
      .map((a, idx) => ({
        submission_id: submissionId,
        request_id: args.requestId,
        workspace_id: args.workspaceId,
        question_id: a.questionId && /^[0-9a-f-]{36}$/i.test(a.questionId) ? a.questionId : null,
        prompt: a.prompt?.trim() ?? "Question",
        answer: a.answer?.trim() ?? "",
        order_index: idx,
      }))
      .filter((a) => a.prompt && a.answer);

    const { error: deleteAnswersErr } = await answerClient
      .from("submission_answers")
      .delete()
      .eq("submission_id", submissionId);
    if (deleteAnswersErr) throw deleteAnswersErr;

    if (normalizedAnswers.length > 0) {
      const { error: answersErr } = await answerClient
        .from("submission_answers")
        .insert(normalizedAnswers);
      if (answersErr) throw answersErr;
    }

    await client
      .from("photo_brief_requests")
      .update({ status: "submitted" })
      .eq("id", args.requestId);

    client.functions
      .invoke("ai-summarize-submission", { body: { submissionId } })
      .catch((e) => console.warn("summary trigger failed", e));

    const payload = { id: submissionId };
    const parsed = RecipientSubmitResponseSchema.safeParse(payload);
    if (!parsed.success) {
      // Log enough to debug without leaking PII — submissionId is a uuid.
      console.error("[submitFromRecipient] invalid response payload", {
        requestId: args.requestId,
        workspaceId: args.workspaceId,
        rawKeys: payload && typeof payload === "object" ? Object.keys(payload) : null,
        issues: parsed.error.issues,
      });
      throw new InvalidSubmitResponseError(payload, parsed.error.issues);
    }
    console.info("[submitFromRecipient] ok", {
      submissionId: parsed.data.id,
      requestId: args.requestId,
      photos: args.photos.length,
      answers: args.answers.length,
    });
    return parsed.data;
  },

  /**
   * Mark previously-rejected captured_media rows as `resubmitted`.
   * Pure helper — callers MUST only invoke this after the parent
   * submission write has succeeded, so a failed submit never leaves
   * orphan rows flipped to resubmitted.
   */
  async markRejectedMediaResubmitted(args: {
    token: string;
    rejectedMediaIds: string[];
  }): Promise<{ updated: number }> {
    const ids = (args.rejectedMediaIds ?? []).filter(Boolean);
    if (ids.length === 0) return { updated: 0 };
    const client = getTokenClient(args.token);
    const { error } = await client
      .from("captured_media")
      .update({ status: "resubmitted" })
      .in("id", ids);
    if (error) throw error;
    return { updated: ids.length };
  },
};
