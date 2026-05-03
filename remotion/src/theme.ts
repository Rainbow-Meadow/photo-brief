// PhotoBrief product spotlight video — Palette B: Graphite + Electric Violet
export const COLORS = {
  bg: "#F8F7FA",
  bgWarm: "#F1EEF6",
  bgDark: "#060507",
  bgCard: "rgba(255,255,255,0.90)",
  bgCardSolid: "#FFFFFF",

  foreground: "#111014",
  muted: "#625F68",
  mutedLight: "#B3ADB7",
  ink: "#111014",
  white: "#FAF9FC",

  primary: "#7C3AED",
  primaryGlow: "#A78BFA",
  primaryLight: "#F1EAFF",
  primaryFg: "#FFFFFF",

  cyan: "#A78BFA",
  violet: "#7C3AED",
  success: "hsl(151, 56%, 34%)",
  successLight: "hsl(151, 60%, 92%)",
  warning: "hsl(38, 92%, 58%)",
  warningLight: "hsl(38, 100%, 94%)",
  destructive: "hsl(0, 76%, 52%)",
  destructiveLight: "hsl(0, 80%, 95%)",

  border: "#E1DEE7",
  borderLight: "#ECE8F1",
  glassBg: "rgba(248, 247, 250, 0.72)",
  glassDark: "rgba(6, 5, 7, 0.68)",

  sidebarBg: "#060507",
  sidebarFg: "#FAF9FC",
  sidebarActive: "#2C1B4F",
  sidebarMuted: "#B3ADB7",
  sidebarBorder: "#2C2933",
};

export const GRADIENT_PRIMARY = `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryGlow})`;
export const GRADIENT_DARK = `linear-gradient(135deg, ${COLORS.bgDark} 0%, ${COLORS.bgCardSolid === "#FFFFFF" ? "#15131A" : COLORS.bgCardSolid} 58%, #2E1065 130%)`;
export const GRADIENT_TEXT = `linear-gradient(100deg, ${COLORS.foreground} 0%, ${COLORS.primary} 54%, ${COLORS.primaryGlow} 100%)`;

export const SHADOW = {
  soft: "0 18px 48px rgba(17, 16, 20, 0.12)",
  strong: "0 42px 100px rgba(17, 16, 20, 0.24)",
  glow: "0 26px 80px rgba(124, 58, 237, 0.30)",
  darkGlow: "0 30px 90px rgba(167, 139, 250, 0.20)",
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
