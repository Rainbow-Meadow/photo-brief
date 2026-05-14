import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import { mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Spread across the 30s composition (900f total)
const FRAMES = [40, 200, 360, 500, 660, 820];
mkdirSync("/tmp/qa", { recursive: true });

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});
const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: "main", puppeteerInstance: browser });
for (const f of FRAMES) {
  console.log("frame", f);
  await renderStill({
    composition,
    serveUrl: bundled,
    output: `/tmp/qa/f-${String(f).padStart(4, "0")}.png`,
    frame: f,
    puppeteerInstance: browser,
  });
}
await browser.close({ silent: false });
console.log("done");
