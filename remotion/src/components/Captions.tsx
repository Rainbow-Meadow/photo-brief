import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import type { CaptionLine } from "../script";
import { COLORS, FONT } from "../theme";

interface Props {
  captions: CaptionLine[];
  /** Vertical anchor: "center" (default) or "bottom" for over-image scenes. */
  anchor?: "center" | "bottom";
}

const SIZE_MAP = {
  hero: 156,
  title: 112,
  body: 64,
} as const;

const LINE_HEIGHT = {
  hero: 0.96,
  title: 1.0,
  body: 1.15,
} as const;

/**
 * Hero captions — vertical 1080×1920. One line at a time, big Fraunces,
 * spring entrance, accent word in amber.
 */
export const Captions: React.FC<Props> = ({ captions, anchor = "center" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: anchor === "bottom" ? "flex-end" : "center",
        padding: anchor === "bottom" ? "0 60px 320px" : "0 60px",
        pointerEvents: "none",
      }}
    >
      {captions.map((c, i) => {
        const fadeIn = 6;
        const fadeOut = 10;
        const start = c.from;
        const end = c.from + c.duration;
        if (frame < start - fadeIn || frame > end + fadeOut) return null;

        const sz = SIZE_MAP[c.size ?? "title"];
        const lh = LINE_HEIGHT[c.size ?? "title"];

        const sp = spring({
          frame: frame - start,
          fps,
          config: { damping: 22, stiffness: 130, mass: 0.9 },
          durationInFrames: 22,
        });
        const opacity = interpolate(
          frame,
          [start - fadeIn, start + 4, end, end + fadeOut],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const y = interpolate(sp, [0, 1], [40, 0]);
        const scale = interpolate(sp, [0, 1], [0.96, 1]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              opacity,
              transform: `translateY(${y}px) scale(${scale})`,
              fontFamily: FONT.display,
              fontSize: sz,
              fontWeight: 500,
              letterSpacing: "-0.025em",
              color: COLORS.ink,
              textAlign: "center",
              lineHeight: lh,
              whiteSpace: "pre-line",
              maxWidth: 980,
            }}
          >
            {renderWithAccent(c.text, c.accent)}
          </div>
        );
      })}
    </div>
  );
};

function renderWithAccent(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;
  const idx = text.indexOf(accent);
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: COLORS.amber, fontStyle: "italic" }}>{accent}</span>
      {text.slice(idx + accent.length)}
    </>
  );
}
