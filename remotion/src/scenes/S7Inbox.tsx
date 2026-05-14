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
import { InboxRow } from "../components/ui/InboxRow";
import { BriefCard } from "../components/ui/BriefCard";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[6];

const OLD_ROWS = [
  { from: "Stripe", preview: "Your weekly report is ready.", meta: "yesterday" },
  { from: "QuickBooks", preview: "Invoice #2241 paid.", meta: "yesterday" },
  { from: "Mom", preview: "Call me back when you can ❤", meta: "Mon" },
  { from: "Yelp", preview: "New review (4★) for Apex Roofing", meta: "Mon" },
];

/** S7 — Operator inbox. New brief lands. Card expands with full intake brief. */
export const S7Inbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Inbox view holds frames 0-100, then card takes over
  const inboxOut = interpolate(frame, [110, 140], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cardP = spring({ frame: frame - 130, fps, config: { damping: 22, stiffness: 110 }, durationInFrames: 28 });

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-7.mp3")} volume={1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* INBOX */}
        <div
          style={{
            position: "absolute",
            opacity: inboxOut,
            width: 1100,
            background: COLORS.uiSurface,
            border: "1px solid rgba(159,179,200,0.16)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
          }}
        >
          <div
            style={{
              padding: "16px 22px",
              borderBottom: "1px solid rgba(159,179,200,0.12)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.32em",
              color: COLORS.uiInkDim,
              textTransform: "uppercase",
            }}
          >
            <div>inbox · apex roofing</div>
            <div>thu · 9:43p</div>
          </div>

          {/* New PhotoBrief row drops in at top */}
          <NewBriefRow frame={frame} fps={fps} />

          {OLD_ROWS.map((r, i) => (
            <InboxRow key={i} from={r.from} preview={r.preview} meta={r.meta} />
          ))}
        </div>

        {/* BRIEF CARD */}
        <div
          style={{
            position: "absolute",
            opacity: cardP,
            transform: `translateY(${interpolate(cardP, [0, 1], [40, 0])}px) scale(${interpolate(cardP, [0, 1], [0.96, 1])})`,
          }}
        >
          <BriefCard frame={frame - 130} fps={fps} />
        </div>

        {/* READY stamp drops in late */}
        <ReadyStamp frame={frame} fps={fps} />
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};

const NewBriefRow: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 200 }, durationInFrames: 24 });
  const opacity = interpolate(p, [0, 1], [0, 1]);
  const y = interpolate(p, [0, 1], [-30, 0]);
  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      <InboxRow
        from="PhotoBrief — Maria Chen"
        preview="Garage cleanout · 4 photos · 92% ready · ready to quote"
        meta="just now"
        unread
        amber
      />
    </div>
  );
};

const ReadyStamp: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const p = spring({ frame: frame - 270, fps, config: { damping: 8, stiffness: 110 }, durationInFrames: 30 });
  const opacity = interpolate(p, [0, 1], [0, 1]);
  const rot = interpolate(p, [0, 1], [-30, -8]);
  const scale = interpolate(p, [0, 1], [1.6, 1]);
  return (
    <div
      style={{
        position: "absolute",
        right: 380,
        bottom: 240,
        opacity,
        transform: `rotate(${rot}deg) scale(${scale})`,
        padding: "14px 28px",
        border: `4px solid ${COLORS.amber}`,
        borderRadius: 8,
        fontFamily: FONT.mono,
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: "0.22em",
        color: COLORS.amber,
        textTransform: "uppercase",
        background: "rgba(14,14,12,0.65)",
      }}
    >
      ready
    </div>
  );
};
