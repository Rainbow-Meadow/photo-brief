import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING, GRADIENT_PRIMARY } from "../theme";

/** Scene 8: Results & closing — value props + logo */
export const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const benefits = [
    { icon: "🌐", title: "Website leads become briefs", desc: "Intake starts the moment someone asks" },
    { icon: "⚡", title: "Faster, clearer decisions", desc: "Photos and answers arrive organized" },
    { icon: "😊", title: "Customers stay guided", desc: "Simple capture, not confusing back-and-forth" },
  ];

  // Benefits cards stagger in
  const benefitsVisible = frame > 20;

  // Final tagline
  const taglineDelay = 180;
  const tagSpring = spring({ frame: frame - taglineDelay, fps, config: SPRING.bouncy });

  // Logo at end
  const logoDelay = 260;
  const logoSpring = spring({ frame: frame - logoDelay, fps, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", width: 1200 }}>
        {/* Section header */}
        <div style={{
          opacity: interpolate(spring({ frame, fps, config: SPRING.snap }), [0, 1], [0, 1]),
          transform: `translateY(${interpolate(spring({ frame, fps, config: SPRING.snap }), [0, 1], [16, 0])}px)`,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: COLORS.primary,
            marginBottom: 12,
          }}>
            The result
          </div>
          <h2 style={{
            fontSize: 42,
            fontWeight: 700,
            color: COLORS.foreground,
            fontFamily: FONT.display,
            lineHeight: 1.1,
            margin: "0 auto",
            maxWidth: 760,
          }}>
            Website leads become photo-ready job briefs.
          </h2>
        </div>

        {/* Benefits cards */}
        <div style={{ display: "flex", gap: 28, marginTop: 48, justifyContent: "center" }}>
          {benefits.map((b, i) => {
            const delay = 40 + i * 18;
            const s = spring({ frame: frame - delay, fps, config: SPRING.bouncy });
            return (
              <div
                key={b.title}
                style={{
                  width: 320,
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 16,
                  padding: "36px 28px",
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{b.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.foreground }}>{b.title}</div>
                <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8 }}>{b.desc}</div>
              </div>
            );
          })}
        </div>

        {/* Final tagline */}
        <div style={{
          marginTop: 56,
          opacity: interpolate(tagSpring, [0, 1], [0, 1]),
          transform: `scale(${interpolate(tagSpring, [0, 1], [0.9, 1])})`,
        }}>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.foreground,
            fontFamily: FONT.display,
          }}>
            PhotoBrief
          </div>
          <div style={{
            fontSize: 20,
            color: COLORS.muted,
            marginTop: 8,
            fontStyle: "italic",
          }}>
            Turn the first contact into the right photos.
          </div>
        </div>

        {/* Logo */}
        <div style={{
          marginTop: 32,
          opacity: interpolate(logoSpring, [0, 1], [0, 1]),
        }}>
          <Img
            src={staticFile("brand/photobrief-horizontal.png")}
            style={{
              height: 48,
              width: "auto",
              filter: "drop-shadow(0 8px 24px rgba(33, 102, 244, 0.2))",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
