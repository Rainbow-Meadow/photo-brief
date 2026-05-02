// Customer domain type — maps to public.customers table.

export interface Customer {
  id: string;
  workspaceId: string;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  preferredContactMethod: "email" | "sms" | "both" | "unknown";
  notes: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  lastRequestAt: string | null;
  archivedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  /** Computed on list queries — not stored. */
  requestCount?: number;
}

export interface CustomerInput {
  displayName: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  preferredContactMethod?: Customer["preferredContactMethod"];
  notes?: string | null;
  tags?: string[];
}
