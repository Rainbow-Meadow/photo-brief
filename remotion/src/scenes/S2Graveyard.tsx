import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  interpolate,
  spring,
  Series,
} from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[1];

const SUBMISSIONS = [
  { name: "John D.", body: "Need a quote.", time: "2:14p", ghost: true },
  { name: "(no name)", body: "hi", time: "3:01p", ghost: true },
  { name: "Sarah", body: "How much?", time: "4:22p", ghost: true },
  { name: "Mike R.", body: "Asking for a friend", time: "5:48p", ghost: true },
  { name: "(no name)", body: "What do u charge", time: "7:03p", ghost: true },
  { name: "Customer", body: "interested", time: "8:51p", ghost: true },
];

/** S2 — Inbox of half-finished form submissions. Each card greys + struck through. */
export const S2Graveyard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-2.mp3")} volume={1} />
      <AbsoluteFill style={{ flexDirection: "row", padding: "120px 100px 200px" }}>
        {/* left — counter */}
        <div style={{ width: 580, paddingRight: 40 }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: COLORS.inkDim,
              marginBottom: 18,
            }}
          >
            this week / contact form
          </div>
          <CountUp frame={frame} fps={fps} target={17} />
          <div
            style={{
              fontFamily: FONT.display,
              fontSize: 38,
              lineHeight: 1.15,
              color: COLORS.ink,
              letterSpacing: "-0.01em",
              maxWidth: 480,
              marginTop: 18,
            }}
          >
            Half are a name and "need a quote."
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: FONT.mono,
              fontSize: 14,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: COLORS.bad,
              opacity: interpolate(frame, [120, 150], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            ▼ ghost rate · 100%
          </div>
        </div>

        {/* right — list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {SUBMISSIONS.map((s, i) => {
            const inDelay = 12 + i * 9;
            const greyDelay = 90 + i * 8;
            const inP = spring({
              frame: frame - inDelay,
              fps,
              config: { damping: 22, stiffness: 200 },
              durationInFrames: 18,
            });
            const grey = interpolate(frame, [greyDelay, greyDelay + 14], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const x = interpolate(inP, [0, 1], [80, 0]);

            return (
              <div
                key={i}
                style={{
                  opacity: interpolate(inP, [0, 1], [0, 1]),
                  transform: `translateX(${x}px)`,
                  background: COLORS.uiSurface,
                  border: "1px solid rgba(159,179,200,0.16)",
                  borderRadius: 10,
                  padding: "16px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  position: "relative",
                  filter: `grayscale(${grey * 0.9}) brightness(${1 - grey * 0.35})`,
                  fontFamily: FONT.ui,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.ink }}>{s.name}</div>
                  <div style={{ fontSize: 14, color: COLORS.uiInk, marginTop: 2 }}>{s.body}</div>
                </div>
                <div style={{ fontFamily: FONT.mono, fontSize: 12, color: COLORS.uiInkDim, letterSpacing: "0.1em" }}>
                  {s.time}
                </div>
                {/* strike-through line */}
                <svg
                  width="100%"
                  height={2}
                  style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-1px)" }}
                >
                  <line
                    x1={0}
                    x2={interpolate(frame, [greyDelay, greyDelay + 18], [0, 1000], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })}
                    y1={1}
                    y2={1}
                    stroke={COLORS.bad}
                    strokeWidth={1.5}
                    opacity={0.7}
                  />
                </svg>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};

const CountUp: React.FC<{ frame: number; fps: number; target: number }> = ({ frame, fps, target }) => {
  const p = spring({ frame: frame - 6, fps, config: { damping: 30, stiffness: 80 }, durationInFrames: 60 });
  const n = Math.round(interpolate(p, [0, 1], [0, target]));
  return (
    <div style={{ fontFamily: FONT.display, fontSize: 220, lineHeight: 0.9, color: COLORS.ink, fontWeight: 500, letterSpacing: "-0.04em" }}>
      {n}
    </div>
  );
};
