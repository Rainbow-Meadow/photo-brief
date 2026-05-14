import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { RouteChip } from "../components/ui/RouteChip";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[2];

const ROUTES = [
  { label: "Repair", hint: "leak · damage · service call" },
  { label: "Install", hint: "new system · replacement" },
  { label: "Quote", hint: "estimate · scope · pricing" },
  { label: "Emergency", hint: "today · same-day" },
];

/** S3 — Routes detected from the site. Stack of 4 chips spring in. */
export const S3Routes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 240 }}>
        {/* faux URL bar */}
        <div
          style={{
            width: 760,
            padding: "16px 22px",
            border: "1px solid rgba(159,179,200,0.18)",
            borderRadius: 10,
            fontFamily: FONT.mono,
            fontSize: 22,
            color: COLORS.uiInk,
            background: "rgba(0,0,0,0.25)",
            marginBottom: 36,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ color: COLORS.amber }}>▸</span>
          apexroofing.com
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 760 }}>
          {ROUTES.map((r, i) => {
            const p = spring({
              frame: frame - 8 - i * 8,
              fps,
              config: { damping: 18, stiffness: 200 },
              durationInFrames: 20,
            });
            const opacity = interpolate(p, [0, 1], [0, 1]);
            const x = interpolate(p, [0, 1], [-40, 0]);
            return (
              <div
                key={r.label}
                style={{
                  opacity,
                  transform: `translateX(${x}px)`,
                  width: "100%",
                }}
              >
                <RouteChip label={r.label} hint={r.hint} amber={i === 3} active />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} anchor="bottom" />
    </PlateFrame>
  );
};
