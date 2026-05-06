import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { MobileSettingsSheet } from "@/components/layout/MobileSettingsSheet";
import { mobilePrimaryNavItems, routes } from "@/routes/navigation";

/**
 * Bottom tab bar used on screens below `lg`. It mirrors the desktop sidebar
 * primary nav from src/routes/navigation.ts, with Settings opening the
 * settings sheet instead of crowding the main tab bar.
 */
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
          "pb-nav-bar border-t",
          "pb-safe",
        )}
      >
        <div className="relative mx-auto grid h-16 max-w-2xl grid-cols-5 items-stretch px-2">
          {mobilePrimaryNavItems.slice(0, 2).map((item) => (
            <TabLink key={item.key} {...item} active={pathname === item.to || pathname.startsWith(`${item.to}/`)} />
          ))}

          <div className="flex flex-col items-center justify-start">
            <NavLink
              to={routes.app.newRequest}
              aria-label="New photo request"
              className={cn(
                "-mt-6 inline-flex h-14 w-14 items-center justify-center rounded-full",
                "bg-primary text-primary-foreground shadow-elev-md",
                "ring-4 ring-background transition active:scale-95",
              )}
            >
              <Plus className="h-6 w-6" />
            </NavLink>
            <span className="mt-0.5 text-[10px] font-medium leading-none text-primary">Request</span>
          </div>

          <TabLink
            {...mobilePrimaryNavItems[2]}
            active={pathname === mobilePrimaryNavItems[2].to || pathname.startsWith(`${mobilePrimaryNavItems[2].to}/`)}
          />

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            className={cn(
              "pb-nav-link flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-xs font-medium transition active:scale-95",
              isSettingsActive ? "active text-primary" : "text-muted-foreground",
            )}
          >
            <Settings className="h-6 w-6" />
            <span className="text-[10px] leading-none">Settings</span>
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
        "pb-nav-link flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-xs font-medium transition active:scale-95",
        active ? "active text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-[10px] leading-none">{label}</span>
    </NavLink>
  );
}
