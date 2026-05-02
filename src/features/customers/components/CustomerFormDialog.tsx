import { useState, useEffect } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import type { Customer, CustomerInput } from "@/types/customer";
import { toast } from "sonner";

const schema = z.object({
  displayName: z.string().trim().min(1, "Name is required").max(100),
  companyName: z.string().max(100).optional(),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().max(30).optional(),
  preferredContactMethod: z.enum(["email", "sms", "both", "unknown"]).optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string()).optional(),
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSuccess: (c: Customer) => void;
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSuccess }: Props) {
  const isEdit = !!customer;
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  const [form, setForm] = useState({
    displayName: "",
    companyName: "",
    email: "",
    phone: "",
    preferredContactMethod: "unknown" as Customer["preferredContactMethod"],
    notes: "",
    tagsInput: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && customer) {
      setForm({
        displayName: customer.displayName,
        companyName: customer.companyName ?? "",
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        preferredContactMethod: customer.preferredContactMethod,
        notes: customer.notes ?? "",
        tagsInput: customer.tags.join(", "),
      });
    } else if (open) {
      setForm({
        displayName: "",
        companyName: "",
        email: "",
        phone: "",
        preferredContactMethod: "unknown",
        notes: "",
        tagsInput: "",
      });
    }
    setErrors({});
  }, [open, customer]);

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const tags = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const input: CustomerInput = {
      displayName: form.displayName,
      companyName: form.companyName || null,
      email: form.email || null,
      phone: form.phone || null,
      preferredContactMethod: form.preferredContactMethod,
      notes: form.notes || null,
      tags,
    };

    const result = schema.safeParse(input);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      let saved: Customer;
      if (isEdit) {
        saved = await updateMutation.mutateAsync({ id: customer.id, input });
      } else {
        saved = await createMutation.mutateAsync(input);
      }
      toast.success(isEdit ? "Customer updated" : "Customer created");
      onSuccess(saved);
    } catch (err: any) {
      const msg = err?.message ?? "Could not save customer";
      if (msg.includes("idx_customers_ws_email_unique")) {
        setErrors({ email: "Another customer with this email already exists." });
      } else if (msg.includes("idx_customers_ws_phone_unique")) {
        setErrors({ phone: "Another customer with this phone already exists." });
      } else {
        toast.error(msg);
      }
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "New customer"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this customer's details."
              : "Save a customer profile to send requests faster."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Name *</Label>
            <Input
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="e.g. Maria Alvarez"
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Company</Label>
            <Input
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="555-0142"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Preferred contact method</Label>
            <select
              className="w-full rounded-lg border bg-card px-3 py-2 text-sm"
              value={form.preferredContactMethod}
              onChange={(e) =>
                set("preferredContactMethod", e.target.value)
              }
            >
              <option value="unknown">Not specified</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label>Tags</Label>
            <Input
              value={form.tagsInput}
              onChange={(e) => set("tagsInput", e.target.value)}
              placeholder="e.g. VIP, residential (comma-separated)"
            />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes about this customer…"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
