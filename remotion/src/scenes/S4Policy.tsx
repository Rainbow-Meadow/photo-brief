import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { PhotoPolicyChip } from "../components/ui/PhotoPolicyChip";
import { SCENES } from "../script";

const SPEC = SCENES[3];

const POLICIES = ["not_needed", "optional", "recommended", "required"] as const;

/** S4 — Photo policy. 2×2 grid of chips, the last one (required) lights amber. */
export const S4Policy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 240 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
            width: 880,
          }}
        >
          {POLICIES.map((p, i) => {
            const sp = spring({
              frame: frame - 14 - i * 9,
              fps,
              config: { damping: 20, stiffness: 180 },
              durationInFrames: 22,
            });
            const opacity = interpolate(sp, [0, 1], [0, 1]);
            const y = interpolate(sp, [0, 1], [30, 0]);
            const scale = interpolate(sp, [0, 1], [0.94, 1]);
            return (
              <div key={p} style={{ opacity, transform: `translateY(${y}px) scale(${scale})` }}>
                <PhotoPolicyChip policy={p} active />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} anchor="bottom" />
    </PlateFrame>
  );
};
