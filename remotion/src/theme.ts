// PhotoBrief — Field Manual / RMBC video tokens
// Locked visual contract: dark navy canvas, cream hairlines, single amber accent.
export const COLORS = {
  bg: "#0E0E0C",         // matches app shell hsl(60 8% 5%)
  ink: "#F4F1EA",        // cream foreground
  inkDim: "rgba(244, 241, 234, 0.55)",
  inkFaint: "rgba(244, 241, 234, 0.16)",
  inkGrid: "rgba(244, 241, 234, 0.06)",
  amber: "#F2A33A",
} as const;

export const STROKE = {
  hairline: 1,
  contour: 2.5,
} as const;

export const FONT = {
  display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
  mono: "'Geist Mono', ui-monospace, 'IBM Plex Mono', Menlo, monospace",
} as const;

export const PLATE = {
  // tracking +160 on a typical 11px label = 1.76px
  monoLabel: {
    fontFamily: FONT.mono,
    fontSize: 14,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: COLORS.ink,
    fontWeight: 500,
  },
  monoSmall: {
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: COLORS.inkDim,
  },
};
