import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const SRC = readFileSync(LANDING_PATH, "utf8");

describe("Landing visual contract (sticky-stack deck)", () => {
  it("anchors the workflow/mechanism slide", () => {
    // Slide primitive sets id from `anchor`; the workflow anchor must exist.
    expect(SRC).toMatch(/anchor="workflow"/);
  });

  it("composes the page from the documented slide components", () => {
    for (const fn of [
      "function HeroSlide",
      "function MarqueeSlide",
      "function ComparisonSlide",
      "function SignpostSlide",
      "function FaqAndCtaSlide",
    ]) {
      expect(SRC, `Missing slide component: ${fn}`).toContain(fn);
    }
  });

  it("renders the deck via SlideStack + Slide primitives (no inline dark <Section>)", () => {
    const dark = SRC.match(/<Section\b[^>]*tone="dark"/g) ?? [];
    expect(dark.length).toBe(0);
    expect(SRC).toMatch(/<SlideStack\b/);
    expect(SRC).toMatch(/<Slide\b/);
  });

  it("renders the four mechanism steps as individual slides", () => {
    const matches = SRC.match(/MechanismSlideView\s+index=\{\d\}/g) ?? [];
    expect(matches.length).toBe(4);
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
