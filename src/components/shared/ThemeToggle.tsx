import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Props = {
  /** Compact icon-only variant for tight nav bars. */
  compact?: boolean;
  /** Hide the text label while keeping the larger switch affordance. */
  hideLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ compact = false, hideLabel = false, className }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const nextTheme = isDark ? "light" : "dark";

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(nextTheme)}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "group relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-background/70 text-muted-foreground shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className,
        )}
      >
        <span aria-hidden className="absolute inset-0 bg-ambient-sky opacity-0 transition-opacity group-hover:opacity-80" />
        <span className="relative grid h-5 w-5 place-items-center">
          <Sun className={cn("absolute h-4 w-4 transition-all duration-300", isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
          <Moon className={cn("absolute h-4 w-4 transition-all duration-300", isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0")} />
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-2.5 text-sm font-medium text-foreground shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      <span className="relative inline-flex h-6 w-11 items-center rounded-full border border-border/70 bg-muted/80 p-0.5 shadow-inner transition-colors duration-300 group-hover:bg-muted">
        <span
          className={cn(
            "grid h-5 w-5 place-items-center rounded-full bg-card text-primary shadow-sm transition-transform duration-300",
            isDark ? "translate-x-5" : "translate-x-0",
          )}
        >
          <Sun className={cn("absolute h-3.5 w-3.5 transition-all duration-300", isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
          <Moon className={cn("absolute h-3.5 w-3.5 transition-all duration-300", isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0")} />
        </span>
      </span>
      {!hideLabel ? (
        <span className="hidden min-w-[4.3rem] text-left sm:inline">
          {isDark ? "Dark mode" : "Light mode"}
        </span>
      ) : null}
    </button>
  );
}
