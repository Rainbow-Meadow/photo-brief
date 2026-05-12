import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Plus, LifeBuoy, KeyRound, LogOut, Globe2, Search } from "lucide-react";
import { FeedbackWidget } from "@/features/support/components/FeedbackWidget";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { BrandMark } from "@/components/layout/BrandMark";
import { CommandMenu } from "@/components/shell/CommandMenu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAccountActions } from "@/features/account/useAccountActions";

export function DashboardLayout() {
  const { workspace } = useCurrentWorkspace();
  const { resetPassword, logOut, resetting, signingOut, email } = useAccountActions();
  const initial = (email?.[0] ?? "U").toUpperCase();
  const { pathname } = useLocation();
  const isFullscreenWizard = pathname === "/requests/new";

  if (isFullscreenWizard) {
    return (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <SidebarProvider>
        <div className="app-shell relative flex min-h-screen w-full overflow-hidden bg-background">

          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col">
            <header className="touch-blur-reduce sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-3 pt-safe sm:px-5">
              <div className="hidden lg:block">
                <SidebarTrigger />
              </div>

              <NavLink to="/dashboard" aria-label="PhotoBrief home" className="flex items-center lg:hidden">
                <BrandMark variant="mark" tone="dark" size={28} eager />
              </NavLink>

              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium text-foreground">
                  {workspace?.name ?? "PhotoBrief"}
                </p>
                <p className="text-[11px] text-muted-foreground">Visual intake workspace</p>
              </div>
              {/* ⌘K search affordance — opens CommandMenu via keyboard event */}
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new KeyboardEvent("keydown", { key: "k", metaKey: true }),
                  );
                }}
                aria-label="Open command menu"
                className="ml-3 hidden h-8 w-56 items-center gap-2 border border-border bg-background/40 px-2 text-left text-xs text-muted-foreground transition hover:border-foreground/40 hover:text-foreground md:flex"
              >
                <Search className="h-3.5 w-3.5" />
                <span className="flex-1 truncate">Search or jump to…</span>
                <kbd className="font-mono text-[0.65rem] tracking-wider text-muted-foreground/70">⌘K</kbd>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <NavLink
                  to="/intake"
                  className="hidden h-9 items-center gap-2 border border-foreground/30 px-3 font-[Geist,Inter,system-ui,sans-serif] text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-foreground transition hover:bg-foreground hover:text-background md:inline-flex"
                >
                  <Globe2 className="h-3.5 w-3.5" />
                  Website Intake
                </NavLink>
                <NavLink
                  to="/requests/new"
                  className="hidden h-9 items-center gap-2 bg-[hsl(var(--accent-kinetic))] px-3 font-[Geist,Inter,system-ui,sans-serif] text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 sm:inline-flex"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New request
                </NavLink>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Account menu"
                      className="outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Avatar className="h-9 w-9 rounded-none border border-border">
                        <AvatarFallback className="rounded-none bg-foreground text-xs font-medium text-background">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-none border border-border">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="truncate text-sm font-medium text-foreground">{email ?? "-"}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); resetPassword(); }} disabled={resetting || !email}>
                      <KeyRound className="mr-2 h-4 w-4" />
                      {resetting ? "Sending link..." : "Reset password"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); logOut(); }} disabled={signingOut} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      {signingOut ? "Signing out..." : "Log out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <main className="relative flex-1 px-3 py-5 pb-24 sm:px-6 sm:py-8 lg:px-10 lg:pb-10">
              <div className="mx-auto w-full max-w-7xl animate-lift-in">
                <Outlet />
              </div>
            </main>
          </div>
        </div>

        <FeedbackWidget />

        <MobileTabBar />
      </SidebarProvider>
    </RequireAuth>
  );
}
