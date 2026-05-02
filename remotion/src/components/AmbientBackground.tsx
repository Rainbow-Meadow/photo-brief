import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";

export const AmbientBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const x1 = interpolate(frame, [0, 2400], [-100, 120]);
  const y1 = interpolate(frame, [0, 2400], [-80, 60]);
  const x2 = interpolate(frame, [0, 2400], [80, -160]);
  const y2 = interpolate(frame, [0, 2400], [60, -60]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${COLORS.bgWarm} 0%, ${COLORS.bg} 50%, ${COLORS.bg} 100%)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -300 + y1,
          left: -300 + x1,
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.primary}, transparent 70%)`,
          opacity: 0.12,
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 300 + y2,
          right: -400 + x2,
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${COLORS.primaryGlow}, transparent 70%)`,
          opacity: 0.10,
          filter: "blur(80px)",
        }}
      />
    </AbsoluteFill>
  );
};
