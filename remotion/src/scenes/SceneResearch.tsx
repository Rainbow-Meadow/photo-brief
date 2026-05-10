import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { MonoLabel } from "../components/MonoLabel";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.01 — RESEARCH (RMBC · 1/4)
 * Magnifier glass over a faint website wireframe. The "I NEED A QUOTE"
 * stamp appears mid-scene and visibly cools to grey to physicalise a dead lead.
 */
export const SceneResearch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wfOpacity = interpolate(frame, [12, 32], [0, 0.55], { extrapolateRight: "clamp" });

  const rim = spring({ frame: frame - 70, fps, config: { damping: 14, stiffness: 110 } });
  const rimOpacity = interpolate(rim, [0, 1], [0, 1]);
  const rimScale = interpolate(rim, [0, 1], [0.92, 1]);

  // Subject drift
  const drift = Math.sin((frame / 30) * Math.PI) * 4;

  // Stamp appears mid-scene; rotates slightly; cools to grey at the end.
  const stampIn = spring({ frame: frame - 150, fps, config: { damping: 10, stiffness: 90 } });
  const stampOpacity = interpolate(stampIn, [0, 1], [0, 1]);
  const stampScale = interpolate(stampIn, [0, 1], [0.6, 1]);
  // Death: amber → grey from frame 240 → 290
  const stampCool = interpolate(frame, [240, 290], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampColor = stampCool < 0.5 ? COLORS.amber : COLORS.inkFaint;
  const strikeProgress = interpolate(frame, [260, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <PlateFrame plate="PLT.A.01" label="RMBC / 01 · RESEARCH">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* faint website wireframe behind */}
          <g opacity={wfOpacity} transform="translate(560, 280)">
            <rect width={800} height={520} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <line x1={0} y1={64} x2={800} y2={64} stroke={COLORS.ink} strokeWidth={1} />
            <rect x={32} y={20} width={120} height={24} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <rect x={32} y={96} width={460} height={180} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <line x1={32} y1={300} x2={300} y2={300} stroke={COLORS.ink} strokeWidth={1} />
            <line x1={32} y1={324} x2={420} y2={324} stroke={COLORS.ink} strokeWidth={1} />
            <line x1={32} y1={348} x2={360} y2={348} stroke={COLORS.ink} strokeWidth={1} />
            {/* faux contact form fields */}
            <rect x={32} y={400} width={236} height={40} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <rect x={282} y={400} width={236} height={40} fill="none" stroke={COLORS.ink} strokeWidth={1} />
            <rect x={32} y={456} width={486} height={64} fill="none" stroke={COLORS.ink} strokeWidth={1} />
          </g>

          {/* magnifier */}
          <g transform={`translate(${860 + drift}, ${480 + drift / 2})`}>
            <DrawnPath
              d="M 0 0 m -160 0 a 160 160 0 1 0 320 0 a 160 160 0 1 0 -320 0"
              delay={20}
              duration={36}
            />
            <DrawnPath d="M 113 113 L 260 260" delay={48} duration={20} strokeWidth={STROKE.contour} />
            <DrawnPath d="M 240 240 L 320 320" delay={62} duration={14} strokeWidth={6} />
            <circle
              cx={0}
              cy={0}
              r={160}
              fill="none"
              stroke={COLORS.amber}
              strokeWidth={5}
              opacity={rimOpacity}
              style={{ transformOrigin: "center", transform: `scale(${rimScale})` }}
            />
            <DrawnPath d="M -40 0 L 40 0" delay={56} duration={14} strokeWidth={1} stroke={COLORS.inkDim} />
            <DrawnPath d="M 0 -40 L 0 40" delay={56} duration={14} strokeWidth={1} stroke={COLORS.inkDim} />
          </g>

          {/* leader + label */}
          <MonoLabel
            number="01"
            text="THE LEAK"
            x={1340}
            y={400}
            delay={80}
            leaderTo={{ x: 1020, y: 470 }}
          />

          {/* "I NEED A QUOTE" stamp — appears, then cools */}
          <g
            transform={`translate(1240, 820) rotate(-6)`}
            opacity={stampOpacity}
            style={{ transformOrigin: "center", transform: `translate(1240px, 820px) rotate(-6deg) scale(${stampScale})` }}
          >
            <rect x={-200} y={-46} width={400} height={92} fill="none" stroke={stampColor} strokeWidth={4} />
            <text
              x={0}
              y={12}
              textAnchor="middle"
              style={{
                fontFamily: FONT.mono,
                fontSize: 28,
                letterSpacing: "0.18em",
                fill: stampColor,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              "I need a quote"
            </text>
            {/* strike-through at the end */}
            <line
              x1={-200}
              y1={0}
              x2={-200 + 400 * strikeProgress}
              y2={0}
              stroke={COLORS.inkDim}
              strokeWidth={2}
              opacity={0.85}
            />
          </g>
        </svg>

        <Headline frame={frame}>Every contact form leaks.</Headline>
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
        maxWidth: 740,
      }}
    >
      {children}
    </div>
  );
};
