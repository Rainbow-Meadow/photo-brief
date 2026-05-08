import { describe, expect, it } from "vitest";

import { routePathSet } from "@/config/routePaths";

describe("public route contract", () => {
  it("keeps the landing page as the only public beta application surface", () => {
    expect(routePathSet.has("/")).toBe(true);
    expect(routePathSet.has("/beta-onboarding")).toBe(false);
    expect(routePathSet.has("/betalist")).toBe(false);
    expect(routePathSet.has("/waitlist")).toBe(false);
    expect(routePathSet.has("/founding-partner-beta")).toBe(false);
  });
});
