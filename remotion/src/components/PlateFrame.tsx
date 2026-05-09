import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT, PLATE } from "../theme";

interface Props {
  plate: string;        // e.g. "PLT.A.02"
  label: string;        // e.g. "RFM-METHOD / RESEARCH"
  children: React.ReactNode;
}

const GRID = 64;

/**
 * Field Manual plate frame: solid dark navy bg, faint construction grid,
 * corner ticks, plate code bottom-right, scene label top-left.
 */
export const PlateFrame: React.FC<Props> = ({ plate, label, children }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const chromeIn = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, opacity: fadeIn }}>
      {/* construction grid */}
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: chromeIn }}
      >
        <defs>
          <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <path
              d={`M ${GRID} 0 L 0 0 0 ${GRID}`}
              fill="none"
              stroke={COLORS.inkGrid}
              strokeWidth={1}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* corner ticks */}
      <CornerTicks opacity={chromeIn} />

      {/* top-left label */}
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 80,
          opacity: chromeIn,
          ...PLATE.monoSmall,
        }}
      >
        <span style={{ color: COLORS.amber, marginRight: 14 }}>◆</span>
        {label}
      </div>

      {/* bottom-right plate code */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          right: 80,
          opacity: chromeIn,
          fontFamily: FONT.mono,
          fontSize: 12,
          letterSpacing: "0.28em",
          color: COLORS.inkDim,
          textTransform: "uppercase",
        }}
      >
        {plate}
        <span style={{ color: COLORS.inkFaint, margin: "0 12px" }}>/</span>
        <span style={{ color: COLORS.ink }}>RFM-METHOD</span>
      </div>

      {/* bottom-left wordmark whisper */}
      <div
        style={{
          position: "absolute",
          bottom: 56,
          left: 80,
          opacity: chromeIn,
          fontFamily: FONT.mono,
          fontSize: 11,
          letterSpacing: "0.32em",
          color: COLORS.inkFaint,
          textTransform: "uppercase",
        }}
      >
        PhotoBrief.ai
      </div>

      {children}
    </AbsoluteFill>
  );
};

const CornerTicks: React.FC<{ opacity: number }> = ({ opacity }) => {
  const T = 18; // tick length
  const M = 48; // margin from edge
  const W = 1920;
  const H = 1080;
  const stroke = COLORS.inkFaint;
  return (
    <svg
      width={W}
      height={H}
      style={{ position: "absolute", inset: 0, opacity }}
    >
      {/* top-left */}
      <path d={`M${M} ${M + T} L${M} ${M} L${M + T} ${M}`} stroke={stroke} fill="none" />
      {/* top-right */}
      <path d={`M${W - M - T} ${M} L${W - M} ${M} L${W - M} ${M + T}`} stroke={stroke} fill="none" />
      {/* bottom-left */}
      <path d={`M${M} ${H - M - T} L${M} ${H - M} L${M + T} ${H - M}`} stroke={stroke} fill="none" />
      {/* bottom-right */}
      <path d={`M${W - M - T} ${H - M} L${W - M} ${H - M} L${W - M} ${H - M - T}`} stroke={stroke} fill="none" />
    </svg>
  );
};
