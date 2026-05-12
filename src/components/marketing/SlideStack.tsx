import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

/* ───────── Slide ───────── */

type SlideProps = {
  children: ReactNode;
  /** id used for hash navigation and indicator rail labelling */
  anchor?: string;
  /** short label for the indicator rail tooltip */
  label?: string;
  /** allow internal scroll if content can't be made to fit 100svh */
  scroll?: boolean;
  /** background override (defaults to --background) */
  tone?: "default" | "alt" | "ink";
  className?: string;
  /** inner-content max-width, defaults to max-w-7xl */
  width?: "narrow" | "default" | "wide" | "full";
  /** vertical alignment of inner content */
  align?: "center" | "start";
  /** style override (used by SlideStack to inject z-index) */
  style?: CSSProperties;
  /** allow data-* attributes injected by SlideStack to land in the DOM */
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
  scroll = false,
  tone = "default",
  className = "",
  width = "default",
  align = "center",
  style,
  ...rest
}: SlideProps) {
  return (
    <div
      id={anchor}
      data-pb-slide
      data-pb-label={label ?? anchor ?? ""}
      className={`pb-slide ${toneMap[tone]} ${scroll ? "pb-slide--scroll" : ""} ${className}`}
      style={style}
      {...rest}
    >
      <div
        className={`pb-slide-inner ${widthMap[width]}`}
        style={align === "start" ? { justifyContent: "flex-start" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/* RawSlide — same sticky pin + bg as Slide but no inner padding/centering.
   Use when children are existing <Section>s with their own padding. */
type RawSlideProps = {
  children: ReactNode;
  anchor?: string;
  label?: string;
  scroll?: boolean;
  tone?: "default" | "alt" | "ink";
  className?: string;
};
export function RawSlide({
  children,
  anchor,
  label,
  scroll = true,
  tone = "default",
  className = "",
}: RawSlideProps) {
  return (
    <div
      id={anchor}
      data-pb-slide
      data-pb-label={label ?? anchor ?? ""}
      className={`pb-slide ${toneMap[tone]} ${scroll ? "pb-slide--scroll" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ───────── SlideStack ───────── */

type SlideStackProps = {
  children: ReactNode;
  /** show the right-side indicator rail (desktop only) */
  rail?: boolean;
};

export function SlideStack({ children, rail = true }: SlideStackProps) {
  const slides = useMemo(
    () =>
      Children.toArray(children).filter((c): c is ReactElement =>
        isValidElement(c),
      ),
    [children],
  );

  const railId = useId();
  const stackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!rail) return;
    const root = stackRef.current;
    if (!root) return;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>("[data-pb-slide]"),
    );
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const idx = Number(entry.target.getAttribute("data-pb-index"));
            if (!Number.isNaN(idx)) setActive(idx);
          }
        });
      },
      { threshold: [0, 0.55, 0.9] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rail, slides.length]);

  const goTo = (i: number) => {
    const el = stackRef.current?.querySelector<HTMLElement>(
      `[data-pb-index="${i}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div
        ref={stackRef}
        className="pb-deck"
        style={{ ["--slide-count" as keyof CSSProperties as string]: slides.length } as CSSProperties}
      >
        {slides.map((child, i) =>
          cloneElement(child, {
            key: child.key ?? i,
            "data-pb-index": i,
            style: {
              ...(child.props.style ?? {}),
              zIndex: i + 1,
            },
          } as Partial<typeof child.props>),
        )}
      </div>

      {rail && slides.length > 1 ? (
        <nav aria-label="Slide navigation" className="pb-deck-rail">
          {slides.map((child, i) => {
            const label =
              (child.props as { label?: string; anchor?: string }).label ??
              (child.props as { anchor?: string }).anchor ??
              `Slide ${i + 1}`;
            return (
              <button
                key={`${railId}-${i}`}
                type="button"
                aria-label={`Go to ${label}`}
                aria-current={active === i ? "true" : undefined}
                onClick={() => goTo(i)}
              />
            );
          })}
        </nav>
      ) : null}
    </>
  );
}
