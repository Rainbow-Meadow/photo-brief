import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Users, Archive } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCustomers } from "@/hooks/useCustomers";
import { CustomerTable } from "@/features/customers/components/CustomerTable";
import { CustomerFormDialog } from "@/features/customers/components/CustomerFormDialog";
import { trackEvent } from "@/lib/analytics";

export default function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [formOpen, setFormOpen] = useState(false);

  const { data: customers, isLoading } = useCustomers({
    search: search || undefined,
    includeArchived: showArchived,
    sortBy,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Manage your contacts and send requests faster."
        actions={
          <Button size="sm" className="gap-1.5" onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> New customer
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-lg border bg-card px-3 py-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">Recently used</option>
            <option value="name">Name</option>
            <option value="created">Newest</option>
          </select>
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowArchived((v) => !v)}
          >
            <Archive className="h-3.5 w-3.5" />
            {showArchived ? "Showing archived" : "Archived"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !customers || customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No customers match your search" : "No customers yet"}
          description={
            search
              ? "Try a different search term."
              : "Save customer profiles to send requests faster and track request history."
          }
          size="lg"
          action={
            !search ? (
              <Button className="gap-1.5" onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" /> Add your first customer
              </Button>
            ) : undefined
          }
        />
      ) : (
        <CustomerTable
          customers={customers}
          onSendRequest={(c) => navigate(`/requests/new?customerId=${c.id}`)}
          onView={(c) => navigate(`/customers/${c.id}`)}
        />
      )}

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={(c) => {
          trackEvent("customer_created", { customer_id: c.id });
          setFormOpen(false);
        }}
      />
    </div>
  );
}
