import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import type { CaptionLine } from "../script";
import { COLORS, FONT } from "../theme";

interface Props {
  captions: CaptionLine[];
}

/**
 * Burned-in caption track. Each line fades in, holds, and fades out.
 * Sits at the lower-third with a faint mono header to feel like a chapter card.
 */
export const Captions: React.FC<Props> = ({ captions }) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 140,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pointerEvents: "none",
      }}
    >
      {captions.map((c, i) => {
        const fadeIn = 8;
        const fadeOut = 10;
        const start = c.from;
        const end = c.from + c.duration;
        if (frame < start - fadeIn || frame > end + fadeOut) return null;

        const opacity = interpolate(
          frame,
          [start - fadeIn, start, end, end + fadeOut],
          [0, 1, 1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const y = interpolate(
          frame,
          [start - fadeIn, start],
          [10, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <div
            key={i}
            style={{
              opacity,
              transform: `translateY(${y}px)`,
              fontFamily: FONT.ui,
              fontSize: 30,
              fontWeight: 500,
              letterSpacing: "-0.005em",
              color: COLORS.ink,
              textAlign: "center",
              padding: "10px 22px",
              background: "rgba(14,14,12,0.62)",
              borderRadius: 10,
              backdropFilter: "none",
              maxWidth: 1200,
              lineHeight: 1.25,
            }}
          >
            {c.text}
          </div>
        );
      })}
    </div>
  );
};
