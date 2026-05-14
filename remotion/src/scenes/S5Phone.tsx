import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { PhoneFrame } from "../components/ui/PhoneFrame";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[4];

/** S5 — Recipient phone. Phone scales in, mock intake screen, captions stack at top. */
export const S5Phone: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const phoneIn = spring({ frame, fps, config: { damping: 22, stiffness: 110 }, durationInFrames: 28 });
  const phoneOpacity = interpolate(phoneIn, [0, 1], [0, 1]);
  const phoneScale = interpolate(phoneIn, [0, 1], [0.88, 1]);

  // Step indicator advances 0→3 over the scene
  const step = Math.min(3, Math.floor((frame - 30) / 45));

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
        <div
          style={{
            opacity: phoneOpacity,
            transform: `scale(${phoneScale})`,
            transformOrigin: "center",
          }}
        >
          <PhoneFrame width={520} height={1080}>
            <div style={{ padding: "28px 26px", height: "100%", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 13,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: COLORS.amber,
                }}
              >
                Apex Roofing
              </div>
              <div
                style={{
                  fontFamily: FONT.display,
                  fontSize: 42,
                  fontWeight: 500,
                  color: COLORS.ink,
                  letterSpacing: "-0.02em",
                  marginTop: 12,
                  lineHeight: 1.05,
                }}
              >
                What's going on{"\n"}with the roof?
              </div>

              {/* progress dots */}
              <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: i <= step ? COLORS.amber : "rgba(159,179,200,0.18)",
                    }}
                  />
                ))}
              </div>

              {/* mock chip answers */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
                {["A leak", "Missing shingles", "Storm damage", "Just a quote"].map((opt, i) => {
                  const selected = i === Math.min(3, step);
                  return (
                    <div
                      key={opt}
                      style={{
                        padding: "20px 22px",
                        borderRadius: 14,
                        border: `1.5px solid ${selected ? COLORS.amber : "rgba(159,179,200,0.18)"}`,
                        background: selected ? "rgba(242,163,58,0.10)" : "transparent",
                        fontFamily: FONT.ui,
                        fontSize: 22,
                        fontWeight: selected ? 600 : 500,
                        color: selected ? COLORS.amber : COLORS.ink,
                      }}
                    >
                      {opt}
                    </div>
                  );
                })}
              </div>

              <div style={{ flex: 1 }} />

              <div
                style={{
                  marginTop: 20,
                  padding: "20px 22px",
                  borderRadius: 14,
                  background: COLORS.amber,
                  color: "#0E0E0C",
                  fontFamily: FONT.ui,
                  fontWeight: 700,
                  fontSize: 22,
                  textAlign: "center",
                  letterSpacing: "0.02em",
                }}
              >
                Send →
              </div>
            </div>
          </PhoneFrame>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} anchor="bottom" />
    </PlateFrame>
  );
};
