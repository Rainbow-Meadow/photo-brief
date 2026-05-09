import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, BookOpen, Settings, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { MobileSettingsSheet } from "@/components/layout/MobileSettingsSheet";

/**
 * Bottom tab bar used on screens below `lg`. Mirrors the desktop sidebar
 * primary nav, with Settings opening a full-screen sheet listing the
 * settings sub-pages. The centered FAB launches a new request.
 *
 * Hidden at `lg:` and above where the AppSidebar takes over.
 */
const tabs: Array<{ key: string; label: string; icon: typeof LayoutDashboard; to: string }> = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard, to: "/dashboard" },
  { key: "requests", label: "Requests", icon: Inbox, to: "/requests" },
  { key: "guides", label: "Guides", icon: BookOpen, to: "/guides" },
];

export function MobileTabBar() {
  const { pathname } = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isSettingsActive = pathname.startsWith("/settings");

  return (
    <>
      <nav
        aria-label="Primary"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 lg:hidden",
          "border-t border-border bg-card",
          "pb-safe",
        )}
      >
        <div className="relative mx-auto grid h-16 max-w-2xl grid-cols-5 items-stretch px-2">
          {/* First two tabs */}
          {tabs.slice(0, 2).map((t) => (
            <TabLink key={t.key} {...t} active={pathname === t.to || pathname.startsWith(`${t.to}/`)} />
          ))}

          {/* Center FAB */}
          <div className="flex flex-col items-center justify-start">
            <NavLink
              to="/requests/new"
              aria-label="New photo request"
              className={cn(
                "-mt-6 inline-flex h-14 w-14 items-center justify-center",
                "bg-[hsl(var(--accent-kinetic))] text-[hsl(var(--primary-foreground))]",
                "border-4 border-card tap-apple focus-apple",
              )}
            >
              <Plus className="h-6 w-6" />
            </NavLink>
            <span className="mt-0.5 font-mono text-[0.6rem] font-semibold uppercase leading-none tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
              Request
            </span>
          </div>

          {/* Last regular tab */}
          <TabLink
            {...tabs[2]}
            active={pathname === tabs[2].to || pathname.startsWith(`${tabs[2].to}/`)}
          />

          {/* Settings opens sheet */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className={cn(
              "tap-apple focus-apple flex flex-col items-center justify-center gap-0.5 px-1 py-1 touch-target-apple",
              isSettingsActive ? "text-[hsl(var(--accent-kinetic))]" : "text-muted-foreground",
            )}
          >
            <Settings className="h-6 w-6" />
            <span className="font-mono text-[0.6rem] font-semibold uppercase leading-none tracking-[0.18em]">Settings</span>
          </button>
        </div>
      </nav>

      <MobileSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

function TabLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={cn(
        "tap-apple focus-apple flex flex-col items-center justify-center gap-0.5 px-1 py-1 touch-target-apple",
        active ? "text-[hsl(var(--accent-kinetic))]" : "text-muted-foreground",
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="font-mono text-[0.6rem] font-semibold uppercase leading-none tracking-[0.18em]">{label}</span>
    </NavLink>
  );
}
