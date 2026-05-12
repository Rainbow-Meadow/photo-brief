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
  anchor?: string;
  label?: string;
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
  scroll = true,
  tone = "default",
  className = "",
  style,
  ...rest
}: RawSlideProps) {
  return (
    <div
      id={anchor}
      data-pb-slide
      data-pb-label={label ?? anchor ?? ""}
      className={`pb-slide ${toneMap[tone]} ${scroll ? "pb-slide--scroll" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ───────── SlideStack ─────────
   Scroll-driven pinned deck. The deck reserves N viewports of scroll. A
   sticky stage pins one viewport. Slides are absolutely positioned inside
   the stage; each slide i translates from translateY(100%) → translateY(0)
   as the document scrolls through its assigned segment, covering slide i-1.
*/

type SlideStackProps = {
  children: ReactNode;
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
  const deckRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const [active, setActive] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Reset transforms so reduced-motion fallback in CSS takes over.
      slideRefs.current.forEach((el) => {
        if (el) el.style.transform = "";
      });
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const deck = deckRef.current;
      if (!deck) return;
      const rect = deck.getBoundingClientRect();
      const vh = window.innerHeight;
      // Total scrollable distance inside the deck = (count) * vh.
      // When deck top = 0  → progress = 0 (slide 0 fully visible).
      // When deck top = -(count) * vh → progress = count (last slide fully shown,
      // about to release the pin).
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(count, scrolled / vh));

      for (let i = 0; i < count; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        if (i === 0) {
          // Slide 0 stays put — it's the base layer.
          el.style.transform = "translate3d(0,0,0)";
          continue;
        }
        // Slide i comes up as progress passes (i-1 → i).
        const local = progress - (i - 1); // -inf .. count
        const clamped = Math.max(0, Math.min(1, local));
        const offset = (1 - clamped) * 100; // 100% → 0%
        el.style.transform = `translate3d(0, ${offset}%, 0)`;
      }

      // Active = whichever segment we're currently inside.
      const idx = Math.min(count - 1, Math.max(0, Math.round(progress)));
      setActive((prev) => (prev === idx ? prev : idx));
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  const goTo = (i: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    const deckTop = deck.getBoundingClientRect().top + window.scrollY;
    const target = deckTop + i * window.innerHeight;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <>
      <div
        ref={deckRef}
        className="pb-deck"
        style={
          {
            ["--slide-count" as keyof CSSProperties as string]: count,
            height: `${count * 100}svh`,
          } as CSSProperties
        }
      >
        <div ref={stageRef} className="pb-deck-stage">
          {slides.map((child, i) => (
            <div
              key={child.key ?? i}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              className="pb-deck-slot"
              style={{
                zIndex: i + 1,
                transform: i === 0 ? "translate3d(0,0,0)" : "translate3d(0,100%,0)",
              }}
              data-pb-index={i}
            >
              {cloneElement(child, {
                "data-pb-index": i,
              } as Partial<typeof child.props>)}
            </div>
          ))}
        </div>
      </div>

      {rail && count > 1 ? (
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
