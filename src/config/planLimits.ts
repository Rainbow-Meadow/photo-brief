// Centralized plan tiers, limits, and feature gating.
//
// Pricing model:
// - The customer-facing pricing axis is simple: photos, branding, storage term,
//   and team size.
// - PhotoBrief Credits are photo credits.
// - 1 submitted/analyzed photo = 1 credit.
// - Basic AI quality checks and submission summaries are bundled into that photo credit.
// - First-pass guarantee: follow-up/resubmission photos requested by PhotoBrief do not consume credits.
import type { Plan } from "@/types/photobrief";

/** Every gated capability in PhotoBrief. */
export type FeatureKey =
  | "request_limit"
  | "credit_limit"
  // Branding / recipient experience
  | "branding"
  | "branded_links"
  | "custom_messages"
  | "white_label"
  // Guides
  | "custom_guides"
  | "ai_guide_generator"
  // AI
  | "ai_request_builder"
  | "advanced_ai_checks"
  | "missing_shot_followup"
  // Workflow
  | "reminders"
  | "internal_notes"
  | "assignments"
  | "team_members"
  | "team_inbox"
  | "saved_templates"
  | "bulk_actions"
  // Output
  | "pdf_export"
  // Org / integrations
  | "multi_workspace"
  | "custom_domain"
  | "api_webhooks"
  | "priority_support";

export interface FeatureMeta {
  label: string;
  description: string;
}

export const featureCatalog: Record<FeatureKey, FeatureMeta> = {
  request_limit: {
    label: "Request volume",
    description: "Requests are workflow containers. Photo volume is the main usage unit.",
  },
  credit_limit: {
    label: "Monthly photos",
    description: "One submitted customer photo uses one PhotoBrief Credit.",
  },
  branding: {
    label: "Customer-facing branding",
    description: "Add your logo, brand color, and customer-facing copy to recipient pages.",
  },
  branded_links: {
    label: "Customer-facing branding",
    description: "Add your logo, brand color, and customer-facing copy to recipient pages.",
  },
  custom_messages: {
    label: "Custom customer messages",
    description: "Set your own request intro and completion copy.",
  },
  white_label: {
    label: "Remove PhotoBrief branding",
    description: "Hide PhotoBrief branding from customer-facing pages and exports.",
  },
  custom_guides: {
    label: "Saved templates",
    description: "Build and save your own reusable photo request templates.",
  },
  ai_guide_generator: {
    label: "AI template drafting",
    description: "Let AI draft reusable photo request templates from a short description.",
  },
  ai_request_builder: {
    label: "AI request builder",
    description: 'Type "I need photos for…" and get an editable request draft.',
  },
  advanced_ai_checks: {
    label: "AI quality checks",
    description: "Catch blur, glare, missing items, and more before your team reviews.",
  },
  missing_shot_followup: {
    label: "Missing-shot follow-up",
    description: "AI nudges the customer for the exact shot you're missing.",
  },
  reminders: {
    label: "Automatic reminders",
    description: "Send reminder messages to recipients who haven't finished.",
  },
  internal_notes: {
    label: "Internal notes",
    description: "Add team-only notes on submissions during review.",
  },
  assignments: {
    label: "Request assignments",
    description: "Assign requests and submissions to teammates.",
  },
  team_members: {
    label: "Team size",
    description: "Invite teammates to share the inbox and assign work.",
  },
  team_inbox: {
    label: "Team inbox",
    description: "Invite teammates to share the inbox and assign work.",
  },
  saved_templates: {
    label: "Saved templates",
    description: "Reuse polished request templates across customers.",
  },
  bulk_actions: {
    label: "Bulk actions",
    description: "Move, archive, or assign many requests at once.",
  },
  pdf_export: {
    label: "PDF export",
    description: "Export a clean PDF of any submission with photos, answers, and the AI summary.",
  },
  multi_workspace: {
    label: "Multiple workspaces",
    description: "Run separate workspaces per location, brand, or business unit.",
  },
  custom_domain: {
    label: "Custom domain",
    description: "Send customers to request links on your own domain.",
  },
  api_webhooks: {
    label: "API & webhooks",
    description: "Push submissions into your own systems with our API and webhooks.",
  },
  priority_support: {
    label: "Priority support",
    description: "Faster response times from the PhotoBrief team.",
  },
};

/** Numeric or unlimited cap. `0` means the feature is off entirely. */
export type Quota = number | "unlimited";

export type PdfExportLevel = false | "basic" | "branded" | "full_branding" | "custom";

export interface PlanLimit {
  id: Plan;
  name: string;
  priceMonthly: number;
  /** Effective monthly price when paying yearly (~20% off). */
  priceAnnualMonthly: number;
  tagline: string;
  purpose: string;
  features: string[];
  /** The four customer-facing pricing axes. */
  pricingAxes: {
    photos: string;
    customerBranding: string;
    photobriefBranding: string;
    storage: string;
    team: string;
  };
  highlight?: boolean;
  quotas: {
    /** Primary usage unit: 1 submitted/analyzed photo = 1 credit. */
    creditsPerMonth: Quota;
    /** Back-compat / abuse-control cap, not the main pricing primitive. */
    requestsPerMonth: Quota;
    /** Back-compat diagnostic quota. New UI should prefer creditsPerMonth. */
    aiChecksPerMonth: Quota;
    /** Friendly pricing-card estimate. Same as credits because one photo = one credit. */
    estimatedSimpleRequests: Quota;
    users: Quota;
    historyMonths: Quota;
    savedTemplates: Quota;
  };
  capabilities: Partial<Record<FeatureKey, boolean>>;
  pdfExport: PdfExportLevel;
  stripeMonthlyPriceId?: string;
  stripeAnnualPriceId?: string;
}

export const CREDIT_COSTS = {
  submittedPhoto: 1,
  firstPassFollowupPhoto: 0,
  aiPhotoCheck: 1,
  aiSubmissionSummary: 0,
  aiRequestBuilder: 0,
  aiGuideGeneration: 0,
  aiFollowupGeneration: 0,
  aiAdminRerun: 0,
} as const;

export const planLimits: PlanLimit[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnualMonthly: 0,
    tagline: "Try the workflow.",
    purpose: "Validate PhotoBrief with a few real customer photos.",
    pricingAxes: {
      photos: "10 photos / month",
      customerBranding: "No customer branding",
      photobriefBranding: "PhotoBrief branding shown",
      storage: "7-day storage",
      team: "1 user",
    },
    quotas: {
      creditsPerMonth: 10,
      requestsPerMonth: 10,
      aiChecksPerMonth: 10,
      estimatedSimpleRequests: 10,
      users: 1,
      historyMonths: 0.25,
      savedTemplates: 0,
    },
    features: [
      "10 customer photos / month",
      "1 submitted photo = 1 photo credit",
      "AI quality checks and summaries included",
      "PhotoBrief branding shown to customers",
      "7-day media storage",
      "1 user",
    ],
    capabilities: {},
    pdfExport: false,
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    priceAnnualMonthly: 15,
    tagline: "Branded basics for solo work.",
    purpose: "Solo operators who want a professional customer-facing request flow.",
    pricingAxes: {
      photos: "100 photos / month",
      customerBranding: "Logo, color, and custom messages",
      photobriefBranding: "PhotoBrief footer remains",
      storage: "30-day storage",
      team: "1 user",
    },
    quotas: {
      creditsPerMonth: 100,
      requestsPerMonth: 100,
      aiChecksPerMonth: 100,
      estimatedSimpleRequests: 100,
      users: 1,
      historyMonths: 1,
      savedTemplates: 3,
    },
    features: [
      "100 customer photos / month",
      "Logo, brand color, and customer-facing messages",
      "PhotoBrief footer remains on customer pages",
      "30-day media storage",
      "1 user",
      "AI quality checks, readiness score, and summary",
      "3 saved templates",
      "PDF export with PhotoBrief footer",
      "First-pass guarantee: requested follow-up photos are free",
    ],
    capabilities: {
      branding: true,
      branded_links: true,
      custom_messages: true,
      advanced_ai_checks: true,
      custom_guides: true,
      saved_templates: true,
      pdf_export: true,
    },
    pdfExport: "basic",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 49,
    priceAnnualMonthly: 40,
    tagline: "More photos, no PhotoBrief branding.",
    purpose: "High-volume solo operators and small teams that want a fully branded customer experience.",
    highlight: true,
    pricingAxes: {
      photos: "500 photos / month",
      customerBranding: "Full customer branding",
      photobriefBranding: "PhotoBrief branding removed",
      storage: "12-month storage",
      team: "Up to 3 users",
    },
    quotas: {
      creditsPerMonth: 500,
      requestsPerMonth: 500,
      aiChecksPerMonth: 500,
      estimatedSimpleRequests: 500,
      users: 3,
      historyMonths: 12,
      savedTemplates: 25,
    },
    features: [
      "500 customer photos / month",
      "Full customer branding",
      "Remove PhotoBrief branding from customer pages",
      "12-month media storage",
      "Up to 3 users",
      "25 saved templates",
      "AI request builder and AI template drafting",
      "Missing-shot follow-up and reminders",
      "Internal notes and assignments",
      "Branded PDF export",
      "First-pass guarantee: requested follow-up photos are free",
    ],
    capabilities: {
      branding: true,
      branded_links: true,
      custom_messages: true,
      custom_guides: true,
      ai_guide_generator: true,
      ai_request_builder: true,
      advanced_ai_checks: true,
      missing_shot_followup: true,
      reminders: true,
      internal_notes: true,
      assignments: true,
      saved_templates: true,
      pdf_export: true,
      white_label: true,
    },
    pdfExport: "branded",
  },
  {
    id: "team",
    name: "Team",
    priceMonthly: 99,
    priceAnnualMonthly: 80,
    tagline: "Team inbox and longer storage.",
    purpose: "Teams sharing customer photo intake across multiple reviewers.",
    pricingAxes: {
      photos: "1,500 photos / month",
      customerBranding: "Full customer branding",
      photobriefBranding: "PhotoBrief branding removed",
      storage: "24-month storage",
      team: "Up to 10 users",
    },
    quotas: {
      creditsPerMonth: 1500,
      requestsPerMonth: 1500,
      aiChecksPerMonth: 1500,
      estimatedSimpleRequests: 1500,
      users: 10,
      historyMonths: 24,
      savedTemplates: "unlimited",
    },
    features: [
      "1,500 customer photos / month",
      "Full customer branding",
      "Remove PhotoBrief branding from customer pages",
      "24-month media storage",
      "Up to 10 users",
      "Unlimited saved templates",
      "Team inbox, assignments, and reviewer roles",
      "Shared internal notes and activity history",
      "Bulk actions",
      "Full PDF branding",
      "Priority support",
      "First-pass guarantee: requested follow-up photos are free",
    ],
    capabilities: {
      branding: true,
      branded_links: true,
      custom_messages: true,
      custom_guides: true,
      ai_guide_generator: true,
      ai_request_builder: true,
      advanced_ai_checks: true,
      missing_shot_followup: true,
      reminders: true,
      internal_notes: true,
      assignments: true,
      team_members: true,
      team_inbox: true,
      saved_templates: true,
      bulk_actions: true,
      pdf_export: true,
      white_label: true,
      priority_support: true,
    },
    pdfExport: "full_branding",
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 199,
    priceAnnualMonthly: 150,
    tagline: "Custom volume and retention.",
    purpose: "Multi-location operators with custom storage, branding, and integration needs.",
    pricingAxes: {
      photos: "5,000+ photos / month",
      customerBranding: "Custom branding and domain",
      photobriefBranding: "Fully white-labeled",
      storage: "Custom retention",
      team: "25+ users",
    },
    quotas: {
      creditsPerMonth: 5000,
      requestsPerMonth: "unlimited",
      aiChecksPerMonth: "unlimited",
      estimatedSimpleRequests: "unlimited",
      users: 25,
      historyMonths: "unlimited",
      savedTemplates: "unlimited",
    },
    features: [
      "5,000+ customer photos / month",
      "Custom pooled photo volume",
      "Custom branding and custom domain",
      "Fully white-labeled customer experience",
      "Custom media retention and export policy",
      "25+ users",
      "Multiple workspaces / locations",
      "Unlimited saved templates",
      "API & webhooks",
      "Advanced audit history",
      "Priority support",
      "First-pass guarantee: requested follow-up photos are free",
    ],
    capabilities: {
      branding: true,
      branded_links: true,
      custom_messages: true,
      custom_guides: true,
      ai_guide_generator: true,
      ai_request_builder: true,
      advanced_ai_checks: true,
      missing_shot_followup: true,
      reminders: true,
      internal_notes: true,
      assignments: true,
      team_members: true,
      team_inbox: true,
      saved_templates: true,
      bulk_actions: true,
      pdf_export: true,
      multi_workspace: true,
      custom_domain: true,
      white_label: true,
      api_webhooks: true,
      priority_support: true,
    },
    pdfExport: "custom",
  },
];

const planRank: Record<Plan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  team: 3,
  business: 4,
};

export function getPlanLimit(plan: Plan): PlanLimit {
  return planLimits.find((p) => p.id === plan) ?? planLimits[0];
}

export function canUseFeature(
  plan: Plan,
  feature: FeatureKey,
  currentUsage?: number,
): boolean {
  const limit = getPlanLimit(plan);

  if (feature === "request_limit") {
    const cap = limit.quotas.requestsPerMonth;
    if (cap === "unlimited") return true;
    if (typeof currentUsage === "number") return currentUsage < cap;
    return cap > 0;
  }

  if (feature === "credit_limit") {
    const cap = limit.quotas.creditsPerMonth;
    if (cap === "unlimited") return true;
    if (typeof currentUsage === "number") return currentUsage < cap;
    return cap > 0;
  }

  return limit.capabilities[feature] === true;
}

export function minPlanFor(feature: FeatureKey): Plan | undefined {
  const sorted = [...planLimits].sort((a, b) => planRank[a.id] - planRank[b.id]);
  for (const p of sorted) {
    if (feature === "request_limit") {
      const cap = p.quotas.requestsPerMonth;
      if (cap === "unlimited" || (typeof cap === "number" && cap > 0)) return p.id;
    } else if (feature === "credit_limit") {
      const cap = p.quotas.creditsPerMonth;
      if (cap === "unlimited" || (typeof cap === "number" && cap > 0)) return p.id;
    } else if (p.capabilities[feature]) {
      return p.id;
    }
  }
  return undefined;
}

export function comparePlans(a: Plan, b: Plan): number {
  return planRank[a] - planRank[b];
}

export function lockedFeatureCopy(feature: FeatureKey): {
  planLabel: string;
  toast: string;
  tooltip: string;
  badge: string;
} {
  const plan = minPlanFor(feature);
  const planLabel = plan ? getPlanLimit(plan).name : "a higher plan";
  const meta = featureCatalog[feature];
  const noun = meta?.label ?? "This feature";
  return {
    planLabel,
    toast: `${noun} is on the ${planLabel} plan`,
    tooltip: `Available on ${planLabel} and above`,
    badge: planLabel,
  };
}

export const FOUNDING_PRO = {
  monthlyPrice: 29,
  totalSlots: 50,
  basePlan: "pro" as Plan,
  couponCode: "FOUNDINGPRO",
};
