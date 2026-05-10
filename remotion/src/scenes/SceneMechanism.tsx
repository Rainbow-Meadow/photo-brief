import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { MonoLabel } from "../components/MonoLabel";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.02 — MECHANISM (RMBC · 2/4)
 * The Reverse-Form Method™. A phone (left) slides toward a brief packet (right);
 * an amber connector locks them at the centre. Annotations call the move out.
 */
export const SceneMechanism: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides in from left, brief packet from right; both meet at the connector.
  const slide = spring({ frame: frame - 10, fps, config: { damping: 200 }, durationInFrames: 50 });
  const phoneX = interpolate(slide, [0, 1], [-280, 0]);
  const briefX = interpolate(slide, [0, 1], [280, 0]);

  // Amber connector pulses in
  const connector = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 130 } });
  const connectorOpacity = interpolate(connector, [0, 1], [0, 1]);
  const connectorScale = interpolate(connector, [0, 1], [0.4, 1]);

  // Camera viewfinder reticle on phone screen pulses
  const reticlePulse = 1 + Math.sin((frame / 12) * Math.PI) * 0.03;

  // Capture beat — flash white briefly at frame 130
  const flash = interpolate(frame, [130, 138, 150], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <PlateFrame plate="PLT.A.02" label="RMBC / 02 · MECHANISM">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* PHONE — left */}
          <g transform={`translate(${680 + phoneX}, 540)`}>
            {/* phone body */}
            <DrawnPath
              d="M -110 -200 L 110 -200 Q 130 -200 130 -180 L 130 180 Q 130 200 110 200 L -110 200 Q -130 200 -130 180 L -130 -180 Q -130 -200 -110 -200 Z"
              delay={6}
              duration={28}
              strokeWidth={STROKE.contour}
            />
            {/* speaker slit */}
            <DrawnPath d="M -28 -176 L 28 -176" delay={32} duration={8} strokeWidth={2} />
            {/* viewport */}
            <rect x={-100} y={-150} width={200} height={300} fill="none" stroke={COLORS.inkDim} strokeWidth={1} />
            {/* reticle (camera target) */}
            <g transform={`scale(${reticlePulse})`} style={{ transformOrigin: "center" }}>
              <rect x={-44} y={-44} width={88} height={88} fill="none" stroke={COLORS.amber} strokeWidth={2} />
              <line x1={-22} y1={0} x2={-8} y2={0} stroke={COLORS.amber} strokeWidth={2} />
              <line x1={8} y1={0} x2={22} y2={0} stroke={COLORS.amber} strokeWidth={2} />
              <line x1={0} y1={-22} x2={0} y2={-8} stroke={COLORS.amber} strokeWidth={2} />
              <line x1={0} y1={8} x2={0} y2={22} stroke={COLORS.amber} strokeWidth={2} />
            </g>
            {/* faint subject contour inside viewport — implies "right shot" */}
            <DrawnPath
              d="M -80 110 L -30 70 L 10 95 L 60 60 L 90 80 L 90 130 L -80 130 Z"
              delay={40}
              duration={20}
              strokeWidth={1}
              stroke={COLORS.inkDim}
            />
            {/* home indicator */}
            <DrawnPath d="M -36 184 L 36 184" delay={44} duration={8} strokeWidth={3} />
          </g>

          {/* AMBER CONNECTOR — locks phone + brief together */}
          <g transform="translate(960, 540)" opacity={connectorOpacity} style={{ transformOrigin: "center" }}>
            <line x1={-130} y1={0} x2={130} y2={0} stroke={COLORS.amber} strokeWidth={4} />
            <circle r={28 * connectorScale} fill={COLORS.amber} />
            <circle r={48 * connectorScale} fill="none" stroke={COLORS.amber} strokeWidth={1} opacity={0.5} />
          </g>

          {/* BRIEF PACKET — right */}
          <g transform={`translate(${1240 + briefX}, 540)`}>
            {/* outer cover */}
            <DrawnPath
              d="M -130 -200 L 130 -200 L 130 200 L -130 200 Z"
              delay={6}
              duration={28}
              strokeWidth={STROKE.contour}
            />
            {/* fold line */}
            <DrawnPath d="M -130 -120 L 130 -120" delay={36} duration={14} strokeWidth={1} stroke={COLORS.inkDim} />
            {/* photo strip */}
            <rect x={-100} y={-90} width={200} height={120} fill="none" stroke={COLORS.inkDim} strokeWidth={1} />
            <DrawnPath d="M -100 -30 L 100 -30" delay={48} duration={12} strokeWidth={1} stroke={COLORS.inkFaint} />
            <DrawnPath d="M -100 -30 L 100 -90" delay={48} duration={14} strokeWidth={1} stroke={COLORS.inkFaint} />
            <DrawnPath d="M -100 -90 L 100 -30" delay={48} duration={14} strokeWidth={1} stroke={COLORS.inkFaint} />
            {/* text lines */}
            <DrawnPath d="M -100 70 L 100 70" delay={56} duration={10} strokeWidth={1} stroke={COLORS.inkDim} />
            <DrawnPath d="M -100 96 L 60 96" delay={60} duration={10} strokeWidth={1} stroke={COLORS.inkDim} />
            <DrawnPath d="M -100 122 L 80 122" delay={64} duration={10} strokeWidth={1} stroke={COLORS.inkDim} />
            <DrawnPath d="M -100 148 L 40 148" delay={68} duration={10} strokeWidth={1} stroke={COLORS.inkDim} />
          </g>

          {/* dimension hairlines */}
          <DrawnPath d="M 540 760 L 1380 760" delay={90} duration={24} strokeWidth={1} stroke={COLORS.inkFaint} />
          <DrawnPath d="M 540 752 L 540 770" delay={108} duration={6} strokeWidth={1} stroke={COLORS.inkDim} />
          <DrawnPath d="M 1380 752 L 1380 770" delay={108} duration={6} strokeWidth={1} stroke={COLORS.inkDim} />

          {/* labels */}
          <MonoLabel
            number="02"
            text="REVERSE-FORM METHOD"
            x={1500}
            y={250}
            delay={70}
            leaderTo={{ x: 1320, y: 360 }}
          />
        </svg>

        {/* capture flash */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "white",
            opacity: flash,
            pointerEvents: "none",
          }}
        />

        <Headline frame={frame}>You tell them what to send.</Headline>
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
