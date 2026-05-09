import React, { useMemo, useRef, useState, useEffect } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, STROKE } from "../theme";

interface Props {
  d: string;
  delay?: number;
  duration?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
}

/** SVG <path> with strokeDashoffset draw-on driven by the current frame. */
export const DrawnPath: React.FC<Props> = ({
  d,
  delay = 0,
  duration = 36,
  stroke = COLORS.ink,
  strokeWidth = STROKE.contour,
  fill = "none",
}) => {
  const frame = useCurrentFrame();
  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(2400);

  useEffect(() => {
    if (ref.current) {
      try {
        const L = ref.current.getTotalLength();
        if (L > 0) setLen(L);
      } catch {
        /* ignore */
      }
    }
  }, [d]);

  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const offset = len * (1 - progress);

  return (
    <path
      ref={ref}
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={len}
      strokeDashoffset={offset}
    />
  );
};
