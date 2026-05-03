#!/usr/bin/env node

const DOMAIN = process.env.CF_AUDIT_DOMAIN || "photobrief.ai";
const BUCKET = process.env.R2_BUCKET_NAME || "photobrief-media";
const TOKEN =
  process.env.CLOUDFLARE_API_TOKEN ||
  process.env.CLOUDFLARE_API_KEY ||
  process.env.CF_API_TOKEN ||
  process.env.CF_API_KEY;
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL;

if (!TOKEN) {
  console.error("Missing Cloudflare token. Set CLOUDFLARE_API_TOKEN, CLOUDFLARE_API_KEY, CF_API_TOKEN, or CF_API_KEY as a repository secret.");
  process.exit(2);
}

const authHeaders = TOKEN.startsWith("Bearer ") || TOKEN.startsWith("ey")
  ? { Authorization: TOKEN.startsWith("Bearer ") ? TOKEN : `Bearer ${TOKEN}` }
  : EMAIL
    ? { "X-Auth-Email": EMAIL, "X-Auth-Key": TOKEN }
    : { Authorization: `Bearer ${TOKEN}` };

const headers = { ...authHeaders, "Content-Type": "application/json" };

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers || {}) },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const errors = Array.isArray(json.errors) ? json.errors.map((e) => e.message).join("; ") : res.statusText;
    throw new Error(`Cloudflare API ${path} failed: ${res.status} ${errors}`);
  }
  return json.result;
}

async function main() {
  const accounts = await cf("/accounts?per_page=50");
  if (!accounts?.length) throw new Error("No Cloudflare accounts available for token");
  const account = accounts[0];
  const accountId = account.id;

  const existingBuckets = await cf(`/accounts/${accountId}/r2/buckets`);
  const buckets = existingBuckets?.buckets ?? existingBuckets ?? [];
  const exists = buckets.some((b) => b.name === BUCKET);
  if (!exists) {
    await cf(`/accounts/${accountId}/r2/buckets`, {
      method: "POST",
      body: JSON.stringify({ name: BUCKET, storage_class: "Standard" }),
    });
  }

  const cors = {
    rules: [
      {
        id: "photobrief-browser-uploads-and-reads",
        allowed: {
          methods: ["GET", "HEAD", "PUT"],
          origins: [
            `https://${DOMAIN}`,
            `https://www.${DOMAIN}`,
            "http://localhost:5173",
            "http://localhost:8080"
          ],
          headers: ["content-type", "content-length", "x-amz-content-sha256", "x-amz-date", "authorization"]
        },
        exposeHeaders: ["etag", "content-length", "content-type"],
        maxAgeSeconds: 7200
      }
    ]
  };

  await cf(`/accounts/${accountId}/r2/buckets/${encodeURIComponent(BUCKET)}/cors`, {
    method: "PUT",
    body: JSON.stringify(cors),
  });

  const lifecycle = {
    rules: [
      {
        id: "expire-temp-originals",
        enabled: true,
        conditions: { prefix: "temp/" },
        deleteObjectsTransition: { condition: { type: "Age", maxAge: 259200 } },
        abortMultipartUploadsTransition: { condition: { type: "Age", maxAge: 86400 } }
      },
      {
        id: "expire-failed-processing",
        enabled: true,
        conditions: { prefix: "failed-processing/" },
        deleteObjectsTransition: { condition: { type: "Age", maxAge: 1209600 } }
      }
    ]
  };

  await cf(`/accounts/${accountId}/r2/buckets/${encodeURIComponent(BUCKET)}/lifecycle`, {
    method: "PUT",
    body: JSON.stringify(lifecycle),
  });

  const bucket = await cf(`/accounts/${accountId}/r2/buckets/${encodeURIComponent(BUCKET)}`);
  const finalCors = await cf(`/accounts/${accountId}/r2/buckets/${encodeURIComponent(BUCKET)}/cors`);
  const finalLifecycle = await cf(`/accounts/${accountId}/r2/buckets/${encodeURIComponent(BUCKET)}/lifecycle`);

  console.log(JSON.stringify({
    ok: true,
    account: { id: accountId, name: account.name },
    bucket,
    cors: finalCors,
    lifecycle: finalLifecycle,
    next_required_runtime_secrets: [
      "R2_ACCOUNT_ID",
      "R2_ACCESS_KEY_ID",
      "R2_SECRET_ACCESS_KEY",
      "R2_BUCKET_NAME=photobrief-media"
    ]
  }, null, 2));
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
