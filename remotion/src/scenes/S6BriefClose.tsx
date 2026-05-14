import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[5];

const PHOTOS = ["wide-garage.jpg", "appliances.jpg", "pile-closeup.jpg", "threshold.jpg"];

/** S6 — Brief lands, then close. Brief card appears, READY stamp, fades to brand close. */
export const S6BriefClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brief card 0–110, close card 110+
  const cardIn = spring({ frame, fps, config: { damping: 22, stiffness: 120 }, durationInFrames: 26 });
  const cardOpacity = interpolate(frame, [0, 12, 100, 120], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardY = interpolate(cardIn, [0, 1], [40, 0]);

  const stampSp = spring({ frame: frame - 60, fps, config: { damping: 9, stiffness: 110 }, durationInFrames: 24 });
  const stampOpacity = interpolate(frame, [60, 72, 100, 120], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stampRot = interpolate(stampSp, [0, 1], [-25, -8]);
  const stampScale = interpolate(stampSp, [0, 1], [1.5, 1]);

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      {/* BRIEF CARD VIEW */}
      <AbsoluteFill
        style={{
          opacity: cardOpacity,
          transform: `translateY(${cardY}px)`,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingTop: 220,
        }}
      >
        <div
          style={{
            width: 880,
            background: COLORS.uiSurface,
            border: "1px solid rgba(159,179,200,0.16)",
            borderRadius: 18,
            padding: 36,
            fontFamily: FONT.ui,
            boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 14,
              letterSpacing: "0.32em",
              color: COLORS.uiInkDim,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            intake brief · #4172
          </div>
          <div style={{ fontSize: 38, fontWeight: 600, color: COLORS.ink, letterSpacing: "-0.015em" }}>
            Maria Chen
          </div>
          <div style={{ fontSize: 22, color: COLORS.uiInk, marginTop: 6 }}>
            Garage cleanout · this week
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 26 }}>
            <Field k="route" v="Quote — Junk removal" />
            <Field k="urgency" v="This week" />
            <Field k="access" v="Driveway, no stairs" />
            <Field k="readiness" v="92%" amber />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            {PHOTOS.map((p) => (
              <Img
                key={p}
                src={staticFile(`photos/${p}`)}
                style={{
                  width: 188,
                  height: 130,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid rgba(159,179,200,0.18)",
                }}
              />
            ))}
          </div>
        </div>

        {/* READY stamp */}
        <div
          style={{
            position: "absolute",
            top: 320,
            right: 80,
            opacity: stampOpacity,
            transform: `rotate(${stampRot}deg) scale(${stampScale})`,
            padding: "20px 36px",
            border: `5px solid ${COLORS.amber}`,
            borderRadius: 10,
            fontFamily: FONT.mono,
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: COLORS.amber,
            textTransform: "uppercase",
            background: "rgba(14,14,12,0.78)",
          }}
        >
          ready
        </div>
      </AbsoluteFill>

      {/* CLOSE CARD overlays after brief fades */}
      <CloseCard frame={frame} />

      <Captions captions={SPEC.captions} anchor="bottom" />
    </PlateFrame>
  );
};

const Field: React.FC<{ k: string; v: string; amber?: boolean }> = ({ k, v, amber }) => (
  <div>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 12,
        letterSpacing: "0.32em",
        color: COLORS.uiInkDim,
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {k}
    </div>
    <div style={{ fontSize: 22, color: amber ? COLORS.amber : COLORS.ink, fontWeight: amber ? 700 : 500 }}>{v}</div>
  </div>
);

const CloseCard: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(frame, [110, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity, alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        {/* PhotoBrief two-tone wordmark */}
        <div
          style={{
            fontFamily: FONT.display,
            fontSize: 130,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          <span style={{ color: COLORS.ink }}>Photo</span>
          <span style={{ color: COLORS.amber, fontStyle: "italic" }}>Brief</span>
        </div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 22,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: COLORS.inkDim,
            marginTop: 26,
          }}
        >
          guide · capture · close
        </div>
      </div>
    </AbsoluteFill>
  );
};
