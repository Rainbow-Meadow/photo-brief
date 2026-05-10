import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const SRC = readFileSync(LANDING_PATH, "utf8");

describe("Landing visual contract (Locomotive editorial)", () => {
  it("anchors the workflow/mechanism section", () => {
    expect(SRC).toMatch(/id="workflow"/);
  });

  it("composes the page from the documented section components", () => {
    for (const fn of [
      "function Hero",
      "function MarqueeBand",
      "function MechanismSection",
      "function ComparisonSection",
      "function SignpostSection",
      "function FaqSection",
      "function FinalCta",
    ]) {
      expect(SRC, `Missing section component: ${fn}`).toContain(fn);
    }
  });

  it("uses Section tone='dark' only on the final CTA section", () => {
    // Match `<Section ... tone="dark"`, not unrelated props (e.g. <BrandMark tone="dark" />).
    const dark = SRC.match(/<Section\b[^>]*tone="dark"/g) ?? [];
    expect(dark.length).toBe(1);
  });

  it("renders the FinalCta with CTA primitives", () => {
    expect(SRC).toMatch(/function FinalCta\b/);
    const cta = SRC.slice(SRC.indexOf("function FinalCta"));
    expect(cta).toMatch(/<CTAGroup/);
    expect(cta).toMatch(/<CTA[\s>]/);
  });

  it("signpost section renders exactly three doors", () => {
    const arr = SRC.match(/const signposts = \[([\s\S]*?)\n\];/);
    expect(arr).not.toBeNull();
    const count = (arr![1].match(/\bto:\s*"/g) ?? []).length;
    expect(count).toBe(3);
  });

  it("uses kinetic motion primitives", () => {
    expect(SRC).toMatch(/MarqueeRow/);
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
