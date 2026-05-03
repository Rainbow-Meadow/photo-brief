import { supabase } from "@/integrations/supabase/client";
import { getTokenClient } from "@/integrations/supabase/tokenClient";
import { convertImageToWebpVariants } from "@/lib/imageProcessing";

interface CreateUploadArgs {
  token?: string;
  requestId: string;
  workspaceId: string;
  stepId?: string | null;
  submissionId?: string | null;
  recipientName?: string | null;
  file: Blob;
  ext: string;
}

export interface R2UploadResult {
  submissionId: string;
  capturedMediaId: string;
  /** Short-lived signed URL for AI analysis of the original upload. */
  publicUrl: string;
  /** Temporary original R2 key until accepted media is promoted to WebP. */
  storagePath: string;
  originalStorageKey?: string | null;
  processedStorageKey?: string | null;
}

interface PromoteArgs {
  token?: string;
  capturedMediaId: string;
  file: Blob;
}

function clientForToken(token?: string) {
  return token ? getTokenClient(token) : supabase;
}

async function putObject(url: string, blob: Blob, contentType: string) {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob,
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status}`);
  }
}

export const r2MediaService = {
  /**
   * Upload the original capture to a temporary R2 key and return a signed URL
   * for AI. This does NOT create the permanent WebP asset yet; promotion happens
   * after the AI verdict accepts the photo or the user chooses "use anyway".
   */
  async uploadOriginalForAnalysis(args: CreateUploadArgs): Promise<R2UploadResult> {
    const client = clientForToken(args.token);
    const contentType = args.file.type || "image/jpeg";

    const { data: created, error: createErr } = await client.functions.invoke("create-media-upload", {
      body: {
        requestId: args.requestId,
        workspaceId: args.workspaceId,
        stepId: args.stepId ?? null,
        submissionId: args.submissionId ?? null,
        recipientName: args.recipientName ?? null,
        contentType,
        ext: args.ext,
        sizeBytes: args.file.size,
      },
    });
    if (createErr) throw createErr;
    if (!created?.uploadUrl || !created?.capturedMediaId || !created?.submissionId) {
      throw new Error("create-media-upload returned an invalid payload");
    }

    await putObject(created.uploadUrl, args.file, contentType);

    const { data: finalized, error: finalizeErr } = await client.functions.invoke("finalize-media-upload", {
      body: { capturedMediaId: created.capturedMediaId },
    });
    if (finalizeErr) throw finalizeErr;
    if (!finalized?.aiReadUrl) {
      throw new Error("finalize-media-upload did not return an AI read URL");
    }

    return {
      submissionId: created.submissionId,
      capturedMediaId: created.capturedMediaId,
      publicUrl: finalized.aiReadUrl,
      storagePath: created.originalStorageKey,
      originalStorageKey: created.originalStorageKey,
      processedStorageKey: null,
    };
  },

  /** Convert the accepted original capture to WebP variants and promote those
   * variants to permanent R2 storage. Safe to call after AI pass/warn or after
   * the user accepts a warning/failure with "use anyway".
   */
  async promoteAcceptedPhotoToWebp(args: PromoteArgs): Promise<{ processedStorageKey: string | null }> {
    const client = clientForToken(args.token);
    const variants = await convertImageToWebpVariants(args.file);

    const uploadVariant = async (variant: "full" | "preview" | "thumb", blob: Blob) => {
      const { data, error } = await client.functions.invoke("get-media-upload-url", {
        body: { capturedMediaId: args.capturedMediaId, variant, contentType: "image/webp" },
      });
      if (error) throw error;
      if (!data?.uploadUrl) throw new Error(`Missing signed ${variant} upload URL`);
      await putObject(data.uploadUrl, blob, "image/webp");
      return data.key as string;
    };

    const [fullKey] = await Promise.all([
      uploadVariant("full", variants.full.blob),
      uploadVariant("preview", variants.preview.blob),
      uploadVariant("thumb", variants.thumb.blob),
    ]);

    const { data: processedFinalized, error: processedErr } = await client.functions.invoke("finalize-media-upload", {
      body: {
        capturedMediaId: args.capturedMediaId,
        processed: {
          uploaded: true,
          width: variants.full.width,
          height: variants.full.height,
          sizeBytes: variants.full.blob.size,
          checksumSha256: variants.checksumSha256,
        },
        deleteOriginal: false,
      },
    });
    if (processedErr) throw processedErr;

    return { processedStorageKey: processedFinalized?.processedStorageKey ?? fullKey };
  },
};

// Back-compat alias for any intermediate imports.
export const uploadSubmissionPhoto = r2MediaService.uploadOriginalForAnalysis;
