import { supabase } from "@/integrations/supabase/client";
import { withSupabaseRetry as withRetry } from "@/lib/supabaseRetry";
import type { Customer, CustomerInput } from "@/types/customer";

function toDomain(row: any): Customer {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    displayName: row.display_name,
    companyName: row.company_name ?? null,
    email: row.email ?? null,
    phone: row.phone ?? null,
    preferredContactMethod: row.preferred_contact_method ?? "unknown",
    notes: row.notes ?? null,
    tags: row.tags ?? [],
    metadata: row.metadata ?? {},
    lastRequestAt: row.last_request_at ?? null,
    archivedAt: row.archived_at ?? null,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    requestCount: row.request_count ?? undefined,
  };
}

export const customersService = {
  async list(
    workspaceId: string,
    opts?: { search?: string; includeArchived?: boolean; sortBy?: string },
  ): Promise<Customer[]> {
    let q = supabase
      .from("customers")
      .select("*, photo_brief_requests(count)")
      .eq("workspace_id", workspaceId);

    if (!opts?.includeArchived) {
      q = q.is("archived_at", null);
    }

    if (opts?.search) {
      const s = `%${opts.search}%`;
      q = q.or(
        `display_name.ilike.${s},company_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`,
      );
    }

    if (opts?.sortBy === "name") {
      q = q.order("display_name", { ascending: true });
    } else if (opts?.sortBy === "created") {
      q = q.order("created_at", { ascending: false });
    } else {
      q = q.order("last_request_at", { ascending: false, nullsFirst: false })
           .order("created_at", { ascending: false });
    }

    const { data, error } = await withRetry(async () => await q.limit(200));
    if (error) throw error;

    return (data ?? []).map((row: any) => {
      const r = toDomain(row);
      const countArr = row.photo_brief_requests;
      r.requestCount =
        Array.isArray(countArr) && countArr.length > 0
          ? countArr[0]?.count ?? 0
          : 0;
      return r;
    });
  },

  async getById(id: string): Promise<Customer | null> {
    const { data, error } = await withRetry(async () =>
      await supabase
        .from("customers")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );
    if (error) throw error;
    if (!data) return null;
    return toDomain(data);
  },

  async create(workspaceId: string, input: CustomerInput): Promise<Customer> {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("customers")
      .insert({
        workspace_id: workspaceId,
        display_name: input.displayName.trim(),
        company_name: input.companyName?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        preferred_contact_method: input.preferredContactMethod ?? "unknown",
        notes: input.notes?.trim() || null,
        tags: input.tags ?? [],
        created_by: user.user?.id ?? null,
      } as any)
      .select("*")
      .single();
    if (error) throw error;
    return toDomain(data);
  },

  async update(id: string, input: Partial<CustomerInput>): Promise<Customer> {
    const payload: Record<string, unknown> = {};
    if (input.displayName !== undefined) payload.display_name = input.displayName.trim();
    if (input.companyName !== undefined) payload.company_name = input.companyName?.trim() || null;
    if (input.email !== undefined) payload.email = input.email?.trim() || null;
    if (input.phone !== undefined) payload.phone = input.phone?.trim() || null;
    if (input.preferredContactMethod !== undefined)
      payload.preferred_contact_method = input.preferredContactMethod;
    if (input.notes !== undefined) payload.notes = input.notes?.trim() || null;
    if (input.tags !== undefined) payload.tags = input.tags;

    const { data, error } = await supabase
      .from("customers")
      .update(payload as any)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toDomain(data);
  },

  async archive(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({ archived_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) throw error;
  },

  async unarchive(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({ archived_at: null } as any)
      .eq("id", id);
    if (error) throw error;
  },

  async updateLastRequestAt(id: string): Promise<void> {
    const { error } = await supabase
      .from("customers")
      .update({ last_request_at: new Date().toISOString() } as any)
      .eq("id", id);
    if (error) throw error;
  },

  async checkDuplicate(
    workspaceId: string,
    field: "email" | "phone",
    value: string,
    excludeId?: string,
  ): Promise<Customer | null> {
    let q = supabase
      .from("customers")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("archived_at", null);

    if (field === "email") {
      q = q.ilike("email", value.trim());
    } else {
      q = q.eq("phone", value.trim());
    }

    if (excludeId) q = q.neq("id", excludeId);

    const { data, error } = await q.limit(1).maybeSingle();
    if (error) throw error;
    return data ? toDomain(data) : null;
  },
};
