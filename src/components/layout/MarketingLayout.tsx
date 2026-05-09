import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import {
  signupCtaTarget,
  signupCtaShortLabel,
  signupCtaLabel,
} from "@/config/access";
import {
  marketingLinks,
  legalLinks,
  allFooterLinks,
} from "@/config/marketingNav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/**
 * MarketingLayout — landing, pricing, auth pages.
 * Mobile: compact header + hamburger sheet for nav.
 * Desktop (sm+): inline nav links and Sign in CTA.
 *
 * Navigation links are managed centrally in `@/config/marketingNav`.
 */
export function MarketingLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="pb-landing flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4 pt-safe">
        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center">
          {/* Centered floating pill: links | LOGO | links */}
          <header className="pb-paper-pill mx-auto flex h-12 items-center gap-1 rounded-full px-2 text-sm font-medium sm:h-14 sm:gap-2 sm:px-3">
            {/* Left links (desktop) */}
            <nav className="hidden items-center gap-1 md:flex">
              {marketingLinks.slice(0, 1).map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `pb-paper-link rounded-full px-3 py-1.5 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>

            {/* Centered wordmark */}
            <NavLink
              to="/"
              aria-label="PhotoBrief.ai"
              className="flex items-center px-2 sm:px-3"
            >
              <BrandMark variant="wordmark" tone="light" size={22} eager className="sm:hidden" />
              <BrandMark variant="wordmark" tone="light" size={26} eager className="hidden sm:block" />
            </NavLink>

            {/* Right links (desktop) */}
            <nav className="hidden items-center gap-1 md:flex">
              {marketingLinks.slice(1).map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    `pb-paper-link rounded-full px-3 py-1.5 ${isActive ? "font-semibold" : ""}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </header>

          {/* Brand mark icon on the far left, outside the pill */}
          <NavLink
            to="/"
            aria-label="PhotoBrief.ai home"
            className="absolute left-3 top-3 flex h-12 items-center sm:left-6 sm:top-4 sm:h-14"
          >
            <BrandMark variant="mark" tone="light" size={36} eager />
          </NavLink>

          {/* CTAs sit outside the pill, on the far right */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 sm:right-6 sm:top-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden rounded-full text-[hsl(var(--pb-ink-soft))] hover:bg-white/60 sm:inline-flex"
            >
              <NavLink to="/auth">Sign in</NavLink>
            </Button>
            <Button asChild size="sm" className="rounded-full px-4">
              <NavLink to={signupCtaTarget()}>{signupCtaShortLabel()}</NavLink>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-[hsl(var(--pb-ink-soft))] md:hidden"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
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
          </div>
          <ul className="divide-y">
            {[...marketingLinks, ...legalLinks].map((l) => (
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
              <NavLink
                to={signupCtaTarget()}
                onClick={() => setMenuOpen(false)}
              >
                {signupCtaLabel()}
              </NavLink>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className={`pb-safe ${isLanding ? "pb-footer-dark pb-dark-island" : ""}`}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[hsl(var(--pb-muted))] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <BrandMark
            variant="horizontal"
            tone={isLanding ? "dark" : "light"}
            size={28}
            className="opacity-80"
          />
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-4"
          >
            {allFooterLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="hover:text-white transition-colors"
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <p className="text-xs text-white/36">
            © {new Date().getFullYear()} PhotoBrief.ai
          </p>
        </div>
      </footer>
    </div>
  );
}
