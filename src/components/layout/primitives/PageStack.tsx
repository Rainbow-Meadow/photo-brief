import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Gap = "default" | "compact" | "relaxed";

const gapClasses: Record<Gap, string> = {
  default: "space-y-5 sm:space-y-7",
  compact: "space-y-3 sm:space-y-4",
  relaxed: "space-y-7 sm:space-y-10",
};

interface PageStackProps extends HTMLAttributes<HTMLDivElement> {
  gap?: Gap;
  children: ReactNode;
}

/** Vertical rhythm between page modules. */
export function PageStack({ gap = "default", className, children, ...rest }: PageStackProps) {
  return (
    <div className={cn(gapClasses[gap], className)} {...rest}>
      {children}
    </div>
  );
}
