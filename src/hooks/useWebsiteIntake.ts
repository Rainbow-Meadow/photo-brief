import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { websiteIntakeService, type IntakeField, type IntakeRuleMatchType } from "@/services/websiteIntakeService";

export function useWebsiteIntakeSource() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["website-intake-source", workspace?.id],
    queryFn: () => websiteIntakeService.getOrCreateSource(workspace!.id),
    enabled: !!workspace?.id,
  });
}

export function useWebsiteIntakeMappings(sourceId?: string) {
  return useQuery({
    queryKey: ["website-intake-mappings", sourceId],
    queryFn: () => websiteIntakeService.listMappings(sourceId!),
    enabled: !!sourceId,
  });
}

export function useWebsiteIntakeRules(sourceId?: string) {
  return useQuery({
    queryKey: ["website-intake-rules", sourceId],
    queryFn: () => websiteIntakeService.listRules(sourceId!),
    enabled: !!sourceId,
  });
}

export function useWebsiteIntakeEvents() {
  const { workspace } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["website-intake-events", workspace?.id],
    queryFn: () => websiteIntakeService.listEvents(workspace!.id),
    enabled: !!workspace?.id,
  });
}

export function useUpdateWebsiteIntakeSource() {
  const qc = useQueryClient();
  const { workspace } = useCurrentWorkspace();
  return useMutation({
    mutationFn: (args: Parameters<typeof websiteIntakeService.updateSource>[1] & { id: string }) => {
      const { id, ...patch } = args;
      return websiteIntakeService.updateSource(id, patch);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-intake-source", workspace?.id] });
    },
  });
}

export function useSaveWebsiteIntakeMappings(sourceId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mappings: Array<{ photobriefField: IntakeField; externalField: string }>) =>
      websiteIntakeService.saveMappings(sourceId!, mappings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-intake-mappings", sourceId] });
    },
  });
}

export function useCreateWebsiteIntakeRule(sourceId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { matchType: IntakeRuleMatchType; matchValue: string; guideId: string; priority: number }) =>
      websiteIntakeService.createRule({ sourceId: sourceId!, ...input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-intake-rules", sourceId] });
    },
  });
}

export function useDeleteWebsiteIntakeRule(sourceId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => websiteIntakeService.deleteRule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-intake-rules", sourceId] });
    },
  });
}

export function useSendWebsiteIntakeTest() {
  const qc = useQueryClient();
  const { workspace } = useCurrentWorkspace();
  return useMutation({
    mutationFn: ({ publicToken, payload }: { publicToken: string; payload: Record<string, unknown> }) =>
      websiteIntakeService.sendTest(publicToken, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["website-intake-events", workspace?.id] });
      qc.invalidateQueries({ queryKey: ["requests", workspace?.id] });
      qc.invalidateQueries({ queryKey: ["customers", workspace?.id] });
    },
  });
}
