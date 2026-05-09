import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { MonoLabel } from "../components/MonoLabel";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.04 — BRIEF
 * Folded brief packet, exploded to 3 stacked layers. Amber band on the cover.
 */
export const SceneBrief: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // each layer slides in
  const lay = (delay: number) => {
    const s = spring({ frame: frame - delay, fps, config: { damping: 200 }, durationInFrames: 28 });
    return s;
  };

  const l1 = lay(10);   // back: summary
  const l2 = lay(22);   // mid: photos
  const l3 = lay(36);   // front: cover

  const amberBand = spring({ frame: frame - 70, fps, config: { damping: 14, stiffness: 120 } });

  return (
    <PlateFrame plate="PLT.A.04" label="RFM-METHOD / BRIEF">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* layer 3 — summary (deepest, smallest offset) */}
          <g transform={`translate(${1000 - 60 * l1}, ${620 - 60 * l1})`} opacity={l1}>
            <rect x={-260} y={-340} width={520} height={680} fill={COLORS.bg} stroke={COLORS.ink} strokeWidth={STROKE.hairline} />
            {/* lines representing copy */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={i} x1={-220} y1={-280 + i * 38} x2={120 + (i % 3) * 60} y2={-280 + i * 38} stroke={COLORS.inkDim} strokeWidth={1} />
            ))}
            <text x={-220} y={310} style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: "0.22em", fill: COLORS.inkFaint, textTransform: "uppercase" }}>
              SUMMARY
            </text>
          </g>

          {/* layer 2 — photos */}
          <g transform={`translate(${1000 - 30 * l2}, ${620 - 30 * l2})`} opacity={l2}>
            <rect x={-260} y={-340} width={520} height={680} fill={COLORS.bg} stroke={COLORS.ink} strokeWidth={STROKE.hairline} />
            {/* photo placeholders */}
            <rect x={-220} y={-300} width={200} height={140} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <line x1={-220} y1={-300} x2={-20} y2={-160} stroke={COLORS.ink} strokeWidth={1} />
            <line x1={-20} y1={-300} x2={-220} y2={-160} stroke={COLORS.ink} strokeWidth={1} />

            <rect x={20} y={-300} width={200} height={140} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <line x1={20} y1={-300} x2={220} y2={-160} stroke={COLORS.ink} strokeWidth={1} />
            <line x1={220} y1={-300} x2={20} y2={-160} stroke={COLORS.ink} strokeWidth={1} />

            <rect x={-220} y={-100} width={440} height={200} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <line x1={-220} y1={-100} x2={220} y2={100} stroke={COLORS.ink} strokeWidth={1} />
            <line x1={220} y1={-100} x2={-220} y2={100} stroke={COLORS.ink} strokeWidth={1} />

            <text x={-220} y={310} style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: "0.22em", fill: COLORS.inkFaint, textTransform: "uppercase" }}>
              PHOTOS · 03
            </text>
          </g>

          {/* layer 1 — cover with amber band */}
          <g transform={`translate(${1000}, ${620})`} opacity={l3}>
            <rect x={-260} y={-340} width={520} height={680} fill={COLORS.bg} stroke={COLORS.ink} strokeWidth={STROKE.contour} />
            {/* amber band */}
            <rect
              x={-260}
              y={-340}
              width={520 * amberBand}
              height={64}
              fill={COLORS.amber}
            />
            {/* serif title */}
            <text x={-220} y={-30} style={{ fontFamily: FONT.display, fontSize: 56, fill: COLORS.ink, letterSpacing: "-0.02em" }}>
              PhotoBrief
            </text>
            <text x={-220} y={20} style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: "0.24em", fill: COLORS.inkDim, textTransform: "uppercase" }}>
              Job · 7821 · Roof Repair
            </text>
            {/* hairlines */}
            <line x1={-220} y1={80} x2={220} y2={80} stroke={COLORS.inkFaint} strokeWidth={1} />
            <text x={-220} y={140} style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: "0.22em", fill: COLORS.inkFaint, textTransform: "uppercase" }}>
              READY-TO-QUOTE
            </text>
          </g>

          <MonoLabel number="03" text="BRIEF" x={520} y={400} delay={80} leaderTo={{ x: 720, y: 460 }} />
        </svg>

        <Headline frame={frame}>A brief, written for the way you quote.</Headline>
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
        top: 200,
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: FONT.display,
        fontSize: 80,
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
