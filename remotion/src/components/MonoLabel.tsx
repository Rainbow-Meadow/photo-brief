import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, PLATE } from "../theme";

interface Props {
  number?: string;          // "01"
  text: string;             // "MAGNIFIER"
  x: number;
  y: number;
  delay?: number;
  /** Leader line endpoint in SVG units, drawn from text anchor toward target. */
  leaderTo?: { x: number; y: number };
  align?: "left" | "right";
}

export const MonoLabel: React.FC<Props> = ({
  number,
  text,
  x,
  y,
  delay = 0,
  leaderTo,
  align = "left",
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const leaderLen = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateRight: "clamp" });

  return (
    <g opacity={opacity}>
      {leaderTo && (
        <line
          x1={x}
          y1={y}
          x2={x + (leaderTo.x - x) * leaderLen}
          y2={y + (leaderTo.y - y) * leaderLen}
          stroke={COLORS.inkDim}
          strokeWidth={1}
        />
      )}
      <text
        x={x}
        y={y}
        textAnchor={align === "right" ? "end" : "start"}
        style={{
          ...PLATE.monoLabel,
          fill: COLORS.ink,
        }}
      >
        {number && (
          <tspan style={{ fill: COLORS.amber, marginRight: 8 }}>{number}  </tspan>
        )}
        {text}
      </text>
    </g>
  );
};
