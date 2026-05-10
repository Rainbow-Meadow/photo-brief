import React from "react";
import { AbsoluteFill, Img, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { DrawnPath } from "../components/DrawnLine";
import { COLORS, FONT } from "../theme";

/**
 * PLT.A.04 — CLOSE (RMBC · 4/4)
 * Brand close. Mark draws on first, wordmark slides in beside it,
 * tagline stamps below, then a long held still on the full lockup.
 */
export const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Mark fade-in (using the official BrandMark PNG sourced from /brand)
  const markIn = spring({ frame: frame - 10, fps, config: { damping: 16, stiffness: 110 } });
  const markOpacity = interpolate(markIn, [0, 1], [0, 1]);
  const markScale = interpolate(markIn, [0, 1], [0.85, 1]);

  // Wordmark reveal
  const wm = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: "clamp" });
  const wmX = interpolate(frame, [40, 80], [40, 0], { extrapolateRight: "clamp" });

  // Tagline reveal (after wordmark)
  const tagOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateRight: "clamp" });
  const tagY = interpolate(frame, [80, 110], [12, 0], { extrapolateRight: "clamp" });

  // Underline ribbon
  const ribbon = interpolate(frame, [70, 100], [0, 1], { extrapolateRight: "clamp" });

  return (
    <PlateFrame plate="PLT.A.04" label="RMBC / 04 · CLOSE">
      <AbsoluteFill>
        {/* lockup row */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            {/* Mark */}
            <div
              style={{
                opacity: markOpacity,
                transform: `scale(${markScale})`,
                transformOrigin: "center",
              }}
            >
              <Img
                src={staticFile("brand/mark-on-dark.png")}
                style={{ width: 180, height: 180, objectFit: "contain" }}
              />
            </div>

            {/* Wordmark */}
            <div
              style={{
                opacity: wm,
                transform: `translateX(${wmX}px)`,
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 800,
                fontSize: 148,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                color: COLORS.ink,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: COLORS.ink }}>Photo</span>
              <span style={{ color: COLORS.amber }}>Brief</span>
              <span
                style={{
                  color: "rgba(244, 241, 234, 0.7)",
                  fontWeight: 600,
                  fontSize: 92,
                  marginLeft: 8,
                  letterSpacing: "-0.02em",
                }}
              >
                .ai
              </span>
            </div>
          </div>

          {/* tagline */}
          <div
            style={{
              opacity: tagOpacity,
              transform: `translateY(${tagY}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
            }}
          >
            <svg width={520} height={4}>
              <line
                x1={0}
                y1={2}
                x2={520 * ribbon}
                y2={2}
                stroke={COLORS.amber}
                strokeWidth={2}
              />
            </svg>
            <div
              style={{
                fontFamily: FONT.mono,
                fontSize: 22,
                letterSpacing: "0.48em",
                color: COLORS.ink,
                textTransform: "uppercase",
              }}
            >
              Guide · Capture · Close
            </div>
          </div>
        </div>

        {/* mono coda — CTA whisper bottom-right of the plate */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <DrawnPath
            d="M 700 880 L 1220 880"
            delay={120}
            duration={24}
            strokeWidth={1}
            stroke={COLORS.inkFaint}
          />
        </svg>
      </AbsoluteFill>
    </PlateFrame>
  );
};
