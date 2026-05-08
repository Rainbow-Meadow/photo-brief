import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING } from "../theme";

export const SceneLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: SPRING.bouncy });
  const scale = interpolate(s, [0, 1], [0.88, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  const sub = spring({ frame: frame - 12, fps, config: SPRING.smooth });
  const subOpacity = interpolate(sub, [0, 1], [0, 1]);
  const subY = interpolate(sub, [0, 1], [10, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: FONT.display }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 24,
          opacity,
          transform: `scale(${scale})`,
          filter: `drop-shadow(0 24px 60px rgba(242, 163, 58, 0.22))`,
        }}>
          <Img
            src={staticFile("brand/mark-color.png")}
            style={{ height: 180, width: 180, objectFit: "contain" }}
          />
          <span style={{
            fontSize: 120, fontWeight: 900, letterSpacing: -6, whiteSpace: "nowrap", lineHeight: 1,
          }}>
            <span style={{ color: COLORS.navy }}>Photo</span>
            <span style={{ color: COLORS.amber }}>Brief</span>
            <span style={{ color: COLORS.navy, opacity: 0.55, fontWeight: 700, fontSize: 74, marginLeft: 4 }}>.ai</span>
          </span>
        </div>
        <div
          style={{
            marginTop: 32,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.navy,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          Guide · Capture · Close
        </div>
      </div>
    </AbsoluteFill>
  );
};
