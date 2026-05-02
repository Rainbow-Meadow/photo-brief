import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING, GRADIENT_PRIMARY } from "../theme";

/** Scene 5: Customer capture experience — phone mockup with guided photo flow */
export const SceneCustomerCapture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides in from bottom
  const phoneSpring = spring({ frame, fps, config: SPRING.smooth });
  const phoneY = interpolate(phoneSpring, [0, 1], [400, 0]);

  // Steps in the guided capture
  const steps = [
    { label: "Front of property", hint: "Stand 20ft back, include full roofline", icon: "🏠" },
    { label: "Close-up: damage area", hint: "Within 3ft, focus on affected zone", icon: "🔍" },
    { label: "Wide angle: left side", hint: "Capture the full left elevation", icon: "↙️" },
    { label: "Wide angle: right side", hint: "Capture the full right elevation", icon: "↗️" },
  ];

  // Current step based on frame
  const currentStep = Math.min(3, Math.floor(interpolate(frame, [60, 340], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  // Progress ring
  const progress = interpolate(frame, [60, 380], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // AI check feedback
  const showCheck = frame > 150 && frame < 180;
  const showCheck2 = frame > 250 && frame < 280;

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Left text content */}
      <div style={{
        position: "absolute",
        left: 120,
        top: "50%",
        transform: "translateY(-50%)",
        width: 500,
      }}>
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
            Customer experience
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: COLORS.foreground, fontFamily: FONT.display, lineHeight: 1.15, margin: 0 }}>
            Guided photo capture
          </h2>
          <p style={{ fontSize: 16, color: COLORS.muted, marginTop: 12, lineHeight: 1.6 }}>
            No app download required. Your customer taps the link and our AI-guided interface walks them through every shot.
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ marginTop: 36 }}>
          {steps.map((step, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const delay = 60 + i * 10;
            const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
            return (
              <div
                key={step.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "10px 16px",
                  marginBottom: 6,
                  borderRadius: 10,
                  backgroundColor: isActive ? COLORS.primaryLight : "transparent",
                  border: `1px solid ${isActive ? COLORS.primary : "transparent"}`,
                  opacity: interpolate(s, [0, 1], [0, 1]),
                }}
              >
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: isDone ? COLORS.success : isActive ? COLORS.primary : COLORS.borderLight,
                  color: isDone || isActive ? "#fff" : COLORS.muted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {isDone ? "✓" : i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? COLORS.foreground : COLORS.muted }}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{step.hint}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phone mockup */}
      <div style={{
        position: "absolute",
        right: 180,
        transform: `translateY(${phoneY}px)`,
      }}>
        <div style={{
          width: 320,
          height: 640,
          borderRadius: 36,
          backgroundColor: "#1a1a1a",
          padding: 8,
          boxShadow: "0 40px 80px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.15)",
        }}>
          <div style={{
            width: "100%",
            height: "100%",
            borderRadius: 28,
            backgroundColor: COLORS.bgCard,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Phone header */}
            <div style={{
              padding: "16px 20px 12px",
              textAlign: "center",
              borderBottom: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>Apex Roofing</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.foreground, marginTop: 2 }}>
                Roof Inspection
              </div>
              {/* Progress bar */}
              <div style={{
                marginTop: 8,
                height: 4,
                borderRadius: 2,
                backgroundColor: COLORS.borderLight,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  borderRadius: 2,
                  background: GRADIENT_PRIMARY,
                }} />
              </div>
            </div>

            {/* Camera viewfinder area */}
            <div style={{
              flex: 1,
              backgroundColor: "#2a2a2a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
              {/* Example photo from assets */}
              <Img
                src={staticFile(`photos/${currentStep === 0 ? "wide-garage.jpg" : currentStep === 1 ? "pile-closeup.jpg" : currentStep === 2 ? "driveway-access.jpg" : "threshold.jpg"}`)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.85,
                }}
              />

              {/* Overlay guide hint */}
              <div style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                backgroundColor: "rgba(0,0,0,0.7)",
                borderRadius: 12,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 12,
                fontWeight: 500,
              }}>
                {steps[currentStep].icon} {steps[currentStep].hint}
              </div>

              {/* AI quality check overlay */}
              {(showCheck || showCheck2) && (
                <div style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(34, 197, 94, 0.9)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  ✓ Quality check passed
                </div>
              )}
            </div>

            {/* Capture button */}
            <div style={{
              padding: "16px",
              display: "flex",
              justifyContent: "center",
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                border: `3px solid ${COLORS.primary}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: GRADIENT_PRIMARY,
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
