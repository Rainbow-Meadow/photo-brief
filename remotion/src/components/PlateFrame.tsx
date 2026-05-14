import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, PLATE } from "../theme";

interface Props {
  plate: string;
  label: string;
  children: React.ReactNode;
}

const GRID = 60;

/**
 * Field Manual plate frame — vertical 1080×1920. Faint grid, corner ticks,
 * top-left scene label, bottom-right plate code, bottom-left wordmark whisper.
 */
export const PlateFrame: React.FC<Props> = ({ plate, label, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const chromeIn = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.bg, opacity: fadeIn }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: chromeIn }}>
        <defs>
          <pattern id="grid" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
            <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke={COLORS.inkGrid} strokeWidth={1} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <CornerTicks opacity={chromeIn} W={width} H={height} />

      {/* top-left label */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 60,
          opacity: chromeIn,
          ...PLATE.monoSmall,
          fontSize: 16,
        }}
      >
        <span style={{ color: COLORS.amber, marginRight: 12 }}>◆</span>
        {label}
      </div>

      {/* bottom-right plate code */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          opacity: chromeIn,
          fontFamily: FONT.mono,
          fontSize: 14,
          letterSpacing: "0.28em",
          color: COLORS.inkDim,
          textTransform: "uppercase",
        }}
      >
        {plate}
      </div>

      {/* bottom-left wordmark whisper */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 60,
          opacity: chromeIn,
          fontFamily: FONT.mono,
          fontSize: 13,
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

const CornerTicks: React.FC<{ opacity: number; W: number; H: number }> = ({ opacity, W, H }) => {
  const T = 22;
  const M = 36;
  const stroke = COLORS.inkFaint;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
      <path d={`M${M} ${M + T} L${M} ${M} L${M + T} ${M}`} stroke={stroke} fill="none" strokeWidth={1.5} />
      <path d={`M${W - M - T} ${M} L${W - M} ${M} L${W - M} ${M + T}`} stroke={stroke} fill="none" strokeWidth={1.5} />
      <path d={`M${M} ${H - M - T} L${M} ${H - M} L${M + T} ${H - M}`} stroke={stroke} fill="none" strokeWidth={1.5} />
      <path d={`M${W - M - T} ${H - M} L${W - M} ${H - M} L${W - M} ${H - M - T}`} stroke={stroke} fill="none" strokeWidth={1.5} />
    </svg>
  );
};
