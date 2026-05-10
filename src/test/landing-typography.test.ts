import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SCHEMA = readFileSync(resolve(__dirname, "../design-system/schema.css"), "utf8");
const LANDING = readFileSync(resolve(__dirname, "../pages/Landing.tsx"), "utf8");

describe("Landing typography contract (Geist + service-trade trust)", () => {
  it("uses Geist as the display family in headings", () => {
    expect(SCHEMA).toMatch(/\.ls-h1[^}]*?font-family:\s*"Geist"/s);
  });

  it("does not reuse Bricolage Grotesque anywhere in the schema", () => {
    expect(SCHEMA).not.toMatch(/Bricolage Grotesque/);
  });

  it("removes the boutique italic accent class in favour of an accent-dot", () => {
    expect(LANDING).not.toMatch(/ls-italic-accent/);
    expect(LANDING).toMatch(/ls-accent-dot/);
  });

  it("CTAs render in the Geist sans family, not mono", () => {
    const cta = SCHEMA.slice(SCHEMA.indexOf(".ls-cta {"));
    expect(cta).toMatch(/font-family:\s*"Geist"/);
    // First match after .ls-cta { must be sans, not mono
    const first = cta.match(/font-family:\s*"([^"]+)"/);
    expect(first?.[1]).toBe("Geist");
  });

  it("h1 weight is 700 (not 800) and tracking is tighter than -0.04em", () => {
    const h1 = SCHEMA.match(/\.ls-h1\s*\{[\s\S]*?\}/)?.[0] ?? "";
    expect(h1).toMatch(/font-weight:\s*700/);
    // -0.025em is "tighter than -0.04em" in the loose-to-tight axis we want
    expect(h1).toMatch(/letter-spacing:\s*-0\.0[12]\d*em/);
  });

  it("marquee ghost variant has a non-stroke fallback for Firefox", () => {
    expect(SCHEMA).toMatch(/@supports \(-webkit-text-stroke/);
  });
});
