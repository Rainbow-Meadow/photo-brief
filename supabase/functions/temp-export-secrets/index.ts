// TEMPORARY: returns 3 secret values for one-time CF Secrets Store sync. Delete after use.
// Gated by gateway JWT (verify_jwt=true).
Deno.serve(() => Response.json({
  SUPABASE_PUBLISHABLE_KEYS: Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "",
  SUPABASE_SECRET_KEYS: Deno.env.get("SUPABASE_SECRET_KEYS") ?? "",
  SUPABASE_JWKS: Deno.env.get("SUPABASE_JWKS") ?? "",
}));
