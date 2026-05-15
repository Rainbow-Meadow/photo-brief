/**
 * Centralized access / signup configuration.
 *
 * PhotoBrief is publicly available. Anyone can create an account and starts
 * on a 14-day trial of the Smart Intake plan. Legacy beta-only branches are
 * kept as constants for any code that still references them, but they are
 * effectively no-ops.
 */
export const PUBLIC_SIGNUP_ENABLED = true;
export const INVITE_ONLY_BETA = false;

/** Where the primary "create account" CTA should send public visitors. */
export function signupCtaTarget(): string {
  return "/auth?mode=signup";
}

/** Label for the primary "create account" CTA. */
export function signupCtaLabel(): string {
  return "Start free trial";
}

/** Short label, suitable for tight nav slots. */
export function signupCtaShortLabel(): string {
  return "Sign up";
}

/** Where pricing tier CTAs should send visitors when they pick a plan. */
export function planCtaTarget(planId: string): string {
  if (planId === "free") return "/auth?mode=signup";
  return `/auth?mode=signup&plan=${encodeURIComponent(planId)}`;
}

/** Label for plan-tier CTAs. */
export function planCtaLabel(planId: string): string {
  if (planId === "free") return "Start free";
  return "Start 14-day trial";
}
