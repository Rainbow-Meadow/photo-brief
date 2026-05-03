import { cn } from "@/lib/utils";
import horizontalLogo from "@/assets/brand/photobrief-horizontal.svg";
import horizontalLogoLight from "@/assets/brand/photobrief-horizontal-light.svg";
import stackedLogo from "@/assets/brand/photobrief-stacked.svg";
import stackedLogoLight from "@/assets/brand/photobrief-stacked-light.svg";
import wordmark from "@/assets/brand/photobrief-wordmark.svg";
import wordmarkLight from "@/assets/brand/photobrief-wordmark-light.svg";
import markDark from "@/assets/brand/photobrief-mark.svg";
import markLight from "@/assets/brand/photobrief-mark-light.svg";
import primaryMark from "@/assets/brand/photobrief-primary.svg";

export type BrandVariant = "horizontal" | "stacked" | "wordmark" | "mark" | "primary";
export type BrandTone = "auto" | "light" | "dark" | "color";

interface BrandMarkProps {
  className?: string;
  /** Which lockup to render. Defaults to "horizontal". */
  variant?: BrandVariant;
  /** Color treatment. "auto" swaps with the dark: class. */
  tone?: BrandTone;
  /** Visual height in px. Defaults to 28. */
  size?: number;
  /** Drop a soft brand glow behind the mark — for dark hero placements. */
  withGlow?: boolean;
  /** Eager-load above-the-fold logos for better LCP. */
  eager?: boolean;
  /** @deprecated Use `variant="mark"` instead. */
  markOnly?: boolean;
  /** @deprecated Use `tone="light"` instead. */
  invert?: boolean;
}

const ALT = "PhotoBrief";

function pickSrc(variant: BrandVariant, tone: BrandTone): string {
  if (variant === "primary") return primaryMark;
  if (variant === "horizontal") return tone === "light" ? horizontalLogoLight : horizontalLogo;
  if (variant === "stacked") return tone === "light" ? stackedLogoLight : stackedLogo;
  if (variant === "wordmark") return tone === "light" ? wordmarkLight : wordmark;
  // variant === "mark"
  if (tone === "color") return primaryMark;
  if (tone === "light") return markLight;
  return markDark;
}

export function BrandMark({
  className,
  variant,
  tone = "auto",
  size = 28,
  withGlow = false,
  eager = false,
  markOnly,
  invert,
}: BrandMarkProps) {
  // Backwards-compat for old call sites
  const resolvedVariant: BrandVariant =
    variant ?? (markOnly ? "mark" : "horizontal");
  const resolvedTone: BrandTone = tone !== "auto" ? tone : invert ? "light" : "auto";

  const loading = eager ? "eager" : "lazy";
  const style = { height: size, width: "auto" as const };
  // Intrinsic aspect ratios for each variant (width:height) so we can emit
  // explicit width/height attributes — prevents CLS and satisfies the
  // Lighthouse "unsized-images" audit without changing displayed size.
  const aspectByVariant: Record<BrandVariant, number> = {
    horizontal: 1200 / 320,
    stacked: 1,
    wordmark: 900 / 180,
    mark: 1,
    primary: 1,
  };
  const aspect = aspectByVariant[resolvedVariant];
  const intrinsicHeight = size;
  const intrinsicWidth = Math.round(size * aspect);
  const imgClass = cn(
    "block select-none",
    withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
  );

  // For "auto" tone on a swappable variant (mark / horizontal / stacked / wordmark),
  // render two images and toggle them with the dark: class — no JS, no FOUC.
  if (resolvedTone === "auto") {
    const lightSrc = pickSrc(resolvedVariant, "dark"); // dark ink for light bg
    const darkSrc = pickSrc(resolvedVariant, "light");
    return (
      <span
        className={cn("inline-flex items-center", className)}
        aria-label={ALT}
      >
        <img
          src={lightSrc}
          alt={ALT}
          width={intrinsicWidth}
          height={intrinsicHeight}
          style={style}
          loading={loading}
          draggable={false}
          className={cn(imgClass, "dark:hidden")}
        />
        <img
          src={darkSrc}
          alt=""
          aria-hidden
          width={intrinsicWidth}
          height={intrinsicHeight}
          style={style}
          loading={loading}
          draggable={false}
          className={cn(imgClass, "hidden dark:block")}
        />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label={ALT}
    >
      <img
        src={pickSrc(resolvedVariant, resolvedTone)}
        alt={ALT}
        width={intrinsicWidth}
        height={intrinsicHeight}
        style={style}
        loading={loading}
        draggable={false}
        className={imgClass}
      />
    </span>
  );
}
