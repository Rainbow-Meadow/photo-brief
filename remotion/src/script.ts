// Single source of truth for the 30s vertical PhotoBrief demo.
// No voiceover — large burned-in captions carry the story.

export const FPS = 30;

export interface CaptionLine {
  text: string;
  /** start frame relative to scene start */
  from: number;
  /** duration in frames */
  duration: number;
  /** optional emphasis word/phrase rendered in amber */
  accent?: string;
  /** size hint: "hero" (huge), "title" (large), "body" (medium) */
  size?: "hero" | "title" | "body";
}

export interface SceneSpec {
  id: string;
  durationInFrames: number;
  plate: string;
  label: string;
  captions: CaptionLine[];
}

// Vertical 9:16 cut — 6 scenes. Sum = 960. Overlap 12f × 5 = 60. Final = 900f / 30s.
export const SCENES: SceneSpec[] = [
  {
    id: "s1-hook-pain",
    durationInFrames: 150,
    plate: "PLT.A.01",
    label: "RFM / OPEN",
    captions: [
      { text: "It's 9pm.", from: 10, duration: 38, size: "hero" },
      { text: "17 'Contact Us'\nforms this week.", from: 52, duration: 44, size: "title" },
      { text: "You text. They ghost.", from: 100, duration: 50, size: "title", accent: "ghost" },
    ],
  },
  {
    id: "s2-reframe-scan",
    durationInFrames: 150,
    plate: "PLT.A.03",
    label: "RFM / REFRAME",
    captions: [
      { text: "The form\nisn't the problem.", from: 6, duration: 56, size: "title" },
      { text: "The ask is.", from: 66, duration: 80, size: "hero", accent: "ask" },
    ],
  },
  {
    id: "s3-routes",
    durationInFrames: 120,
    plate: "PLT.B.01",
    label: "RFM / SCAN",
    captions: [
      { text: "Paste your site.\nWe build the routes.", from: 8, duration: 110, size: "title", accent: "routes" },
    ],
  },
  {
    id: "s4-policy",
    durationInFrames: 150,
    plate: "PLT.B.02",
    label: "RFM / POLICY",
    captions: [
      { text: "Photos —\nonly when they help.", from: 8, duration: 140, size: "title", accent: "help" },
    ],
  },
  {
    id: "s5-phone",
    durationInFrames: 180,
    plate: "PLT.B.03",
    label: "RFM / CAPTURE",
    captions: [
      { text: "One link.", from: 10, duration: 40, size: "hero" },
      { text: "One thumb.", from: 52, duration: 40, size: "hero" },
      { text: "No login.", from: 94, duration: 80, size: "hero", accent: "No login" },
    ],
  },
  {
    id: "s6-brief-close",
    durationInFrames: 210,
    plate: "PLT.A.06",
    label: "RFM / CLOSE",
    captions: [
      { text: "A complete brief.\nReady to quote.", from: 8, duration: 80, size: "title" },
      { text: "Stop chasing.\nStart closing.", from: 100, duration: 105, size: "hero", accent: "Start closing." },
    ],
  },
];

export const TOTAL_SCENE_FRAMES = SCENES.reduce((a, s) => a + s.durationInFrames, 0);
export const TRANSITION_FRAMES = 12;
export const TOTAL_FRAMES = TOTAL_SCENE_FRAMES - TRANSITION_FRAMES * (SCENES.length - 1);
