import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  interpolate,
  spring,
} from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { DrawnPath } from "../components/DrawnLine";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[7];

const STATS = [
  { big: "More", small: "complete briefs" },
  { big: "Fewer", small: "follow-up texts" },
  { big: "Minutes", small: "to publish" },
];

/** S8 — Stats wall, then logo + tagline close. */
export const S8Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // stats hold 0..360, then fade out for logo
  const statsOut = interpolate(frame, [330, 380], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoP = spring({ frame: frame - 380, fps, config: { damping: 22, stiffness: 110 }, durationInFrames: 32 });
  const taglineP = spring({ frame: frame - 430, fps, config: { damping: 22, stiffness: 140 }, durationInFrames: 28 });
  const microP = interpolate(frame, [490, 520], [0, 1], { extrapolateRight: "clamp" });

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-8.mp3")} volume={1} />
      <Audio src={staticFile("audio/stinger.mp3")} volume={0.55} startFrom={0} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* STATS WALL */}
        <div
          style={{
            position: "absolute",
            opacity: statsOut,
            display: "flex",
            gap: 40,
          }}
        >
          {STATS.map((s, i) => {
            const p = spring({
              frame: frame - (i * 22),
              fps,
              config: { damping: 22, stiffness: 130 },
              durationInFrames: 28,
            });
            return (
              <div
                key={i}
                style={{
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                  width: 380,
                  padding: "44px 32px",
                  border: `1px solid ${i === 1 ? COLORS.amber : "rgba(244,241,234,0.18)"}`,
                  borderRadius: 16,
                  background: i === 1 ? "rgba(242,163,58,0.06)" : "transparent",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT.display,
                    fontSize: 96,
                    color: i === 1 ? COLORS.amber : COLORS.ink,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {s.big}
                </div>
                <div
                  style={{
                    fontFamily: FONT.ui,
                    fontSize: 22,
                    color: COLORS.inkDim,
                    marginTop: 16,
                    letterSpacing: "-0.005em",
                  }}
                >
                  {s.small}
                </div>
              </div>
            );
          })}
        </div>

        {/* LOGO + TAGLINE */}
        <div
          style={{
            position: "absolute",
            opacity: logoP,
            transform: `translateY(${interpolate(logoP, [0, 1], [20, 0])}px)`,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 168,
              letterSpacing: "-0.025em",
              color: COLORS.ink,
              fontWeight: 500,
              lineHeight: 1,
            }}
          >
            Photo<span style={{ color: COLORS.amber }}>Brief</span>
          </div>

          {/* drawn-on rule */}
          <svg width={520} height={20} style={{ display: "block", margin: "28px auto 0" }}>
            <DrawnPath
              d="M 10 10 L 510 10"
              delay={400}
              duration={26}
              strokeWidth={1}
              stroke={COLORS.inkFaint}
            />
          </svg>

          <div
            style={{
              opacity: taglineP,
              marginTop: 22,
              fontFamily: FONT.mono,
              fontSize: 22,
              letterSpacing: "0.42em",
              color: COLORS.inkDim,
              textTransform: "uppercase",
            }}
          >
            Guide · Capture · Close
          </div>

          <div
            style={{
              opacity: microP,
              marginTop: 60,
              fontFamily: FONT.ui,
              fontSize: 18,
              color: COLORS.amber,
              letterSpacing: "0.04em",
            }}
          >
            photobrief.ai
          </div>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};
