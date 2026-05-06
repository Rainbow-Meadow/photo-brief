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
  /** Kept for API parity with the old image-based implementation. */
  eager?: boolean;
}

const ALT = "PhotoBrief.ai";
const MARK_SRC = "/brand/mark-color.webp";
const MARK_FALLBACK = "/brand/mark-color.png";
const WORDMARK = "PhotoBrief.ai";
const WORDMARK_GRADIENT =
  "var(--pb-wordmark-gradient, linear-gradient(135deg, #f6f0ff 0%, #e7d4ff 24%, #c99aff 52%, #9f73ff 78%, #7f55ff 100%))";

function MarkImage({ size, eager }: { size: number; eager?: boolean }) {
  const imgClass = "block select-none object-contain shrink-0";
  const imgStyle = { height: size, width: size } satisfies CSSProperties;

  return (
    <picture>
      <source srcSet={MARK_SRC} type="image/webp" />
      <img
        src={MARK_FALLBACK}
        alt=""
        aria-hidden="true"
        className={imgClass}
        style={imgStyle}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width={size}
        height={size}
      />
    </picture>
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
  variant = "horizontal",
  size = 28,
  eager,
}: BrandMarkProps) {
  const resolvedVariant: BrandVariant = variant;

  if (resolvedVariant === "mark" || resolvedVariant === "primary") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center justify-center", className)}>
        <MarkImage size={size} eager={eager} />
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
        <MarkImage size={size} eager={eager} />
        <Wordmark size={Math.max(14, size * 0.26)} />
      </span>
    );
  }

  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-2.5 min-w-0", className)}>
      <MarkImage size={size} eager={eager} />
      <Wordmark size={Math.max(16, size * 0.72)} compact />
    </span>
  );
}
