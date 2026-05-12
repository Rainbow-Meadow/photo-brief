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

  // Per-slide scroll budget = 1 viewport of transition + DWELL_RATIO of locked dwell.
  const DWELL_RATIO = 0.5;
  const SEGMENT = 1 + DWELL_RATIO; // viewports per slide after the first
  const deckViewports = 1 + Math.max(0, count - 1) * SEGMENT;

  useEffect(() => {
    if (count === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile =
      typeof window !== "undefined" && window.innerWidth < 1024;

    const disablePin = () => {
      const stage = stageRef.current;
      if (stage) {
        stage.style.position = "static";
        stage.style.top = "";
        stage.style.bottom = "";
      }
      slideRefs.current.forEach((el) => {
        if (el) {
          el.style.transform = "";
          el.style.position = "relative";
        }
      });
    };

    if (reduced || isMobile) {
      disablePin();
      const onResize = () => {
        if (window.innerWidth >= 1024 && !reduced) window.location.reload();
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const deck = deckRef.current;
      const stage = stageRef.current;
      if (!deck || !stage) return;
      const rect = deck.getBoundingClientRect();
      const vh = window.innerHeight;
      const deckHeight = rect.height;

      if (rect.top > 0) {
        stage.style.position = "absolute";
        stage.style.top = "0";
        stage.style.bottom = "auto";
      } else if (rect.bottom < vh) {
        stage.style.position = "absolute";
        stage.style.top = "auto";
        stage.style.bottom = "0";
      } else {
        stage.style.position = "fixed";
        stage.style.top = "0";
        stage.style.bottom = "auto";
      }

      const scrolled = -rect.top;
      const maxScroll = Math.max(1, deckHeight - vh);
      // Normalized progress 0..(count-1) across the deck.
      const progress = Math.max(
        0,
        Math.min(count - 1, (scrolled / maxScroll) * (count - 1)),
      );

      const transitionEnd = 1 / SEGMENT; // portion of a unit spent transitioning
      for (let i = 0; i < count; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        if (i === 0) {
          el.style.transform = "translate3d(0,0,0)";
          continue;
        }
        const local = progress - (i - 1); // 0..1 within slide i's segment
        const t = Math.max(0, Math.min(1, local / transitionEnd));
        const offset = (1 - t) * 100;
        el.style.transform = `translate3d(0, ${offset}%, 0)`;
      }

      // Active = highest index whose transition has finished (now in dwell).
      let idx = 0;
      for (let i = 1; i < count; i++) {
        if (progress - (i - 1) >= transitionEnd) idx = i;
      }
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
    const vh = window.innerHeight;
    const maxScroll = Math.max(1, deck.getBoundingClientRect().height - vh);
    // Land at the start of slide i's dwell (transition just completed).
    const denom = Math.max(1, count - 1);
    const target = deckTop + (Math.min(i, count - 1) / denom) * maxScroll;
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
                transform:
                  i === 0 ? "translate3d(0,0,0)" : "translate3d(0,100%,0)",
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
