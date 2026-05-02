import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING, GRADIENT_PRIMARY } from "../theme";

/** Scene 7: AI analysis deep-dive — quality checks, auto-reshoot prompt */
export const SceneAIAnalysis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Central card
  const cardSpring = spring({ frame, fps, config: SPRING.smooth });

  // Scanning animation
  const scanProgress = interpolate(frame, [20, 180], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Individual check results
  const checks = [
    { label: "Completeness", score: 100, detail: "8/8 required shots present", icon: "📋" },
    { label: "Image clarity", score: 95, detail: "Sharp focus, good resolution", icon: "🔍" },
    { label: "Proper framing", score: 88, detail: "All angles within guidelines", icon: "🖼️" },
    { label: "Lighting quality", score: 92, detail: "Well-lit, minimal shadows", icon: "💡" },
    { label: "Damage visibility", score: 96, detail: "Key areas clearly shown", icon: "📸" },
  ];

  // Auto-reshoot prompt appears
  const reshootFrame = frame - 240;
  const reshootSpring = spring({ frame: reshootFrame, fps, config: SPRING.bouncy });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 1200, display: "flex", gap: 40 }}>
        {/* Left: Analysis panel */}
        <div style={{
          flex: 1,
          opacity: interpolate(cardSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(cardSpring, [0, 1], [24, 0])}px)`,
        }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 2,
            color: COLORS.primary,
            marginBottom: 12,
          }}>
            AI-powered analysis
          </div>
          <h2 style={{
            fontSize: 32,
            fontWeight: 700,
            color: COLORS.foreground,
            fontFamily: FONT.display,
            lineHeight: 1.15,
            margin: 0,
          }}>
            Every submission is scored automatically
          </h2>
          <p style={{ fontSize: 15, color: COLORS.muted, marginTop: 12, lineHeight: 1.6 }}>
            Completeness, framing, lighting — our AI checks every photo against your guide's requirements.
          </p>

          {/* Scanning progress bar */}
          <div style={{
            marginTop: 28,
            backgroundColor: COLORS.bgCard,
            borderRadius: 12,
            padding: "20px",
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>Analyzing submission...</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.primary }}>{Math.round(scanProgress)}%</span>
            </div>
            <div style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.borderLight,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${scanProgress}%`,
                height: "100%",
                borderRadius: 3,
                background: GRADIENT_PRIMARY,
              }} />
            </div>
          </div>
        </div>

        {/* Right: Check results card */}
        <div style={{
          width: 480,
          backgroundColor: COLORS.bgCard,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          padding: 28,
          boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.foreground,
            marginBottom: 20,
          }}>
            Quality Checks
          </div>

          {checks.map((check, i) => {
            const delay = 40 + i * 24;
            const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
            const barWidth = interpolate(frame, [delay + 10, delay + 40], [0, check.score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div key={check.label} style={{
                marginBottom: 18,
                opacity: interpolate(s, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(s, [0, 1], [20, 0])}px)`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{check.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>{check.label}</span>
                  </div>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: barWidth > 90 ? COLORS.success : barWidth > 70 ? COLORS.warning : COLORS.destructive,
                  }}>
                    {Math.round(barWidth)}%
                  </span>
                </div>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.borderLight,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    borderRadius: 3,
                    backgroundColor: barWidth > 90 ? COLORS.success : barWidth > 70 ? COLORS.warning : COLORS.destructive,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{check.detail}</div>
              </div>
            );
          })}

          {/* Auto-reshoot prompt */}
          {reshootFrame > 0 && (
            <div style={{
              marginTop: 12,
              padding: "14px 18px",
              borderRadius: 10,
              backgroundColor: COLORS.warningLight,
              border: `1px solid ${COLORS.warning}`,
              opacity: interpolate(reshootSpring, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(reshootSpring, [0, 1], [10, 0])}px)`,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "hsl(30, 80%, 32%)" }}>
                ↻ Auto-reshoot triggered
              </div>
              <div style={{ fontSize: 11, color: "hsl(30, 60%, 40%)", marginTop: 4 }}>
                "Close-up: gutter damage" didn't meet minimum clarity — customer prompted to retake.
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
