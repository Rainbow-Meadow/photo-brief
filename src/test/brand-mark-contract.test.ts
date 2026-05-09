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
 * Files allowed to render `<BrandMark ... tone="dark" />`. The tone must match
 * the surface the mark physically sits on (a real dark navy bg), not the
 * page's overall theme. Adding a file here is a deliberate design decision.
 */
const DARK_TONE_ALLOWLIST = new Set([
  // Marketing footer flips to a dark navy bg on the landing route.
  "components/layout/MarketingLayout.tsx",
  // Embeddable badge — host page may be dark; component honors `forceDark`.
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

  it("only uses tone=\"dark\" inside files explicitly allowlisted for dark surfaces", () => {
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
        const usesDark = tone === "dark" || /tone=\{[^}]*"dark"[^}]*\}/.test(tag);
        if (usesDark && !DARK_TONE_ALLOWLIST.has(rel)) {
          offenders.push(`${rel}: ${tag}`);
        }
      }
    }
    expect(
      offenders,
      `tone="dark" used outside the allowlist (mark would render cream-on-cream):\n${offenders.join("\n")}`,
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
