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
  publicUrl: string;
  storagePath: string;
  processedStorageKey?: string | null;
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

function withContentType(url: string, contentType: string) {
  // Signed R2 URLs include the signed header set. The server signs with the
  // intended content type, so keep PUT headers exactly aligned with it.
  return { url, contentType };
}

export const r2MediaService = {
  async uploadSubmissionPhoto(args: CreateUploadArgs): Promise<R2UploadResult> {
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

    const originalUpload = withContentType(created.uploadUrl, contentType);
    await putObject(originalUpload.url, args.file, originalUpload.contentType);

    // Make the original available to AI immediately. This validates the upload
    // and returns a short-lived signed read URL.
    const { data: originalFinalized, error: originalErr } = await client.functions.invoke("finalize-media-upload", {
      body: { capturedMediaId: created.capturedMediaId },
    });
    if (originalErr) throw originalErr;
    if (!originalFinalized?.aiReadUrl) {
      throw new Error("finalize-media-upload did not return an AI read URL");
    }

    // Convert after original upload/validation. If conversion fails, keep the
    // original available for AI and mark the media as uploaded_original; the
    // reviewer still has a usable submission.
    try {
      const variants = await convertImageToWebpVariants(args.file);
      const fullKey = `submissions/${args.workspaceId}/${args.requestId}/${created.submissionId}/${created.capturedMediaId}/full.webp`;
      const previewKey = `submissions/${args.workspaceId}/${args.requestId}/${created.submissionId}/${created.capturedMediaId}/preview.webp`;
      const thumbKey = `submissions/${args.workspaceId}/${args.requestId}/${created.submissionId}/${created.capturedMediaId}/thumb.webp`;

      const uploadVariant = async (key: string, blob: Blob) => {
        const { data, error } = await client.functions.invoke("get-media-upload-url", {
          body: { key, contentType: "image/webp" },
        });
        if (error) throw error;
        if (!data?.uploadUrl) throw new Error("Missing signed variant upload URL");
        await putObject(data.uploadUrl, blob, "image/webp");
      };

      await Promise.all([
        uploadVariant(fullKey, variants.full.blob),
        uploadVariant(previewKey, variants.preview.blob),
        uploadVariant(thumbKey, variants.thumb.blob),
      ]);

      const { data: processedFinalized, error: processedErr } = await client.functions.invoke("finalize-media-upload", {
        body: {
          capturedMediaId: created.capturedMediaId,
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

      return {
        submissionId: created.submissionId,
        capturedMediaId: created.capturedMediaId,
        publicUrl: originalFinalized.aiReadUrl,
        storagePath: processedFinalized?.processedStorageKey ?? fullKey,
        processedStorageKey: processedFinalized?.processedStorageKey ?? fullKey,
      };
    } catch (err) {
      console.warn("WebP conversion/upload failed; continuing with original", err);
      return {
        submissionId: created.submissionId,
        capturedMediaId: created.capturedMediaId,
        publicUrl: originalFinalized.aiReadUrl,
        storagePath: created.originalStorageKey,
        processedStorageKey: null,
      };
    }
  },
};
