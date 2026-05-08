/**
 * Shared brand tokens — stable identity values used by both desktop and mobile schemas.
 * These do NOT include spacing, animation, or interaction behavior.
 */

export const BRAND = {
  /** Core brand colors (HSL value strings, no `hsl()` wrapper) */
  colors: {
    navy: "219 47% 20%",
    amber: "33 88% 55%",
    amberLight: "33 89% 69%",
    amberHover: "35 74% 49%",
    cream: "39 33% 97%",
    creamWarm: "36 34% 94%",
    graphite: "219 47% 14%",
    paper: "39 33% 97%",
    night: "219 50% 7%",
    ink: "219 47% 14%",
    /** Legacy aliases — point to the closest current value to avoid breaking imports. */
    violet: "33 88% 55%",
    lavender: "33 89% 69%",
    electric: "219 47% 20%",
    mint: "166 92% 54%",
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
  tone: "premium-light" as const,
} as const;
