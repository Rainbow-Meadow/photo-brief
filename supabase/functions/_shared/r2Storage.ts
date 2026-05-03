import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID") ?? "";
const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID") ?? "";
const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "";
export const R2_BUCKET_NAME = Deno.env.get("R2_BUCKET_NAME") ?? "photobrief-media";

function assertConfigured() {
  const missing = [
    ["R2_ACCOUNT_ID", R2_ACCOUNT_ID],
    ["R2_ACCESS_KEY_ID", R2_ACCESS_KEY_ID],
    ["R2_SECRET_ACCESS_KEY", R2_SECRET_ACCESS_KEY],
    ["R2_BUCKET_NAME", R2_BUCKET_NAME],
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) {
    throw new Error(`R2 is not configured. Missing: ${missing.join(", ")}`);
  }
}

function r2Client() {
  assertConfigured();
  return new AwsClient({
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    service: "s3",
    region: "auto",
  });
}

function endpointForKey(key: string) {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${encoded}`;
}

export function buildTempOriginalKey(args: {
  workspaceId: string;
  requestId: string;
  submissionId: string;
  mediaId: string;
  ext?: string | null;
}) {
  const ext = sanitizeExt(args.ext ?? "bin");
  return `temp/${args.workspaceId}/${args.requestId}/${args.submissionId}/${args.mediaId}/original.${ext}`;
}

export function buildProcessedKey(args: {
  workspaceId: string;
  requestId: string;
  submissionId: string;
  mediaId: string;
  variant?: "full" | "preview" | "thumb";
}) {
  return `submissions/${args.workspaceId}/${args.requestId}/${args.submissionId}/${args.mediaId}/${args.variant ?? "full"}.webp`;
}

export function sanitizeExt(ext: string) {
  const clean = ext.toLowerCase().replace(/^\./, "").replace(/[^a-z0-9]/g, "");
  if (clean === "jpeg") return "jpg";
  return clean || "bin";
}

export async function presignR2Url(args: {
  key: string;
  method: "GET" | "PUT" | "HEAD" | "DELETE";
  expiresSeconds?: number;
  contentType?: string | null;
}) {
  const client = r2Client();
  const headers = new Headers();
  if (args.contentType) headers.set("content-type", args.contentType);
  const request = new Request(endpointForKey(args.key), {
    method: args.method,
    headers,
  });
  const signed = await client.sign(request, {
    aws: {
      signQuery: true,
      allHeaders: false,
      datetime: new Date(),
      expires: args.expiresSeconds ?? 900,
    },
  });
  return signed.url;
}

export async function headR2Object(key: string) {
  const client = r2Client();
  const signed = await client.sign(new Request(endpointForKey(key), { method: "HEAD" }));
  const res = await fetch(signed);
  if (!res.ok) {
    return null;
  }
  return {
    contentType: res.headers.get("content-type"),
    contentLength: Number(res.headers.get("content-length") ?? 0),
    etag: res.headers.get("etag")?.replace(/^\"|\"$/g, "") ?? null,
  };
}

export async function deleteR2Object(key: string) {
  const client = r2Client();
  const signed = await client.sign(new Request(endpointForKey(key), { method: "DELETE" }));
  const res = await fetch(signed);
  if (!res.ok && res.status !== 404) {
    throw new Error(`Failed to delete R2 object ${key}: ${res.status}`);
  }
}
