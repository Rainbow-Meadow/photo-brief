import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING, GRADIENT_PRIMARY } from "../theme";
import { DashboardShell } from "../components/DashboardShell";

/** Scene 6: Review inbox — submission arrives and is scored */
export const SceneReviewInbox: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Notification banner slides in
  const notifSpring = spring({ frame: frame - 10, fps, config: SPRING.bouncy });
  const notifY = interpolate(notifSpring, [0, 1], [-60, 0]);
  const notifOpacity = interpolate(notifSpring, [0, 1], [0, 1]);

  // Submission card appears
  const cardSpring = spring({ frame: frame - 40, fps, config: SPRING.smooth });

  // Score ring animation
  const scoreFrame = frame - 80;
  const scoreProgress = interpolate(scoreFrame, [0, 60], [0, 92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Photo grid
  const photos = ["wide-garage.jpg", "pile-closeup.jpg", "driveway-access.jpg", "threshold.jpg", "mattress.jpg", "appliances.jpg"];

  return (
    <AbsoluteFill>
      <DashboardShell activeItem="Requests">
        {/* Notification banner */}
        <div style={{
          position: "absolute",
          top: 70,
          right: 40,
          backgroundColor: COLORS.bgCard,
          borderRadius: 12,
          padding: "12px 20px",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: notifOpacity,
          transform: `translateY(${notifY}px)`,
          zIndex: 10,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: COLORS.success,
          }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>
              New submission from Sarah Mitchell
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted }}>Roof Inspection · 8 photos · Just now</div>
          </div>
        </div>

        <div style={{
          opacity: interpolate(spring({ frame, fps, config: SPRING.snap }), [0, 1], [0, 1]),
          marginBottom: 20,
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: COLORS.foreground, fontFamily: FONT.display, margin: 0 }}>
            Submission Review
          </h1>
        </div>

        <div style={{
          display: "flex",
          gap: 24,
          opacity: interpolate(cardSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(cardSpring, [0, 1], [20, 0])}px)`,
        }}>
          {/* Left: Submission details */}
          <div style={{
            flex: 1,
            backgroundColor: COLORS.bgCard,
            borderRadius: 14,
            border: `1px solid ${COLORS.border}`,
            padding: 24,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              {/* Score ring */}
              <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: `conic-gradient(${COLORS.success} ${scoreProgress * 3.6}deg, ${COLORS.borderLight} ${scoreProgress * 3.6}deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  backgroundColor: COLORS.bgCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  color: COLORS.foreground,
                }}>
                  {Math.round(scoreProgress)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.foreground }}>Sarah Mitchell</div>
                <div style={{ fontSize: 13, color: COLORS.muted }}>Roof Inspection · 8 of 8 photos</div>
                <div style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 99,
                  backgroundColor: COLORS.successLight,
                  color: COLORS.success,
                  display: "inline-block",
                }}>
                  Ready for review
                </div>
              </div>
            </div>

            {/* AI analysis items */}
            {[
              { check: "Completeness", status: "All 8 required shots captured", pass: true },
              { check: "Image quality", status: "Good lighting and focus", pass: true },
              { check: "Framing", status: "All angles within spec", pass: true },
              { check: "Damage visibility", status: "Key areas clearly documented", pass: true },
            ].map((item, i) => {
              const delay = 100 + i * 12;
              const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
              return (
                <div key={item.check} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  opacity: interpolate(s, [0, 1], [0, 1]),
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: item.pass ? COLORS.successLight : COLORS.warningLight,
                    color: item.pass ? COLORS.success : COLORS.warning,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {item.pass ? "✓" : "!"}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.foreground }}>{item.check}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{item.status}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Photo grid */}
          <div style={{
            width: 540,
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
            alignContent: "start",
          }}>
            {photos.map((photo, i) => {
              const delay = 60 + i * 8;
              const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
              return (
                <div key={photo} style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(s, [0, 1], [0.92, 1])})`,
                  aspectRatio: "4/3",
                }}>
                  <Img
                    src={staticFile(`photos/${photo}`)}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </DashboardShell>
    </AbsoluteFill>
  );
};
