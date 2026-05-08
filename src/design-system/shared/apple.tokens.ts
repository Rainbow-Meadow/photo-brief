/**
 * Apple HIG token source-of-truth.
 *
 * Mirrors UIKit/AppKit semantic system: System Colors, Labels, Fills,
 * Separators, Backgrounds, Materials, SF Type Ramp, and standard motion.
 *
 * All color values are HSL triplets (no hsl() wrapper) so they can be
 * dropped into CSS custom properties and consumed via `hsl(var(--x))`.
 */

export const APPLE_SYSTEM_COLORS = {
  light: {
    blue:    "211 100% 50%",
    indigo:  "239 72% 58%",
    purple:  "280 60% 50%",
    pink:    "344 79% 56%",
    red:     "3 100% 59%",
    orange:  "28 100% 50%",
    yellow:  "48 100% 50%",
    green:   "135 59% 41%",
    mint:    "168 47% 47%",
    teal:    "189 60% 47%",
    cyan:    "200 80% 50%",
    brown:   "27 31% 47%",
  },
  dark: {
    blue:    "211 100% 60%",
    indigo:  "239 75% 70%",
    purple:  "280 70% 65%",
    pink:    "344 88% 65%",
    red:     "5 90% 65%",
    orange:  "28 100% 60%",
    yellow:  "48 100% 60%",
    green:   "135 50% 55%",
    mint:    "168 55% 60%",
    teal:    "189 55% 60%",
    cyan:    "200 70% 60%",
    brown:   "27 31% 60%",
  },
} as const;

/** Apple Label opacity tiers — applied to `--foreground`/`--background` triplets. */
export const APPLE_LABEL_OPACITY = {
  primary:    1,
  secondary:  0.6,
  tertiary:   0.3,
  quaternary: 0.18,
} as const;

/** Material thickness — backdrop blur radius (px) + tint alpha. */
export const APPLE_MATERIALS = {
  ultraThin: { blur: 8,  tintLight: 0.55, tintDark: 0.22 },
  thin:      { blur: 14, tintLight: 0.65, tintDark: 0.32 },
  regular:   { blur: 20, tintLight: 0.74, tintDark: 0.45 },
  thick:     { blur: 28, tintLight: 0.84, tintDark: 0.6  },
  chrome:    { blur: 32, tintLight: 0.92, tintDark: 0.78 },
} as const;

/** SF type ramp — size (rem), line-height, letter-spacing, weight. */
export const APPLE_TYPE = {
  largeTitle: { size: "2.125rem", line: 1.12, tracking: "-0.022em", weight: 700 },
  title1:     { size: "1.75rem",  line: 1.18, tracking: "-0.018em", weight: 700 },
  title2:     { size: "1.375rem", line: 1.22, tracking: "-0.012em", weight: 700 },
  title3:     { size: "1.25rem",  line: 1.25, tracking: "-0.008em", weight: 600 },
  headline:   { size: "1.0625rem",line: 1.3,  tracking: "-0.006em", weight: 600 },
  body:       { size: "1.0625rem",line: 1.45, tracking: "-0.003em", weight: 400 },
  callout:    { size: "1rem",     line: 1.4,  tracking: "0",        weight: 400 },
  subhead:    { size: "0.9375rem",line: 1.4,  tracking: "0",        weight: 400 },
  footnote:   { size: "0.8125rem",line: 1.35, tracking: "0.002em",  weight: 400 },
  caption1:   { size: "0.75rem",  line: 1.3,  tracking: "0.004em",  weight: 400 },
  caption2:   { size: "0.6875rem",line: 1.3,  tracking: "0.008em",  weight: 400 },
} as const;

/** Spring-feel cubic-bezier curves modeled after Apple Core Animation defaults. */
export const APPLE_MOTION = {
  /** Smooth, default UIKit spring */
  spring:        "cubic-bezier(0.32, 0.72, 0, 1)",
  /** Snappier — buttons, segmented controls */
  springSnappy:  "cubic-bezier(0.22, 1, 0.36, 1)",
  /** Gentle, longer settle — sheets, modals */
  springGentle:  "cubic-bezier(0.4, 0, 0.2, 1.2)",
  /** Sharp ease for taps */
  easeOutQuart:  "cubic-bezier(0.165, 0.84, 0.44, 1)",
  durations: {
    quick:    "180ms",
    standard: "260ms",
    slow:     "380ms",
  },
} as const;

/** Apple system font stack — resolves to SF on Apple devices. */
export const APPLE_FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", system-ui, "Segoe UI", Roboto, sans-serif';

export const APPLE_FONT_ROUNDED =
  '-apple-system-rounded, ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif';

export const APPLE_FONT_MONO =
  'ui-monospace, "SF Mono", "Menlo", "Monaco", "Cascadia Code", "Roboto Mono", monospace';

/** Min touch target per HIG (pt). */
export const APPLE_MIN_TOUCH = 44;
