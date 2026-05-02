import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { COLORS, FONT, SPRING } from "../theme";
import { DashboardShell } from "../components/DashboardShell";

/** Scene 2: Dashboard overview with metric cards and request lists */
export const SceneDashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const metrics = [
    { label: "Ready to review", value: "3", color: COLORS.success },
    { label: "Needs customer action", value: "5", color: COLORS.warning },
    { label: "In progress", value: "2", color: COLORS.primary },
    { label: "Requests this month", value: "24", color: COLORS.primary },
    { label: "First-pass acceptance", value: "92%", color: COLORS.success },
  ];

  return (
    <AbsoluteFill>
      <DashboardShell activeItem="Dashboard">
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          {(() => {
            const s = spring({ frame, fps, config: SPRING.snap });
            return (
              <div style={{ opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)` }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: COLORS.foreground, fontFamily: FONT.display, margin: 0 }}>
                  Dashboard
                </h1>
                <p style={{ fontSize: 14, color: COLORS.muted, marginTop: 4 }}>Your inbox at a glance.</p>
              </div>
            );
          })()}
        </div>

        {/* Metrics row */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {metrics.map((m, i) => {
            const delay = 8 + i * 5;
            const s = spring({ frame: frame - delay, fps, config: SPRING.snap });
            const opacity = interpolate(s, [0, 1], [0, 1]);
            const y = interpolate(s, [0, 1], [16, 0]);
            return (
              <div
                key={m.label}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 12,
                  padding: "18px 20px",
                  border: `1px solid ${COLORS.border}`,
                  opacity,
                  transform: `translateY(${y}px)`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500, marginBottom: 8 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.foreground }}>
                  {m.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Request lists */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            {
              title: "Ready to review",
              items: [
                { name: "Sarah M. — Roof Inspection", time: "2 min ago", status: "Submitted", color: COLORS.success },
                { name: "Mike T. — Junk Removal", time: "15 min ago", status: "Submitted", color: COLORS.success },
                { name: "Lisa K. — Damage Claim", time: "1 hr ago", status: "Submitted", color: COLORS.success },
              ],
            },
            {
              title: "Needs customer action",
              items: [
                { name: "Tom B. — HVAC Install", time: "3 hrs ago", status: "Sent", color: COLORS.warning },
                { name: "Jane D. — Kitchen Remodel", time: "5 hrs ago", status: "Sent", color: COLORS.warning },
              ],
            },
          ].map((list, li) => {
            const listDelay = 30 + li * 12;
            const ls = spring({ frame: frame - listDelay, fps, config: SPRING.smooth });
            return (
              <div
                key={list.title}
                style={{
                  flex: 1,
                  backgroundColor: COLORS.bgCard,
                  borderRadius: 12,
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                  opacity: interpolate(ls, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(ls, [0, 1], [20, 0])}px)`,
                }}
              >
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    fontSize: 14,
                    fontWeight: 600,
                    color: COLORS.foreground,
                  }}
                >
                  {list.title}
                </div>
                {list.items.map((item, ii) => {
                  const itemDelay = listDelay + 10 + ii * 6;
                  const is = spring({ frame: frame - itemDelay, fps, config: SPRING.snap });
                  return (
                    <div
                      key={item.name}
                      style={{
                        padding: "12px 20px",
                        borderBottom: `1px solid ${COLORS.borderLight}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        opacity: interpolate(is, [0, 1], [0, 1]),
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.foreground }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>{item.time}</div>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 99,
                          backgroundColor: item.color === COLORS.success ? COLORS.successLight : COLORS.warningLight,
                          color: item.color,
                        }}
                      >
                        {item.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </DashboardShell>
    </AbsoluteFill>
  );
};
