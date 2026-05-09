import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Token-hygiene regression for src/pages/Landing.tsx.
 *
 * These rules lock in the visual language so future copy edits or
 * hand-tuned styling can't silently introduce raw colors or unused
 * illustrations. If you intentionally change one of these, update
 * this test in the same commit.
 */

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const LANDING_SOURCE = readFileSync(LANDING_PATH, "utf8");

describe("Landing token hygiene", () => {
  it("does not use raw hex literals in className arbitrary values", () => {
    // text-[#fff] / bg-[#000] / border-[#abc] — all forbidden.
    const matches = LANDING_SOURCE.match(/[a-z-]+-\[#[0-9a-fA-F]{3,8}\]/g);
    expect(matches, `Found raw hex tailwind values: ${matches?.join(", ")}`).toBeNull();
  });

  it("does not use bg-black or text-black utility classes", () => {
    // text-white is widely used on dark sections via design tokens — allowed.
    const offenders = ["bg-black ", "text-black ", "bg-black\"", "text-black\""];
    for (const token of offenders) {
      expect(
        LANDING_SOURCE.includes(token),
        `Forbidden raw color class: ${token.trim()}`,
      ).toBe(false);
    }
  });

  it("imports only assets that exist and are referenced at least twice (import + use)", () => {
    const importRegex = /import\s+(\w+)\s+from\s+"@\/assets\/[^"]+";/g;
    const importedNames: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = importRegex.exec(LANDING_SOURCE))) {
      importedNames.push(m[1]);
    }
    expect(importedNames.length).toBeGreaterThan(0);
    for (const name of importedNames) {
      // Count occurrences. >=2 means imported AND used somewhere.
      const occurrences = LANDING_SOURCE.split(name).length - 1;
      expect(
        occurrences,
        `Asset import "${name}" is unused (only ${occurrences} occurrence(s)).`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("includes the new RMBC illustrations", () => {
    expect(LANDING_SOURCE).toMatch(/researchMagnifierIllo/);
    expect(LANDING_SOURCE).toMatch(/mechanismGearsIllo/);
    expect(LANDING_SOURCE).toMatch(/briefPacketIllo/);
    expect(LANDING_SOURCE).toMatch(/closeHandshakeIllo/);
    expect(LANDING_SOURCE).toMatch(/methodOverviewIllo/);
  });
});
