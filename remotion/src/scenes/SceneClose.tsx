import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.06 — CLOSE
 * Hexagon and square interlocking like a key + lock. Amber on the connection
 * point. Closing wordmark + tagline.
 */
export const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // hexagon and square slide together
  const drift = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 50 });
  const offset = interpolate(drift, [0, 1], [220, 0]);

  // amber connection dot pulses in at midpoint
  const dot = spring({ frame: frame - 60, fps, config: { damping: 12, stiffness: 130 } });
  const dotOpacity = interpolate(dot, [0, 1], [0, 1]);
  const dotScale = interpolate(dot, [0, 1], [0.4, 1]);

  // wordmark reveal late
  const wm = interpolate(frame, [80, 120], [0, 1], { extrapolateRight: "clamp" });
  const wmY = interpolate(frame, [80, 120], [12, 0], { extrapolateRight: "clamp" });

  // hexagon path centered at origin, "radius" 160
  const r = 160;
  const hex = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  }).join(" ");

  return (
    <PlateFrame plate="PLT.A.06" label="RFM-METHOD / CLOSE">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* hexagon (left) */}
          <g transform={`translate(${800 - offset}, 460)`}>
            <polygon points={hex} fill="none" stroke={COLORS.ink} strokeWidth={STROKE.contour} />
          </g>

          {/* square (right) — rotated diamond */}
          <g transform={`translate(${1120 + offset}, 460) rotate(45)`}>
            <rect x={-130} y={-130} width={260} height={260} fill="none" stroke={COLORS.ink} strokeWidth={STROKE.contour} />
          </g>

          {/* connection dot at center, between them */}
          <g transform="translate(960, 460)" opacity={dotOpacity} style={{ transformOrigin: "center" }}>
            <circle r={36 * dotScale} fill={COLORS.amber} />
            <circle r={56 * dotScale} fill="none" stroke={COLORS.amber} strokeWidth={1} opacity={0.5} />
          </g>

          {/* hairline frame for close caption */}
          <DrawnPath d="M 700 760 L 1220 760" delay={70} duration={20} strokeWidth={1} stroke={COLORS.inkFaint} />
        </svg>

        {/* wordmark */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 760,
            textAlign: "center",
            opacity: wm,
            transform: `translateY(${wmY}px)`,
            fontFamily: FONT.display,
            fontSize: 84,
            letterSpacing: "-0.02em",
            color: COLORS.ink,
            fontWeight: 500,
          }}
        >
          Photo<span style={{ color: COLORS.amber }}>Brief</span>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 880,
            textAlign: "center",
            opacity: wm,
            fontFamily: FONT.mono,
            fontSize: 18,
            letterSpacing: "0.42em",
            color: COLORS.inkDim,
            textTransform: "uppercase",
          }}
        >
          Guide · Capture · Close
        </div>
      </AbsoluteFill>
    </PlateFrame>
  );
};
