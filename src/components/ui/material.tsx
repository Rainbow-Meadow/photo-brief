/**
 * Material — Apple HIG vibrancy surface primitive.
 *
 * Variants map directly to UIKit `UIBlurEffect.Style`:
 *   ultraThin | thin | regular | thick | chrome
 *
 * On touch devices, blur is automatically reduced (see index.css).
 * Use this for any chrome-like surface (nav bars, sheets, popovers, cards).
 *
 * For backwards-compatibility, `GlassPanel` is still exported and continues
 * to work — it now resolves to a `Material` underneath.
 */
import * as React from "react";
import { cn } from "@/lib/utils";

export type MaterialVariant =
  | "ultraThin"
  | "thin"
  | "regular"
  | "thick"
  | "chrome";

export interface MaterialProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: MaterialVariant;
  /** Adds HIG tap feedback (scale 0.97 + opacity dim). */
  interactive?: boolean;
  /** Round to iOS continuous-corner radius (rounded-2xl). */
  rounded?: boolean;
  asChild?: boolean;
}

const variantClass: Record<MaterialVariant, string> = {
  ultraThin: "material-ultraThin",
  thin: "material-thin",
  regular: "material-regular",
  thick: "material-thick",
  chrome: "material-chrome",
};

export const Material = React.forwardRef<HTMLDivElement, MaterialProps>(
  function Material(
    { className, variant = "regular", interactive, rounded = true, ...rest },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={cn(
          variantClass[variant],
          rounded && "rounded-2xl",
          interactive && "tap-apple cursor-pointer",
          className,
        )}
        {...rest}
      />
    );
  },
);

/* ── iOS-style grouped list ─────────────────────────────────────────── */

export const ListSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { title?: string; footer?: React.ReactNode }
>(function ListSection({ className, title, footer, children, ...rest }, ref) {
  return (
    <section ref={ref} className={cn("space-y-2", className)} {...rest}>
      {title ? (
        <h3 className="text-footnote uppercase tracking-wider text-label-secondary px-4">
          {title}
        </h3>
      ) : null}
      <div className="list-section-apple bg-systemBackground-grouped-secondary">
        {children}
      </div>
      {footer ? (
        <p className="text-footnote text-label-secondary px-4">{footer}</p>
      ) : null}
    </section>
  );
});

export const ListRow = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
    subtitle?: React.ReactNode;
  }
>(function ListRow(
  { className, leading, trailing, subtitle, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "list-row-apple w-full text-left focus-apple touch-target-apple",
        className,
      )}
      {...rest}
    >
      {leading ? <span className="shrink-0">{leading}</span> : null}
      <span className="flex-1 min-w-0">
        <span className="block text-callout text-label">{children}</span>
        {subtitle ? (
          <span className="block text-footnote text-label-secondary truncate">
            {subtitle}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className="shrink-0 text-label-tertiary">{trailing}</span>
      ) : null}
    </button>
  );
});

/* ── Segmented control ──────────────────────────────────────────────── */

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("segmented-apple", className)}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          type="button"
          aria-selected={value === opt.value}
          data-state={value === opt.value ? "active" : "inactive"}
          onClick={() => onChange(opt.value)}
          className="focus-apple"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
