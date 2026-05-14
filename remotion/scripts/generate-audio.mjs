#!/usr/bin/env node
// Regenerate audio for the 90s PhotoBrief demo.
// - Per-scene voiceover files (vo-1.mp3 ... vo-8.mp3) — each scene's Audio
//   plays from frame 0 of its Sequence so the line lands on the cut.
// - ambient.mp3 — sparse documentary bed (regenerated only if --music passed)
// - tick.mp3 — soft scene-cut tick (regenerated only if --sfx passed)
// - stinger.mp3 — act-break amber stinger (--sfx)
//
// Usage:
//   ELEVENLABS_API_KEY=... node remotion/scripts/generate-audio.mjs           # vo only
//   ELEVENLABS_API_KEY=... node remotion/scripts/generate-audio.mjs --sfx     # vo + sfx
//   ELEVENLABS_API_KEY=... node remotion/scripts/generate-audio.mjs --music   # vo + music
//   ELEVENLABS_API_KEY=... node remotion/scripts/generate-audio.mjs --all     # everything

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { SCENES } from "../src/script.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/audio");
mkdirSync(OUT, { recursive: true });

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing");
  process.exit(1);
}

const args = new Set(process.argv.slice(2));
const RUN_SFX = args.has("--sfx") || args.has("--all");
const RUN_MUSIC = args.has("--music") || args.has("--all");
const FORCE = args.has("--force");

// George — calm, confident operator voice. Already in use.
const VOICE = "JBFqnCBsd6RMkjVDRZzb";

function save(name, buf) {
  const p = `${OUT}/${name}`;
  writeFileSync(p, Buffer.from(buf));
  console.log(`  → ${name} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
}

async function tts(text, speed = 0.95, prev, next) {
  const body = {
    text,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.55,
      similarity_boost: 0.78,
      style: 0.32,
      use_speaker_boost: true,
      speed,
    },
  };
  if (prev) body.previous_text = prev;
  if (next) body.next_text = next;

  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!r.ok) throw new Error(`TTS ${r.status}: ${await r.text()}`);
  return r.arrayBuffer();
}

async function generateVoiceover() {
  console.log("Voiceover (per scene, request-stitched):");
  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    const out = `vo-${i + 1}.mp3`;
    if (!FORCE && existsSync(`${OUT}/${out}`)) {
      console.log(`  · ${out} exists, skip (use --force to overwrite)`);
      continue;
    }
    const prev = SCENES[i - 1]?.vo;
    const next = SCENES[i + 1]?.vo;
    const buf = await tts(s.vo, s.voiceSpeed ?? 0.95, prev, next);
    save(out, buf);
  }
}

async function sfx(text, dur, name) {
  if (!FORCE && existsSync(`${OUT}/${name}`)) {
    console.log(`  · ${name} exists, skip`);
    return;
  }
  const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      duration_seconds: dur,
      prompt_influence: 0.55,
    }),
  });
  if (!r.ok) throw new Error(`SFX ${r.status}: ${await r.text()}`);
  save(name, await r.arrayBuffer());
}

async function generateSfx() {
  console.log("SFX:");
  await sfx(
    "A single soft pencil tick on paper, very short, dry, intimate, no reverb",
    0.6,
    "tick.mp3",
  );
  await sfx(
    "A short warm low brass swell with a metallic shimmer, 1.2 seconds, like a film chapter stinger, confident",
    1.4,
    "stinger.mp3",
  );
}

async function generateMusic() {
  if (!FORCE && existsSync(`${OUT}/ambient.mp3`)) {
    console.log("Music: ambient.mp3 exists, skip");
    return;
  }
  console.log("Music: ambient.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt:
        "Sparse editorial documentary score for a 90 second product film. Low cello drone, single muted piano notes every few seconds, soft mallet percussion, restrained build into the final 20 seconds. No drums until the last act. Calm, confident, premium. Field manual aesthetic.",
      music_length_ms: 95000,
    }),
  });
  if (!r.ok) throw new Error(`Music ${r.status}: ${await r.text()}`);
  save("ambient.mp3", await r.arrayBuffer());
}

await generateVoiceover();
if (RUN_SFX) await generateSfx();
if (RUN_MUSIC) await generateMusic();
console.log("Done.");
