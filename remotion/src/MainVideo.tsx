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

import { S1ColdOpen } from "./scenes/S1ColdOpen";
import { S2Graveyard } from "./scenes/S2Graveyard";
import { S3Reframe } from "./scenes/S3Reframe";
import { S4PasteUrl } from "./scenes/S4PasteUrl";
import { S5Questions } from "./scenes/S5Questions";
import { S6Recipient } from "./scenes/S6Recipient";
import { S7Inbox } from "./scenes/S7Inbox";
import { S8Close } from "./scenes/S8Close";

const SCENE_COMPONENTS = [
  S1ColdOpen,
  S2Graveyard,
  S3Reframe,
  S4PasteUrl,
  S5Questions,
  S6Recipient,
  S7Inbox,
  S8Close,
];

// Mark act-break transitions for accent flair (S3→S4 enters Act II, S7→S8 enters Act III)
const ACT_BREAKS = new Set([2, 6]); // index of the OUTGOING scene before the cut

export { TOTAL_FRAMES };

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Persistent ambient bed */}
      <Audio src={staticFile("audio/ambient.mp3")} volume={0.14} />

      {/* Persistent vignette */}
      <Vignette />

      {/* TransitionSeries — varied cuts per scene boundary */}
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
                    ? clockWipe({ width: 1920, height: 1080 })
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

      {/* Persistent timecode strip */}
      <TimecodeLayer />

      {/* Tick on every cut (cumulative scene-start frames) */}
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
