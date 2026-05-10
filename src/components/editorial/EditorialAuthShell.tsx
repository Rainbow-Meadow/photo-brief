import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BrandMark } from "@/components/layout/BrandMark";
import { Card } from "@/design-system/schema";

interface EditorialAuthShellProps {
  numeral: string;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** @deprecated retained for source compatibility; ignored by schema Card. */
  className?: string;
}

/**
 * Shared editorial frame for auth-style pages (sign-in, sign-up, password reset).
 * Sharp 1px paper Card on the warm off-black canvas, composed from the
 * design-system schema primitives.
 */
export function EditorialAuthShell({
  numeral,
  eyebrow,
  title,
  description,
  children,
  footer,
}: EditorialAuthShellProps) {
  return (
    <div className="relative isolate flex min-h-[100vh] flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-ambient-sky"
        aria-hidden
      />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <NavLink
          to="/"
          aria-label="PhotoBrief.ai home"
          className="mx-auto mb-8 flex items-center"
        >
          <BrandMark variant="stacked" tone="dark" size={64} eager />
        </NavLink>
        <Card variant="paper" padding="lg">
          <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span className="text-[hsl(var(--accent-kinetic))]">[ {numeral} ]</span>
            <span>{eyebrow}</span>
          </p>
          <h1 className="mt-5 text-[clamp(1.6rem,3vw,2rem)] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          <div className="mt-7">{children}</div>
        </Card>
        {footer ? (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
