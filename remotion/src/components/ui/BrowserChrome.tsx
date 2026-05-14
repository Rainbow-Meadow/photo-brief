import React from "react";
import { COLORS, FONT } from "../../theme";

interface Props {
  url: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
  /** caret blink phase, 0..1 */
  caretPhase?: number;
}

/**
 * Mock browser chrome for product UI scenes. Cool ink + dark surface so it
 * reads as the "product layer" without competing with the field-manual plate.
 */
export const BrowserChrome: React.FC<Props> = ({
  url,
  width = 1280,
  height = 720,
  children,
  caretPhase = 0,
}) => {
  const showCaret = caretPhase > 0.5;
  return (
    <div
      style={{
        width,
        height,
        background: COLORS.uiSurface,
        border: `1px solid rgba(159,179,200,0.18)`,
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
      }}
    >
      {/* tab bar */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(159,179,200,0.10)",
        }}
      >
        <Dot c="#FF5F57" /><Dot c="#FEBC2E" /><Dot c="#28C840" />
        <div style={{ flex: 1 }} />
        <div
          style={{
            flex: "0 1 640px",
            background: "rgba(159,179,200,0.08)",
            borderRadius: 8,
            padding: "8px 14px",
            fontFamily: FONT.ui,
            fontSize: 14,
            color: COLORS.uiInk,
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ opacity: 0.4 }}>https://</span>
          <span>{url}</span>
          {showCaret && (
            <span style={{ background: COLORS.amber, width: 2, height: 18, marginLeft: 2 }} />
          )}
        </div>
        <div style={{ flex: 1 }} />
      </div>
      <div style={{ position: "relative", width: "100%", height: height - 44 }}>{children}</div>
    </div>
  );
};

const Dot: React.FC<{ c: string }> = ({ c }) => (
  <div style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />
);
