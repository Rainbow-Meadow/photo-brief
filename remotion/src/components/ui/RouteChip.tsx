import React from "react";
import { COLORS, FONT } from "../../theme";

interface Props {
  label: string;
  hint?: string;
  active?: boolean;
  amber?: boolean;
}

export const RouteChip: React.FC<Props> = ({ label, hint, active, amber }) => (
  <div
    style={{
      padding: "16px 22px",
      borderRadius: 12,
      border: `1px solid ${amber ? COLORS.amber : "rgba(159,179,200,0.22)"}`,
      background: amber
        ? "rgba(242,163,58,0.08)"
        : active
          ? "rgba(159,179,200,0.06)"
          : "transparent",
      fontFamily: FONT.ui,
      color: COLORS.ink,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      minWidth: 200,
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{label}</div>
    {hint && (
      <div style={{ fontSize: 13, color: COLORS.uiInk, fontFamily: FONT.mono, letterSpacing: "0.06em" }}>
        {hint}
      </div>
    )}
  </div>
);
