import React from "react";
import { COLORS, FONT } from "../../theme";

type Policy = "not_needed" | "optional" | "recommended" | "required";

interface Props {
  policy: Policy;
  active?: boolean;
}

const COPY: Record<Policy, { label: string; sub: string; tone: string }> = {
  not_needed: { label: "not needed", sub: "skip the camera", tone: COLORS.uiInk },
  optional: { label: "optional", sub: "offer, don't block", tone: COLORS.uiInk },
  recommended: { label: "recommended", sub: "explain why", tone: COLORS.ink },
  required: { label: "required", sub: "needed to quote", tone: COLORS.amber },
};

export const PhotoPolicyChip: React.FC<Props> = ({ policy, active }) => {
  const c = COPY[policy];
  const isAmber = policy === "required";
  return (
    <div
      style={{
        padding: "18px 22px",
        borderRadius: 14,
        border: `1.5px solid ${active && isAmber ? COLORS.amber : active ? "rgba(244,241,234,0.35)" : "rgba(159,179,200,0.18)"}`,
        background: active && isAmber ? "rgba(242,163,58,0.10)" : "transparent",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontFamily: FONT.ui,
        minWidth: 220,
        transition: "none",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          fontFamily: FONT.mono,
          color: active ? c.tone : COLORS.uiInkDim,
        }}
      >
        photos
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: active ? c.tone : COLORS.uiInk,
          letterSpacing: "-0.01em",
        }}
      >
        {c.label}
      </div>
      <div style={{ fontSize: 14, color: COLORS.uiInk }}>{c.sub}</div>
    </div>
  );
};
