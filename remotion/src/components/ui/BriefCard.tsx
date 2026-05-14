import React from "react";
import { Img, staticFile } from "remotion";
import { COLORS, FONT } from "../../theme";
import { ReadinessRing } from "./ReadinessRing";

interface Props {
  frame: number;
  fps: number;
}

const PHOTOS = ["wide-garage.jpg", "appliances.jpg", "pile-closeup.jpg", "threshold.jpg"];

export const BriefCard: React.FC<Props> = ({ frame, fps }) => {
  return (
    <div
      style={{
        width: 1100,
        background: COLORS.uiSurface,
        border: "1px solid rgba(159,179,200,0.16)",
        borderRadius: 16,
        padding: 32,
        fontFamily: FONT.ui,
        boxShadow: "0 30px 90px rgba(0,0,0,0.55)",
        display: "grid",
        gridTemplateColumns: "1fr 200px",
        gap: 32,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: FONT.mono,
            fontSize: 11,
            letterSpacing: "0.32em",
            color: COLORS.uiInkDim,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          intake brief · #4172
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.ink, letterSpacing: "-0.01em" }}>
          Maria Chen — garage cleanout
        </div>
        <div style={{ fontSize: 15, color: COLORS.uiInk, marginTop: 4 }}>
          (415) 555-0184 · maria.c@example.com · 94110
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 24 }}>
          <Field k="route" v="Quote — Junk removal" />
          <Field k="urgency" v="This week" />
          <Field k="access" v="Driveway, no stairs" />
          <Field k="items" v="Mattress, 2× appliances, debris pile" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          {PHOTOS.map((p) => (
            <Img
              key={p}
              src={staticFile(`photos/${p}`)}
              style={{
                width: 130,
                height: 90,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid rgba(159,179,200,0.18)",
              }}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            border: `1.5px solid ${COLORS.amber}`,
            color: COLORS.amber,
            borderRadius: 999,
            fontFamily: FONT.mono,
            fontSize: 12,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          ◆ ready to quote
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <ReadinessRing value={0.92} size={180} frame={frame} fps={fps} delay={20} />
      </div>
    </div>
  );
};

const Field: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div>
    <div
      style={{
        fontFamily: FONT.mono,
        fontSize: 10,
        letterSpacing: "0.32em",
        color: COLORS.uiInkDim,
        textTransform: "uppercase",
        marginBottom: 4,
      }}
    >
      {k}
    </div>
    <div style={{ fontSize: 17, color: COLORS.ink, fontWeight: 500 }}>{v}</div>
  </div>
);
