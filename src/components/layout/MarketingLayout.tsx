import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { signupCtaTarget, signupCtaShortLabel, signupCtaLabel } from "@/config/access";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";


const marketingRoutes = [
  { to: "/betalist", label: "Beta Program" },
  { to: "/pricing", label: "Pricing" },
  { to: "/help", label: "Help" },
];

const legalRoutes = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

/**
 * MarketingLayout — landing, pricing, auth pages.
 * Mobile: compact header + hamburger sheet for nav.
 * Desktop (sm+): inline nav links and Sign in CTA.
 */
export function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="pb-landing flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4 pt-safe">
        <header className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 rounded-full glass-nav px-3 sm:h-16 sm:px-5">
          <NavLink to="/" aria-label="PhotoBrief home" className="flex items-center pl-1">
            <BrandMark variant="wordmark" tone="auto" size={22} eager className="sm:hidden" />
            <BrandMark variant="wordmark" tone="auto" size={26} eager className="hidden sm:block" />
          </NavLink>

          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            {marketingRoutes.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 transition-colors ${
                    isActive
                      ? "bg-[hsl(var(--pb-lavender)/0.12)] text-[hsl(var(--pb-lavender))]"
                      : "text-white/62 hover:bg-white/7 hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <ThemeToggle hideLabel className="hidden md:inline-flex" />
            <Button asChild variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
              <NavLink to="/auth">Sign in</NavLink>
            </Button>
            <Button asChild size="sm" className="rounded-full px-4">
              <NavLink to={signupCtaTarget()}>{signupCtaShortLabel()}</NavLink>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>
      </div>

      {/* Mobile nav sheet */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[84vw] max-w-sm p-0">
          <SheetHeader className="border-b px-5 py-4 text-left">
            <SheetTitle>
              <BrandMark variant="horizontal" tone="auto" size={32} eager />
            </SheetTitle>
          </SheetHeader>
          <div className="border-b px-5 py-4">
            <ThemeToggle className="w-full justify-between" />
          </div>
          <ul className="divide-y">
            {marketingRoutes.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-4 text-base font-medium text-foreground active:bg-muted"
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            {legalRoutes.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-4 text-base font-medium text-foreground active:bg-muted"
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-5 py-4 text-base font-medium text-foreground active:bg-muted"
              >
                Sign in
              </NavLink>
            </li>
          </ul>
          <div className="px-5 pt-6">
            <Button asChild className="w-full rounded-full">
              <NavLink to={signupCtaTarget()} onClick={() => setMenuOpen(false)}>
                {signupCtaLabel()}
              </NavLink>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="pb-safe">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[hsl(var(--pb-muted))] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandMark variant="horizontal" tone="light" size={28} className="opacity-80" />
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-4">
            <NavLink to="/betalist" className="hover:text-white transition-colors">Beta Program</NavLink>
            <NavLink to="/pricing" className="hover:text-white transition-colors">Pricing</NavLink>
            <NavLink to="/help" className="hover:text-white transition-colors">Help</NavLink>
            <NavLink to="/for-ai-agents" className="hover:text-white transition-colors">For AI agents</NavLink>
            <NavLink to="/privacy" className="hover:text-white transition-colors">Privacy</NavLink>
            <NavLink to="/terms" className="hover:text-white transition-colors">Terms</NavLink>
          </nav>
          <p className="text-xs text-white/36">© {new Date().getFullYear()} PhotoBrief.ai</p>
        </div>
      </footer>
    </div>
  );
}
