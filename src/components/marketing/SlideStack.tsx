import type { CSSProperties, ReactNode } from "react";

/* ───────── Slide ─────────
   Plain stacked section. Previously this was part of a scroll-pinned deck;
   that mechanism was removed for simplicity. Slides now flow naturally and
   grow with their content on every viewport. */

type SlideProps = {
  children: ReactNode;
  anchor?: string;
  label?: string;
  /** Kept for API compatibility — no longer used. */
  scroll?: boolean;
  tone?: "default" | "alt" | "ink";
  className?: string;
  width?: "narrow" | "default" | "wide" | "full";
  align?: "center" | "start";
  style?: CSSProperties;
  [dataAttr: `data-${string}`]: unknown;
};

const widthMap = {
  narrow: "max-w-3xl",
  default: "max-w-7xl",
  wide: "max-w-[88rem]",
  full: "max-w-none",
} as const;

const toneMap = {
  default: "bg-[hsl(var(--background))]",
  alt: "bg-[hsl(var(--card))]",
  ink: "bg-[hsl(var(--pb-ink))] text-[hsl(var(--pb-paper))]",
} as const;

export function Slide({
  children,
  anchor,
  label,
  tone = "default",
  className = "",
  width = "default",
  align = "center",
  style,
  scroll: _scroll,
  ...rest
}: SlideProps) {
  return (
    <section
      id={anchor}
      data-pb-slide
      data-pb-label={label ?? anchor ?? ""}
      className={`w-full ${toneMap[tone]} ${className}`}
      style={style}
      {...rest}
    >
      <div
        className={`mx-auto w-full px-6 py-20 sm:px-8 sm:py-24 lg:py-28 ${widthMap[width]}`}
        style={align === "start" ? { display: "flex", flexDirection: "column" } : undefined}
      >
        {children}
      </div>
    </section>
  );
}

type RawSlideProps = {
  children: ReactNode;
  anchor?: string;
  label?: string;
  scroll?: boolean;
  tone?: "default" | "alt" | "ink";
  className?: string;
  style?: CSSProperties;
  [dataAttr: `data-${string}`]: unknown;
};
export function RawSlide({
  children,
  anchor,
  label,
  tone = "default",
  className = "",
  style,
  scroll: _scroll,
  ...rest
}: RawSlideProps) {
  return (
    <section
      id={anchor}
      data-pb-slide
      data-pb-label={label ?? anchor ?? ""}
      className={`w-full ${toneMap[tone]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </section>
  );
}

/* ───────── SlideStack ─────────
   No-op wrapper: renders children stacked. The pinned scroll deck was
   removed; this stays as a thin shim so existing pages keep working. */

type SlideStackProps = {
  children: ReactNode;
  /** Kept for API compatibility — no longer rendered. */
  rail?: boolean;
};

export function SlideStack({ children }: SlideStackProps) {
  return <>{children}</>;
}
