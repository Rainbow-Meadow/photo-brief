import { NavLink } from "react-router-dom";
import { Send, ChevronRight, Mail, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/types/customer";
import { formatRelativeTime } from "@/utils/format";
import { cn } from "@/lib/utils";

interface Props {
  customers: Customer[];
  onSendRequest: (c: Customer) => void;
  onView: (c: Customer) => void;
}

export function CustomerTable({ customers, onSendRequest, onView }: Props) {
  return (
    <div className="surface-card divide-y overflow-hidden">
      {customers.map((c) => (
        <div
          key={c.id}
          className={cn(
            "flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30 cursor-pointer",
            c.archivedAt && "opacity-60",
          )}
          onClick={() => onView(c)}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-foreground">
                {c.displayName}
              </p>
              {c.companyName && (
                <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                  <Building2 className="mr-0.5 inline h-3 w-3" />
                  {c.companyName}
                </span>
              )}
              {c.archivedAt && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Archived
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {c.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {c.email}
                </span>
              )}
              {c.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {c.phone}
                </span>
              )}
              {c.lastRequestAt && (
                <span>Last request {formatRelativeTime(c.lastRequestAt)}</span>
              )}
              {(c.requestCount ?? 0) > 0 && (
                <span>{c.requestCount} request{c.requestCount === 1 ? "" : "s"}</span>
              )}
            </div>
            {c.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {c.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
                {c.tags.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{c.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-1 sm:inline-flex"
              onClick={(e) => {
                e.stopPropagation();
                onSendRequest(c);
              }}
            >
              <Send className="h-3.5 w-3.5" /> Send request
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      ))}
    </div>
  );
}
