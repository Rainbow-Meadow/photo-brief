import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type BrandVariant = "horizontal" | "stacked" | "wordmark" | "mark" | "primary";
export type BrandTone = "auto" | "light" | "dark" | "color";

interface BrandMarkProps {
  className?: string;
  /** Which lockup to render. Defaults to "horizontal". */
  variant?: BrandVariant;
  /** Color treatment. "auto" swaps from dark ink to light ink in dark mode. */
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

/**
 * New brand asset map — all PNGs with transparent backgrounds.
 *
 * | Context           | Tone  | File                          |
 * |--------------------|-------|-------------------------------|
 * | Mark (color)       | any   | /brand/mark-color.png         |
 * | Mark (dark ink)    | dark  | /brand/mark-dark.png          |
 * | Horizontal (color) | color | /brand/horizontal-color.png   |
 * | Horizontal (dark)  | dark  | /brand/horizontal-dark.png    |
 * | Horizontal (light) | light | /brand/horizontal-light.png   |
 * | Stacked (color)    | color | /brand/stacked-color.png      |
 */

function MarkImage({ tone, size, withGlow, eager }: { tone: BrandTone; size: number; withGlow: boolean; eager?: boolean }) {
  const imgClass = cn(
    "block select-none object-contain",
    withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
  );
  const style: CSSProperties = { height: size, width: "auto" };
  const loading = eager ? "eager" as const : "lazy" as const;

  if (tone === "color" || tone === "auto") {
    // Full-color mark works on both light and dark backgrounds
    return (
      <img
        src="/brand/mark-color.png"
        alt=""
        aria-hidden="true"
        className={imgClass}
        style={style}
        loading={loading}
      />
    );
  }

  if (tone === "dark") {
    return (
      <img
        src="/brand/mark-dark.png"
        alt=""
        aria-hidden="true"
        className={imgClass}
        style={style}
        loading={loading}
      />
    );
  }

  // tone === "light" — use color mark which reads well on dark
  return (
    <img
      src="/brand/mark-color.png"
      alt=""
      aria-hidden="true"
      className={imgClass}
      style={style}
      loading={loading}
    />
  );
}

function HorizontalImage({ tone, size, withGlow, eager }: { tone: BrandTone; size: number; withGlow: boolean; eager?: boolean }) {
  const imgClass = cn(
    "block select-none object-contain",
    withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
  );
  const style: CSSProperties = { height: size, width: "auto" };
  const loading = eager ? "eager" as const : "lazy" as const;

  if (tone === "color") {
    return <img src="/brand/horizontal-color.png" alt="" aria-hidden="true" className={imgClass} style={style} loading={loading} />;
  }

  if (tone === "light") {
    return <img src="/brand/horizontal-light.png" alt="" aria-hidden="true" className={imgClass} style={style} loading={loading} />;
  }

  if (tone === "dark") {
    return <img src="/brand/horizontal-dark.png" alt="" aria-hidden="true" className={imgClass} style={style} loading={loading} />;
  }

  // Auto: dark on light, color on dark
  return (
    <>
      <img src="/brand/horizontal-dark.png" alt="" aria-hidden="true" className={cn(imgClass, "dark:hidden")} style={style} loading={loading} />
      <img src="/brand/horizontal-color.png" alt="" aria-hidden="true" className={cn(imgClass, "hidden dark:block")} style={style} loading={loading} />
    </>
  );
}

function StackedImage({ tone, size, withGlow, eager }: { tone: BrandTone; size: number; withGlow: boolean; eager?: boolean }) {
  const imgClass = cn(
    "block select-none object-contain",
    withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
  );
  const style: CSSProperties = { height: size, width: "auto" };
  const loading = eager ? "eager" as const : "lazy" as const;

  // Always use the color stacked — it works on both surfaces
  return <img src="/brand/stacked-color.png" alt="" aria-hidden="true" className={imgClass} style={style} loading={loading} />;
}

const WORDMARK = "PhotoBrief.ai";
const WORDMARK_GRADIENT =
  "linear-gradient(135deg, #f3ebff 0%, #d9bbff 28%, #b98cff 58%, #8f63ff 100%)";

function Wordmark({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      className={cn("font-bold tracking-[-0.055em] leading-none bg-clip-text text-transparent", className)}
      style={{
        ...style,
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
  tone = "auto",
  size = 28,
  withGlow = false,
  eager,
  markOnly,
  invert,
}: BrandMarkProps) {
  const resolvedVariant: BrandVariant = variant ?? (markOnly ? "mark" : "horizontal");
  const resolvedTone: BrandTone = tone !== "auto" ? tone : invert ? "light" : "auto";

  if (resolvedVariant === "mark" || resolvedVariant === "primary") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center", className)}>
        <MarkImage tone={resolvedTone} size={size} withGlow={withGlow} eager={eager} />
      </span>
    );
  }

  if (resolvedVariant === "wordmark") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center", className)}>
        <Wordmark style={{ fontSize: size }} />
      </span>
    );
  }

  if (resolvedVariant === "stacked") {
    return (
      <span
        role="img"
        aria-label={ALT}
        className={cn("inline-flex flex-col items-center justify-center", className)}
      >
        <StackedImage tone={resolvedTone} size={size} withGlow={withGlow} eager={eager} />
      </span>
    );
  }

  // horizontal (default)
  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center", className)}>
      <HorizontalImage tone={resolvedTone} size={size} withGlow={withGlow} eager={eager} />
    </span>
  );
}
