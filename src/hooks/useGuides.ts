import { useQuery } from "@tanstack/react-query";
import { guidesService } from "@/services/guidesService";
import type { PhotoGuide } from "@/types/photobrief";

/** Custom guides saved to the current workspace. */
export function useWorkspaceGuides(workspaceId: string | null | undefined) {
  return useQuery({
    queryKey: ["workspace-guides", workspaceId ?? null],
    queryFn: async () => {
      if (!workspaceId) return [] as PhotoGuide[];
      return guidesService.listForWorkspace(workspaceId).then((all) =>
        all.filter((g) => g.workspaceId === workspaceId),
      );
    },
    enabled: !!workspaceId,
  });
}

/** Async lookup: tries local templates first, then DB. */
export function useGuideAsync(id: string | undefined) {
  return useQuery({
    queryKey: ["guide", id ?? null],
    queryFn: async () => (id ? guidesService.getByIdAsync(id) : null),
    enabled: !!id,
  });
}
