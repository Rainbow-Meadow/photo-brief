import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type BrandVariant = "horizontal" | "stacked" | "wordmark" | "mark" | "primary";
/**
 * Surface the lockup is rendered on.
 * - "light" → cream-bg lockup (navy + amber wordmark, light mark asset).
 * - "dark"  → dark-bg lockup (cream + amber wordmark, dark mark asset).
 *
 * Tone matches the surface the BrandMark physically sits on, NOT the page's
 * overall theme. Do not reintroduce "auto" / "color" — they collapsed to
 * "light" silently and made author intent unreadable.
 */
export type BrandTone = "light" | "dark";

interface BrandMarkProps {
  className?: string;
  /** Which lockup to render. Defaults to "horizontal". */
  variant?: BrandVariant;
  /** Surface tone (see BrandTone). Defaults to "dark" — the app shell is dark-themed. */
  tone?: BrandTone;
  /** Visual height in px. Defaults to 28. */
  size?: number;
  /** Kept for API parity with the old image-based implementation. */
  eager?: boolean;
  /** Show the GUIDE · CAPTURE · CLOSE tagline below the wordmark (stacked + horizontal). */
  showTagline?: boolean;
}

const ALT = "PhotoBrief.ai · Guide · Capture · Close";
const MARK_SVG_LIGHT = "/brand/mark.svg?v=2";
const MARK_PNG_LIGHT = "/brand/mark-color.png?v=2";
const MARK_SVG_DARK = "/brand/mark-on-dark.svg?v=2";
const MARK_PNG_DARK = "/brand/mark-on-dark.png?v=2";
const TAGLINE = "Guide · Capture · Close";

function MarkImage({ size, eager, tone }: { size: number; eager?: boolean; tone: BrandTone }) {
  const imgClass = "block select-none object-contain shrink-0";
  const imgStyle = { height: size, width: size } satisfies CSSProperties;
  const isDark = tone === "dark";
  const svg = isDark ? MARK_SVG_DARK : MARK_SVG_LIGHT;
  const png = isDark ? MARK_PNG_DARK : MARK_PNG_LIGHT;

  // SVG first for crisp rendering; <picture> falls back to PNG when SVG fails.
  return (
    <picture>
      <source srcSet={svg} type="image/svg+xml" />
      <img
        src={png}
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

function Wordmark({ size, compact = false, tone }: { size: number; compact?: boolean; tone: BrandTone }) {
  const isDark = tone === "dark";
  const photoColor = isDark ? "hsl(var(--pb-cream))" : "hsl(var(--pb-wordmark-navy))";
  const aiColor = isDark ? "hsl(var(--pb-cream) / 0.7)" : "hsl(var(--pb-wordmark-navy) / 0.55)";
  return (
    <span
      className="font-extrabold leading-none whitespace-nowrap"
      style={{
        fontSize: size,
        letterSpacing: compact ? "-0.055em" : "-0.05em",
      }}
    >
      <span style={{ color: photoColor }}>Photo</span>
      <span style={{ color: "hsl(var(--pb-wordmark-amber))" }}>Brief</span>
      <span
        style={{
          color: aiColor,
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

function Tagline({ size, tone }: { size: number; tone: BrandTone }) {
  const color = tone === "dark"
    ? "hsl(var(--pb-cream) / 0.75)"
    : "hsl(var(--pb-wordmark-navy) / 0.7)";
  return (
    <span
      className="block uppercase font-semibold whitespace-nowrap"
      style={{
        fontSize: Math.max(9, size * 0.13),
        letterSpacing: "0.22em",
        color,
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
  tone = "dark",
  size = 28,
  eager,
  showTagline = false,
}: BrandMarkProps) {
  const resolvedVariant: BrandVariant = variant;

  if (resolvedVariant === "mark" || resolvedVariant === "primary") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center justify-center", className)}>
        <MarkImage size={size} eager={eager} tone={tone} />
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
        <Wordmark size={size} tone={tone} />
        {showTagline ? <Tagline size={size} tone={tone} /> : null}
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
        <MarkImage size={size} eager={eager} tone={tone} />
        <Wordmark size={Math.max(14, size * 0.26)} tone={tone} />
        {showTagline ? <Tagline size={Math.max(14, size * 0.26)} tone={tone} /> : null}
      </span>
    );
  }

  // horizontal
  const wordSize = Math.max(16, size * 0.72);
  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-2.5 min-w-0", className)}>
      <MarkImage size={size} eager={eager} tone={tone} />
      <span className="inline-flex flex-col items-start min-w-0">
        <Wordmark size={wordSize} compact tone={tone} />
        {showTagline ? <Tagline size={wordSize} tone={tone} /> : null}
      </span>
    </span>
  );
}
