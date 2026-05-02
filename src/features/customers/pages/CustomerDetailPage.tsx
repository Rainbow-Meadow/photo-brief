import { useState } from "react";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Send,
  Pencil,
  Archive,
  ArchiveRestore,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useCustomer, useArchiveCustomer } from "@/hooks/useCustomers";
import { CustomerFormDialog } from "@/features/customers/components/CustomerFormDialog";
import { CustomerRequestHistory } from "@/features/customers/components/CustomerRequestHistory";
import { trackEvent } from "@/lib/analytics";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useCustomer(customerId);
  const archiveMutation = useArchiveCustomer();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <NavLink to="/customers">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to customers
          </NavLink>
        </Button>
      </div>
    );
  }

  const isArchived = !!customer.archivedAt;
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handleArchive = async () => {
    try {
      if (isArchived) {
        const { customersService } = await import("@/services/customersService");
        await customersService.unarchive(customer.id);
        toast.success("Customer restored");
      } else {
        await archiveMutation.mutateAsync(customer.id);
        trackEvent("customer_archived", { customer_id: customer.id });
        toast.success("Customer archived");
      }
    } catch {
      toast.error("Could not update customer");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.displayName}
        eyebrow={
          <NavLink
            to="/customers"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Customers
          </NavLink>
        }
        description={customer.companyName ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => navigate(`/requests/new?customerId=${customer.id}`)}
            >
              <Send className="h-4 w-4" /> Send request
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={handleArchive}
            >
              {isArchived ? (
                <><ArchiveRestore className="h-4 w-4" /> Restore</>
              ) : (
                <><Archive className="h-4 w-4" /> Archive</>
              )}
            </Button>
          </div>
        }
      />

      {isArchived && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2 text-sm text-warning">
          This customer has been archived.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact info card */}
        <div className="surface-card space-y-4 p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-foreground">Contact info</h2>

          {customer.email && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(customer.email!, "Email")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {customer.phone && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(customer.phone!, "Phone")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          {customer.companyName && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{customer.companyName}</span>
            </div>
          )}

          {!customer.email && !customer.phone && (
            <p className="text-xs text-muted-foreground">No contact details added.</p>
          )}

          {customer.preferredContactMethod !== "unknown" && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">Preferred contact</p>
              <StatusBadge
                label={customer.preferredContactMethod}
                tone="info"
              />
            </div>
          )}

          {customer.tags.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          <div className="pt-2 text-xs text-muted-foreground space-y-0.5">
            <p>Added {formatRelativeTime(customer.createdAt)}</p>
            {customer.lastRequestAt && (
              <p>Last request {formatRelativeTime(customer.lastRequestAt)}</p>
            )}
          </div>
        </div>

        {/* Request history */}
        <div className="lg:col-span-2">
          <CustomerRequestHistory customerId={customer.id} />
        </div>
      </div>

      <CustomerFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
        onSuccess={() => {
          trackEvent("customer_updated", { customer_id: customer.id });
          setEditOpen(false);
        }}
      />
    </div>
  );
}
