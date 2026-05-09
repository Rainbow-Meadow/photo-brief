import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * LenisProvider — inertial smooth scroll for the marketing surface.
 * Disabled on touch devices and under prefers-reduced-motion so we
 * don't fight native scrolling on phones.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const isTouch = typeof window !== "undefined"
      && window.matchMedia("(pointer: coarse)").matches;
    const reduced = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
    });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
