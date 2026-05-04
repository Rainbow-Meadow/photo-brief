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

const ALT = "PhotoBrief";
const FONT_FAMILY =
  "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function toneClass(tone: BrandTone): string {
  if (tone === "light") return "text-white";
  if (tone === "auto") return "text-black dark:text-white";
  return "text-black";
}

function LogoSymbol({ x = 0, y = 0, size = 256 }: { x?: number; y?: number; size?: number }) {
  const scale = size / 256;
  const lensMaskId = useId().replace(/:/g, "");

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <defs>
        <mask id={lensMaskId} maskUnits="userSpaceOnUse" x="80" y="80" width="96" height="96">
          <rect x="80" y="80" width="96" height="96" fill="white" />
          <ellipse cx="116" cy="119" rx="15" ry="7" fill="black" transform="rotate(-20 116 119)" />
          <circle cx="146" cy="111" r="5" fill="black" />
        </mask>
      </defs>
      <path
        d="M44 62V30c0-5.5 4.5-10 10-10h34M168 20h34c5.5 0 10 4.5 10 10v32M212 194v32c0 5.5-4.5 10-10 10h-34M88 236H54c-5.5 0-10-4.5-10-10v-32"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
      <circle cx="128" cy="128" r="72" fill="none" stroke="currentColor" strokeWidth="8" />
      <path
        d="M90 82a62 62 0 0 1 36-17M166 76a62 62 0 0 1 14 13M184 114a62 62 0 0 1-16 63M137 190a62 62 0 0 1-46-16M74 148a62 62 0 0 1 8-45"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M102 128a35 35 0 0 1 54-29"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <circle cx="128" cy="128" r="39" fill="currentColor" mask={`url(#${lensMaskId})`} />
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
    horizontal: 720 / 160,
    stacked: 1,
    wordmark: 520 / 120,
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
      PhotoBrief
    </text>
  );

  return (
    <span className={cn("inline-flex items-center", toneClass(resolvedTone), className)}>
      {(resolvedVariant === "mark" || resolvedVariant === "primary") && (
        <svg {...svgProps} viewBox="0 0 256 256">
          <LogoSymbol />
        </svg>
      )}

      {resolvedVariant === "wordmark" && (
        <svg {...svgProps} viewBox="0 0 520 120">
          {wordmark}
        </svg>
      )}

      {resolvedVariant === "horizontal" && (
        <svg {...svgProps} viewBox="0 0 720 160">
          <LogoSymbol x={0} y={5} size={150} />
          <g transform="translate(182 22)">{wordmark}</g>
        </svg>
      )}

      {resolvedVariant === "stacked" && (
        <svg {...svgProps} viewBox="0 0 500 500">
          <LogoSymbol x={122} y={70} size={256} />
          <text
            x="250"
            y="410"
            fill="currentColor"
            fontFamily={FONT_FAMILY}
            fontSize="78"
            fontWeight="700"
            letterSpacing="-4.5"
            textAnchor="middle"
          >
            PhotoBrief
          </text>
        </svg>
      )}
    </span>
  );
}
