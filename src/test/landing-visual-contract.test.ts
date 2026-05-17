import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const SRC = readFileSync(LANDING_PATH, "utf8");

describe("Landing visual contract", () => {
  it("anchors the workflow/mechanism section", () => {
    expect(SRC).toMatch(/id="workflow"/);
  });

  it("composes the page from the documented section components", () => {
    for (const fn of [
      "function Hero",
      "function MechanismSection",
      "function ComparisonSection",
      "function FinalCta",
    ]) {
      expect(SRC, `Missing section component: ${fn}`).toContain(fn);
    }
  });

  it("uses the standardized FinalCtaSection (no inline Section tone='dark')", () => {
    const dark = SRC.match(/<Section\b[^>]*tone="dark"/g) ?? [];
    expect(dark.length).toBe(0);
    expect(SRC).toMatch(/FinalCtaSection/);
  });

  it("renders the FinalCta via the standardized FinalCtaSection primitive", () => {
    expect(SRC).toMatch(/function FinalCta\b/);
    const cta = SRC.slice(SRC.indexOf("function FinalCta"));
    expect(cta).toMatch(/<FinalCtaSection\b/);
    expect(cta).toMatch(/primary=\{/);
  });

  it("uses kinetic motion primitives", () => {
    expect(SRC).toMatch(/RiseIn/);
    expect(SRC).toMatch(/MagneticCTA/);
  });

  it('renders every <BrandMark> on the dark app shell with tone="dark"', () => {
    const tags = SRC.match(/<BrandMark\b[^>]*?(?:\/>|>)/g) ?? [];
    for (const tag of tags) {
      expect(tag, `Landing BrandMark must use tone="dark": ${tag}`).toMatch(/tone="dark"/);
    }
  });
});
