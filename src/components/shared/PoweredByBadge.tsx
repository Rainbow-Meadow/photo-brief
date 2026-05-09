import { Camera } from "lucide-react";
import { BrandMark, type BrandTone } from "@/components/layout/BrandMark";
import { cn } from "@/lib/utils";

interface PoweredByBadgeProps {
  className?: string;
  /** Size of the wordmark in px. Default 48. */
  size?: number;
  /** Surface tone the badge sits on. Defaults to "dark" — the app shell is dark-themed. */
  tone?: BrandTone;
}

/**
 * Reusable "Sent securely with PhotoBrief" attribution badge.
 * Used on recipient confirmation, public pages, and other external surfaces.
 */
export function PoweredByBadge({ className, size = 48, tone = "dark" }: PoweredByBadgeProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground",
        className,
      )}
    >
      <div className="flex items-center justify-center gap-1.5">
        <Camera className="h-3 w-3 shrink-0" />
        <span>Sent securely with</span>
        <BrandMark variant="wordmark" tone={tone} size={size} />
      </div>
      <span className="uppercase tracking-[0.22em] text-[9px] text-current/60">
        Guide · Capture · Close
      </span>
    </div>
  );
}
