import React from "react";
import { AbsoluteFill, useCurrentFrame, random, interpolate } from "remotion";
import { COLORS } from "../theme";

/**
 * Persistent grain layer. Samples a small set of randomised dots per frame
 * to evoke filmic noise without blowing up render time. The pattern shifts
 * every 2 frames for organic movement.
 */
export const GrainOverlay: React.FC<{ opacity?: number; density?: number }> = ({
  opacity = 0.07,
  density = 600,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);

  const dots = Array.from({ length: density }, (_, i) => {
    const x = random(`x-${seed}-${i}`) * 1920;
    const y = random(`y-${seed}-${i}`) * 1080;
    const s = 0.6 + random(`s-${seed}-${i}`) * 1.2;
    const a = 0.25 + random(`a-${seed}-${i}`) * 0.75;
    return <circle key={i} cx={x} cy={y} r={s} fill={COLORS.ink} opacity={a} />;
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width={1920} height={1080}>{dots}</svg>
    </AbsoluteFill>
  );
};

/** A slow vignette that warms the corners. */
export const Vignette: React.FC = () => {
  const frame = useCurrentFrame();
  const breathe = interpolate(
    Math.sin((frame / 240) * Math.PI * 2),
    [-1, 1],
    [0.55, 0.7],
  );
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${breathe}) 100%)`,
      }}
    />
  );
};
