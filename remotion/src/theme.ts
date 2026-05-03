// PhotoBrief product spotlight video — premium light/dark cinematic palette
export const COLORS = {
  bg: "hsl(214, 45%, 98%)",
  bgWarm: "hsl(211, 100%, 97%)",
  bgDark: "hsl(222, 58%, 6%)",
  bgCard: "rgba(255,255,255,0.92)",
  bgCardSolid: "#FFFFFF",

  foreground: "hsl(222, 56%, 10%)",
  muted: "hsl(220, 12%, 42%)",
  mutedLight: "hsl(217, 18%, 70%)",
  ink: "hsl(222, 58%, 6%)",
  white: "#FFFFFF",

  primary: "hsl(217, 100%, 50%)",
  primaryGlow: "hsl(204, 100%, 63%)",
  primaryLight: "hsl(211, 100%, 94%)",
  primaryFg: "#FFFFFF",

  cyan: "hsl(188, 100%, 62%)",
  violet: "hsl(252, 90%, 72%)",
  success: "hsl(153, 66%, 38%)",
  successLight: "hsl(153, 72%, 92%)",
  warning: "hsl(39, 94%, 50%)",
  warningLight: "hsl(39, 96%, 92%)",
  destructive: "hsl(0, 78%, 56%)",
  destructiveLight: "hsl(0, 80%, 95%)",

  border: "hsl(215, 28%, 88%)",
  borderLight: "hsl(214, 36%, 93%)",
  glassBg: "rgba(255, 255, 255, 0.72)",
  glassDark: "rgba(8, 22, 48, 0.66)",

  sidebarBg: "hsl(222, 50%, 9%)",
  sidebarFg: "hsl(216, 38%, 96%)",
  sidebarActive: "hsl(217, 88%, 54%)",
  sidebarMuted: "hsl(217, 18%, 70%)",
  sidebarBorder: "hsl(222, 30%, 16%)",
};

export const GRADIENT_PRIMARY = `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryGlow})`;
export const GRADIENT_DARK = `linear-gradient(135deg, ${COLORS.bgDark} 0%, hsl(222, 48%, 10%) 58%, hsl(217, 100%, 36%) 130%)`;
export const GRADIENT_TEXT = `linear-gradient(100deg, ${COLORS.foreground} 0%, ${COLORS.primary} 54%, ${COLORS.primaryGlow} 100%)`;

export const SHADOW = {
  soft: "0 18px 48px rgba(6, 19, 38, 0.12)",
  strong: "0 42px 100px rgba(6, 19, 38, 0.22)",
  glow: "0 26px 80px rgba(11, 103, 255, 0.32)",
  darkGlow: "0 30px 90px rgba(77, 172, 255, 0.26)",
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
