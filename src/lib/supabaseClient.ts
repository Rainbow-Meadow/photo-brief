// Resilient Supabase client wrapper.
// Re-exports the raw `supabase` client but also provides `withRetry` for
// wrapping any Supabase call in transient-error retry logic.
//
// Usage in services:
//   import { supabase, withRetry } from "@/lib/supabaseClient";
//   const { data, error } = await withRetry(() => supabase.from("x").select("*"));

export { supabase } from "@/integrations/supabase/client";
export { withSupabaseRetry as withRetry } from "@/lib/supabaseRetry";
