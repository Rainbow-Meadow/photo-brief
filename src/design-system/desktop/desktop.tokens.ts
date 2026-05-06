/**
 * Desktop schema — optimised for pointer-based interaction, larger viewports,
 * richer visual effects, and denser information layout.
 */

export const DESKTOP = {
  /** Spacing scale (rem) */
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
    section: "clamp(3.5rem, 7vw, 7rem)",
    sectionTight: "clamp(2.5rem, 4.5vw, 4rem)",
  },

  /** Layout density */
  layout: {
    containerMax: "1400px",
    contentMax: "1180px",
    contentNarrow: "860px",
    sidebarWidth: "280px",
    headerHeight: "4rem",
    /** Gap between cards in grid layouts */
    cardGap: "1.5rem",
    /** Padding inside cards */
    cardPadding: "1.5rem",
    columns: { default: 1, md: 2, lg: 3 },
  },

  /** Typography scale */
  typography: {
    hero: "clamp(2.25rem, 6vw, 5.5rem)",
    sectionTitle: "clamp(1.65rem, 4vw, 3.5rem)",
    heading: "clamp(1.5rem, 3vw, 2.5rem)",
    subheading: "clamp(1.125rem, 2vw, 1.5rem)",
    body: "0.9375rem",
    bodySmall: "0.875rem",
    caption: "0.75rem",
    lineHeight: { tight: 1.12, body: 1.65, relaxed: 1.8 },
    letterSpacing: { tight: "-0.045em", normal: "0", wide: "0.14em" },
  },

  /** Animation & motion */
  motion: {
    /** Entrance animation duration */
    entranceDuration: "360ms",
    /** Transition duration for interactive states */
    transitionDuration: "200ms",
    /** Hover lift transition */
    hoverDuration: "260ms",
    /** Easing curve */
    easeDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeApple: "cubic-bezier(0.32, 0.72, 0, 1)",
    easeBounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /** Blur intensity */
  blur: {
    glass: "16px",
    glassStrong: "20px",
    glassNav: "24px",
    ambient: "3xl", // Tailwind blur-3xl
  },

  /** Shadow depth */
  shadow: {
    card: "var(--glass-shadow)",
    cardHover: "var(--glass-shadow-lg)",
    elevated: "var(--shadow-lg)",
    glow: "var(--shadow-glow)",
    /** Subtle lift on hover */
    hoverLift: "0 14px 28px -10px hsl(var(--primary) / 0.3)",
  },

  /** Card elevation */
  elevation: {
    flat: { shadow: "none", border: true },
    sm: { shadow: "var(--shadow-sm)", border: true },
    md: { shadow: "var(--glass-shadow)", border: true },
    lg: { shadow: "var(--glass-shadow-lg)", border: true },
  },

  /** Skeleton / loading */
  skeleton: {
    /** Show detailed skeleton matching final layout */
    detailed: true,
    /** Number of placeholder rows */
    rows: 6,
    animationDuration: "1.5s",
  },

  /** Interaction states */
  states: {
    hover: {
      lift: "-2px",
      scale: "1.006",
      borderHighlight: true,
    },
    focus: {
      ringWidth: "2px",
      ringOffset: "2px",
    },
    active: {
      scale: "0.98",
    },
  },

  /** Navigation behavior */
  navigation: {
    style: "sidebar" as const,
    /** Desktop uses sidebar + top header */
    sidebarCollapsible: true,
    headerSticky: true,
  },

  /** Modal behavior */
  modal: {
    style: "centered" as const,
    backdropBlur: "8px",
    maxWidth: "32rem",
    entranceAnimation: "bubble-in",
  },
} as const;
