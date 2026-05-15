import { describe, expect, it } from "vitest";

import {
  INVITE_ONLY_BETA,
  PUBLIC_SIGNUP_ENABLED,
  planCtaLabel,
  planCtaTarget,
  signupCtaLabel,
  signupCtaShortLabel,
  signupCtaTarget,
} from "@/config/access";

describe("public signup CTA routing", () => {
  it("opens public signup", () => {
    expect(PUBLIC_SIGNUP_ENABLED).toBe(true);
    expect(INVITE_ONLY_BETA).toBe(false);
    expect(signupCtaTarget()).toBe("/auth?mode=signup");
    expect(signupCtaLabel()).toBe("Start free trial");
    expect(signupCtaShortLabel()).toBe("Sign up");
  });

  it("routes plan tiers to /auth?mode=signup with plan in query", () => {
    expect(planCtaTarget("intake")).toBe("/auth?mode=signup&plan=intake");
    expect(planCtaTarget("intake_team")).toBe("/auth?mode=signup&plan=intake_team");
    expect(planCtaTarget("free")).toBe("/auth?mode=signup");
  });

  it("encodes plan ids safely", () => {
    const target = planCtaTarget("starter plus");
    expect(target).toBe("/auth?mode=signup&plan=starter%20plus");
    const url = new URL(target, "https://photobrief.ai");
    expect(url.searchParams.get("plan")).toBe("starter plus");
  });

  it("uses launch labels for plan CTAs", () => {
    expect(planCtaLabel("free")).toBe("Start free");
    expect(planCtaLabel("intake")).toBe("Start 14-day trial");
    expect(planCtaLabel("intake_team")).toBe("Start 14-day trial");
  });
});
