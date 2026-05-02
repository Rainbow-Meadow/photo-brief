import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont } from "@remotion/google-fonts/Inter";

import { AmbientBackground } from "./components/AmbientBackground";
import { SceneLogo } from "./scenes/SceneLogo";
import { SceneDashboard } from "./scenes/SceneDashboard";
import { SceneTemplates } from "./scenes/SceneTemplates";
import { SceneSendRequest } from "./scenes/SceneSendRequest";
import { SceneCustomerCapture } from "./scenes/SceneCustomerCapture";
import { SceneReviewInbox } from "./scenes/SceneReviewInbox";
import { SceneAIAnalysis } from "./scenes/SceneAIAnalysis";
import { SceneClosing } from "./scenes/SceneClosing";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

// Scene durations (frames @ 30fps) — total ~81s = 2430 frames
const D_LOGO = 120;         // 0-4s: intro
const D_DASHBOARD = 240;    // 4-12s: dashboard overview
const D_TEMPLATES = 240;    // 12-20s: template selection
const D_SEND = 240;         // 20-28s: send request
const D_CAPTURE = 420;      // 28-42s: customer capture
const D_REVIEW = 360;       // 42-54s: review inbox
const D_AI = 360;           // 54-66s: AI analysis
const D_CLOSING = 450;      // 66-81s: results & closing

const TRANSITION = 20;
const TRANSITION_COUNT = 7;

export const TOTAL_FRAMES =
  D_LOGO + D_DASHBOARD + D_TEMPLATES + D_SEND + D_CAPTURE + D_REVIEW + D_AI + D_CLOSING
  - TRANSITION_COUNT * TRANSITION;

const fadeTiming = linearTiming({ durationInFrames: TRANSITION });

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "hsl(220, 20%, 98%)" }}>
      <AmbientBackground />
      <Audio src={staticFile("audio/voiceover.mp3")} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D_LOGO}>
          <SceneLogo />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_DASHBOARD}>
          <SceneDashboard />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_TEMPLATES}>
          <SceneTemplates />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_SEND}>
          <SceneSendRequest />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_CAPTURE}>
          <SceneCustomerCapture />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_REVIEW}>
          <SceneReviewInbox />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_AI}>
          <SceneAIAnalysis />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={fadeTiming} />

        <TransitionSeries.Sequence durationInFrames={D_CLOSING}>
          <SceneClosing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
