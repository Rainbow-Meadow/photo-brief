#!/usr/bin/env node
// Generates the three audio assets used by the Field Manual video.
// Run once; outputs are committed under remotion/public/audio/.
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/audio");
mkdirSync(OUT, { recursive: true });

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing");
  process.exit(1);
}

const VOICE_GEORGE = "JBFqnCBsd6RMkjVDRZzb";

// RMBC copywriting framework: Research → Mechanism → Benefits → Close.
// Pacing target: ~32 seconds at conversational delivery.
const SCRIPT = [
  // 01 RESEARCH — the problem
  "Every contact form leaks. A name, an email, and 'I need a quote.' No photos. No address. No scope. So you call back. They don't pick up. The quote dies.",
  // 02 MECHANISM — the Reverse-Form Method
  "PhotoBrief reverses the form. You tell the customer what to send. The camera opens at the right angle, on the right shot. No app. No login. No thinking.",
  // 03 BENEFITS — what changes
  "A quote-ready packet lands in your inbox on the first reply. Photos in order. Address geocoded. Notes attached. No chasing. No callbacks.",
  // 04 CLOSE — brand
  "PhotoBrief. Guide. Capture. Close.",
].join(" ... ");

async function save(name, buf) {
  const p = `${OUT}/${name}`;
  writeFileSync(p, Buffer.from(buf));
  console.log(`  → ${name} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
}

async function tts() {
  console.log("TTS: voiceover.mp3");
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_GEORGE}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: SCRIPT,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.78,
          style: 0.4,
          use_speaker_boost: true,
          speed: 0.97,
        },
      }),
    },
  );
  if (!r.ok) throw new Error(`TTS ${r.status}: ${await r.text()}`);
  await save("voiceover.mp3", await r.arrayBuffer());
}

async function music() {
  console.log("Music: ambient.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/music", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt:
        "Sparse editorial documentary score, 33 seconds. Low cello drone. A single piano note every eight seconds, marking a scene change. Soft mallet percussion, no drums, no swells. Calm, confident, restrained. Field manual aesthetic.",
      music_length_ms: 33000,
    }),
  });
  if (!r.ok) throw new Error(`Music ${r.status}: ${await r.text()}`);
  await save("ambient.mp3", await r.arrayBuffer());
}

async function sfx() {
  console.log("SFX: tick.mp3");
  const r = await fetch("https://api.elevenlabs.io/v1/sound-generation", {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "A single soft pencil tick on paper, very short, dry, intimate, no reverb",
      duration_seconds: 0.6,
      prompt_influence: 0.5,
    }),
  });
  if (!r.ok) throw new Error(`SFX ${r.status}: ${await r.text()}`);
  await save("tick.mp3", await r.arrayBuffer());
}

await tts();
await music();
await sfx();
console.log("All audio generated.");
