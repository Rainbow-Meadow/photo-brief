import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { MonoLabel } from "../components/MonoLabel";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.01 — CAPTURE
 * Phone-shaped brief packet, photo viewport showing a faintly drawn job site.
 * Amber leader to a "READY-TO-QUOTE" stamp at the top corner.
 */
export const SceneCapture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneIn = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const stamp = spring({ frame: frame - 80, fps, config: { damping: 12, stiffness: 130 } });
  const stampOpacity = interpolate(stamp, [0, 1], [0, 1]);
  const stampRot = interpolate(stamp, [0, 1], [-18, -8]);
  const stampScale = interpolate(stamp, [0, 1], [0.85, 1]);

  return (
    <PlateFrame plate="PLT.A.01" label="RFM-METHOD / CAPTURE">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g transform={`translate(${1100}, ${540}) scale(${0.92 + 0.08 * phoneIn})`} opacity={phoneIn}>
            {/* phone body */}
            <rect x={-200} y={-360} width={400} height={720} rx={44} fill={COLORS.bg} stroke={COLORS.ink} strokeWidth={STROKE.contour} />
            {/* notch */}
            <rect x={-50} y={-348} width={100} height={20} rx={10} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            {/* viewport — photo of job site (faint) */}
            <rect x={-170} y={-300} width={340} height={500} fill="none" stroke={COLORS.inkDim} strokeWidth={1} />
            {/* job site sketch inside */}
            <DrawnPath d="M -160 100 L -60 -30 L 40 60 L 160 -80" delay={20} duration={28} stroke={COLORS.inkDim} strokeWidth={1.5} />
            <DrawnPath d="M -170 200 L 170 200" delay={26} duration={14} stroke={COLORS.inkDim} strokeWidth={1} />
            {/* viewfinder frame inside */}
            <DrawnPath d="M -130 -260 L -90 -260 M -130 -260 L -130 -220" delay={34} duration={10} stroke={COLORS.amber} strokeWidth={2} />
            <DrawnPath d="M 90 -260 L 130 -260 M 130 -260 L 130 -220" delay={36} duration={10} stroke={COLORS.amber} strokeWidth={2} />
            <DrawnPath d="M -130 160 L -130 200 L -90 200" delay={38} duration={10} stroke={COLORS.amber} strokeWidth={2} />
            <DrawnPath d="M 90 200 L 130 200 L 130 160" delay={40} duration={10} stroke={COLORS.amber} strokeWidth={2} />
            {/* shutter button */}
            <circle cx={0} cy={290} r={28} fill="none" stroke={COLORS.ink} strokeWidth={1.5} />
            <circle cx={0} cy={290} r={20} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            {/* status bar */}
            <text x={-160} y={-330} style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: "0.18em", fill: COLORS.inkDim, textTransform: "uppercase" }}>
              PHOTOBRIEF · 04 / 06
            </text>
          </g>

          {/* stamp top-right */}
          <g
            transform={`translate(${1500}, ${260}) rotate(${stampRot}) scale(${stampScale})`}
            opacity={stampOpacity}
          >
            <rect x={-160} y={-44} width={320} height={88} fill="none" stroke={COLORS.amber} strokeWidth={3} />
            <rect x={-152} y={-36} width={304} height={72} fill="none" stroke={COLORS.amber} strokeWidth={1} />
            <text
              x={0}
              y={8}
              textAnchor="middle"
              style={{ fontFamily: FONT.mono, fontSize: 22, letterSpacing: "0.26em", fill: COLORS.amber, fontWeight: 700, textTransform: "uppercase" }}
            >
              READY-TO-QUOTE
            </text>
          </g>

          {/* leader from stamp toward phone */}
          <DrawnPath d="M 1340 280 L 1170 360" delay={92} duration={16} strokeWidth={1} stroke={COLORS.amber} />

          <MonoLabel number="04" text="CAPTURE" x={520} y={500} delay={70} leaderTo={{ x: 870, y: 540 }} />
        </svg>

        <Headline frame={frame}>Ready to quote, before the call.</Headline>
      </AbsoluteFill>
    </PlateFrame>
  );
};

const Headline: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const opacity = interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [60, 90], [16, 0], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        top: 220,
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: FONT.display,
        fontSize: 84,
        lineHeight: 1.04,
        color: COLORS.ink,
        letterSpacing: "-0.02em",
        maxWidth: 640,
      }}
    >
      {children}
    </div>
  );
};
