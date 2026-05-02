import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { Inbox, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { requestStatusOptions } from "@/config/statusOptions";
import { formatRelativeTime } from "@/utils/format";

interface Props {
  customerId: string;
}

export function CustomerRequestHistory({ customerId }: Props) {
  const { data: requests, isLoading } = useQuery({
    queryKey: ["customer-requests", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("photo_brief_requests")
        .select("id, recipient_name, status, created_at, updated_at, guide_id, photo_guides(name)")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        id: r.id,
        recipientName: r.recipient_name ?? "",
        status: r.status,
        guideName: r.photo_guides?.name ?? "",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    },
    enabled: !!customerId,
  });

  return (
    <div className="surface-card overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 hairline-b">
        <h2 className="text-sm font-semibold text-foreground">Request history</h2>
        {requests && requests.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {requests.length} request{requests.length === 1 ? "" : "s"}
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-2 px-5 py-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No requests yet"
          description="Send a request to this customer to see their history here."
          compact
        />
      ) : (
        <ul className="divide-y">
          {requests.map((r) => {
            const statusOpt = requestStatusOptions[r.status as keyof typeof requestStatusOptions];
            return (
              <li key={r.id}>
                <NavLink
                  to={`/requests/${r.id}`}
                  className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {r.guideName || "Request"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusOpt && (
                      <StatusBadge label={statusOpt.label} tone={statusOpt.tone} />
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
