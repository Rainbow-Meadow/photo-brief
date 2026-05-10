import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

import { SceneResearch } from "./scenes/SceneResearch";
import { SceneMechanism } from "./scenes/SceneMechanism";
import { SceneBenefits } from "./scenes/SceneBenefits";
import { SceneClose } from "./scenes/SceneClose";
import { COLORS } from "./theme";

loadFraunces("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadGeistMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });
loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });

// RMBC copywriting framework: Research → Mechanism → Benefits → Close.
// Scene lengths shaped to the voiceover (~36s). Frames at 30fps.
const SCENES = [
  { Cmp: SceneResearch, frames: 330 }, // 11.0s
  { Cmp: SceneMechanism, frames: 300 }, // 10.0s
  { Cmp: SceneBenefits, frames: 270 }, // 9.0s
  { Cmp: SceneClose, frames: 200 }, // 6.66s
];

export const TOTAL_FRAMES = SCENES.reduce((acc, s) => acc + s.frames, 0); // 1100 = 36.66s

export const MainVideo: React.FC = () => {
  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Persistent ambient music bed */}
      <Audio src={staticFile("audio/ambient.mp3")} volume={0.16} />
      {/* Voiceover, full duration */}
      <Audio src={staticFile("audio/voiceover.mp3")} volume={1.0} />

      {SCENES.map(({ Cmp, frames }, i) => {
        const from = cursor;
        cursor += frames;
        return (
          <Sequence key={i} from={from} durationInFrames={frames}>
            {/* Scene-cut tick (first scene gets no tick) */}
            {i > 0 ? <Audio src={staticFile("audio/tick.mp3")} volume={0.32} /> : null}
            <Cmp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
