/**
 * Centralized beta program configuration.
 *
 * Single source of truth for duration, cohort size, reward tiers, partner
 * benefits/expectations, and confirmation copy. Consumed by the public
 * /betalist page and internal admin surfaces.
 */

// ── Program parameters ───────────────────────────────────────────────

export const BETA_DURATION_DAYS = 60;
export const BETA_TOTAL_PARTNERS = 30;
export const BETA_PARTNERS_PER_WEEK = 5;
export const BETA_COHORTS = Math.ceil(BETA_TOTAL_PARTNERS / BETA_PARTNERS_PER_WEEK); // 6

// ── Reward tiers ─────────────────────────────────────────────────────

export type DiscountDuration = "perpetuity" | "first-year" | "free-pro";

export interface RewardTier {
  label: string;
  count: number;
  discount: number | null; // percentage, null for free-pro
  duration: DiscountDuration;
  shortDescription: string;
}

export const REWARD_TIERS: RewardTier[] = [
  {
    label: "Top 2",
    count: 2,
    discount: null,
    duration: "free-pro",
    shortDescription: "Free Pro for life",
  },
  {
    label: "Elite",
    count: 4,
    discount: 75,
    duration: "perpetuity",
    shortDescription: "75% off in perpetuity",
  },
  {
    label: "Strong",
    count: 4,
    discount: 50,
    duration: "perpetuity",
    shortDescription: "50% off in perpetuity",
  },
  {
    label: "Solid",
    count: 10,
    discount: 75,
    duration: "first-year",
    shortDescription: "75% off first year",
  },
  {
    label: "Participating",
    count: 10,
    discount: 50,
    duration: "first-year",
    shortDescription: "50% off first year",
  },
];

/** Human-readable summary for public-facing copy. */
export const MAX_DISCOUNT_LABEL = "Up to 75% off post-launch — based on feedback quality";

// ── Partner benefits & expectations ──────────────────────────────────

export const PARTNER_BENEFITS = [
  `${BETA_DURATION_DAYS}-day free founding beta access`,
  "Concierge setup for first templates and workflows",
  "Direct feedback channel and priority product input",
  "Early access to future tools",
  MAX_DISCOUNT_LABEL,
] as const;

export const PARTNER_EXPECTATIONS = [
  "Use PhotoBrief on 3–5 real customer workflows",
  "Share short feedback every two weeks",
  "Report confusing moments or missing workflow needs",
] as const;

// ── Confirmation / thank-you copy ────────────────────────────────────

export const CONFIRMATION_SUMMARY = `${BETA_DURATION_DAYS} days free · concierge setup · priority support · direct roadmap input · early access to future tools · up to 75% off post-launch`;
