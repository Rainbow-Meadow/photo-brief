// PhotoBrief product spotlight video — line-brand cinematic palette
export const COLORS = {
  bg: "hsl(43, 52%, 97%)",
  bgWarm: "hsl(38, 46%, 94%)",
  bgDark: "hsl(220, 13%, 8%)",
  bgCard: "rgba(255,255,255,0.90)",
  bgCardSolid: "#FFFFFF",

  foreground: "hsl(220, 13%, 8%)",
  muted: "hsl(225, 8%, 42%)",
  mutedLight: "hsl(40, 13%, 70%)",
  ink: "hsl(220, 13%, 8%)",
  white: "#F7F3EA",

  primary: "hsl(187, 79%, 40%)",
  primaryGlow: "hsl(188, 79%, 72%)",
  primaryLight: "hsl(187, 69%, 92%)",
  primaryFg: "#F7F3EA",

  cyan: "hsl(188, 79%, 72%)",
  violet: "hsl(267, 43%, 68%)",
  success: "hsl(151, 56%, 34%)",
  successLight: "hsl(151, 60%, 92%)",
  warning: "hsl(37, 100%, 65%)",
  warningLight: "hsl(37, 100%, 92%)",
  destructive: "hsl(0, 76%, 52%)",
  destructiveLight: "hsl(0, 80%, 95%)",

  border: "hsl(38, 24%, 84%)",
  borderLight: "hsl(38, 28%, 90%)",
  glassBg: "rgba(247, 243, 234, 0.72)",
  glassDark: "rgba(17, 19, 23, 0.68)",

  sidebarBg: "hsl(220, 13%, 8%)",
  sidebarFg: "hsl(43, 52%, 97%)",
  sidebarActive: "hsl(187, 70%, 30%)",
  sidebarMuted: "hsl(40, 13%, 70%)",
  sidebarBorder: "hsl(218, 12%, 18%)",
};

export const GRADIENT_PRIMARY = `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryGlow})`;
export const GRADIENT_DARK = `linear-gradient(135deg, ${COLORS.bgDark} 0%, hsl(216, 13%, 11%) 58%, hsl(187, 79%, 28%) 130%)`;
export const GRADIENT_TEXT = `linear-gradient(100deg, ${COLORS.foreground} 0%, ${COLORS.primary} 54%, ${COLORS.warning} 100%)`;

export const SHADOW = {
  soft: "0 18px 48px rgba(17, 19, 23, 0.12)",
  strong: "0 42px 100px rgba(17, 19, 23, 0.24)",
  glow: "0 26px 80px rgba(20, 166, 184, 0.30)",
  darkGlow: "0 30px 90px rgba(123, 223, 242, 0.20)",
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
