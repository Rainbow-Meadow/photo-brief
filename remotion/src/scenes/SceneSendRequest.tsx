import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING, GRADIENT_PRIMARY } from "../theme";
import { DashboardShell } from "../components/DashboardShell";

/** Scene 4: Creating and sending a request */
export const SceneSendRequest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Form fields appear staggered
  const fields = [
    { label: "Customer name", value: "Sarah Mitchell", placeholder: "" },
    { label: "Phone number", value: "+1 (555) 234-8901", placeholder: "" },
    { label: "Email (optional)", value: "sarah.m@example.com", placeholder: "" },
    { label: "Guide", value: "Roof Inspection", placeholder: "" },
    { label: "Notes", value: "Requesting photos for insurance claim estimate", placeholder: "" },
  ];

  // Typing effect for form values
  const typeChar = (text: string, startFrame: number, charsPerFrame: number = 0.6) => {
    const elapsed = Math.max(0, frame - startFrame);
    const chars = Math.min(text.length, Math.floor(elapsed * charsPerFrame));
    return text.substring(0, chars);
  };

  // Send button activation
  const sendProgress = interpolate(frame, [180, 195], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sendScale = interpolate(sendProgress, [0, 0.5, 1], [1, 0.96, 1]);

  // Success state
  const showSuccess = frame > 200;
  const successSpring = spring({ frame: frame - 200, fps, config: SPRING.bouncy });

  return (
    <AbsoluteFill>
      <DashboardShell activeItem="Requests">
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ opacity: interpolate(spring({ frame, fps, config: SPRING.snap }), [0, 1], [0, 1]) }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.foreground, fontFamily: FONT.display, margin: 0 }}>
              New photo request
            </h1>
            <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
              Your customer receives a simple link — no app required.
            </p>
          </div>

          <div style={{
            marginTop: 28,
            backgroundColor: COLORS.bgCard,
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            padding: "28px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
          }}>
            {fields.map((f, i) => {
              const delay = 15 + i * 20;
              const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
              const typed = typeChar(f.value, delay + 10);
              return (
                <div
                  key={f.label}
                  style={{
                    marginBottom: 20,
                    opacity: interpolate(s, [0, 1], [0, 1]),
                    transform: `translateY(${interpolate(s, [0, 1], [8, 0])}px)`,
                  }}
                >
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground, display: "block", marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 14,
                    color: typed ? COLORS.foreground : COLORS.muted,
                    backgroundColor: COLORS.bg,
                    minHeight: f.label === "Notes" ? 60 : "auto",
                  }}>
                    {typed || f.placeholder || "\u00A0"}
                    {typed.length < f.value.length && frame > delay + 10 && (
                      <span style={{ borderRight: "2px solid", color: COLORS.primary, animation: "none" }}>​</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Send button */}
            <div style={{
              marginTop: 8,
              opacity: interpolate(frame, [160, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              <div
                style={{
                  background: GRADIENT_PRIMARY,
                  color: "#fff",
                  padding: "12px 28px",
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textAlign: "center",
                  transform: `scale(${sendScale})`,
                  boxShadow: "0 8px 24px rgba(33, 102, 244, 0.3)",
                  cursor: "pointer",
                }}
              >
                {showSuccess ? "✓ Request sent!" : "Send request →"}
              </div>
            </div>
          </div>

          {/* Success overlay */}
          {showSuccess && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.85)",
              opacity: interpolate(successSpring, [0, 1], [0, 1]),
            }}>
              <div style={{
                textAlign: "center",
                transform: `scale(${interpolate(successSpring, [0, 1], [0.9, 1])})`,
              }}>
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: GRADIENT_PRIMARY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 32,
                  color: "#fff",
                }}>
                  ✓
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.foreground }}>
                  Request sent to Sarah Mitchell
                </div>
                <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8 }}>
                  She'll receive an SMS with a capture link
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardShell>
    </AbsoluteFill>
  );
};
