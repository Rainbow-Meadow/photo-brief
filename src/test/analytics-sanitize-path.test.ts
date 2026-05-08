import { describe, expect, it } from "vitest";

import { sanitizePath } from "@/lib/analytics";

describe("analytics path sanitization", () => {
  it("removes recipient tokens from public capture paths", () => {
    expect(sanitizePath("/r/customer-secret-token")).toBe("/r/:token");
    expect(sanitizePath("/r/customer-secret-token/done")).toBe("/r/:token/done");
  });

  it("removes invite tokens", () => {
    expect(sanitizePath("/invite/team-invite-token")).toBe("/invite/:token");
    expect(sanitizePath("/beta-invite/beta-token")).toBe("/beta-invite/:token");
  });

  it("replaces UUID path segments", () => {
    expect(
      sanitizePath("/requests/11111111-2222-4333-8444-555555555555"),
    ).toBe("/requests/:id");
  });

  it("leaves normal public marketing paths intact", () => {
    expect(sanitizePath("/")).toBe("/");
    expect(sanitizePath("/pricing")).toBe("/pricing");
    expect(sanitizePath("/for-ai-agents")).toBe("/for-ai-agents");
  });
});
