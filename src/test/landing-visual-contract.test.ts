import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const SRC = readFileSync(LANDING_PATH, "utf8");

describe("Landing visual contract (Locomotive editorial)", () => {
  it("contains the documented section anchors", () => {
    for (const id of [
      'id="workflow"',
      'id="comparison"',
      'id="use-cases"',
      'id="website-intelligence"',
      'id="beta-program"',
      'id="apply"',
    ]) {
      expect(SRC.includes(id), `Section ${id} missing.`).toBe(true);
    }
  });

  it("anchor index strip lists exactly 5 entries (beta-program is its own section but excluded from the strip)", () => {
    const arr = SRC.match(/const sectionLinks = \[([\s\S]*?)\n\];/);
    expect(arr).not.toBeNull();
    const count = (arr![1].match(/^\s*{/gm) ?? []).length;
    expect(count).toBe(5);
  });

  it("uses Section tone='dark' only on the final CTA section", () => {
    // Match `<Section ... tone="dark"`, not unrelated props (e.g. <BrandMark tone="dark" />).
    const dark = SRC.match(/<Section\b[^>]*tone="dark"/g) ?? [];
    expect(dark.length).toBe(1);
  });

  it("renders the FinalCta with quick-apply form via CTA primitives", () => {
    expect(SRC).toMatch(/function FinalCta\b/);
    expect(SRC).toMatch(/FinalCtaQuickApply/);
    const cta = SRC.slice(SRC.indexOf("function FinalCta"));
    expect(cta).toMatch(/<CTAGroup/);
    expect(cta).toMatch(/<CTA[\s>]/);
  });

  it("workflow renders exactly four steps", () => {
    const arr = SRC.match(/const workflowSteps = \[([\s\S]*?)\n\];/);
    expect(arr).not.toBeNull();
    const count = (arr![1].match(/^\s*{/gm) ?? []).length;
    expect(count).toBe(4);
  });

  it("website intelligence renders exactly three cards", () => {
    const arr = SRC.match(/const websiteIntelCards = \[([\s\S]*?)\n\];/);
    expect(arr).not.toBeNull();
    const count = (arr![1].match(/^\s*{/gm) ?? []).length;
    expect(count).toBe(3);
  });

  it("uses kinetic motion primitives", () => {
    expect(SRC).toMatch(/MarqueeRow/);
    expect(SRC).toMatch(/RiseIn/);
    expect(SRC).toMatch(/MagneticCTA/);
  });

  it("never renders <BrandMark tone=\"dark\" /> directly (FinalCta dark Section has no logo; hero mark must be light)", () => {
    const tags = SRC.match(/<BrandMark\b[^>]*?(?:\/>|>)/g) ?? [];
    for (const tag of tags) {
      expect(tag, `Landing BrandMark must use tone="light": ${tag}`).not.toMatch(/tone="dark"/);
    }
  });
});
