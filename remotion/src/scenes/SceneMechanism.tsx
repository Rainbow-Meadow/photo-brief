import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { MonoLabel } from "../components/MonoLabel";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.03 — MECHANISM
 * Three interlocking gears, the smallest one amber. Dimension ticks on diameters.
 */
export const SceneMechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // gears rotate slowly
  const r1 = (frame / fps) * 22;     // big, slow
  const r2 = -(frame / fps) * 33;    // mid, opposite
  const r3 = (frame / fps) * 64;     // small, fast

  const amberIn = spring({ frame: frame - 70, fps, config: { damping: 14 } });

  // Gear at (cx, cy) with N teeth, outer radius rOut, drawing as petal-style stroke.
  const gear = (cx: number, cy: number, rOut: number, rIn: number, n: number, rot: number, color: string, sw: number, key: string) => {
    const teeth = Array.from({ length: n }, (_, i) => {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = ((i + 0.5) / n) * Math.PI * 2;
      const a2 = ((i + 1) / n) * Math.PI * 2;
      const p0 = [Math.cos(a0) * rIn, Math.sin(a0) * rIn];
      const p1 = [Math.cos(a0) * rOut, Math.sin(a0) * rOut];
      const p2 = [Math.cos(a1) * rOut, Math.sin(a1) * rOut];
      const p3 = [Math.cos(a2) * rIn, Math.sin(a2) * rIn];
      return `M${p0[0]},${p0[1]} L${p1[0]},${p1[1]} L${p2[0]},${p2[1]} L${p3[0]},${p3[1]}`;
    }).join(" ");
    return (
      <g key={key} transform={`translate(${cx}, ${cy}) rotate(${rot})`}>
        <circle r={rIn} fill="none" stroke={color} strokeWidth={sw} />
        <path d={teeth} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" />
        <circle r={rIn * 0.18} fill="none" stroke={color} strokeWidth={sw} />
      </g>
    );
  };

  return (
    <PlateFrame plate="PLT.A.03" label="RFM-METHOD / MECHANISM">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* Big gear (left) */}
          {frame > 8 ? gear(720, 540, 220, 200, 16, r1, COLORS.ink, STROKE.contour, "g1") : null}
          {/* Mid gear (right) */}
          {frame > 18 ? gear(1110, 460, 150, 134, 12, r2, COLORS.ink, STROKE.contour, "g2") : null}
          {/* Small amber gear (top right) */}
          {frame > 32 ? (
            <g opacity={amberIn}>{gear(1310, 320, 78, 66, 10, r3, COLORS.amber, 3, "g3")}</g>
          ) : null}

          {/* dimension ticks on big gear */}
          <DrawnPath d="M 480 540 L 460 540" delay={50} duration={10} strokeWidth={1} stroke={COLORS.inkDim} />
          <DrawnPath d="M 960 540 L 980 540" delay={50} duration={10} strokeWidth={1} stroke={COLORS.inkDim} />
          <DrawnPath d="M 470 540 L 970 540" delay={56} duration={20} strokeWidth={1} stroke={COLORS.inkFaint} />

          {/* labels */}
          <MonoLabel number="02" text="MECHANISM" x={1500} y={250} delay={70} leaderTo={{ x: 1370, y: 290 }} />
        </svg>

        <Headline frame={frame}>Mechanism, in their pocket.</Headline>
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
        fontSize: 92,
        lineHeight: 1.02,
        color: COLORS.ink,
        letterSpacing: "-0.02em",
        maxWidth: 720,
      }}
    >
      {children}
    </div>
  );
};
