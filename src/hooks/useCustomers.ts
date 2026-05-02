import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "@/services/customersService";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import type { Customer, CustomerInput } from "@/types/customer";

export function useCustomers(opts?: {
  search?: string;
  includeArchived?: boolean;
  sortBy?: string;
}) {
  const { workspace } = useCurrentWorkspace();
  const wsId = workspace?.id;

  return useQuery({
    queryKey: ["customers", wsId, opts?.search, opts?.includeArchived, opts?.sortBy],
    queryFn: () => customersService.list(wsId!, opts),
    enabled: !!wsId,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersService.getById(id!),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  const { workspace } = useCurrentWorkspace();

  return useMutation({
    mutationFn: (input: CustomerInput) =>
      customersService.create(workspace!.id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers", workspace?.id] });
    },
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  const { workspace } = useCurrentWorkspace();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CustomerInput> }) =>
      customersService.update(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["customers", workspace?.id] });
      qc.invalidateQueries({ queryKey: ["customer", vars.id] });
    },
  });
}

export function useArchiveCustomer() {
  const qc = useQueryClient();
  const { workspace } = useCurrentWorkspace();

  return useMutation({
    mutationFn: (id: string) => customersService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers", workspace?.id] });
    },
  });
}
