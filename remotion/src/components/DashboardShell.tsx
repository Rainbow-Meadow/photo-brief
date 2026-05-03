import React from "react";
import { Img, staticFile } from "remotion";
import { COLORS, FONT } from "../theme";

/** Reusable sidebar + top-bar chrome wrapping scene content. */
export const DashboardShell: React.FC<{
  children: React.ReactNode;
  activeItem?: string;
}> = ({ children, activeItem = "Dashboard" }) => {
  const navItems = [
    { icon: "⊞", label: "Dashboard" },
    { icon: "📋", label: "Requests" },
    { icon: "🌐", label: "Intake" },
    { icon: "⚙", label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", width: 1920, height: 1080, fontFamily: FONT.body }}>
      {/* Sidebar */}
      <div
        style={{
          width: 240,
          backgroundColor: COLORS.sidebarBg,
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
          borderRight: `1px solid ${COLORS.sidebarBorder}`,
        }}
      >
        <div style={{ padding: "0 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <Img
            src={staticFile("brand/photobrief-horizontal-light.svg")}
            style={{ height: 32, width: "auto" }}
          />
        </div>
        {navItems.map((item) => (
          <div
            key={item.label}
            style={{
              padding: "10px 20px",
              margin: "2px 12px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              fontWeight: item.label === activeItem ? 600 : 400,
              color: item.label === activeItem ? COLORS.primaryFg : COLORS.sidebarMuted,
              backgroundColor: item.label === activeItem ? COLORS.sidebarActive : "transparent",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div
          style={{
            margin: "0 12px",
            padding: "12px",
            borderRadius: 8,
            backgroundColor: "hsla(220, 26%, 20%, 0.6)",
            fontSize: 12,
            color: COLORS.sidebarMuted,
          }}
        >
          <div style={{ fontWeight: 600, color: COLORS.sidebarFg, marginBottom: 4 }}>Apex Services</div>
          <div>Visual intake workspace</div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: COLORS.bg }}>
        {/* Top bar */}
        <div
          style={{
            height: 56,
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 24px",
            gap: 12,
            backgroundColor: COLORS.bgCard,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: COLORS.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            AS
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", padding: "24px 32px" }}>{children}</div>
      </div>
    </div>
  );
};
