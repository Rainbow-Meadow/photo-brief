// PhotoBrief demo video — Blue/White/Gray SaaS palette
export const COLORS = {
  // Backgrounds
  bg: "hsl(220, 20%, 98%)",
  bgWarm: "hsl(220, 16%, 96%)",
  bgDark: "hsl(220, 26%, 14%)",
  bgCard: "#FFFFFF",

  // Text
  foreground: "hsl(222, 47%, 11%)",
  muted: "hsl(220, 9%, 46%)",
  mutedLight: "hsl(220, 14%, 70%)",

  // Primary blue
  primary: "hsl(217, 91%, 55%)",
  primaryGlow: "hsl(217, 91%, 65%)",
  primaryLight: "hsl(217, 92%, 95%)",
  primaryFg: "#FFFFFF",

  // Accents
  success: "hsl(152, 60%, 42%)",
  successLight: "hsl(152, 70%, 92%)",
  warning: "hsl(38, 92%, 50%)",
  warningLight: "hsl(38, 95%, 92%)",
  destructive: "hsl(0, 84%, 60%)",
  destructiveLight: "hsl(0, 80%, 95%)",

  // Surfaces
  border: "hsl(220, 13%, 91%)",
  borderLight: "hsl(220, 16%, 94%)",
  glassBg: "rgba(255, 255, 255, 0.85)",

  // Sidebar (dark)
  sidebarBg: "hsl(220, 26%, 14%)",
  sidebarFg: "hsl(0, 0%, 96%)",
  sidebarActive: "hsl(217, 80%, 52%)",
  sidebarMuted: "hsl(220, 14%, 70%)",
  sidebarBorder: "hsl(220, 20%, 20%)",
};

export const GRADIENT_PRIMARY = `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryGlow})`;

export const SPRING = {
  smooth: { damping: 20, stiffness: 180, mass: 1 },
  bouncy: { damping: 12, stiffness: 160, mass: 1 },
  snap: { damping: 22, stiffness: 240, mass: 1 },
};

export const FONT = {
  display: "Inter, system-ui, sans-serif",
  body: "Inter, system-ui, sans-serif",
};
