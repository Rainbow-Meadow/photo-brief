/**
 * Mobile/tablet schema — optimised for touch interaction, smaller viewports,
 * performance-conscious effects, and progressive disclosure.
 */

export const MOBILE = {
  /** Spacing scale (rem) */
  spacing: {
    xs: "0.25rem",
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "2.5rem",
    section: "clamp(2rem, 5vw, 3.5rem)",
    sectionTight: "clamp(1.5rem, 3vw, 2.5rem)",
  },

  /** Layout density */
  layout: {
    containerMax: "100%",
    contentMax: "100%",
    contentNarrow: "100%",
    sidebarWidth: "0px",
    headerHeight: "3.5rem",
    /** Gap between cards in grid layouts */
    cardGap: "0.75rem",
    /** Padding inside cards */
    cardPadding: "1rem",
    columns: { default: 1, md: 1, lg: 2 },
    /** Horizontal page padding */
    pagePadding: "0.75rem",
  },

  /** Typography scale — slightly tighter to save space */
  typography: {
    hero: "clamp(1.75rem, 5vw, 2.5rem)",
    sectionTitle: "clamp(1.35rem, 3.5vw, 2rem)",
    heading: "clamp(1.25rem, 2.5vw, 1.75rem)",
    subheading: "clamp(1rem, 1.5vw, 1.25rem)",
    body: "0.875rem",
    bodySmall: "0.8125rem",
    caption: "0.6875rem",
    lineHeight: { tight: 1.15, body: 1.6, relaxed: 1.7 },
    letterSpacing: { tight: "-0.03em", normal: "0", wide: "0.12em" },
  },

  /** Animation & motion — shorter for perceived speed */
  motion: {
    entranceDuration: "220ms",
    transitionDuration: "150ms",
    hoverDuration: "0ms", // No hover on touch
    easeDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
    easeApple: "cubic-bezier(0.32, 0.72, 0, 1)",
    easeBounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /** Blur intensity — reduced for performance */
  blur: {
    glass: "10px",
    glassStrong: "12px",
    glassNav: "14px",
    ambient: "xl", // Tailwind blur-xl (less expensive)
  },

  /** Shadow depth — simpler for performance */
  shadow: {
    card: "var(--shadow-sm)",
    cardHover: "var(--shadow-sm)", // No hover change
    elevated: "var(--shadow-md)",
    glow: "none", // Skip expensive glow on mobile
    hoverLift: "none",
  },

  /** Card elevation — flatter */
  elevation: {
    flat: { shadow: "none", border: true },
    sm: { shadow: "var(--shadow-sm)", border: true },
    md: { shadow: "var(--shadow-md)", border: true },
    lg: { shadow: "var(--shadow-md)", border: true }, // Capped at md
  },

  /** Skeleton / loading — lighter */
  skeleton: {
    detailed: false,
    rows: 3,
    animationDuration: "1.2s",
  },

  /** Interaction states — touch-optimised */
  states: {
    /** Minimum touch target (px) */
    minTouchTarget: 44,
    tap: {
      /** Scale on active press */
      scale: "0.97",
      /** Opacity feedback */
      opacity: "0.85",
    },
    focus: {
      ringWidth: "2px",
      ringOffset: "2px",
    },
  },

  /** Navigation behavior */
  navigation: {
    style: "bottom-tabs" as const,
    /** Mobile uses bottom tab bar + hamburger drawer */
    drawerFromEdge: true,
    headerSticky: true,
  },

  /** Modal behavior — bottom sheet on mobile */
  modal: {
    style: "bottom-sheet" as const,
    backdropBlur: "4px",
    maxWidth: "100%",
    entranceAnimation: "slide-up",
  },

  /** Safe areas for notch/home-indicator devices */
  safeArea: {
    top: "env(safe-area-inset-top)",
    bottom: "env(safe-area-inset-bottom)",
    left: "env(safe-area-inset-left)",
    right: "env(safe-area-inset-right)",
  },
} as const;
