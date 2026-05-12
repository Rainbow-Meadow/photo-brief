// One-off admin: applies the R2 bucket CORS policy via the Cloudflare API.
// Reads CLOUDFLARE_API_TOKEN, R2_ACCOUNT_ID, R2_BUCKET_NAME from env.
// Safe to call once and delete.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const token = Deno.env.get("CLOUDFLARE_API_TOKEN");
  const accountId = Deno.env.get("R2_ACCOUNT_ID");
  const bucket = Deno.env.get("R2_BUCKET_NAME") ?? "photobrief-media";
  if (!token || !accountId) {
    return json({ error: "Missing CLOUDFLARE_API_TOKEN or R2_ACCOUNT_ID" }, 500);
  }

  const policy = {
    rules: [
      {
        allowed: {
          origins: [
            "https://*.lovableproject.com",
            "https://*.lovable.app",
            "https://*.lovable.dev",
            "https://photobrief.ai",
            "https://www.photobrief.ai",
            "https://photo-brief.lovable.app",
            "http://localhost:5173",
            "http://localhost:8080",
          ],
          methods: ["GET", "PUT", "HEAD", "POST", "DELETE"],
          headers: ["*"],
        },
        exposeHeaders: ["ETag"],
        maxAgeSeconds: 3600,
      },
    ],
  };

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucket}/cors`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(policy),
  });
  const body = await res.text();
  return json({ status: res.status, body, sentPolicy: policy }, res.ok ? 200 : res.status);
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
