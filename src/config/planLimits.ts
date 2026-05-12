// Centralized plan tiers, limits, and feature gating.
//
// Pricing model:
// - Free + Starter are manual-link plans: create a PhotoBrief request and send a clickable link.
// - Pro is the first automation plan: hosted Smart Intake, routing, webhook/integration setup.
// - The customer-facing pricing axes stay simple: photos, branding, storage term, team size.
// - 1 submitted/analyzed photo = 1 PhotoBrief Credit.
// - First-pass guarantee: follow-up/resubmission photos requested by PhotoBrief do not consume credits.
import type { Plan } from "@/types/photobrief";

/** Every gated capability in PhotoBrief. */
export type FeatureKey =
  | "request_limit"
  | "credit_limit"
  // Manual request links
  | "manual_links"
  | "clickable_links"
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
  // Website Intake / integrations
  | "website_intake"
  | "hosted_intake_form"
  | "intake_routing"
  | "api_webhooks"
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
  // Org
  | "multi_workspace"
  | "custom_domain"
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
  manual_links: {
    label: "Manual PhotoBrief links",
    description: "Create a request and send a clickable PhotoBrief link to a customer.",
  },
  clickable_links: {
    label: "Clickable PhotoBrief links",
    description: "Send customers a simple link that opens their mobile photo workflow.",
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
    description: "Let AI draft reusable photo request templates from a short guided setup.",
  },
  ai_request_builder: {
    label: "AI request builder",
    description: "Answer a few questions and get an editable request draft.",
  },
  advanced_ai_checks: {
    label: "AI quality checks",
    description: "Catch blur, glare, missing subjects, and unreadable labels before your team reviews.",
  },
  missing_shot_followup: {
    label: "Missing-shot follow-up",
    description: "AI nudges the customer for the exact shot you are missing.",
  },
  website_intake: {
    label: "Smart Intake",
    description: "Replace basic website forms with routed intake briefs that request photos only when useful.",
  },
  hosted_intake_form: {
    label: "Hosted smart intake",
    description: "Use a PhotoBrief-hosted intake link from your website CTA.",
  },
  intake_routing: {
    label: "Smart routing",
    description: "Route request types and messages to the right brief path, saved template, or conditional photo handoff.",
  },
  api_webhooks: {
    label: "Website integrations & webhooks",
    description: "Connect existing forms, Zapier, Make, Webflow, WordPress, and other tools to PhotoBrief.",
  },
  reminders: {
    label: "Automatic reminders",
    description: "Send reminder messages to recipients who have not finished.",
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
    tagline: "Send your first PhotoBrief links.",
    purpose: "Try manual customer photo collection with a few real links.",
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
      "Create and send clickable PhotoBrief links",
      "10 customer photos / month",
      "1 submitted photo = 1 photo credit",
      "Simple AI photo checks and summaries included",
      "PhotoBrief branding shown to customers",
      "7-day media storage",
      "Smart Intake and integrations unlock on Pro",
    ],
    capabilities: {
      manual_links: true,
      clickable_links: true,
      advanced_ai_checks: true,
    },
    pdfExport: false,
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    priceAnnualMonthly: 15,
    tagline: "Branded manual links.",
    purpose: "Solo operators who want a professional manual request flow before automating website leads.",
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
      "Create and send clickable PhotoBrief links",
      "100 customer photos / month",
      "Logo, brand color, and customer-facing messages",
      "3 saved templates for repeat manual requests",
      "AI quality checks, readiness score, and summary",
      "PDF export with PhotoBrief footer",
      "30-day media storage",
      "Smart Intake and integrations unlock on Pro",
    ],
    capabilities: {
      manual_links: true,
      clickable_links: true,
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
    tagline: "Automate smart intake.",
    purpose: "Small businesses ready to replace basic website forms with routed intake briefs and conditional photo handoff.",
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
      "Everything in Starter",
      "Hosted Smart Intake for your website CTA",
      "Clean intake briefs from website leads",
      "Guided setup for common website tools",
      "Smart routing for request types and messages",
      "Conditional photo requests only when useful",
      "Webhook and Zapier/Make-style integrations",
      "AI request builder and AI template drafting",
      "Remove PhotoBrief branding from customer pages",
      "Up to 3 users",
      "12-month media storage",
      "First-pass guarantee: requested follow-up photos are free",
    ],
    capabilities: {
      manual_links: true,
      clickable_links: true,
      branding: true,
      branded_links: true,
      custom_messages: true,
      custom_guides: true,
      ai_guide_generator: true,
      ai_request_builder: true,
      advanced_ai_checks: true,
      missing_shot_followup: true,
      website_intake: true,
      hosted_intake_form: true,
      intake_routing: true,
      api_webhooks: true,
      reminders: true,
      internal_notes: true,
      assignments: true,
      team_members: true,
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
    tagline: "Shared intake operations.",
    purpose: "Teams sharing automated smart intake and photo review across reviewers.",
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
      "Everything in Pro",
      "1,500 customer photos / month",
      "Smart Intake and webhook integrations",
      "Unlimited saved templates",
      "Team inbox, assignments, and reviewer roles",
      "Shared internal notes and activity history",
      "Bulk actions",
      "Full PDF branding",
      "Priority support",
      "24-month media storage",
    ],
    capabilities: {
      manual_links: true,
      clickable_links: true,
      branding: true,
      branded_links: true,
      custom_messages: true,
      custom_guides: true,
      ai_guide_generator: true,
      ai_request_builder: true,
      advanced_ai_checks: true,
      missing_shot_followup: true,
      website_intake: true,
      hosted_intake_form: true,
      intake_routing: true,
      api_webhooks: true,
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
      "Everything in Team",
      "5,000+ customer photos / month",
      "Custom pooled photo volume",
      "Custom branding and custom domain",
      "Fully white-labeled customer experience",
      "Custom media retention and export policy",
      "25+ users",
      "Multiple workspaces / locations",
      "Advanced audit history",
      "Priority support",
    ],
    capabilities: {
      manual_links: true,
      clickable_links: true,
      branding: true,
      branded_links: true,
      custom_messages: true,
      custom_guides: true,
      ai_guide_generator: true,
      ai_request_builder: true,
      advanced_ai_checks: true,
      missing_shot_followup: true,
      website_intake: true,
      hosted_intake_form: true,
      intake_routing: true,
      api_webhooks: true,
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
