/**
 * GrainOverlay — a fixed, full-viewport SVG grain wash.
 * Pure markup, GPU-cheap, ignored by pointer events. Opacity comes from
 * the --grain-opacity token so it can be tuned globally.
 */
export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-overlay"
      style={{
        opacity: "var(--grain-opacity, 0.05)",
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.92 0 0 0 0 0.85 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
