import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";

import { COLORS } from "./theme";
import { SCENES, TOTAL_FRAMES, TRANSITION_FRAMES } from "./script";
import { GrainOverlay, Vignette } from "./components/GrainOverlay";
import { PlateCodeTicker } from "./components/PlateCodeTicker";

import { S1HookPain } from "./scenes/S1HookPain";
import { S2ReframeScan } from "./scenes/S2ReframeScan";
import { S3Routes } from "./scenes/S3Routes";
import { S4Policy } from "./scenes/S4Policy";
import { S5Phone } from "./scenes/S5Phone";
import { S6BriefClose } from "./scenes/S6BriefClose";

const SCENE_COMPONENTS = [
  S1HookPain,
  S2ReframeScan,
  S3Routes,
  S4Policy,
  S5Phone,
  S6BriefClose,
];

// Single act break between Act I (S1–S2) and Act II/III
const ACT_BREAKS = new Set([1]); // outgoing scene index

export { TOTAL_FRAMES };

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Persistent ambient bed */}
      <Audio src={staticFile("audio/ambient.mp3")} volume={0.18} />

      {/* Persistent vignette */}
      <Vignette />

      <TransitionSeries>
        {SCENE_COMPONENTS.map((Scene, i) => {
          const dur = SCENES[i].durationInFrames;
          const isActBreak = ACT_BREAKS.has(i);
          const els = [
            <TransitionSeries.Sequence key={`s${i}`} durationInFrames={dur}>
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          if (i < SCENE_COMPONENTS.length - 1) {
            els.push(
              <TransitionSeries.Transition
                key={`t${i}`}
                presentation={
                  isActBreak
                    ? clockWipe({ width: 1080, height: 1920 })
                    : i % 2 === 0
                      ? fade()
                      : wipe({ direction: "from-bottom" })
                }
                timing={
                  isActBreak
                    ? springTiming({
                        config: { damping: 200 },
                        durationInFrames: TRANSITION_FRAMES + 6,
                      })
                    : linearTiming({ durationInFrames: TRANSITION_FRAMES })
                }
              />,
            );
          }
          return els;
        })}
      </TransitionSeries>

      {/* Persistent grain on top */}
      <GrainOverlay opacity={0.06} density={500} />

      <TimecodeLayer />

      {/* Tick on every cut */}
      {(() => {
        let cursor = 0;
        return SCENE_COMPONENTS.map((_, i) => {
          if (i === 0) {
            cursor += SCENES[0].durationInFrames - TRANSITION_FRAMES;
            return null;
          }
          const tickAt = cursor;
          cursor += SCENES[i].durationInFrames - TRANSITION_FRAMES;
          return (
            <Sequence key={`tick-${i}`} from={Math.max(0, tickAt - 2)} durationInFrames={20}>
              <Audio src={staticFile("audio/tick.mp3")} volume={0.4} />
            </Sequence>
          );
        });
      })()}
    </AbsoluteFill>
  );
};

const TimecodeLayer: React.FC = () => {
  const f = useCurrentFrame();
  return <PlateCodeTicker totalFrame={f} totalFrames={TOTAL_FRAMES} />;
};
