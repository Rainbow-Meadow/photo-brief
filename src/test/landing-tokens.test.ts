import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const SRC = readFileSync(LANDING_PATH, "utf8");

describe("Landing token hygiene", () => {
  it("does not use raw hex literals in className arbitrary values", () => {
    const matches = SRC.match(/[a-z-]+-\[#[0-9a-fA-F]{3,8}\]/g);
    expect(matches, `Found raw hex tailwind values: ${matches?.join(", ")}`).toBeNull();
  });

  it("does not use bare text-black or border-black tokens", () => {
    expect(/\btext-black(?![/\w-])/.test(SRC)).toBe(false);
    expect(/\bborder-black(?![/\w-])/.test(SRC)).toBe(false);
  });

  it("imports only assets that are referenced at least twice (import + use)", () => {
    const importRegex = /import\s+(\w+)\s+from\s+"@\/assets\/[^"]+";/g;
    const importedNames: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = importRegex.exec(SRC))) importedNames.push(m[1]);
    expect(importedNames.length).toBeGreaterThan(0);
    for (const name of importedNames) {
      const occurrences = SRC.split(name).length - 1;
      expect(occurrences, `Asset import "${name}" is unused`).toBeGreaterThanOrEqual(2);
    }
  });

  it("includes the RMBC illustrations used by the editorial layout", () => {
    expect(SRC).toMatch(/researchMagnifierIllo/);
    expect(SRC).toMatch(/mechanismGearsIllo/);
    expect(SRC).toMatch(/briefPacketIllo/);
    expect(SRC).toMatch(/methodOverviewIllo/);
  });
});
