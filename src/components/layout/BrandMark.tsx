import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type BrandVariant = "horizontal" | "stacked" | "wordmark" | "mark" | "primary";
export type BrandTone = "auto" | "light" | "dark" | "color";

interface BrandMarkProps {
  className?: string;
  /** Which lockup to render. Defaults to "horizontal". */
  variant?: BrandVariant;
  /** Kept for compatibility. The mark is full color and transparent on all surfaces. */
  tone?: BrandTone;
  /** Visual height in px. Defaults to 28. */
  size?: number;
  /** Drop a soft brand glow behind the mark — for dark hero placements. */
  withGlow?: boolean;
  /** Kept for API parity with the old image-based implementation. */
  eager?: boolean;
  /** @deprecated Use `variant="mark"` instead. */
  markOnly?: boolean;
  /** @deprecated Use `tone="light"` instead. */
  invert?: boolean;
}

const ALT = "PhotoBrief.ai";
const MARK_SRC = "/brand/mark-color.png";
const WORDMARK = "PhotoBrief.ai";
const WORDMARK_GRADIENT =
  "var(--pb-wordmark-gradient, linear-gradient(135deg, #f6f0ff 0%, #e7d4ff 24%, #c99aff 52%, #9f73ff 78%, #7f55ff 100%))";

function MarkImage({ size, withGlow, eager }: { size: number; withGlow: boolean; eager?: boolean }) {
  return (
    <img
      src={MARK_SRC}
      alt=""
      aria-hidden="true"
      className={cn(
        "block select-none object-contain shrink-0",
        withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
      )}
      style={{ height: size, width: size } satisfies CSSProperties}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function Wordmark({ size, compact = false }: { size: number; compact?: boolean }) {
  return (
    <span
      className="font-extrabold leading-none bg-clip-text text-transparent whitespace-nowrap"
      style={{
        fontSize: size,
        letterSpacing: compact ? "-0.06em" : "-0.055em",
        backgroundImage: WORDMARK_GRADIENT,
      }}
    >
      {WORDMARK}
    </span>
  );
}

export function BrandMark({
  className,
  variant,
  size = 28,
  withGlow = false,
  eager,
  markOnly,
}: BrandMarkProps) {
  const resolvedVariant: BrandVariant = variant ?? (markOnly ? "mark" : "horizontal");

  if (resolvedVariant === "mark" || resolvedVariant === "primary") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center justify-center", className)}>
        <MarkImage size={size} withGlow={withGlow} eager={eager} />
      </span>
    );
  }

  if (resolvedVariant === "wordmark") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center min-w-0", className)}>
        <Wordmark size={size} />
      </span>
    );
  }

  if (resolvedVariant === "stacked") {
    return (
      <span
        role="img"
        aria-label={ALT}
        className={cn("inline-flex flex-col items-center justify-center gap-2 min-w-0", className)}
      >
        <MarkImage size={size} withGlow={withGlow} eager={eager} />
        <Wordmark size={Math.max(14, size * 0.26)} />
      </span>
    );
  }

  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-2.5 min-w-0", className)}>
      <MarkImage size={size} withGlow={withGlow} eager={eager} />
      <Wordmark size={Math.max(16, size * 0.72)} compact />
    </span>
  );
}
