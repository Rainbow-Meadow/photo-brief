/**
 * Centralized beta program configuration.
 *
 * Single source of truth for duration, cohort size, reward tiers, partner
 * benefits/expectations, and confirmation copy. Consumed by the public
 * landing page and internal admin surfaces.
 */

// ── Program parameters ───────────────────────────────────────────────

export const BETA_DURATION_DAYS = 60;
export const BETA_SETUP_BUFFER_DAYS = 14;
export const BETA_TOTAL_PARTNERS = 30;
export const BETA_PARTNERS_PER_WEEK = 5;
export const BETA_COHORTS = Math.ceil(BETA_TOTAL_PARTNERS / BETA_PARTNERS_PER_WEEK); // 6

/** Number of seats accepted so far. Update manually as partners are approved. */
export const BETA_SEATS_FILLED = 0;
export const BETA_SEATS_REMAINING = BETA_TOTAL_PARTNERS - BETA_SEATS_FILLED;
export const BETA_IS_FULL = BETA_SEATS_FILLED >= BETA_TOTAL_PARTNERS;

/** Human-readable timing explanation for public copy. */
export const BETA_TIMING_EXPLAINER = `Your ${BETA_DURATION_DAYS} days don't start ticking until ${BETA_SETUP_BUFFER_DAYS} days after the last seat fills — concierge setup first, clock second.`;

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
export const MAX_DISCOUNT_LABEL = "Up to 75% off forever — earned by feedback, not volume";

// ── Partner benefits & expectations ──────────────────────────────────

export const PARTNER_BENEFITS = [
  `${BETA_DURATION_DAYS} days free — clock starts after concierge setup`,
  "We read your site and build your intake routes for you",
  "Direct line to the team — your input shapes what ships next",
  "First in line on every tool we release",
  MAX_DISCOUNT_LABEL,
] as const;

export const PARTNER_EXPECTATIONS = [
  "Replace your contact form with PhotoBrief on a real site — not a sandbox",
  "Send a short async note every two weeks — chat, email, or in-app",
  "Tell us what confused customers, what felt missing, what the form should've asked",
] as const;

// ── Detailed expectations (for the full breakdown section) ───────────

export interface DetailedExpectation {
  title: string;
  description: string;
}

export const DETAILED_EXPECTATIONS: DetailedExpectation[] = [
  {
    title: "Run it on real customers",
    description:
      "Put PhotoBrief on a live site, in front of real leads. Sandboxes don't show you where the form is bleeding.",
  },
  {
    title: "Take at least 5 real intakes in the first two weeks",
    description:
      "Five live submissions is enough to tell us what's working and what's getting in the way.",
  },
  {
    title: "Respond to check-ins",
    description:
      "We'll reach out via email, chat, or in-app messages at two weeks and periodically after. A one-line reply is fine — we just need to know what's working and what isn't.",
  },
  {
    title: "Report bugs and friction",
    description:
      "If something breaks, feels wrong, or slows you down — tell us. That's the most valuable input you can give.",
  },
  {
    title: "Consent to anonymized usage data",
    description:
      "We use aggregate, anonymized data to make product decisions. Your business details stay private.",
  },
  {
    title: "Optional: testimonial or case study",
    description:
      "If you're willing, a short quote or case study helps us at launch — and earns you a higher reward tier.",
  },
];

// ── What drives reward placement ─────────────────────────────────────

export const REWARD_CRITERIA = [
  "Depth and quality of feedback responses",
  "Consistency of engagement over the 60-day period",
  "Actionability of bug reports and workflow suggestions",
  "Willingness to participate in async check-ins (chat, email, in-app) and case studies",
] as const;

// ── Scoring rubric for top-2 selection ───────────────────────────────

export interface ScoringDimension {
  label: string;
  weight: string;
  description: string;
  examples: string[];
}

export const SCORING_RUBRIC: ScoringDimension[] = [
  {
    label: "Feedback depth",
    weight: "30%",
    description:
      "Specific, contextual observations about your real workflow — not surface-level reactions.",
    examples: [
      '"The photo prompt order didn\'t match how my roofer walks a roof — here\'s the sequence that would."',
      '"Step 3 confused my customer because the wording assumes they know what flashing is."',
    ],
  },
  {
    label: "Consistency",
    weight: "25%",
    description:
      "Sustained engagement across the full 60 days, not a burst in week one and silence after.",
    examples: [
      "Responding to every bi-weekly check-in",
      "Continuing to flag issues as you use new features",
    ],
  },
  {
    label: "Bug & friction reports",
    weight: "25%",
    description:
      "Clear, reproducible reports that help us fix things fast — with context and steps.",
    examples: [
      '"On iPhone 14, the upload spinner hangs after the 4th photo if I switch apps mid-upload."',
      '"The template preview doesn\'t show the customer-facing intro text — I had to send a test to see it."',
    ],
  },
  {
    label: "Collaboration",
    weight: "20%",
    description:
      "Willingness to answer a follow-up via chat or email, share a short async walkthrough, or let us feature your story.",
    examples: [
      "Responding to a follow-up question over email or chat with context and detail",
      "Providing a short testimonial or before/after case study",
    ],
  },
];

// ── Free Pro for Life eligibility ─────────────────────────────────────

export const FREE_PRO_QUALIFIES = [
  "Depth and specificity of feedback — detailed workflow observations, not just thumbs-up",
  "Consistency across the full 60 days — regular engagement, not a burst and silence",
  "Actionable bug reports with steps to reproduce and context",
  "Participation in async check-ins (chat, email, in-app) and willingness to walk us through your process",
  "Optional but valued: a testimonial or case study we can feature at launch",
] as const;

export const FREE_PRO_DOES_NOT_QUALIFY = [
  "High usage volume alone — sending lots of requests without feedback won't move you up",
  "One-time feedback dumps — we need sustained engagement, not a single brain-dump",
  "Vague or generic comments like \"it's good\" or \"needs work\" without specifics",
  "Inactive accounts — if you stop using PhotoBrief, you can't earn the top tier",
  "Referrals or social promotion — helpful, but not a factor in tier placement",
] as const;

export const FREE_PRO_FINE_PRINT = [
  "Free Pro for Life applies to one workspace on one Pro-tier plan, for as long as the PhotoBrief Pro plan exists.",
  "Winners are chosen by the PhotoBrief team at the end of the 60-day beta based on overall feedback contribution.",
  "The reward is non-transferable and cannot be exchanged for cash or credit.",
  "PhotoBrief reserves the right to adjust plan features over time; the reward covers whatever the Pro plan includes.",
  "If a winning partner's account becomes inactive for 12+ consecutive months, the reward may be reviewed.",
] as const;

// ── Confirmation / thank-you copy ────────────────────────────────────

export const CONFIRMATION_SUMMARY = `${BETA_DURATION_DAYS} days free (clock starts ${BETA_SETUP_BUFFER_DAYS} days after the last seat fills) · concierge intake setup · direct line to the team · first access to every release · up to 75% off forever`;
