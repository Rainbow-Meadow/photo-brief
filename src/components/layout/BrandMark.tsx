import { useId } from "react";

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
const FONT_FAMILY =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const ACCENT = "var(--pb-brand-accent, #c8a8ff)";

function toneClass(tone: BrandTone): string {
  if (tone === "light") return "text-white";
  if (tone === "auto") return "text-[#171b21] dark:text-white";
  return "text-[#171b21]";
}

function LogoSymbol({ x = 0, y = 0, size = 256 }: { x?: number; y?: number; size?: number }) {
  const scale = size / 512;
  const bodyMaskId = useId().replace(/:/g, "");
  const bodyPath = "M64 102h384c34 0 56 22 56 56v224c0 34-22 56-56 56H64c-34 0-56-22-56-56V158c0-34 22-56 56-56Z";
  const centerHolePath = "M256 241l36 21v42l-36 21-36-21v-42l36-21Z";

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <mask id={bodyMaskId} maskUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">
          <rect width="512" height="512" fill="black" />
          <path d={bodyPath} fill="white" />
          <circle cx="430" cy="159" r="18" fill="black" />
          <path d={centerHolePath} fill="black" />
        </mask>
      </defs>

      <path d={bodyPath} fill="currentColor" mask={`url(#${bodyMaskId})`} />

      <g fill="none" stroke={ACCENT} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 181l171 111c16 10 37 4 45-13" strokeWidth="18" />
        <path d="M504 181L333 292c-16 10-37 4-45-13" strokeWidth="18" />
      </g>

      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="256" cy="282" r="96" strokeWidth="20" />
        <circle cx="256" cy="282" r="66" strokeWidth="7" />
      </g>

      <g fill={ACCENT}>
        <path d="M248 214c25-2 50 7 69 24l-25 28h-49l-8-10 13-42Z" />
        <path d="M327 247c17 21 23 48 17 75l-39-13-24-42 6-13 40-7Z" />
        <path d="M333 331c-17 21-42 35-70 36l10-40 25-43 15-2 20 49Z" />
        <path d="M254 367c-28-1-53-13-71-33l39-12h50l8 10-26 35Z" />
        <path d="M176 322c-12-25-13-53-2-78l29 29 24 42-6 14-45-7Z" />
        <path d="M179 234c16-22 40-36 67-40l-11 41-25 43-15 3-16-47Z" />
      </g>
    </g>
  );
}

export function BrandMark({
  className,
  variant,
  tone = "auto",
  size = 28,
  withGlow = false,
  markOnly,
  invert,
}: BrandMarkProps) {
  // Backwards-compat for old call sites
  const resolvedVariant: BrandVariant = variant ?? (markOnly ? "mark" : "horizontal");
  const resolvedTone: BrandTone = tone !== "auto" ? tone : invert ? "light" : "auto";

  const aspectByVariant: Record<BrandVariant, number> = {
    horizontal: 820 / 160,
    stacked: 1,
    wordmark: 650 / 120,
    mark: 1,
    primary: 1,
  };
  const aspect = aspectByVariant[resolvedVariant];
  const intrinsicHeight = size;
  const intrinsicWidth = Math.round(size * aspect);
  const style = { height: size, width: "auto" as const };
  const svgClass = cn(
    "block select-none",
    withGlow && "drop-shadow-[0_8px_28px_hsl(var(--primary)/0.45)]",
  );

  const svgProps = {
    role: "img",
    "aria-label": ALT,
    width: intrinsicWidth,
    height: intrinsicHeight,
    style,
    focusable: "false",
    className: svgClass,
  } as const;

  const wordmark = (
    <text
      x="0"
      y="82"
      fill="currentColor"
      fontFamily={FONT_FAMILY}
      fontSize="78"
      fontWeight="700"
      letterSpacing="-4.5"
    >
      {WORDMARK}
    </text>
  );

  return (
    <span className={cn("inline-flex items-center", toneClass(resolvedTone), className)}>
      {(resolvedVariant === "mark" || resolvedVariant === "primary") && (
        <svg {...svgProps} viewBox="0 0 512 512">
          <LogoSymbol />
        </svg>
      )}

      {resolvedVariant === "wordmark" && (
        <svg {...svgProps} viewBox="0 0 650 120">
          {wordmark}
        </svg>
      )}

      {resolvedVariant === "horizontal" && (
        <svg {...svgProps} viewBox="0 0 820 160">
          <LogoSymbol x={0} y={-52} size={264} />
          <g transform="translate(190 22)">{wordmark}</g>
        </svg>
      )}

      {resolvedVariant === "stacked" && (
        <svg {...svgProps} viewBox="0 0 500 500">
          <LogoSymbol x={52} y={45} size={396} />
          <text
            x="250"
            y="410"
            fill="currentColor"
            fontFamily={FONT_FAMILY}
            fontSize="66"
            fontWeight="700"
            letterSpacing="-3.5"
            textAnchor="middle"
          >
            {WORDMARK}
          </text>
        </svg>
      )}
    </span>
  );
}
