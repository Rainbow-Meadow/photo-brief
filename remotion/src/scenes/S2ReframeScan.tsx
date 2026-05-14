import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[1];

/** S2 — Reframe. "Contact Us" form crossed out, then captions land. */
export const S2ReframeScan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const formIn = spring({ frame, fps, config: { damping: 22, stiffness: 130 }, durationInFrames: 22 });
  const strikeP = interpolate(frame, [70, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const formOut = interpolate(frame, [120, 145], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 280 }}>
        {/* mock contact form */}
        <div
          style={{
            opacity: formIn * formOut,
            transform: `translateY(${interpolate(formIn, [0, 1], [40, 0])}px)`,
            width: 760,
            background: "rgba(159,179,200,0.04)",
            border: "1px solid rgba(159,179,200,0.16)",
            borderRadius: 14,
            padding: 36,
            position: "relative",
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 14,
              letterSpacing: "0.32em",
              color: COLORS.uiInkDim,
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            contact us
          </div>
          {["Name", "Email", "Message"].map((k, i) => (
            <div key={k} style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: FONT.ui, fontSize: 18, color: COLORS.uiInk, marginBottom: 6 }}>{k}</div>
              <div
                style={{
                  height: i === 2 ? 110 : 50,
                  background: "rgba(159,179,200,0.06)",
                  border: "1px solid rgba(159,179,200,0.14)",
                  borderRadius: 8,
                }}
              />
            </div>
          ))}
          {/* strikethrough */}
          <svg width={760} height={420} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <line
              x1={20}
              y1={400}
              x2={20 + (760 - 40) * strikeP}
              y2={20}
              stroke={COLORS.amber}
              strokeWidth={6}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} anchor="bottom" />
    </PlateFrame>
  );
};
