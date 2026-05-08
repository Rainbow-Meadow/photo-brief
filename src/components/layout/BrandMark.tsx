import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type BrandVariant = "horizontal" | "stacked" | "wordmark" | "mark" | "primary";
export type BrandTone = "auto" | "light" | "dark" | "color";

interface BrandMarkProps {
  className?: string;
  /** Which lockup to render. Defaults to "horizontal". */
  variant?: BrandVariant;
  /** Kept for API compatibility. The mark is full color and transparent on all surfaces. */
  tone?: BrandTone;
  /** Visual height in px. Defaults to 28. */
  size?: number;
  /** Kept for API parity with the old image-based implementation. */
  eager?: boolean;
  /** Show the GUIDE · CAPTURE · CLOSE tagline below the wordmark (stacked + horizontal). */
  showTagline?: boolean;
}

const ALT = "PhotoBrief.ai · Guide · Capture · Close";
const MARK_SVG = "/brand/mark.svg";
const MARK_PNG = "/brand/mark-color.png";
const TAGLINE = "Guide · Capture · Close";

function MarkImage({ size, eager }: { size: number; eager?: boolean }) {
  const imgClass = "block select-none object-contain shrink-0";
  const imgStyle = { height: size, width: size } satisfies CSSProperties;

  // SVG first for crisp rendering; <picture> falls back to PNG when SVG fails.
  return (
    <picture>
      <source srcSet={MARK_SVG} type="image/svg+xml" />
      <img
        src={MARK_PNG}
        alt=""
        aria-hidden="true"
        className={imgClass}
        style={imgStyle}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        width={size}
        height={size}
      />
    </picture>
  );
}

function Wordmark({ size, compact = false }: { size: number; compact?: boolean }) {
  return (
    <span
      className="font-extrabold leading-none whitespace-nowrap"
      style={{
        fontSize: size,
        letterSpacing: compact ? "-0.055em" : "-0.05em",
      }}
    >
      <span style={{ color: "hsl(var(--pb-wordmark-navy))" }}>Photo</span>
      <span style={{ color: "hsl(var(--pb-wordmark-amber))" }}>Brief</span>
      <span
        style={{
          color: "hsl(var(--pb-wordmark-navy) / 0.55)",
          fontWeight: 600,
          fontSize: size * 0.62,
          marginLeft: size * 0.04,
          letterSpacing: "-0.02em",
          verticalAlign: "baseline",
        }}
      >
        .ai
      </span>
    </span>
  );
}

function Tagline({ size }: { size: number }) {
  return (
    <span
      className="block uppercase font-semibold whitespace-nowrap"
      style={{
        fontSize: Math.max(9, size * 0.13),
        letterSpacing: "0.22em",
        color: "hsl(var(--pb-wordmark-navy) / 0.7)",
        marginTop: Math.max(4, size * 0.05),
      }}
    >
      {TAGLINE}
    </span>
  );
}

export function BrandMark({
  className,
  variant = "horizontal",
  size = 28,
  eager,
  showTagline = false,
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
      <span
        role="img"
        aria-label={ALT}
        className={cn("inline-flex flex-col items-start min-w-0", className)}
      >
        <Wordmark size={size} />
        {showTagline ? <Tagline size={size} /> : null}
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
        {showTagline ? <Tagline size={Math.max(14, size * 0.26)} /> : null}
      </span>
    );
  }

  // horizontal
  const wordSize = Math.max(16, size * 0.72);
  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-2.5 min-w-0", className)}>
      <MarkImage size={size} eager={eager} />
      <span className="inline-flex flex-col items-start min-w-0">
        <Wordmark size={wordSize} compact />
        {showTagline ? <Tagline size={wordSize} /> : null}
      </span>
    </span>
  );
}
