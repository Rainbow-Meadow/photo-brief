import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING } from "../theme";
import { DashboardShell } from "../components/DashboardShell";

/** Scene 3: Template selection — picking a guide template */
export const SceneTemplates: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const templates = [
    { name: "Roof Inspection", desc: "Pre-quote condition shots", icon: "🏠", shots: 8 },
    { name: "Junk Removal", desc: "Pile + access photos", icon: "🗑️", shots: 6 },
    { name: "Damage Claim", desc: "Loss documentation", icon: "📸", shots: 10 },
    { name: "Kitchen Remodel", desc: "Before-state measurements", icon: "🍳", shots: 7 },
    { name: "HVAC Install", desc: "Equipment & access paths", icon: "❄️", shots: 5 },
    { name: "Vehicle Damage", desc: "All-angle capture", icon: "🚗", shots: 12 },
  ];

  // Cursor highlight effect — animates to the first template
  const cursorProgress = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const selectedIdx = frame > 90 ? 0 : -1;

  return (
    <AbsoluteFill>
      <DashboardShell activeItem="Guides">
        <div style={{ opacity: interpolate(spring({ frame, fps, config: SPRING.snap }), [0, 1], [0, 1]) }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.foreground, fontFamily: FONT.display, margin: 0 }}>
            Choose a template
          </h1>
          <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>
            Start from a proven guide or build your own from scratch.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginTop: 32 }}>
          {templates.map((t, i) => {
            const delay = 10 + i * 6;
            const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
            const isSelected = selectedIdx === i;
            const selectPulse = isSelected ? interpolate(frame, [90, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

            return (
              <div
                key={t.name}
                style={{
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 14,
                  padding: "24px",
                  border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px) scale(${1 + selectPulse * 0.02})`,
                  boxShadow: isSelected
                    ? `0 8px 32px rgba(33, 102, 244, 0.18)`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {isSelected && (
                  <div style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: selectPulse,
                  }}>
                    ✓
                  </div>
                )}
                <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.foreground }}>{t.name}</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>{t.desc}</div>
                <div style={{
                  marginTop: 12,
                  fontSize: 11,
                  color: COLORS.primary,
                  fontWeight: 600,
                  padding: "4px 10px",
                  backgroundColor: COLORS.primaryLight,
                  borderRadius: 6,
                  display: "inline-block",
                }}>
                  {t.shots} shots required
                </div>
              </div>
            );
          })}
        </div>
      </DashboardShell>
    </AbsoluteFill>
  );
};
