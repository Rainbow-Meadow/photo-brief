// Top-up PhotoBrief Credit packs. One-time purchases that add AI/photo
// workload capacity on top of the workspace's monthly plan allowance.
// Credits expire at the end of the current billing period.
//
// Stripe lookup keys are unchanged for now because payments are not fully
// integrated yet. Product copy and metadata now treat these as credit packs.
export interface TopupPack {
  /** Stripe price lookup key. Kept stable until Stripe products are created. */
  priceId: "topup_25" | "topup_100" | "topup_500";
  size: 100 | 500 | 1500;
  /** Display price in cents. */
  amountCents: number;
  currency: "usd";
  label: string;
  tagline: string;
  highlight?: boolean;
}

export const topupPacks: TopupPack[] = [
  {
    priceId: "topup_25",
    size: 100,
    amountCents: 1500,
    currency: "usd",
    label: "100 credits",
    tagline: "Quick top-up for a few extra jobs.",
  },
  {
    priceId: "topup_100",
    size: 500,
    amountCents: 4500,
    currency: "usd",
    label: "500 credits",
    tagline: "Most teams pick this one.",
    highlight: true,
  },
  {
    priceId: "topup_500",
    size: 1500,
    amountCents: 17500,
    currency: "usd",
    label: "1,500 credits",
    tagline: "Best value for high-volume intake.",
  },
];

export function formatPrice(cents: number, currency: "usd" = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function perCreditCents(pack: TopupPack): number {
  return Math.round(pack.amountCents / pack.size);
}

/** Back-compat alias for older UI imports. */
export const perRequestCents = perCreditCents;
