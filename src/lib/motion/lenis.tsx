import { useEffect, type ReactNode } from "react";

/**
 * LenisProvider — inertial smooth scroll for the marketing surface.
 * Lenis is dynamically imported inside the effect so a failed/late
 * module load can never blank the entire app. Disabled on touch
 * devices and under prefers-reduced-motion.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    let raf = 0;
    let destroy: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { default: Lenis } = await import("lenis");
        if (cancelled) return;
        const lenis = new Lenis({
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.95,
        });
        const loop = (time: number) => {
          lenis.raf(time);
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        destroy = () => {
          cancelAnimationFrame(raf);
          lenis.destroy();
        };
      } catch (err) {
        // Smooth scroll is non-essential — fall back to native silently.
        if (import.meta.env?.DEV) console.warn("[Lenis] disabled:", err);
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return <>{children}</>;
}
