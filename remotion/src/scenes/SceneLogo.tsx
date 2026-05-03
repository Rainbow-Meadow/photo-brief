import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING } from "../theme";

export const SceneLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = spring({ frame, fps, config: SPRING.bouncy });
  const scale = interpolate(s, [0, 1], [0.88, 1]);
  const opacity = interpolate(s, [0, 1], [0, 1]);

  const sub = spring({ frame: frame - 12, fps, config: SPRING.smooth });
  const subOpacity = interpolate(sub, [0, 1], [0, 1]);
  const subY = interpolate(sub, [0, 1], [10, 0]);

  const tag = spring({ frame: frame - 30, fps, config: SPRING.smooth });
  const tagOpacity = interpolate(tag, [0, 1], [0, 1]);
  const tagY = interpolate(tag, [0, 1], [12, 0]);

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: FONT.display }}>
        <Img
          src={staticFile("brand/photobrief-horizontal.svg")}
          style={{
            height: 160,
            width: "auto",
            opacity,
            transform: `scale(${scale})`,
            filter: "drop-shadow(0 24px 60px rgba(33, 102, 244, 0.25))",
          }}
        />
        <div
          style={{
            marginTop: 28,
            opacity: subOpacity,
            transform: `translateY(${subY}px)`,
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.muted,
            letterSpacing: 0.5,
          }}
        >
          Visual intake for small businesses
        </div>
        <div
          style={{
            marginTop: 16,
            opacity: tagOpacity,
            transform: `translateY(${tagY}px)`,
            fontSize: 18,
            fontWeight: 400,
            color: COLORS.mutedLight,
          }}
        >
          Turn website leads into photo-ready briefs
        </div>
      </div>
    </AbsoluteFill>
  );
};
