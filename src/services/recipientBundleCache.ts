// Best-effort recipient bundle cache invalidation.
//
// When a contractor edits a sent request, brand profile, or attached guide,
// the public /r/:token bundle cached at the Cloudflare edge becomes stale.
// We POST to a Supabase Edge Function (`invalidate-recipient-bundle`) which
// holds the service-role token and forwards the invalidation to the
// assistant-agent worker.
//
// All failures are swallowed — the bundle's 1h TTL ensures eventual
// consistency even if invalidation fails.

import { supabase } from "@/integrations/supabase/client";

export async function invalidateRecipientBundle(token: string | null | undefined): Promise<void> {
  if (!token) return;
  try {
    await supabase.functions.invoke("invalidate-recipient-bundle", {
      body: { token },
    });
  } catch {
    // Cache will expire on its own.
  }
}

/** Invalidate every token belonging to a workspace (brand-profile changes). */
export async function invalidateRecipientBundlesForWorkspace(workspaceId: string | null | undefined): Promise<void> {
  if (!workspaceId) return;
  try {
    await supabase.functions.invoke("invalidate-recipient-bundle", {
      body: { workspace_id: workspaceId },
    });
  } catch {
    // Cache will expire on its own.
  }
}

/** Invalidate every token tied to a particular guide (guide edits). */
export async function invalidateRecipientBundlesForGuide(guideId: string | null | undefined): Promise<void> {
  if (!guideId) return;
  try {
    await supabase.functions.invoke("invalidate-recipient-bundle", {
      body: { guide_id: guideId },
    });
  } catch {
    // Cache will expire on its own.
  }
}
