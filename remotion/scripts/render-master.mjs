import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || "/mnt/documents/photobrief-demo-master.mp4";

console.log("Bundling…");
const serveUrl = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl, id: "main", puppeteerInstance: browser });
console.log(`Rendering ${composition.durationInFrames}f @ ${composition.fps}fps → ${out}`);

await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: out,
  puppeteerInstance: browser,
  muted: false,
  enforceAudioTrack: true,
  audioCodec: "aac",
  audioBitrate: "256k",
  videoBitrate: "12M",
  x264Preset: "slow",
  pixelFormat: "yuv420p",
  concurrency: 2,
  chromiumOptions: { gl: "swangle" },
});

await browser.close({ silent: false });
console.log("Done →", out);
