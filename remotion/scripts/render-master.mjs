import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { renameSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const finalOut = process.argv[2] || "/mnt/documents/photobrief-demo-mobile.mp4";
const tmpOut = finalOut.replace(/\.mp4$/, ".raw.mp4");

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
console.log(
  `Rendering ${composition.width}x${composition.height} · ${composition.durationInFrames}f @ ${composition.fps}fps → ${finalOut}`,
);

await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: tmpOut,
  puppeteerInstance: browser,
  muted: false,
  enforceAudioTrack: true,
  audioCodec: "aac",
  audioBitrate: "192k",
  videoBitrate: "10M",
  x264Preset: "slow",
  pixelFormat: "yuv420p",
  concurrency: 2,
  chromiumOptions: { gl: "swangle" },
});

await browser.close({ silent: false });

console.log("Remuxing with +faststart…");
execSync(`ffmpeg -y -i "${tmpOut}" -c copy -movflags +faststart "${finalOut}"`, { stdio: "inherit" });
execSync(`rm -f "${tmpOut}"`);
console.log("Done →", finalOut);
