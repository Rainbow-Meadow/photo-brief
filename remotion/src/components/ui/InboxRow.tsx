import React from "react";
import { COLORS, FONT } from "../../theme";

interface Props {
  from: string;
  preview: string;
  meta: string;
  unread?: boolean;
  amber?: boolean;
}

export const InboxRow: React.FC<Props> = ({ from, preview, meta, unread, amber }) => (
  <div
    style={{
      padding: "16px 22px",
      borderBottom: "1px solid rgba(159,179,200,0.08)",
      background: amber ? "rgba(242,163,58,0.06)" : "transparent",
      display: "flex",
      alignItems: "center",
      gap: 16,
      fontFamily: FONT.ui,
    }}
  >
    {unread && <div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.amber }} />}
    {!unread && <div style={{ width: 8 }} />}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: unread ? 700 : 500,
          color: COLORS.ink,
          marginBottom: 4,
        }}
      >
        {from}
      </div>
      <div
        style={{
          fontSize: 14,
          color: COLORS.uiInk,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {preview}
      </div>
    </div>
    <div style={{ fontFamily: FONT.mono, fontSize: 12, color: COLORS.uiInkDim, letterSpacing: "0.06em" }}>
      {meta}
    </div>
  </div>
);
