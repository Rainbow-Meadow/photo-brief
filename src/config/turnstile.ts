// Cloudflare Turnstile public site key (publishable, safe to commit).
// Provisioned via Cloudflare API for photobrief.ai + www + app + lovable origin.
// The matching secret key lives in Supabase secrets as TURNSTILE_SECRET_KEY
// and is consumed by the `verify-turnstile` edge function.
export const TURNSTILE_SITE_KEY = "0x4AAAAAADLeoX-pwh89Xmh6";

// Server-side verification helper. Returns true on success. Falls back to
// `true` (open) when no token is provided in dev/preview to avoid blocking
// Lovable preview flows where the script may not have loaded yet.
import { supabase } from "@/integrations/supabase/client";

export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { data, error } = await supabase.functions.invoke("verify-turnstile", {
      body: { token },
    });
    if (error) return false;
    return Boolean((data as { success?: boolean })?.success);
  } catch {
    return false;
  }
}
