import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";

import { SceneResearch } from "./scenes/SceneResearch";
import { SceneMechanism } from "./scenes/SceneMechanism";
import { SceneBrief } from "./scenes/SceneBrief";
import { SceneCapture } from "./scenes/SceneCapture";
import { SceneClose } from "./scenes/SceneClose";
import { COLORS } from "./theme";

loadFraunces("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadGeistMono("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

const FPS = 30;
const SCENE = 180; // 6s per scene
const N = 5;

export const TOTAL_FRAMES = SCENE * N; // 900 = 30s

const SCENES = [
  SceneResearch,
  SceneMechanism,
  SceneBrief,
  SceneCapture,
  SceneClose,
];

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Persistent ambient music bed */}
      <Audio src={staticFile("audio/ambient.mp3")} volume={0.18} />
      {/* Voiceover, full duration */}
      <Audio src={staticFile("audio/voiceover.mp3")} volume={1.0} />

      {SCENES.map((Scene, i) => (
        <Sequence key={i} from={i * SCENE} durationInFrames={SCENE}>
          {/* Scene-cut tick */}
          <Audio src={staticFile("audio/tick.mp3")} volume={0.45} />
          <Scene />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
