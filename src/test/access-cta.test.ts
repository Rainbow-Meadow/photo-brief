import { describe, expect, it } from "vitest";

import {
  INVITE_ONLY_BETA,
  planCtaLabel,
  planCtaTarget,
  signupCtaLabel,
  signupCtaShortLabel,
  signupCtaTarget,
} from "@/config/access";

describe("beta access CTA routing", () => {
  it("keeps public signup in invite-only beta mode", () => {
    expect(INVITE_ONLY_BETA).toBe(true);
    expect(signupCtaTarget()).toBe("/#apply");
    expect(signupCtaLabel()).toBe("Apply to join the beta");
    expect(signupCtaShortLabel()).toBe("Apply");
  });

  it("puts pricing interest in the query string before the apply hash", () => {
    const target = planCtaTarget("starter");
    expect(target).toBe("/?interest=starter#apply");

    const url = new URL(target, "https://photobrief.ai");
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("interest")).toBe("starter");
    expect(url.hash).toBe("#apply");
  });

  it("encodes plan interest safely while preserving the landing apply anchor", () => {
    const target = planCtaTarget("starter plus");
    expect(target).toBe("/?interest=starter%20plus#apply");

    const url = new URL(target, "https://photobrief.ai");
    expect(url.searchParams.get("interest")).toBe("starter plus");
    expect(url.hash).toBe("#apply");
  });

  it("uses beta-specific pricing labels", () => {
    expect(planCtaLabel("free")).toBe("Apply for beta");
    expect(planCtaLabel("starter")).toBe("Request founding access");
    expect(planCtaLabel("pro")).toBe("Request founding access");
  });
});
