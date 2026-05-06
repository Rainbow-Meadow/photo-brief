/**
 * Shared brand tokens — stable identity values used by both desktop and mobile schemas.
 * These do NOT include spacing, animation, or interaction behavior.
 */

export const BRAND = {
  /** Core brand colors (HSL value strings, no `hsl()` wrapper) */
  colors: {
    violet: "262 83% 58%",
    lavender: "264 100% 78%",
    electric: "246 100% 72%",
    mint: "166 92% 54%",
    graphite: "255 11% 7%",
    paper: "260 24% 96%",
    night: "260 52% 4%",
    ink: "258 45% 7%",
  },

  /** Font stacks */
  font: {
    display: "Inter, system-ui, -apple-system, sans-serif",
    body: "Inter, system-ui, -apple-system, sans-serif",
    mono: "ui-monospace, 'SF Mono', 'Fira Code', monospace",
  },

  /** Base border-radius personality (rem) */
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    pill: "9999px",
  },

  /** Icon style guidance */
  icon: {
    style: "lucide" as const,
    strokeWidth: 1.75,
  },

  /** General visual tone */
  tone: "premium-dark" as const,
} as const;
