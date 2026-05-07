import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, FONT, GRADIENT_PRIMARY, SHADOW, SPRING } from "../theme";

export function useEntrance(delay = 0, from = 24) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: SPRING.cinematic });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [from, 0])}px) scale(${interpolate(s, [0, 1], [0.985, 1])})`,
  } as React.CSSProperties;
}

export const Kicker: React.FC<{ children: React.ReactNode; tone?: "light" | "dark" }> = ({ children, tone = "light" }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      borderRadius: 999,
      padding: "8px 14px",
      background: tone === "dark" ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.72)",
      border: tone === "dark" ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${COLORS.border}`,
      color: tone === "dark" ? "rgba(255,255,255,0.78)" : COLORS.primary,
      fontFamily: FONT.body,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: "uppercase",
      boxShadow: tone === "dark" ? "0 20px 60px rgba(0,0,0,0.24)" : SHADOW.soft,
      backdropFilter: "blur(18px)",
    }}
  >
    <span style={{ width: 7, height: 7, borderRadius: 999, background: tone === "dark" ? COLORS.cyan : COLORS.primary, boxShadow: `0 0 24px ${tone === "dark" ? COLORS.cyan : COLORS.primary}` }} />
    {children}
  </div>
);

export const BigTitle: React.FC<{ children: React.ReactNode; tone?: "light" | "dark"; maxWidth?: number }> = ({ children, tone = "light", maxWidth = 960 }) => (
  <h1
    style={{
      margin: "20px 0 0",
      maxWidth,
      fontFamily: FONT.display,
      fontSize: 82,
      lineHeight: 0.96,
      letterSpacing: -4.2,
      fontWeight: 780,
      color: tone === "dark" ? COLORS.white : COLORS.foreground,
    }}
  >
    {children}
  </h1>
);

export const BodyCopy: React.FC<{ children: React.ReactNode; tone?: "light" | "dark"; maxWidth?: number }> = ({ children, tone = "light", maxWidth = 690 }) => (
  <p
    style={{
      maxWidth,
      margin: "24px 0 0",
      fontFamily: FONT.body,
      fontSize: 25,
      lineHeight: 1.42,
      color: tone === "dark" ? "rgba(255,255,255,0.72)" : COLORS.muted,
    }}
  >
    {children}
  </p>
);

export const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ children, style, dark }) => (
  <div
    style={{
      background: dark ? COLORS.glassDark : COLORS.glassBg,
      border: dark ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${COLORS.border}`,
      boxShadow: dark ? SHADOW.darkGlow : SHADOW.strong,
      backdropFilter: "blur(24px)",
      borderRadius: 36,
      ...style,
    }}
  >
    {children}
  </div>
);

export const LogoLockup: React.FC<{ light?: boolean; height?: number }> = ({ light, height = 62 }) => {
  const wordmarkSize = Math.max(16, height * 0.72);
  const gradient = "linear-gradient(135deg, #f6f0ff 0%, #e7d4ff 24%, #c99aff 52%, #9f73ff 78%, #7f55ff 100%)";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: height * 0.16, filter: light ? "drop-shadow(0 18px 50px rgba(70, 168, 255, 0.28))" : "drop-shadow(0 18px 50px rgba(11, 103, 255, 0.20))" }}>
      <Img
        src={staticFile("brand/mark-color.png")}
        style={{ height, width: height, objectFit: "contain" }}
      />
      <span
        style={{
          fontFamily: FONT.display,
          fontSize: wordmarkSize,
          fontWeight: 800,
          letterSpacing: -0.06 * wordmarkSize,
          lineHeight: 1,
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          color: "transparent",
          whiteSpace: "nowrap",
        }}
      >
        PhotoBrief.ai
      </span>
    </div>
  );
};

export const FlowPill: React.FC<{ label: string; active?: boolean; dark?: boolean; delay?: number }> = ({ label, active, dark, delay = 0 }) => {
  const entrance = useEntrance(delay, 12);
  return (
    <div
      style={{
        ...entrance,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        borderRadius: 999,
        padding: "12px 18px",
        background: active ? GRADIENT_PRIMARY : dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)",
        border: active ? "1px solid rgba(255,255,255,0.25)" : dark ? "1px solid rgba(255,255,255,0.13)" : `1px solid ${COLORS.border}`,
        color: active ? COLORS.white : dark ? "rgba(255,255,255,0.78)" : COLORS.foreground,
        fontFamily: FONT.body,
        fontSize: 18,
        fontWeight: 700,
        boxShadow: active ? SHADOW.glow : "none",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 999, background: active ? COLORS.white : COLORS.primary }} />
      {label}
    </div>
  );
};

export function gradientTextStyle(): React.CSSProperties {
  return {
    backgroundImage: `linear-gradient(100deg, ${COLORS.white} 0%, ${COLORS.primaryGlow} 52%, ${COLORS.cyan} 100%)`,
    WebkitBackgroundClip: "text",
    color: "transparent",
  };
}
