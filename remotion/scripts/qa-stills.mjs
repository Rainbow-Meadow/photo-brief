import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMES = [2660, 2680, 2695];

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
    composition, serveUrl: bundled,
    output: `/tmp/qa/f-${String(f).padStart(4, "0")}.png`,
    frame: f, puppeteerInstance: browser,
  });
}
await browser.close({ silent: false });
console.log("done");
