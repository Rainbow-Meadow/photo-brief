import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  interpolate,
  spring,
} from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { BrowserChrome } from "../components/ui/BrowserChrome";
import { RouteChip } from "../components/ui/RouteChip";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";

const SPEC = SCENES[3];
const URL_FULL = "apexroofing.com";

const ROUTES = [
  { label: "Repair", hint: "leak · missing shingle · storm" },
  { label: "Install", hint: "full re-roof · new construction" },
  { label: "Quote", hint: "price me a job" },
  { label: "Emergency", hint: "active leak · tarp now" },
];

/** S4 — Paste URL, scan, routes propose. */
export const S4PasteUrl: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // typewriter URL
  const charCount = Math.floor(interpolate(frame, [10, 60], [0, URL_FULL.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }));
  const typed = URL_FULL.slice(0, charCount);
  const caretPhase = (Math.floor(frame / 12) % 2 === 0) ? 1 : 0;

  // scan bar after typing finishes
  const scanStart = 75;
  const scanP = interpolate(frame, [scanStart, scanStart + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-4.mp3")} volume={1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative" }}>
          <BrowserChrome url={typed} caretPhase={caretPhase} width={1400} height={780}>
            <div style={{ position: "relative", width: "100%", height: "100%", padding: 40, fontFamily: FONT.ui }}>
              {/* the operator's website preview, faded */}
              <div
                style={{
                  position: "absolute",
                  inset: 40,
                  border: "1px solid rgba(159,179,200,0.12)",
                  borderRadius: 10,
                  padding: 32,
                  opacity: 0.55,
                }}
              >
                <div style={{ fontFamily: FONT.display, fontSize: 42, color: COLORS.ink, fontWeight: 500 }}>
                  Apex Roofing
                </div>
                <div style={{ fontSize: 16, color: COLORS.uiInk, marginTop: 8 }}>
                  Family-owned. 22 years on roofs across the Bay.
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  <FakeBtn label="Get a quote" amber />
                  <FakeBtn label="Call us" />
                </div>
              </div>

              {/* scan bar */}
              <div
                style={{
                  position: "absolute",
                  left: 40,
                  right: 40,
                  top: 40 + interpolate(scanP, [0, 1], [0, 700]),
                  height: 2,
                  background: COLORS.amber,
                  boxShadow: `0 0 24px ${COLORS.amber}`,
                  opacity: scanP > 0 && scanP < 1 ? 1 : 0,
                }}
              />

              {/* routes overlay after scan */}
              <RoutesOverlay frame={frame} fps={fps} startFrame={140} />
            </div>
          </BrowserChrome>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};

const FakeBtn: React.FC<{ label: string; amber?: boolean }> = ({ label, amber }) => (
  <div
    style={{
      padding: "10px 22px",
      borderRadius: 8,
      border: `1px solid ${amber ? COLORS.amber : "rgba(159,179,200,0.3)"}`,
      background: amber ? "rgba(242,163,58,0.12)" : "transparent",
      color: amber ? COLORS.amber : COLORS.uiInk,
      fontSize: 14,
      fontWeight: 500,
    }}
  >
    {label}
  </div>
);

const RoutesOverlay: React.FC<{ frame: number; fps: number; startFrame: number }> = ({ frame, fps, startFrame }) => {
  const containerP = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 22, stiffness: 120 },
    durationInFrames: 24,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 60,
        background: "rgba(14,14,12,0.78)",
        borderRadius: 12,
        padding: 36,
        opacity: containerP,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: "0.32em", color: COLORS.amber, textTransform: "uppercase" }}>
            ◆ proposed routes
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 38, color: COLORS.ink, marginTop: 6, letterSpacing: "-0.01em" }}>
            4 routes a customer might come in for
          </div>
        </div>
        <div
          style={{
            opacity: interpolate(frame, [startFrame + 90, startFrame + 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            padding: "10px 20px",
            border: `1.5px solid ${COLORS.amber}`,
            color: COLORS.amber,
            fontFamily: FONT.mono,
            fontSize: 12,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          ✓ approved
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10 }}>
        {ROUTES.map((r, i) => {
          const p = spring({
            frame: frame - (startFrame + 18 + i * 10),
            fps,
            config: { damping: 18, stiffness: 200 },
            durationInFrames: 18,
          });
          return (
            <div
              key={r.label}
              style={{
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
              }}
            >
              <RouteChip label={r.label} hint={r.hint} active />
            </div>
          );
        })}
      </div>
    </div>
  );
};
