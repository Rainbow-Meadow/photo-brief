import React from "react";
import { COLORS, FONT } from "../../theme";

interface Props {
  width?: number;
  height?: number;
  children?: React.ReactNode;
  time?: string;
}

/**
 * Tilted phone frame for the recipient POV scene. SVG-pure, no asset.
 */
export const PhoneFrame: React.FC<Props> = ({
  width = 420,
  height = 860,
  children,
  time = "9:42",
}) => {
  const r = 56;
  return (
    <div
      style={{
        width,
        height,
        background: "#0a0a09",
        border: `8px solid #1c1f25`,
        borderRadius: r,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 50px 120px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(159,179,200,0.08)",
      }}
    >
      {/* status bar */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          fontFamily: FONT.ui,
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.ink,
          background: "transparent",
          position: "relative",
          zIndex: 2,
        }}
      >
        <span>{time}</span>
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 28,
            background: "#000",
            borderRadius: 16,
          }}
        />
        <span style={{ opacity: 0.85 }}>●●●●</span>
      </div>
      <div style={{ position: "relative", width: "100%", height: height - 44 - 16 }}>
        {children}
      </div>
    </div>
  );
};
