import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Visual contract for the landing page.
 *
 * We deliberately lint the source rather than rendering the whole page —
 * the page pulls in lazy chunks, lottie, and analytics that aren't worth
 * booting in jsdom. The rules below assert the structural rhythm of the
 * page so accidental drift is caught at PR time.
 */

const LANDING_PATH = resolve(__dirname, "../pages/Landing.tsx");
const SRC = readFileSync(LANDING_PATH, "utf8");

describe("Landing visual contract", () => {
  it("contains the documented set of section anchors", () => {
    const expected = [
      "id=\"workflow\"",
      "id=\"comparison\"",
      "id=\"use-cases\"",
      "id=\"website-intelligence\"",
      "id=\"beta-program\"",
      "id=\"apply\"",
    ];
    for (const needle of expected) {
      expect(SRC.includes(needle), `Section "${needle}" missing.`).toBe(true);
    }
  });

  it("uses the SectionIntro primitive for the major content sections", () => {
    // Each of these sections should compose SectionIntro for header rhythm.
    const requiredIntroSections = [
      "id=\"workflow\"", // workflow uses a custom split header — exempt
      "id=\"comparison\"",
      "id=\"use-cases\"",
      "id=\"website-intelligence\"",
      "id=\"beta-program\"",
    ];
    // workflow is the documented exception — drop it.
    const introSections = requiredIntroSections.slice(1);
    for (const id of introSections) {
      const idx = SRC.indexOf(id);
      const window = SRC.slice(idx, idx + 1500);
      expect(window.includes("<SectionIntro"), `${id} should use <SectionIntro>`).toBe(true);
    }
  });

  it("only allows tone='dark' on the final CTA section", () => {
    const darkOccurrences = SRC.match(/tone="dark"/g) ?? [];
    expect(darkOccurrences.length, "Expect a single dark-tone Section (final CTA).").toBe(1);
  });

  it("uses the CTA schema primitive for the final CTA — no raw <Button> in FinalCta", () => {
    const finalCtaStart = SRC.indexOf("function FinalCta");
    expect(finalCtaStart).toBeGreaterThan(-1);
    const finalCtaSrc = SRC.slice(finalCtaStart, finalCtaStart + 2500);
    expect(finalCtaSrc).toMatch(/<CTAGroup/);
    expect(finalCtaSrc).toMatch(/<CTA[\s>]/);
    expect(finalCtaSrc.includes("<Button")).toBe(false);
  });

  it("hero brand mark is rendered above the hero illustration in a centered column", () => {
    // Look at the JSX usage (the last occurrence), not the import line.
    const heroIllusIdx = SRC.lastIndexOf("src={heroIllustration}");
    expect(heroIllusIdx).toBeGreaterThan(-1);
    const before = SRC.slice(Math.max(0, heroIllusIdx - 1500), heroIllusIdx);
    expect(before).toMatch(/<BrandMark[\s\S]+variant="horizontal"/);
    expect(before).toMatch(/justify-center/);
  });

  it("RMBC illustrations are placed at their canonical RMBC stages", () => {
    // Mechanism section header eyebrow uses the literal "The mechanism" prefixed by Sparkles.
    const mechIdx = SRC.indexOf("Sparkles className=\"h-3.5 w-3.5\" /> The mechanism");
    expect(mechIdx, "Mechanism SectionIntro eyebrow not found").toBeGreaterThan(-1);
    const mechBlock = SRC.slice(mechIdx, mechIdx + 3000);
    expect(mechBlock).toMatch(/mechanismGearsIllo/);
    expect(mechBlock).toMatch(/methodOverviewIllo/);

    // Comparison section uses briefPacketIllo
    const cmpIdx = SRC.indexOf("id=\"comparison\"");
    expect(SRC.slice(cmpIdx, cmpIdx + 1500)).toMatch(/briefPacketIllo/);

    // Website Intelligence uses researchMagnifierIllo
    const wiIdx = SRC.indexOf("id=\"website-intelligence\"");
    expect(SRC.slice(wiIdx, wiIdx + 1500)).toMatch(/researchMagnifierIllo/);

    // Final CTA uses closeHandshakeIllo
    const cta = SRC.slice(SRC.indexOf("function FinalCta"));
    expect(cta).toMatch(/closeHandshakeIllo/);
  });

  it("trade illustrations on Pain Points are sized within the canonical band (≤360px)", () => {
    // Pain points header img — must not use the old scale-150 escape hatch.
    const painIdx = SRC.indexOf("function PainPointSection");
    expect(painIdx).toBeGreaterThan(-1);
    const painBlock = SRC.slice(painIdx, painIdx + 4000);
    expect(painBlock.includes("scale-150"), "scale-150 escape hatch should be removed").toBe(false);
    // At least one max-w-[3xx px] illustration sizing.
    expect(painBlock).toMatch(/max-w-\[3\d{2}px\]/);
  });

  it("workflow renders exactly four steps", () => {
    const stepsArrayMatch = SRC.match(/const workflowSteps = \[([\s\S]*?)\n\];/);
    expect(stepsArrayMatch).not.toBeNull();
    const stepCount = (stepsArrayMatch![1].match(/^\s*{/gm) ?? []).length;
    expect(stepCount).toBe(4);
  });

  it("website intelligence renders exactly three cards", () => {
    const arr = SRC.match(/const websiteIntelCards = \[([\s\S]*?)\n\];/);
    expect(arr).not.toBeNull();
    const count = (arr![1].match(/^\s*{/gm) ?? []).length;
    expect(count).toBe(3);
  });
});
