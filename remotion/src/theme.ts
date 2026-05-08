// PhotoBrief brand video — Navy + Amber on Cream
export const COLORS = {
  bg: "#FAF7F2",
  bgWarm: "#F4EEE3",
  bgDark: "#10172A",
  bgCard: "rgba(255,255,255,0.92)",
  bgCardSolid: "#FFFFFF",

  foreground: "#1B2A4A",
  muted: "#5C6B85",
  mutedLight: "#9AA6BC",
  ink: "#1B2A4A",
  white: "#FAF7F2",

  primary: "#F2A33A",
  primaryGlow: "#F6BC6A",
  primaryLight: "#FCE7C0",
  primaryFg: "#FFFFFF",

  cyan: "#F6BC6A",
  violet: "#1B2A4A",
  navy: "#1B2A4A",
  navyDeep: "#10172A",
  amber: "#F2A33A",
  amberLight: "#F6BC6A",
  amberHover: "#D88A20",

  success: "hsl(151, 56%, 34%)",
  successLight: "hsl(151, 60%, 92%)",
  warning: "hsl(38, 92%, 58%)",
  warningLight: "hsl(38, 100%, 94%)",
  destructive: "hsl(0, 76%, 52%)",
  destructiveLight: "hsl(0, 80%, 95%)",

  border: "#E8DFCE",
  borderLight: "#F0E9DC",
  glassBg: "rgba(250, 247, 242, 0.78)",
  glassDark: "rgba(16, 23, 42, 0.68)",

  sidebarBg: "#10172A",
  sidebarFg: "#FAF7F2",
  sidebarActive: "#1F2A4A",
  sidebarMuted: "#9AA6BC",
  sidebarBorder: "#1F2A4A",
};

export const GRADIENT_PRIMARY = `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryGlow})`;
export const GRADIENT_DARK = `linear-gradient(135deg, ${COLORS.bgDark} 0%, #1B2A4A 60%, #2A3A60 130%)`;
export const GRADIENT_TEXT = `linear-gradient(100deg, ${COLORS.navy} 0%, ${COLORS.amber} 58%, ${COLORS.amberLight} 100%)`;

export const SHADOW = {
  soft: "0 18px 48px rgba(27, 42, 74, 0.10)",
  strong: "0 42px 100px rgba(27, 42, 74, 0.20)",
  glow: "0 26px 80px rgba(242, 163, 58, 0.32)",
  darkGlow: "0 30px 90px rgba(246, 188, 106, 0.22)",
};

export const SPRING = {
  smooth: { damping: 22, stiffness: 180, mass: 1 },
  bouncy: { damping: 13, stiffness: 170, mass: 1 },
  snap: { damping: 24, stiffness: 260, mass: 1 },
  cinematic: { damping: 28, stiffness: 120, mass: 1.15 },
};

export const FONT = {
  display: "Inter, system-ui, sans-serif",
  body: "Inter, system-ui, sans-serif",
};
