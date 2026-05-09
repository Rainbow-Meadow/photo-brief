import { Outlet, NavLink } from "react-router-dom";
import { BrandMark } from "@/components/layout/BrandMark";
import { PoweredByBadge } from "@/components/shared/PoweredByBadge";
import { useRecipientBranding } from "@/features/capture/RecipientBrandingContext";

/**
 * PublicRequestLayout
 * Mobile-first layout for the recipient capture flow.
 * Slim header, no sidebar, no auth.
 */
export function PublicRequestLayout() {
  const { businessName, logoUrl, hidePhotobriefBranding } = useRecipientBranding();
  return (
    <div className="recipient-shell relative isolate flex min-h-screen flex-col bg-gradient-subtle">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40vh] bg-ambient-sky" aria-hidden />
      <header className="material-chrome sticky top-0 z-30 rounded-none border-0 hairline-apple-b">
        <div className="mx-auto flex h-14 w-full max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2 text-callout font-semibold text-label">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={businessName}
                className="h-7 w-7 rounded-lg object-cover ring-1 ring-separator"
              />
            ) : (
              <BrandMark variant="horizontal" tone="light" size={28} eager />
            )}
            {logoUrl ? <span>{businessName}</span> : null}
          </div>
          <span className="text-caption-2 font-semibold uppercase tracking-wide text-label-tertiary">Secure intake</span>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-2xl px-3 py-3 sm:px-4 sm:py-6">
          <Outlet />
        </div>
      </main>

      {!hidePhotobriefBranding ? (
        <footer className="material-thin rounded-none border-0 hairline-apple-t py-4">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
            <PoweredByBadge size={42} />
            <nav aria-label="Legal" className="flex items-center gap-4 text-footnote text-label-secondary">
              <NavLink to="/privacy" className="tap-apple hover:text-label transition-colors">Privacy</NavLink>
              <NavLink to="/terms" className="tap-apple hover:text-label transition-colors">Terms</NavLink>
            </nav>
          </div>
        </footer>
      ) : null}
    </div>
  );
}
