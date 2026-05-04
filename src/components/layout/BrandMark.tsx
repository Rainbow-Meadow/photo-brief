import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type BrandVariant = "horizontal" | "stacked" | "wordmark" | "mark" | "primary";
export type BrandTone = "auto" | "light" | "dark" | "color";

interface BrandMarkProps {
  className?: string;
  /** Which lockup to render. Defaults to "horizontal". */
  variant?: BrandVariant;
  /** Color treatment. "auto" swaps from black ink to white ink in dark mode. */
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
const WORDMARK = "PhotoBrief.ai";
const WORDMARK_GRADIENT =
  "linear-gradient(135deg, #f3ebff 0%, #d9bbff 28%, #b98cff 58%, #8f63ff 100%)";

function toneClass(tone: BrandTone): string {
  if (tone === "light") return "text-white";
  if (tone === "auto") return "text-[#171b21] dark:text-white";
  return "text-[#171b21]";
}

function MarkImage({ tone, size, withGlow, eager }: { tone: BrandTone; size: number; withGlow: boolean; eager?: boolean }) {
  const imgClass = cn(
    "block select-none object-contain",
    withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
  );
  const style = { height: size, width: "auto" as const };
  const loading = eager ? "eager" : "lazy";

  if (tone === "light") {
    return <img src="/photobrief-mark-light.svg" alt="" aria-hidden="true" className={imgClass} style={style} loading={loading} />;
  }

  if (tone === "dark" || tone === "color") {
    return <img src="/photobrief-mark-dark.svg" alt="" aria-hidden="true" className={imgClass} style={style} loading={loading} />;
  }

  return (
    <>
      <img src="/photobrief-mark-dark.svg" alt="" aria-hidden="true" className={cn(imgClass, "dark:hidden")} style={style} loading={loading} />
      <img src="/photobrief-mark-light.svg" alt="" aria-hidden="true" className={cn(imgClass, "hidden dark:block")} style={style} loading={loading} />
    </>
  );
}

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
  // Backwards-compat for old call sites
  const resolvedVariant: BrandVariant = variant ?? (markOnly ? "mark" : "horizontal");
  const resolvedTone: BrandTone = tone !== "auto" ? tone : invert ? "light" : "auto";
  const wordmarkSize = Math.max(12, Math.round(size * 0.62));

  if (resolvedVariant === "mark" || resolvedVariant === "primary") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center", className)}>
        <MarkImage tone={resolvedTone} size={size} withGlow={withGlow} eager={eager} />
      </span>
    );
  }

  if (resolvedVariant === "wordmark") {
    return (
      <span role="img" aria-label={ALT} className={cn("inline-flex items-center", toneClass(resolvedTone), className)}>
        <Wordmark style={{ fontSize: size }} />
      </span>
    );
  }

  if (resolvedVariant === "stacked") {
    return (
      <span
        role="img"
        aria-label={ALT}
        className={cn("inline-flex flex-col items-center justify-center gap-[0.2em]", toneClass(resolvedTone), className)}
      >
        <MarkImage tone={resolvedTone} size={Math.round(size * 0.7)} withGlow={withGlow} eager={eager} />
        <Wordmark style={{ fontSize: Math.round(size * 0.16) }} />
      </span>
    );
  }

  return (
    <span role="img" aria-label={ALT} className={cn("inline-flex items-center gap-[0.55em]", toneClass(resolvedTone), className)}>
      <MarkImage tone={resolvedTone} size={size} withGlow={withGlow} eager={eager} />
      <Wordmark style={{ fontSize: wordmarkSize }} />
    </span>
  );
}
