import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Braces,
  ClipboardList,
  Code2,
  FileSpreadsheet,
  FormInput,
  Globe2,
  Mail,
  MessageSquareText,
  PlugZap,
  Send,
  Smartphone,
  Workflow,
} from "lucide-react";
import type { Plan } from "@/types/photobrief";

export type IntegrationCategory = "website" | "communication" | "automation" | "crm";
export type IntegrationStage = "live" | "setup_ready" | "planned";
export type IntegrationActionKind = "internal_route" | "copy" | "oauth_placeholder" | "docs";

export interface IntegrationActionDefinition {
  label: string;
  kind: IntegrationActionKind;
  to?: string;
  copyValue?: string;
  helper?: string;
}

export interface IntegrationDefinition {
  key: string;
  name: string;
  category: IntegrationCategory;
  stage: IntegrationStage;
  icon: LucideIcon;
  plan: Plan;
  tagline: string;
  description: string;
  enables: string[];
  inboundEvents: string[];
  outboundActions: string[];
  actions: IntegrationActionDefinition[];
  statusLabel: string;
}

export const integrationCategories: Record<IntegrationCategory, { label: string; description: string }> = {
  website: {
    label: "Website intake",
    description: "Turn site visitors and existing forms into guided PhotoBrief requests.",
  },
  communication: {
    label: "Email & SMS",
    description: "Send request links from the channels customers already trust.",
  },
  automation: {
    label: "Automation",
    description: "Move PhotoBrief events into the tools your team already uses.",
  },
  crm: {
    label: "CRM & operations",
    description: "Attach clean briefs to customers, leads, jobs, approvals, and dispatch workflows.",
  },
};

export const integrationDefinitions: IntegrationDefinition[] = [
  {
    key: "website-intake",
    name: "Hosted Website Intake",
    category: "website",
    stage: "live",
    icon: Globe2,
    plan: "pro",
    tagline: "A PhotoBrief-powered intake page for your site CTA.",
    description:
      "Send website visitors into a guided request flow without rebuilding your site or existing forms.",
    enables: ["Hosted intake URL", "Request type routing", "Pro automation path"],
    inboundEvents: ["Website lead received", "Request type selected"],
    outboundActions: ["Create customer", "Create PhotoBrief request", "Generate request link"],
    actions: [{ label: "Open Website Intake", kind: "internal_route", to: "/intake" }],
    statusLabel: "Available now",
  },
  {
    key: "site-badge",
    name: "PhotoBrief Site Badge",
    category: "website",
    stage: "live",
    icon: Code2,
    plan: "pro",
    tagline: "A branded badge businesses can paste into their website.",
    description:
      "A lightweight script/button pattern that tells customers why PhotoBrief helps and keeps the intake experience consistent.",
    enables: ["Branded website CTA", "Consistent customer explanation", "Low-code install"],
    inboundEvents: ["Badge clicked", "Hosted intake opened"],
    outboundActions: ["Open intake page", "Preserve brand context"],
    actions: [
      {
        label: "Copy badge script",
        kind: "copy",
        copyValue:
          '<script async src="https://photobrief.ai/photobrief-site-badge.js" data-photobrief-intake="https://photobrief.ai/i/YOUR_TOKEN"></script>',
        helper: "Paste this near the button area on your site and replace YOUR_TOKEN with your intake token.",
      },
    ],
    statusLabel: "Available now",
  },
  {
    key: "webhook-bridge",
    name: "Existing Form Webhook Bridge",
    category: "website",
    stage: "setup_ready",
    icon: Braces,
    plan: "pro",
    tagline: "Let existing website forms create PhotoBrief requests.",
    description:
      "A structured receiver for Wix, Webflow, WordPress, Zapier, Make, or custom site forms to hand off leads to PhotoBrief.",
    enables: ["Field mapping", "Lead-to-request creation", "Test payload workflow"],
    inboundEvents: ["External form submitted", "Mapped customer fields received"],
    outboundActions: ["Create/update customer", "Create request", "Generate send-ready message"],
    actions: [
      {
        label: "Copy webhook URL",
        kind: "copy",
        copyValue: "https://photobrief.ai/functions/v1/integration-webhook/{workspace_id}/{connection_key}",
        helper: "Use this as the stable endpoint shape for existing form tools. Replace placeholders after a connection is created.",
      },
    ],
    statusLabel: "Framework ready",
  },
  {
    key: "wordpress-com",
    name: "WordPress.com",
    category: "website",
    stage: "setup_ready",
    icon: FormInput,
    plan: "pro",
    tagline: "Connect WordPress lead forms to guided photo requests.",
    description:
      "Start with a webhook/embedded badge pattern for WordPress sites, then promote to a native plugin once beta demand is clear.",
    enables: ["Lead form handoff", "Badge install path", "Draft request creation"],
    inboundEvents: ["WordPress form submitted", "Badge clicked"],
    outboundActions: ["Create customer", "Create draft request", "Open hosted intake"],
    actions: [{ label: "Use webhook", kind: "internal_route", to: "/settings/integrations" }],
    statusLabel: "Setup ready",
  },
  {
    key: "webflow",
    name: "Webflow",
    category: "website",
    stage: "setup_ready",
    icon: FormInput,
    plan: "pro",
    tagline: "Route Webflow form submissions into PhotoBrief.",
    description:
      "Use the webhook bridge for existing Webflow forms and turn submitted leads into draft PhotoBrief requests.",
    enables: ["Webflow form webhook", "Field mapping", "Request routing"],
    inboundEvents: ["Webflow form submitted"],
    outboundActions: ["Create customer", "Create draft request", "Generate request link"],
    actions: [{ label: "Use webhook", kind: "internal_route", to: "/settings/integrations" }],
    statusLabel: "Setup ready",
  },
  {
    key: "wix",
    name: "Wix",
    category: "website",
    stage: "planned",
    icon: FormInput,
    plan: "pro",
    tagline: "One-click site builder install once beta demand confirms it.",
    description:
      "Wix should start with hosted links and webhooks, then become a native install experience after the workflow is proven.",
    enables: ["Site CTA", "Request type routing", "Future app install"],
    inboundEvents: ["Wix form submitted", "CTA clicked"],
    outboundActions: ["Open intake", "Create request", "Sync result to site"],
    actions: [{ label: "Use webhook first", kind: "internal_route", to: "/settings/integrations" }],
    statusLabel: "Planned native",
  },
  {
    key: "shopify",
    name: "Shopify",
    category: "website",
    stage: "planned",
    icon: FormInput,
    plan: "team",
    tagline: "Collect product, return, review, and custom-order photos.",
    description:
      "A future Shopify connector can request the right photos for returns, custom products, reviews, and support tickets.",
    enables: ["Return documentation", "Product photo requests", "Support handoff"],
    inboundEvents: ["Order selected", "Return requested", "Support ticket opened"],
    outboundActions: ["Create request", "Attach brief to order", "Update support thread"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Prioritize after real ecommerce beta demand." }],
    statusLabel: "Planned native",
  },
  {
    key: "gmail",
    name: "Gmail",
    category: "communication",
    stage: "setup_ready",
    icon: Mail,
    plan: "starter",
    tagline: "Send request links from the business Gmail account.",
    description:
      "OAuth-backed Gmail sending keeps PhotoBrief messages in the customer’s familiar email thread while preserving the request activity log.",
    enables: ["OAuth connection", "Send from Gmail", "Message activity logging"],
    inboundEvents: ["Gmail connected", "Email delivery result"],
    outboundActions: ["Send initial request", "Send reminder", "Log external message"],
    actions: [{ label: "Prepare OAuth", kind: "oauth_placeholder", helper: "Requires Google OAuth client, redirect URL, and server-side token storage." }],
    statusLabel: "OAuth scaffold",
  },
  {
    key: "manual-sms",
    name: "Manual Phone Text",
    category: "communication",
    stage: "live",
    icon: Smartphone,
    plan: "free",
    tagline: "Copy a polished text and send it from your own number.",
    description:
      "The safest low-friction SMS workflow: PhotoBrief generates the message, and the business sends it from its normal texting app.",
    enables: ["Customer sees real business number", "No carrier setup", "Manual sent logging"],
    inboundEvents: ["Message copied", "Marked as sent"],
    outboundActions: ["Generate text", "Open Messages", "Log manual send"],
    actions: [{ label: "Create request", kind: "internal_route", to: "/requests/new" }],
    statusLabel: "Available now",
  },
  {
    key: "twilio",
    name: "Twilio SMS",
    category: "communication",
    stage: "setup_ready",
    icon: MessageSquareText,
    plan: "pro",
    tagline: "Automated SMS with compliance-aware setup.",
    description:
      "A native SMS connector should handle workspace configuration, sender number, opt-out handling, delivery logs, and A2P readiness.",
    enables: ["Automated request texts", "Delivery logging", "Opt-out controls"],
    inboundEvents: ["SMS reply", "STOP/START keyword", "Delivery callback"],
    outboundActions: ["Send request link", "Send reminder", "Log delivery status"],
    actions: [{ label: "Open SMS settings", kind: "internal_route", to: "/settings/sms" }],
    statusLabel: "Setup ready",
  },
  {
    key: "telegram",
    name: "Telegram",
    category: "communication",
    stage: "planned",
    icon: Send,
    plan: "team",
    tagline: "Bot-based request notifications and team alerts.",
    description:
      "Telegram is useful for internal team alerts or bot-driven customer workflows where teams already operate there.",
    enables: ["Bot notifications", "Submission alerts", "Team routing"],
    inboundEvents: ["Bot command received", "Reply received"],
    outboundActions: ["Send alert", "Post brief summary", "Create task"],
    actions: [{ label: "Plan bot flow", kind: "docs", helper: "Requires Telegram bot token and workspace chat mapping." }],
    statusLabel: "Planned native",
  },
  {
    key: "zapier",
    name: "Zapier",
    category: "automation",
    stage: "setup_ready",
    icon: PlugZap,
    plan: "pro",
    tagline: "Cover the long tail of business apps fast.",
    description:
      "Expose PhotoBrief triggers and actions so teams can connect the tools we have not built natively yet.",
    enables: ["New request trigger", "Submitted brief trigger", "Create request action"],
    inboundEvents: ["Zap action called", "External app created lead"],
    outboundActions: ["Emit request events", "Emit submission events", "Create request from Zap"],
    actions: [
      {
        label: "Copy trigger endpoint",
        kind: "copy",
        copyValue: "https://photobrief.ai/functions/v1/integration-events/zapier",
        helper: "Use this as the future Zapier trigger/action endpoint family.",
      },
    ],
    statusLabel: "Contract ready",
  },
  {
    key: "make",
    name: "Make",
    category: "automation",
    stage: "setup_ready",
    icon: Workflow,
    plan: "pro",
    tagline: "Visual automations for routed requests and submissions.",
    description:
      "Make support can reuse the same integration event and action contract as Zapier with Make-specific auth and payload docs.",
    enables: ["Scenario triggers", "Webhook actions", "Brief handoff"],
    inboundEvents: ["Make webhook received", "Mapped external payload"],
    outboundActions: ["Emit brief-ready event", "Create customer", "Create request"],
    actions: [
      {
        label: "Copy webhook contract",
        kind: "copy",
        copyValue: "PhotoBrief event envelope: { event, workspace_id, request_id, customer, request, submission, occurred_at }",
      },
    ],
    statusLabel: "Contract ready",
  },
  {
    key: "slack",
    name: "Slack",
    category: "automation",
    stage: "planned",
    icon: MessageSquareText,
    plan: "team",
    tagline: "Send brief-ready alerts into team channels.",
    description:
      "Slack can notify operations, quoting, dispatch, or support teams when a PhotoBrief is ready or needs attention.",
    enables: ["Channel alerts", "Brief summaries", "Review handoff"],
    inboundEvents: ["Submission completed", "Review status changed"],
    outboundActions: ["Post alert", "Post summary", "Create review thread"],
    actions: [{ label: "Plan Slack app", kind: "docs", helper: "Requires Slack app, OAuth scopes, and workspace/channel mapping." }],
    statusLabel: "Planned native",
  },
  {
    key: "airtable",
    name: "Airtable",
    category: "automation",
    stage: "planned",
    icon: FileSpreadsheet,
    plan: "team",
    tagline: "Sync customer requests into an operations base.",
    description:
      "Airtable is a strong bridge for teams that track quotes, approvals, and dispatch packets in custom bases.",
    enables: ["Base/table mapping", "Request rows", "Submission status sync"],
    inboundEvents: ["Record selected", "Automation called"],
    outboundActions: ["Create/update record", "Attach brief link", "Update status"],
    actions: [{ label: "Plan schema", kind: "docs", helper: "Map customer, request, submission, status, and next action fields." }],
    statusLabel: "Planned native",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    category: "crm",
    stage: "setup_ready",
    icon: ClipboardList,
    plan: "team",
    tagline: "Attach clean PhotoBrief packets to leads and deals.",
    description:
      "HubSpot should become the first full CRM-native connector once beta users confirm the object mapping they need.",
    enables: ["OAuth connection", "Contact lookup", "Brief summary sync"],
    inboundEvents: ["HubSpot contact/deal selected", "Workflow action called"],
    outboundActions: ["Create note", "Update deal", "Attach brief summary"],
    actions: [{ label: "Prepare OAuth", kind: "oauth_placeholder", helper: "Requires HubSpot OAuth client, redirect URL, and server-side token storage." }],
    statusLabel: "OAuth scaffold",
  },
  {
    key: "salesforce",
    name: "Salesforce",
    category: "crm",
    stage: "planned",
    icon: ClipboardList,
    plan: "team",
    tagline: "Attach PhotoBriefs to leads, accounts, and cases.",
    description:
      "Salesforce belongs after HubSpot unless beta customers specifically need enterprise CRM mapping first.",
    enables: ["Lead/account mapping", "Case updates", "Brief links"],
    inboundEvents: ["Lead selected", "Case opened"],
    outboundActions: ["Create note", "Update case", "Attach brief summary"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Prioritize if founding partners use Salesforce heavily." }],
    statusLabel: "Planned native",
  },
  {
    key: "google-sheets",
    name: "Google Sheets",
    category: "automation",
    stage: "planned",
    icon: FileSpreadsheet,
    plan: "starter",
    tagline: "Push request and submission rows to a shared sheet.",
    description:
      "A useful reporting connector for teams that are not ready for a CRM but want a live operations ledger.",
    enables: ["Request rows", "Submission rows", "Simple reporting"],
    inboundEvents: ["Sheet connected"],
    outboundActions: ["Append request row", "Append submission row", "Update review status"],
    actions: [{ label: "Plan sheet schema", kind: "docs", helper: "Columns should mirror customer, request, status, link, submitted_at, and next_action." }],
    statusLabel: "Planned native",
  },
  {
    key: "jobber",
    name: "Jobber",
    category: "crm",
    stage: "planned",
    icon: BadgeCheck,
    plan: "team",
    tagline: "Turn clean customer photos into job-ready packets.",
    description:
      "Jobber is a practical vertical connector candidate for service teams that need photo context before quoting or dispatch.",
    enables: ["Client/job mapping", "Quote prep", "Dispatch notes"],
    inboundEvents: ["Client selected", "Quote requested", "Job created"],
    outboundActions: ["Attach brief", "Create task", "Update notes"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Build after enough service beta users request it." }],
    statusLabel: "Demand driven",
  },
  {
    key: "servicetitan",
    name: "ServiceTitan",
    category: "crm",
    stage: "planned",
    icon: BadgeCheck,
    plan: "business",
    tagline: "Photo documentation for larger service operations.",
    description:
      "ServiceTitan is a later-stage connector for dispatch-heavy businesses that need request packets attached to jobs.",
    enables: ["Job mapping", "Dispatch packet sync", "Review status updates"],
    inboundEvents: ["Job created", "Estimate requested", "Customer selected"],
    outboundActions: ["Attach brief", "Create task", "Update job notes"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Track requested systems by beta partner before building." }],
    statusLabel: "Demand driven",
  },
];

export const integrationContract = {
  triggers: [
    "website_lead_received",
    "customer_created",
    "request_created",
    "request_link_sent",
    "recipient_opened",
    "submission_completed",
    "brief_ready_to_review",
    "more_photos_requested",
    "request_archived",
  ],
  actions: [
    "create_customer",
    "create_request",
    "generate_manual_send_message",
    "send_request_link",
    "log_external_message",
    "update_request_status",
    "push_brief_summary",
    "create_external_task",
  ],
};
