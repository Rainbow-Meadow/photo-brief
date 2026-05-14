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
import { RouteChip } from "../components/ui/RouteChip";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[2];

/** S3 — The form isn't the problem. Generic form (left) → routed chips (right). */
export const S3Reframe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // generic form fades in early then dims
  const formIn = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });
  const formDim = interpolate(frame, [120, 150], [1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const routes = [
    { label: "Repair", hint: "01" },
    { label: "Install", hint: "02" },
    { label: "Quote", hint: "03" },
    { label: "Emergency", hint: "04" },
  ];

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-3.mp3")} volume={1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* connector hairlines from form (right side) to chips */}
          {[0, 1, 2, 3].map((i) => (
            <DrawnPath
              key={i}
              d={`M 770 ${380 + i * 80} C 900 ${380 + i * 80}, 1000 ${340 + i * 110}, 1130 ${340 + i * 110}`}
              delay={120 + i * 8}
              duration={24}
              strokeWidth={1}
              stroke={COLORS.inkFaint}
            />
          ))}
        </svg>

        {/* left — generic form */}
        <div
          style={{
            position: "absolute",
            left: 200,
            top: 280,
            opacity: formIn * formDim,
            width: 540,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: COLORS.inkDim,
              marginBottom: 20,
            }}
          >
            generic contact form
          </div>
          {[
            { l: "Name", w: 480 },
            { l: "Email", w: 480 },
            { l: "Phone", w: 320 },
            { l: "How can we help?", w: 480, h: 120 },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ fontFamily: FONT.ui, fontSize: 14, color: COLORS.uiInk, marginBottom: 6 }}>
                {f.l}
              </div>
              <div
                style={{
                  width: f.w,
                  height: f.h ?? 38,
                  border: "1px solid rgba(159,179,200,0.22)",
                  borderRadius: 6,
                  background: "rgba(0,0,0,0.2)",
                }}
              />
            </div>
          ))}
        </div>

        {/* right — route chips */}
        <div
          style={{
            position: "absolute",
            right: 180,
            top: 290,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: COLORS.amber,
              marginBottom: 10,
              opacity: interpolate(frame, [110, 140], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            ◆ routes, by job
          </div>
          {routes.map((r, i) => {
            const p = spring({
              frame: frame - (130 + i * 14),
              fps,
              config: { damping: 18, stiffness: 200 },
              durationInFrames: 20,
            });
            return (
              <div
                key={r.label}
                style={{
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(p, [0, 1], [40, 0])}px)`,
                }}
              >
                <RouteChip label={r.label} hint={r.hint} amber={i === 3} />
              </div>
            );
          })}
        </div>

        {/* headline */}
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT.display,
            fontSize: 76,
            color: COLORS.ink,
            letterSpacing: "-0.02em",
            opacity: interpolate(frame, [200, 230], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Generic ask → <span style={{ color: COLORS.amber }}>generic answer.</span>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};
