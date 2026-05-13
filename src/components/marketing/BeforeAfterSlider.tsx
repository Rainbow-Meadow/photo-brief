import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { cfImage, cfImageSrcSet } from "@/lib/cfImage";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  initial?: number;
  onFirstInteract?: () => void;
  className?: string;
}

export function BeforeAfterSlider({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel = "Before",
  afterLabel = "After",
  initial = 50,
  onFirstInteract,
  className,
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const interactedRef = useRef(false);
  const [position, setPosition] = useState(initial);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, x)));
  }, []);

  const flagInteract = useCallback(() => {
    if (interactedRef.current) return;
    interactedRef.current = true;
    onFirstInteract?.();
  }, [onFirstInteract]);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    flagInteract();
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = position;
    if (e.key === "ArrowLeft") next = Math.max(0, position - 5);
    else if (e.key === "ArrowRight") next = Math.min(100, position + 5);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 100;
    else return;
    e.preventDefault();
    flagInteract();
    setPosition(next);
  };

  // Subtle one-time hint nudge on mount (respects reduced-motion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const t1 = window.setTimeout(() => setPosition(62), 700);
    const t2 = window.setTimeout(() => setPosition(initial), 1300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [initial]);

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={containerRef}
        className="relative aspect-[3/4] w-full overflow-hidden border border-border bg-[hsl(var(--pb-paper))] select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* After image (base layer) */}
        <img
          src={after}
          alt={afterAlt}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          // @ts-expect-error - fetchpriority is valid HTML attribute
          fetchpriority="high"
          width={1152}
          height={1536}
          draggable={false}
        />
        {/* Before image (clipped overlay) */}
        <img
          src={before}
          alt={beforeAlt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          loading="eager"
          width={1152}
          height={1536}
          draggable={false}
        />

        {/* Labels */}
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground backdrop-blur-sm">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))] backdrop-blur-sm">
          {afterLabel}
        </span>

        {/* Divider line */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-[hsl(var(--accent-kinetic))]"
          style={{ left: `${position}%`, transform: "translateX(-0.5px)" }}
        />

        {/* Handle */}
        <button
          type="button"
          role="slider"
          aria-label="Drag to compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          onKeyDown={onKeyDown}
          className="absolute top-1/2 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-[hsl(var(--accent-kinetic))] bg-background shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent-kinetic))]"
          style={{ left: `${position}%` }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
            <polyline points="9 6 3 12 9 18" />
            <polyline points="15 6 21 12 15 18" />
          </svg>
        </button>
      </div>

      {/* Caption strip below the frame */}
      <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-foreground/70">
        <span className="font-mono">Fig. 01</span>
        <span className="font-mono">Reverse-Form Method™</span>
      </div>
    </div>
  );
}
