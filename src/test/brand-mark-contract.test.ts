import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC_DIR = join(__dirname, "..");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip generated assets, build artifacts, and the editor's __screenshots__.
      if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
      out.push(...walk(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const ALL_FILES = walk(SRC_DIR);

/**
 * The app shell is dark-themed (`--background: 60 8% 5%`, `color-scheme: dark`),
 * so the cream-on-dark lockup (`tone="dark"`) is the de-facto default.
 *
 * Files allowed to render `<BrandMark ... tone="light" />` are surfaces that
 * are explicitly light (e.g. an embed served onto a host page the workspace
 * doesn't control). Any other use of `tone="light"` would render navy ink on
 * the dark app shell — illegible.
 */
const LIGHT_TONE_ALLOWLIST = new Set([
  // Embeddable badge — host page may be light; component honors `forceDark`.
  "pages/IntakeBadge.tsx",
]);

const BRANDMARK_TAG = /<BrandMark\b[^>]*?(?:\/>|>)/g;
const TONE_PROP = /\btone\s*=\s*"([^"]+)"|\btone\s*=\s*\{[^}]*?"([^"]+)"[^}]*?\}/;

describe("BrandMark tone contract", () => {
  it("never uses the deprecated 'auto' or 'color' tones", () => {
    const offenders: string[] = [];
    for (const file of ALL_FILES) {
      const src = readFileSync(file, "utf8");
      const tags = src.match(BRANDMARK_TAG) ?? [];
      for (const tag of tags) {
        const m = tag.match(TONE_PROP);
        const tone = m?.[1] ?? m?.[2];
        if (tone === "auto" || tone === "color") {
          offenders.push(`${file.replace(SRC_DIR + "/", "")}: ${tag}`);
        }
      }
    }
    expect(offenders, `Deprecated BrandMark tones found:\n${offenders.join("\n")}`).toEqual([]);
  });

  it('only uses tone="light" inside files explicitly allowlisted for light surfaces', () => {
    const offenders: string[] = [];
    for (const file of ALL_FILES) {
      const rel = file.replace(SRC_DIR + "/", "");
      // The BrandMark implementation itself references the literal — skip.
      if (rel === "components/layout/BrandMark.tsx") continue;
      // Tests are allowed to mention the literal.
      if (rel.startsWith("test/")) continue;

      const src = readFileSync(file, "utf8");
      const tags = src.match(BRANDMARK_TAG) ?? [];
      for (const tag of tags) {
        const m = tag.match(TONE_PROP);
        const tone = m?.[1] ?? m?.[2];
        const usesLight = tone === "light" || /tone=\{[^}]*"light"[^}]*\}/.test(tag);
        if (usesLight && !LIGHT_TONE_ALLOWLIST.has(rel)) {
          offenders.push(`${rel}: ${tag}`);
        }
      }
    }
    expect(
      offenders,
      `tone="light" used outside the allowlist (mark would render navy-on-dark):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("never inlines the dark mark asset outside BrandMark.tsx", () => {
    const offenders: string[] = [];
    for (const file of ALL_FILES) {
      const rel = file.replace(SRC_DIR + "/", "");
      if (rel === "components/layout/BrandMark.tsx") continue;
      if (rel.startsWith("test/")) continue;
      const src = readFileSync(file, "utf8");
      if (/mark-on-dark\.(svg|png)/.test(src)) {
        offenders.push(rel);
      }
    }
    expect(
      offenders,
      `mark-on-dark.* asset referenced directly (use <BrandMark tone="dark" /> instead):\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
