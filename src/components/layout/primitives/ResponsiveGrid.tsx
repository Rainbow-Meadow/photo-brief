import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Cols = "1-2" | "1-3" | "1-4" | "sidebar" | "aside";
type Gap = "default" | "compact";

const colClasses: Record<Cols, string> = {
  "1-2": "grid-cols-1 md:grid-cols-2",
  "1-3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  "1-4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  sidebar: "grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]",
  aside: "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]",
};

const gapClasses: Record<Gap, string> = {
  default: "gap-4 sm:gap-5",
  compact: "gap-2 sm:gap-3",
};

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: Cols;
  gap?: Gap;
  children?: ReactNode;
}

/** Standard responsive grid grammar — mobile single-column, scales up. */
export function ResponsiveGrid({
  cols = "1-3",
  gap = "default",
  className,
  children,
  ...rest
}: ResponsiveGridProps) {
  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)} {...rest}>
      {children}
    </div>
  );
}
