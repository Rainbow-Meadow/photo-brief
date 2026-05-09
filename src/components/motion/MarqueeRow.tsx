import type { ReactNode } from "react";

interface MarqueeRowProps {
  children: ReactNode;
  /** Speed in seconds for one full loop. Lower = faster. */
  duration?: number;
  /** Direction of travel. */
  direction?: "left" | "right";
  className?: string;
}

/**
 * MarqueeRow — infinite horizontal text strip.
 * Pure CSS keyframes (animate-marquee-x) so it never blocks main thread.
 * Honours prefers-reduced-motion via a Tailwind utility on the inner track.
 */
export function MarqueeRow({
  children,
  duration = 40,
  direction = "left",
  className,
}: MarqueeRowProps) {
  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      role="presentation"
      aria-hidden
    >
      <div
        className="flex w-max motion-reduce:animate-none"
        style={{
          animation: `marquee-x ${duration}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
