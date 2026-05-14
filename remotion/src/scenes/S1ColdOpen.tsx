import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  interpolate,
} from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { DrawnPath } from "../components/DrawnLine";
import { COLORS, FONT } from "../theme";
import { entrance, entranceStyle } from "../motion";
import { SCENES } from "../script";

const SPEC = SCENES[0];

/** S1 — Cold open. One Fraunces line. Amber underline traces in. */
export const S1ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const e1 = entrance({ frame, fps, delay: 8, variant: "hero" });
  const e2 = entrance({ frame, fps, delay: 36, variant: "hero" });

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-1.mp3")} volume={1} />
      <AbsoluteFill style={{ alignItems: "flex-start", justifyContent: "center", padding: "0 120px" }}>
        <div
          style={{
            ...entranceStyle(e1),
            fontFamily: FONT.mono,
            fontSize: 14,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: COLORS.amber,
            marginBottom: 28,
          }}
        >
          ◆ act i — the pain
        </div>
        <div
          style={{
            ...entranceStyle(e2),
            fontFamily: FONT.display,
            fontSize: 132,
            lineHeight: 1.02,
            color: COLORS.ink,
            letterSpacing: "-0.025em",
            fontWeight: 500,
            maxWidth: 1500,
          }}
        >
          It's 9pm.<br />
          You still don't know
          <br />
          what the <Underline>job</Underline> is.
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};

const Underline: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ position: "relative", display: "inline-block", color: COLORS.amber }}>
    {children}
    <svg
      width={260}
      height={26}
      style={{ position: "absolute", left: 0, bottom: -10, overflow: "visible" }}
    >
      <DrawnPath
        d="M 0 12 Q 110 2, 250 16"
        delay={70}
        duration={28}
        stroke={COLORS.amber}
        strokeWidth={6}
      />
    </svg>
  </span>
);
