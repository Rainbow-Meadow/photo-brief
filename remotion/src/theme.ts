// PhotoBrief — Field Manual / RMBC video tokens
// Locked visual contract: dark navy canvas, cream hairlines, single amber accent.
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const fraunces = loadFraunces("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
const geistMono = loadGeistMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
const inter = loadInter("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const COLORS = {
  bg: "#0E0E0C",         // matches app shell hsl(60 8% 5%)
  ink: "#F4F1EA",        // cream foreground
  inkDim: "rgba(244, 241, 234, 0.55)",
  inkFaint: "rgba(244, 241, 234, 0.16)",
  inkGrid: "rgba(244, 241, 234, 0.06)",
  amber: "#F2A33A",
  amberDim: "rgba(242, 163, 58, 0.18)",
  // UI mock-only cool ink for browser/phone/inbox chrome (act II)
  uiInk: "#9FB3C8",
  uiInkDim: "rgba(159, 179, 200, 0.4)",
  uiSurface: "#15171B",
  uiSurfaceHi: "#1C1F25",
  ok: "#7BD389",
  warn: "#F2A33A",
  bad: "#E66A5C",
} as const;

export const STROKE = {
  hairline: 1,
  contour: 2.5,
} as const;

export const FONT = {
  display: fraunces.fontFamily,
  mono: geistMono.fontFamily,
  ui: inter.fontFamily,
} as const;

export const PLATE = {
  monoLabel: {
    fontFamily: FONT.mono,
    fontSize: 14,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: COLORS.ink,
    fontWeight: 500,
  },
  monoSmall: {
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
    color: COLORS.inkDim,
  },
};
