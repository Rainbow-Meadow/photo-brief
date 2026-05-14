import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  staticFile,
  Img,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { PlateFrame } from "../components/PlateFrame";
import { Captions } from "../components/Captions";
import { PhoneFrame } from "../components/ui/PhoneFrame";
import { COLORS, FONT } from "../theme";
import { SCENES } from "../script";
import { wobble } from "../motion";

const SPEC = SCENES[5];

/** S6 — Recipient POV. Phone in centre, three sub-screens cycle inside. */
export const S6Recipient: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wob = wobble(frame, 180, 6);
  const tilt = interpolate(Math.sin((frame / 240) * Math.PI * 2), [-1, 1], [-2.5, 2.5]);

  return (
    <PlateFrame plate={SPEC.plate} label={SPEC.label}>
      <Audio src={staticFile("audio/vo-6.mp3")} volume={1} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {/* left side — caption with the route in operator typography */}
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 220,
            maxWidth: 540,
          }}
        >
          <div
            style={{
              fontFamily: FONT.mono,
              fontSize: 12,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: COLORS.amber,
              marginBottom: 14,
            }}
          >
            ◆ recipient pov
          </div>
          <div style={{ fontFamily: FONT.display, fontSize: 70, color: COLORS.ink, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            One link.<br />One thumb.<br />Plain words.
          </div>
          <div
            style={{
              marginTop: 26,
              fontFamily: FONT.ui,
              fontSize: 18,
              color: COLORS.inkDim,
              maxWidth: 460,
              lineHeight: 1.5,
            }}
          >
            No login. No app to install. Your customer just answers — and the brief writes itself.
          </div>
        </div>

        {/* phone */}
        <div
          style={{
            position: "absolute",
            right: 220,
            top: 90,
            transform: `rotate(${tilt}deg) translateY(${wob}px)`,
            transformOrigin: "center",
          }}
        >
          <PhoneFrame width={420} height={860}>
            {/* Step 1: question */}
            <Sequence from={0} durationInFrames={140}>
              <PhoneStep>
                <StepHeader step="01" total="03" title="Repair" />
                <Question text="Is there an active leak right now?" />
                <ChoiceList choices={["Yes — water coming in", "Yes — but it's stopped", "No, just damage"]} />
              </PhoneStep>
            </Sequence>

            {/* Step 2: photo capture (auto-takes a photo) */}
            <Sequence from={140} durationInFrames={150}>
              <PhoneStep>
                <StepHeader step="02" total="03" title="One photo" />
                <Question text="Show us the damaged area." />
                <PhotoCapture />
              </PhoneStep>
            </Sequence>

            {/* Step 3: send */}
            <Sequence from={290} durationInFrames={70}>
              <PhoneStep>
                <SendScreen />
              </PhoneStep>
            </Sequence>
          </PhoneFrame>
        </div>
      </AbsoluteFill>
      <Captions captions={SPEC.captions} />
    </PlateFrame>
  );
};

// Sub-screens — each receives sequence-relative useCurrentFrame
const PhoneStep: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: "100%", height: "100%", padding: "20px 22px", fontFamily: FONT.ui, color: COLORS.ink }}>{children}</div>
);

const StepHeader: React.FC<{ step: string; total: string; title: string }> = ({ step, total, title }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
    <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: "0.28em", color: COLORS.uiInkDim, textTransform: "uppercase" }}>
      step {step}/{total}
    </div>
    <div style={{ fontFamily: FONT.mono, fontSize: 11, letterSpacing: "0.28em", color: COLORS.amber, textTransform: "uppercase" }}>
      {title}
    </div>
  </div>
);

const Question: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontFamily: FONT.display, fontSize: 30, color: COLORS.ink, letterSpacing: "-0.01em", lineHeight: 1.18, marginBottom: 22, fontWeight: 500 }}>
    {text}
  </div>
);

const ChoiceList: React.FC<{ choices: string[] }> = ({ choices }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // tap-ripple on second choice at frame ~80
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {choices.map((c, i) => {
        const p = spring({ frame: frame - (10 + i * 8), fps, config: { damping: 22, stiffness: 200 }, durationInFrames: 16 });
        const tappedFrame = 80;
        const tapped = i === 0 && frame >= tappedFrame;
        const ripple = i === 0 ? interpolate(frame, [tappedFrame, tappedFrame + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
        return (
          <div
            key={i}
            style={{
              opacity: interpolate(p, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px)`,
              border: `1.5px solid ${tapped ? COLORS.amber : "rgba(159,179,200,0.18)"}`,
              borderRadius: 12,
              padding: "16px 18px",
              fontSize: 16,
              color: tapped ? COLORS.amber : COLORS.ink,
              fontWeight: tapped ? 600 : 500,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {c}
            {ripple > 0 && (
              <div
                style={{
                  position: "absolute",
                  width: 200 * ripple,
                  height: 200 * ripple,
                  borderRadius: "50%",
                  background: "rgba(242,163,58,0.18)",
                  left: 24 - 100 * ripple,
                  top: 24 - 100 * ripple,
                  opacity: 1 - ripple,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const PhotoCapture: React.FC = () => {
  const frame = useCurrentFrame();
  // viewfinder for ~70 frames, then "captured" still
  const captured = frame > 70;
  const flash = interpolate(frame, [68, 75], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "relative", width: "100%", height: 460, borderRadius: 12, overflow: "hidden", background: "#000" }}>
      <Img
        src={staticFile("photos/wide-garage.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: captured ? "none" : "brightness(0.85) saturate(0.9)",
        }}
      />
      {!captured && (
        <>
          {/* viewfinder corners */}
          <Corner x={12} y={12} />
          <Corner x="auto" y={12} r />
          <Corner x={12} y="auto" b />
          <Corner x="auto" y="auto" r b />
        </>
      )}
      {flash > 0 && (
        <div style={{ position: "absolute", inset: 0, background: "white", opacity: flash * 0.7 }} />
      )}
      {captured && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            right: 12,
            background: "rgba(14,14,12,0.78)",
            borderRadius: 8,
            padding: "8px 12px",
            fontFamily: FONT.mono,
            fontSize: 11,
            color: COLORS.amber,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          ✓ photo attached · garage_01.jpg
        </div>
      )}
      {!captured && (
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "4px solid white", background: "rgba(255,255,255,0.2)" }} />
        </div>
      )}
    </div>
  );
};

const Corner: React.FC<{ x?: number | "auto"; y?: number | "auto"; r?: boolean; b?: boolean }> = ({ x = 12, y = 12, r, b }) => (
  <div
    style={{
      position: "absolute",
      width: 28,
      height: 28,
      borderTop: !b ? "2px solid rgba(255,255,255,0.85)" : undefined,
      borderBottom: b ? "2px solid rgba(255,255,255,0.85)" : undefined,
      borderLeft: !r ? "2px solid rgba(255,255,255,0.85)" : undefined,
      borderRight: r ? "2px solid rgba(255,255,255,0.85)" : undefined,
      ...(x === "auto" ? { right: 12 } : { left: x }),
      ...(y === "auto" ? { bottom: 12 } : { top: y }),
    }}
  />
);

const SendScreen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const checkP = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 140 }, durationInFrames: 24 });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 18 }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: `3px solid ${COLORS.amber}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${interpolate(checkP, [0, 1], [0.6, 1])})`,
          opacity: checkP,
        }}
      >
        <svg width={60} height={60}>
          <path
            d="M 12 32 L 26 46 L 50 18"
            fill="none"
            stroke={COLORS.amber}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div style={{ fontFamily: FONT.display, fontSize: 26, color: COLORS.ink, fontWeight: 500 }}>Sent.</div>
      <div style={{ fontFamily: FONT.ui, fontSize: 14, color: COLORS.uiInk, textAlign: "center", maxWidth: 280 }}>
        We'll text you when Apex Roofing reads it.
      </div>
    </div>
  );
};
