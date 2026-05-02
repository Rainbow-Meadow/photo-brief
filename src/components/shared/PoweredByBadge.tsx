import { Camera } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { cn } from "@/lib/utils";

interface PoweredByBadgeProps {
  className?: string;
  /** Size of the wordmark in px. Default 48. */
  size?: number;
}

/**
 * Reusable "Sent securely with PhotoBrief" attribution badge.
 * Used on recipient confirmation, public pages, and other external surfaces.
 */
export function PoweredByBadge({ className, size = 48 }: PoweredByBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <Camera className="h-3 w-3 shrink-0" />
      <span>Sent securely with</span>
      <BrandMark variant="wordmark" tone="auto" size={size} />
    </div>
  );
}
