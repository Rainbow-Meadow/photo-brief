import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { MonoLabel } from "../components/MonoLabel";
import { COLORS, FONT, STROKE } from "../theme";

/**
 * PLT.A.03 — BENEFITS (RMBC · 3/4)
 * Three benefit plates draw on in sequence, each marked with a hairline
 * check. A "READY-TO-QUOTE" amber stamp lands on the final beat.
 */
export const SceneBenefits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stamp at the very end
  const stampIn = spring({ frame: frame - 200, fps, config: { damping: 10, stiffness: 110 } });
  const stampOpacity = interpolate(stampIn, [0, 1], [0, 1]);
  const stampScale = interpolate(stampIn, [0, 1], [0.6, 1]);

  return (
    <PlateFrame plate="PLT.A.03" label="RMBC / 03 · BENEFITS">
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <BenefitPlate
            x={760}
            y={380}
            delay={20}
            label="01"
            kicker="ON FIRST REPLY"
            title="Quote-ready packet"
            sub="Photos in order. Address geocoded. Notes attached."
            frame={frame}
          />
          <BenefitPlate
            x={760}
            y={560}
            delay={70}
            label="02"
            kicker="NO CHASING"
            title="No callbacks"
            sub="The lead doesn't cool. The job moves."
            frame={frame}
          />
          <BenefitPlate
            x={760}
            y={740}
            delay={120}
            label="03"
            kicker="ESTIMATOR-READY"
            title="Inbox · CRM · PDF"
            sub="Formatted for the person writing the quote."
            frame={frame}
          />

          {/* READY-TO-QUOTE stamp */}
          <g
            opacity={stampOpacity}
            style={{
              transformOrigin: "center",
              transform: `translate(1620px, 540px) rotate(8deg) scale(${stampScale})`,
            }}
          >
            <rect x={-150} y={-100} width={300} height={200} fill="none" stroke={COLORS.amber} strokeWidth={4} />
            <rect x={-138} y={-88} width={276} height={176} fill="none" stroke={COLORS.amber} strokeWidth={1} opacity={0.5} />
            <text
              x={0}
              y={-28}
              textAnchor="middle"
              style={{
                fontFamily: FONT.mono,
                fontSize: 22,
                letterSpacing: "0.22em",
                fill: COLORS.amber,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Ready
            </text>
            <text
              x={0}
              y={4}
              textAnchor="middle"
              style={{
                fontFamily: FONT.display,
                fontSize: 42,
                letterSpacing: "-0.02em",
                fill: COLORS.ink,
                fontWeight: 600,
              }}
            >
              to quote
            </text>
            <line x1={-100} y1={28} x2={100} y2={28} stroke={COLORS.amber} strokeWidth={1} opacity={0.6} />
            <text
              x={0}
              y={62}
              textAnchor="middle"
              style={{
                fontFamily: FONT.mono,
                fontSize: 12,
                letterSpacing: "0.32em",
                fill: COLORS.inkDim,
                textTransform: "uppercase",
              }}
            >
              PhotoBrief · A.03
            </text>
          </g>

          <MonoLabel
            number="03"
            text="WHAT CHANGES"
            x={160}
            y={920}
            delay={20}
          />
        </svg>

        <Headline frame={frame}>What lands in your inbox.</Headline>
      </AbsoluteFill>
    </PlateFrame>
  );
};

interface PlateProps {
  x: number;
  y: number;
  delay: number;
  label: string;
  kicker: string;
  title: string;
  sub: string;
  frame: number;
}

const BenefitPlate: React.FC<PlateProps> = ({ x, y, delay, label, kicker, title, sub, frame }) => {
  const opacity = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const slide = interpolate(frame - delay, [0, 22], [24, 0], { extrapolateRight: "clamp" });
  const checkProgress = interpolate(frame - delay - 12, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g transform={`translate(${x}, ${y + slide})`} opacity={opacity}>
      {/* plate frame */}
      <rect x={0} y={-58} width={680} height={116} fill="none" stroke={COLORS.ink} strokeWidth={STROKE.contour} />
      {/* check ring */}
      <g transform="translate(54, 0)">
        <circle r={28} fill="none" stroke={COLORS.amber} strokeWidth={2} />
        <path
          d="M -12 2 L -2 14 L 16 -10"
          fill="none"
          stroke={COLORS.amber}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={50}
          strokeDashoffset={50 * (1 - checkProgress)}
        />
      </g>
      {/* number */}
      <text
        x={108}
        y={-22}
        style={{
          fontFamily: FONT.mono,
          fontSize: 12,
          letterSpacing: "0.28em",
          fill: COLORS.inkDim,
          textTransform: "uppercase",
        }}
      >
        {label} · {kicker}
      </text>
      {/* title */}
      <text
        x={108}
        y={14}
        style={{
          fontFamily: FONT.display,
          fontSize: 38,
          letterSpacing: "-0.01em",
          fill: COLORS.ink,
          fontWeight: 500,
        }}
      >
        {title}
      </text>
      {/* sub */}
      <text
        x={108}
        y={40}
        style={{
          fontFamily: FONT.mono,
          fontSize: 14,
          letterSpacing: "0.06em",
          fill: COLORS.inkDim,
        }}
      >
        {sub}
      </text>
    </g>
  );
};

const Headline: React.FC<{ frame: number; children: React.ReactNode }> = ({ frame, children }) => {
  const opacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [10, 40], [16, 0], { extrapolateRight: "clamp" });
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
        lineHeight: 1.02,
        color: COLORS.ink,
        letterSpacing: "-0.02em",
        maxWidth: 600,
      }}
    >
      {children}
    </div>
  );
};
