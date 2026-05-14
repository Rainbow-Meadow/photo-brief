import React from "react";
import { interpolate, spring } from "remotion";
import { COLORS, FONT } from "../../theme";

interface Props {
  /** 0..1 target value */
  value: number;
  size?: number;
  /** local frame for animation */
  frame: number;
  fps: number;
  delay?: number;
}

export const ReadinessRing: React.FC<Props> = ({
  value,
  size = 180,
  frame,
  fps,
  delay = 0,
}) => {
  const p = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 80 },
    durationInFrames: 60,
  });
  const v = interpolate(p, [0, 1], [0, value]);
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  const pct = Math.round(v * 100);

  return (
    <div style={{ width: size, height: size, position: "relative" }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(159,179,200,0.18)"
          strokeWidth={10}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={COLORS.amber}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.display,
          color: COLORS.ink,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em" }}>{pct}%</div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: "0.32em",
            color: COLORS.inkDim,
            textTransform: "uppercase",
            marginTop: 2,
          }}
        >
          ready
        </div>
      </div>
    </div>
  );
};
