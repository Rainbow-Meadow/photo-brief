import { Outlet, NavLink } from "react-router-dom";
import { Plus, LifeBuoy, KeyRound, LogOut, Globe2 } from "lucide-react";
import { FeedbackWidget } from "@/features/support/components/FeedbackWidget";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
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
  return (
    <RequireAuth>
      <SidebarProvider>
        <div className="app-shell relative flex min-h-screen w-full overflow-hidden bg-background">
          <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-ambient-future opacity-80" />
          <div aria-hidden className="future-grid pointer-events-none fixed inset-0 opacity-35" />
          <div aria-hidden className="pointer-events-none fixed -right-40 top-24 h-96 w-96 rounded-full bg-primary/8 blur-3xl animate-pulse-glow" />
          <div aria-hidden className="pointer-events-none fixed -left-32 bottom-24 h-80 w-80 rounded-full bg-primary-glow/10 blur-3xl" />

          <div className="hidden lg:block">
            <AppSidebar />
          </div>

          <div className="relative flex min-w-0 flex-1 flex-col">
            <header className="pb-nav-bar sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-3 pt-safe sm:px-5">
              <div className="hidden lg:block">
                <SidebarTrigger />
              </div>

              <NavLink to="/dashboard" aria-label="PhotoBrief home" className="flex items-center lg:hidden">
                <BrandMark variant="mark" tone="auto" size={28} eager />
              </NavLink>

              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-medium text-foreground">
                  {workspace?.name ?? "PhotoBrief"}
                </p>
                <p className="text-[11px] text-muted-foreground">Visual intake workspace</p>
              </div>

              <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                <Button asChild size="sm" variant="outline" className="hidden gap-1.5 rounded-full bg-background/70 md:inline-flex">
                  <NavLink to="/intake">
                    <Globe2 className="h-4 w-4" />
                    Website Intake
                  </NavLink>
                </Button>
                <Button asChild size="sm" className="hidden gap-1.5 rounded-full sm:inline-flex">
                  <NavLink to="/requests/new">
                    <Plus className="h-4 w-4" />
                    New request
                  </NavLink>
                </Button>
                <ThemeToggle compact />
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Account menu"
                      className="rounded-full outline-none ring-offset-background transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <Avatar className="h-9 w-9 border border-border/70 shadow-sm">
                        <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-2xl">
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

            <main className="relative flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-10 lg:pb-10">
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
