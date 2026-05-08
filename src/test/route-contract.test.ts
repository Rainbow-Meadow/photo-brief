import { describe, expect, it } from "vitest";

import { routePathSet } from "@/config/routePaths";

describe("public route contract", () => {
  it("keeps the legacy beta onboarding path registered as a redirect route", () => {
    expect(routePathSet.has("/beta-onboarding")).toBe(true);
  });

  it("keeps the landing page as the canonical application surface", () => {
    expect(routePathSet.has("/")).toBe(true);
    expect(routePathSet.has("/betalist")).toBe(false);
    expect(routePathSet.has("/waitlist")).toBe(false);
    expect(routePathSet.has("/founding-partner-beta")).toBe(false);
  });
});
