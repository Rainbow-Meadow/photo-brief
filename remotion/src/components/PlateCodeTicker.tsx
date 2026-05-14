import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONT } from "../theme";

interface Props {
  /** Total composition frame, NOT scene-relative — pass in from MainVideo */
  totalFrame: number;
  totalFrames: number;
}

/**
 * Bottom-strip plate code that reads as a film leader: a frame counter
 * that ticks up alongside a timecode. Rendered above all scenes as a
 * persistent layer.
 */
export const PlateCodeTicker: React.FC<Props> = ({ totalFrame, totalFrames }) => {
  const tc = framesToTimecode(totalFrame);
  const progress = interpolate(totalFrame, [0, totalFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        display: "flex",
        justifyContent: "center",
        padding: "0 60px",
        fontFamily: FONT.mono,
        fontSize: 12,
        letterSpacing: "0.32em",
        color: COLORS.inkDim,
        textTransform: "uppercase",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span>{tc}</span>
        <ProgressBar progress={progress} />
        <span>{framesToTimecode(totalFrames)}</span>
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      width: 220,
      height: 2,
      background: "rgba(244,241,234,0.12)",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: `${progress * 100}%`,
        background: COLORS.amber,
      }}
    />
  </div>
);

function framesToTimecode(f: number) {
  const totalSec = f / 30;
  const m = Math.floor(totalSec / 60);
  const s = Math.floor(totalSec % 60);
  const ff = f % 30;
  return `${pad(m)}:${pad(s)}:${pad(ff)}`;
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
