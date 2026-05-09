import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Width = "default" | "narrow" | "reading" | "full";

const widthClasses: Record<Width, string> = {
  default: "max-w-7xl",
  narrow: "max-w-5xl",
  reading: "max-w-3xl",
  full: "max-w-none",
};

interface PageShellProps extends HTMLAttributes<HTMLDivElement> {
  width?: Width;
  /** Adds bottom padding to clear the mobile tab bar. Default true. */
  bottomSafe?: boolean;
  children: ReactNode;
}

/**
 * PageShell — standard width + horizontal padding for authenticated pages.
 *
 * Composes inside DashboardLayout's <main>; provides max-width, page-edge
 * padding, and mobile bottom-tab safe-area padding. Use one per page.
 */
export function PageShell({
  width = "default",
  bottomSafe = true,
  className,
  children,
  ...rest
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        widthClasses[width],
        bottomSafe && "app-shell-bottom-safe",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
