// Reusable motion presets for the demo video.
// Centralised so every entrance/exit shares a coherent rhythm.
import { interpolate, spring } from "remotion";

export interface EntranceArgs {
  frame: number;
  fps: number;
  delay?: number;
  /** "default" = 18f gentle. "hero" = 28f with blur. "snap" = 10f snappy. */
  variant?: "default" | "hero" | "snap";
}

/** Returns { opacity, y, blur, scale } you can spread into a style. */
export function entrance({
  frame,
  fps,
  delay = 0,
  variant = "default",
}: EntranceArgs) {
  const f = frame - delay;
  const cfg =
    variant === "hero"
      ? { damping: 22, stiffness: 110, mass: 1 }
      : variant === "snap"
        ? { damping: 18, stiffness: 240, mass: 0.6 }
        : { damping: 22, stiffness: 180, mass: 0.9 };
  const dur = variant === "hero" ? 28 : variant === "snap" ? 10 : 18;
  const p = spring({ frame: f, fps, config: cfg, durationInFrames: dur });
  const yMax = variant === "hero" ? 24 : 8;
  const blurStart = variant === "hero" ? 8 : 0;

  return {
    opacity: interpolate(p, [0, 1], [0, 1]),
    y: interpolate(p, [0, 1], [yMax, 0]),
    scale: interpolate(p, [0, 1], [variant === "snap" ? 0.92 : 0.98, 1]),
    blur: interpolate(p, [0, 1], [blurStart, 0]),
    progress: p,
  };
}

/** Linear opacity exit over `dur` frames ending at `endFrame`. */
export function exit(frame: number, endFrame: number, dur = 12) {
  return interpolate(frame, [endFrame - dur, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Helper: a tiny sin-wave wobble for "alive" subjects. */
export function wobble(frame: number, period = 90, amplitude = 4) {
  return Math.sin((frame / period) * Math.PI * 2) * amplitude;
}

/** Compose into a CSS transform/filter string. */
export function entranceStyle(e: ReturnType<typeof entrance>) {
  return {
    opacity: e.opacity,
    transform: `translateY(${e.y}px) scale(${e.scale})`,
    filter: e.blur > 0.1 ? `blur(${e.blur}px)` : undefined,
  };
}
