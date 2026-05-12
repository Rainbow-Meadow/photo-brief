// TEMPORARY: returns 3 secret values for one-time CF Secrets Store sync. Delete after use.
// Requires Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
Deno.serve(async (req) => {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`;
  if (!auth || auth !== expected) {
    return new Response("forbidden", { status: 403 });
  }
  return Response.json({
    SUPABASE_PUBLISHABLE_KEYS: Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "",
    SUPABASE_SECRET_KEYS: Deno.env.get("SUPABASE_SECRET_KEYS") ?? "",
    SUPABASE_JWKS: Deno.env.get("SUPABASE_JWKS") ?? "",
  });
});
