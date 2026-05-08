// Verifies a Cloudflare Turnstile token server-side. Called by the React app
// before submitting auth / password-reset / signup actions.
import { corsHeaders } from "../_shared/cors.ts";

interface VerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : null;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "missing_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secret) {
      // No secret configured → treat as open. This keeps preview / staging
      // working before the secret is rolled out.
      console.warn("[verify-turnstile] TURNSTILE_SECRET_KEY not set — returning success");
      return new Response(JSON.stringify({ success: true, configured: false }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "";

    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip.split(",")[0].trim());

    const res = await fetch(VERIFY_URL, { method: "POST", body: form });
    const data = (await res.json()) as VerifyResponse;

    return new Response(
      JSON.stringify({
        success: Boolean(data.success),
        hostname: data.hostname,
        errorCodes: data["error-codes"],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[verify-turnstile] error", err);
    return new Response(JSON.stringify({ success: false, error: "server_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
