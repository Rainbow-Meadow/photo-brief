/**
 * Regression test for the recipient intake copy: under no circumstances should
 * the literal placeholder strings reach a real recipient. See BUG-2 in the
 * 2026-05-12 Cedar & Sons E2E report.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const FILES = [
  "src/features/capture/recipientContext.ts",
  "src/features/capture/pages/PublicRecipientPage.tsx",
  "src/hooks/useChatFlow.ts",
  "src/config/microcopy.ts",
];

describe("recipient intake copy", () => {
  for (const rel of FILES) {
    it(`${rel} contains no leaked placeholder strings`, () => {
      const full = path.resolve(process.cwd(), rel);
      const src = fs.readFileSync(full, "utf8");
      // The exact "Your business here" + "Your business needs" strings were
      // produced by recipientContext when the workspace name fell back to
      // "Your business". We forbid the substring entirely.
      expect(src).not.toMatch(/Your business here/i);
      expect(src).not.toMatch(/Your business needs/i);
    });
  }
});
