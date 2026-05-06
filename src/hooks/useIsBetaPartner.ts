import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns true if the current workspace is an active beta partner.
 * Queries beta_workspace_profiles; returns false if not found or not active.
 */
export function useIsBetaPartner(workspaceId: string | undefined): boolean {
  const [isBeta, setIsBeta] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setIsBeta(false);
      return;
    }

    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("beta_workspace_profiles")
        .select("is_beta_partner, beta_status")
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (!cancelled) {
        setIsBeta(
          !!data?.is_beta_partner &&
            (!data.beta_status || !["churned"].includes(data.beta_status as string))
        );
      }
    })();

    return () => { cancelled = true; };
  }, [workspaceId]);

  return isBeta;
}
