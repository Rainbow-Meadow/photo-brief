import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Img,
  interpolate,
  spring,
} from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { PhotoPolicyChip } from "../components/ui/PhotoPolicyChip";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[4];

const QUESTIONS = [
  "What kind of roof? (asphalt · metal · tile · flat)",
  "Is there an active leak right now?",
  "Approximate square footage?",
  "When did the issue start?",
  "Is this a rental or owner-occupied?",
];

const POLICIES: Array<"not_needed" | "optional" | "recommended" | "required"> = [
  "not_needed",
  "optional",
  "recommended",
  "required",
];

const PHOTOS = ["wide-garage.jpg", "appliances.jpg", "pile-closeup.jpg", "threshold.jpg"];

/** S5 — Per-route questions on left, photo policy chips on right. */
export const S5Questions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each policy chip lights up in turn — VO names them
  const chipActiveFrames = [150, 195, 240, 285];

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-5.mp3")} volume={1} />
      <AbsoluteFill style={{ flexDirection: "row", padding: "120px 100px 200px" }}>
        {/* LEFT — typewriter question list */}
        <div style={{ width: 760, paddingRight: 40 }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: COLORS.amber,
              marginBottom: 16,
            }}
          >
            ◆ route: repair
          </div>
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 44,
              color: COLORS.ink,
              letterSpacing: "-0.015em",
              marginBottom: 28,
              fontWeight: 500,
            }}
          >
            The right questions, per route.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {QUESTIONS.map((q, i) => {
              const p = spring({
                frame: frame - (20 + i * 14),
                fps,
                config: { damping: 22, stiffness: 200 },
                durationInFrames: 16,
              });
              return (
                <div
                  key={i}
                  style={{
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [16, 0])}px)`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    fontFamily: FONT.ui,
                    fontSize: 19,
                    color: COLORS.ink,
                    lineHeight: 1.4,
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONT.mono,
                      fontSize: 12,
                      color: COLORS.uiInkDim,
                      marginTop: 5,
                      letterSpacing: "0.16em",
                    }}
                  >
                    Q{(i + 1).toString().padStart(2, "0")}
                  </div>
                  <div style={{ flex: 1 }}>{q}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — photo policy chips */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: COLORS.inkDim,
              marginBottom: 4,
            }}
          >
            photo policy · 4 states
          </div>
          {POLICIES.map((p, i) => {
            const active = frame >= chipActiveFrames[i];
            const sp = spring({
              frame: frame - (40 + i * 18),
              fps,
              config: { damping: 22, stiffness: 200 },
              durationInFrames: 18,
            });
            return (
              <div
                key={p}
                style={{
                  opacity: interpolate(sp, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(sp, [0, 1], [12, 0])}px)`,
                }}
              >
                <PhotoPolicyChip policy={p} active={active} />
              </div>
            );
          })}

          {/* photos appearing behind required */}
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 8,
              opacity: interpolate(frame, [310, 340], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {PHOTOS.map((ph) => (
              <Img
                key={ph}
                src={staticFile(`photos/${ph}`)}
                style={{
                  width: 110,
                  height: 78,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: `1px solid ${COLORS.amber}`,
                }}
              />
            ))}
          </div>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};
