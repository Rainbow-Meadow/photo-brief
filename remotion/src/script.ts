// Single source of truth for the 90s PhotoBrief demo video.
// Per-scene VO is rendered separately so each line lands on its cut.

export const FPS = 30;

export interface CaptionLine {
  text: string;
  /** start frame relative to scene start */
  from: number;
  /** duration in frames */
  duration: number;
}

export interface SceneSpec {
  id: string;
  /** scene length in frames (includes outgoing transition headroom) */
  durationInFrames: number;
  /** human-readable plate code */
  plate: string;
  /** small label rendered top-left */
  label: string;
  /** voiceover line — one mp3 generated per scene */
  vo: string;
  /** burned-in captions, frame-relative to the scene */
  captions: CaptionLine[];
  /** voice settings tuning per line for variety */
  voiceSpeed?: number;
}

// Scene durations (frames). Sum = 2805. Transition overlap ≈ 15f × 7 = 105 → final 2700f / 90s.
export const SCENES: SceneSpec[] = [
  {
    id: "s1-cold-open",
    durationInFrames: 135, // 4.5s
    plate: "PLT.A.01",
    label: "RFM-METHOD / OPEN",
    vo: "It's nine pm. You still don't know what the job is.",
    voiceSpeed: 0.92,
    captions: [
      { text: "It's 9pm.", from: 18, duration: 36 },
      { text: "You still don't know what the job is.", from: 56, duration: 70 },
    ],
  },
  {
    id: "s2-graveyard",
    durationInFrames: 270, // 9.0s
    plate: "PLT.A.02",
    label: "RFM-METHOD / PAIN",
    vo: "Seventeen Contact Us submissions this week. Half of them — just a name and need a quote. You text back. They ghost. Repeat.",
    captions: [
      { text: "17 'Contact Us' submissions this week.", from: 8, duration: 60 },
      { text: "Half of them: a name and 'need a quote'.", from: 70, duration: 60 },
      { text: "You text. They ghost. Repeat.", from: 132, duration: 56 },
    ],
  },
  {
    id: "s3-reframe",
    durationInFrames: 285, // 9.5s
    plate: "PLT.A.03",
    label: "RFM-METHOD / REFRAME",
    vo: "The form isn't the problem. The ask is. A roofer needs different answers than a mover. A leak needs different photos than a re-roof.",
    captions: [
      { text: "The form isn't the problem.", from: 6, duration: 48 },
      { text: "The ask is.", from: 56, duration: 40 },
      { text: "Different jobs. Different questions.", from: 110, duration: 60 },
      { text: "Different photos.", from: 175, duration: 60 },
    ],
  },
  {
    id: "s4-paste-url",
    durationInFrames: 375, // 12.5s
    plate: "PLT.B.01",
    label: "RFM-METHOD / SCAN",
    vo: "Paste your website. PhotoBrief reads it and proposes the routes a customer comes in for. Repair. Install. Quote. Emergency. You approve.",
    captions: [
      { text: "Paste your website.", from: 8, duration: 50 },
      { text: "PhotoBrief reads it.", from: 65, duration: 55 },
      { text: "Proposes routes: repair, install, quote, emergency.", from: 130, duration: 90 },
      { text: "You approve.", from: 240, duration: 55 },
    ],
  },
  {
    id: "s5-questions",
    durationInFrames: 375, // 12.5s
    plate: "PLT.B.02",
    label: "RFM-METHOD / QUESTIONS",
    vo: "Per route, the right questions. And a photo policy with four settings — not needed. Optional. Recommended. Required. Photos only when they actually move the job forward.",
    captions: [
      { text: "Per route — the right questions.", from: 6, duration: 60 },
      { text: "Photo policy: not a checkbox.", from: 80, duration: 60 },
      { text: "not needed · optional · recommended · required", from: 150, duration: 110 },
      { text: "Photos only when they move the job forward.", from: 270, duration: 90 },
    ],
  },
  {
    id: "s6-recipient",
    durationInFrames: 360, // 12.0s
    plate: "PLT.B.03",
    label: "RFM-METHOD / CAPTURE",
    vo: "Your customer gets one link. On their phone. One thumb. Plain words. No login. They answer. Attach what's asked. Hit send.",
    captions: [
      { text: "Your customer gets one link.", from: 8, duration: 60 },
      { text: "On their phone. One thumb.", from: 75, duration: 60 },
      { text: "Plain words. No login.", from: 145, duration: 60 },
      { text: "Answer. Attach. Send.", from: 240, duration: 90 },
    ],
  },
  {
    id: "s7-inbox",
    durationInFrames: 360, // 12.0s
    plate: "PLT.B.04",
    label: "RFM-METHOD / BRIEF",
    vo: "You get a brief. Contact, answers, photos, a readiness score. And either ready to quote — or a short list of what's still missing. Stop chasing. Start closing.",
    captions: [
      { text: "You get a brief.", from: 8, duration: 50 },
      { text: "Contact. Answers. Photos. Readiness score.", from: 60, duration: 90 },
      { text: "Ready to quote — or what's missing.", from: 160, duration: 90 },
      { text: "Stop chasing. Start closing.", from: 280, duration: 130 },
    ],
  },
  {
    id: "s8-close",
    durationInFrames: 645, // 21.5s
    plate: "PLT.A.06",
    label: "RFM-METHOD / CLOSE",
    vo: "PhotoBrief. Guide. Capture. Close. Built for roofers, HVAC, contractors, real estate, and claims adjusters tired of chasing customers over text.",
    voiceSpeed: 0.95,
    captions: [
      { text: "More complete briefs.", from: 30, duration: 100 },
      { text: "Fewer follow-up texts.", from: 140, duration: 100 },
      { text: "Publish in minutes.", from: 250, duration: 110 },
    ],
  },
];

export const TOTAL_SCENE_FRAMES = SCENES.reduce(
  (a, s) => a + s.durationInFrames,
  0,
);

/** Frames of overlap between adjacent scenes via TransitionSeries.Transition */
export const TRANSITION_FRAMES = 15;

/** Final composition duration after transition overlaps are applied */
export const TOTAL_FRAMES =
  TOTAL_SCENE_FRAMES - TRANSITION_FRAMES * (SCENES.length - 1);
