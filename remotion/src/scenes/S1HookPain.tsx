import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[0];

/** S1 — Hook + pain. Three big captions stacked, faint clock ticking in BG. */
export const S1HookPain: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.5 + 0.5 * Math.sin((frame / 30) * Math.PI);
  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* huge time digit watermark behind captions */}
        <div
          style={{
            position: "absolute",
            fontFamily: FONT.mono,
            fontSize: 600,
            color: COLORS.inkFaint,
            opacity: 0.35 + pulse * 0.1,
            letterSpacing: "-0.04em",
            top: 220,
            lineHeight: 1,
          }}
        >
          21:00
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};
