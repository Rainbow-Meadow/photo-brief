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

export interface SetupStep {
  title: string;
  detail: string;
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
  setupSteps: SetupStep[];
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
    plan: "intake_team",
    tagline: "A PhotoBrief-powered intake page for your site CTA.",
    description:
      "Send website visitors into a guided request flow without rebuilding your site or existing forms.",
    enables: ["Hosted intake URL", "Request type routing", "Pro automation path"],
    inboundEvents: ["Website lead received", "Request type selected"],
    outboundActions: ["Create customer", "Create PhotoBrief request", "Generate request link"],
    actions: [{ label: "Open Website Intake", kind: "internal_route", to: "/intake" }],
    statusLabel: "Available now",
    setupSteps: [
      { title: "Go to Website Intake settings", detail: "Navigate to the Intake page from the sidebar (requires Pro plan or higher)." },
      { title: "Copy your hosted intake URL", detail: "Your unique intake URL is displayed at the top of the page. Copy it." },
      { title: "Add the URL to your website CTA", detail: "Paste the URL as the destination of a button or link on your site, e.g. \"Request a Quote\" or \"Upload Photos\"." },
      { title: "Configure request type routing (optional)", detail: "Under Template Rules, add rules that map incoming request types to specific photo guides so submissions are auto-routed." },
    ],
  },
  {
    key: "site-badge",
    name: "PhotoBrief Site Badge",
    category: "website",
    stage: "live",
    icon: Code2,
    plan: "intake_team",
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
    setupSteps: [
      { title: "Copy the badge script tag", detail: "Click \"Copy badge script\" above. The snippet includes a <script> tag and a data attribute for your intake URL." },
      { title: "Replace YOUR_TOKEN", detail: "Open your Website Intake settings and copy your public intake token. Replace YOUR_TOKEN in the script tag with it." },
      { title: "Paste into your website HTML", detail: "Add the script tag to your site's HTML just above or below the CTA button area. Works with any site builder that allows custom HTML (WordPress, Webflow, Squarespace, Wix, etc.)." },
      { title: "Verify", detail: "Reload your site page and confirm the PhotoBrief badge appears and links to your hosted intake." },
    ],
  },
  {
    key: "webhook-bridge",
    name: "Existing Form Webhook Bridge",
    category: "website",
    stage: "setup_ready",
    icon: Braces,
    plan: "intake_team",
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
    setupSteps: [
      { title: "Click \"Connect\" to create a webhook connection", detail: "This generates a unique webhook URL with your workspace ID and connection key pre-filled." },
      { title: "Copy the webhook URL", detail: "Once connected, click \"Webhook\" to copy the full URL to your clipboard." },
      { title: "Paste the URL into your form tool", detail: "In your site builder (Wix Automations, Webflow Logic, WordPress webhooks, GravityForms, etc.), add a new webhook action and paste the PhotoBrief URL." },
      { title: "Map fields", detail: "Configure the form tool to send name, email, phone, request_type, message, and address as JSON keys. PhotoBrief will map them automatically." },
      { title: "Test with a sample submission", detail: "Submit a test form entry and check the Intake Events log on the Website Intake page to confirm the payload was received and a draft request was created." },
    ],
  },
  {
    key: "wordpress-com",
    name: "WordPress.com",
    category: "website",
    stage: "setup_ready",
    icon: FormInput,
    plan: "intake_team",
    tagline: "Connect WordPress lead forms to guided photo requests.",
    description:
      "Start with a webhook/embedded badge pattern for WordPress sites, then promote to a native plugin once beta demand is clear.",
    enables: ["Lead form handoff", "Badge install path", "Draft request creation"],
    inboundEvents: ["WordPress form submitted", "Badge clicked"],
    outboundActions: ["Create customer", "Create draft request", "Open hosted intake"],
    actions: [{ label: "Use webhook", kind: "internal_route", to: "/settings/integrations" }],
    statusLabel: "Setup ready",
    setupSteps: [
      { title: "Install a forms plugin (if needed)", detail: "Use Contact Form 7, WPForms, Gravity Forms, or the built-in WordPress form block. Any plugin that supports webhook/HTTP POST will work." },
      { title: "Create the Webhook Bridge connector", detail: "On this page, find \"Existing Form Webhook Bridge\" and click Connect to generate your webhook URL." },
      { title: "Add a webhook action in your forms plugin", detail: "In your form's settings, add a \"webhook\" or \"HTTP POST\" notification. Paste the PhotoBrief webhook URL as the destination." },
      { title: "Map form fields to PhotoBrief fields", detail: "Ensure the webhook sends name, email, phone, and message as JSON keys matching the PhotoBrief field names." },
      { title: "Alternative: embed the Site Badge", detail: "If you prefer a no-form approach, paste the PhotoBrief Site Badge script into a Custom HTML block on your WordPress page." },
    ],
  },
  {
    key: "webflow",
    name: "Webflow",
    category: "website",
    stage: "setup_ready",
    icon: FormInput,
    plan: "intake_team",
    tagline: "Route Webflow form submissions into PhotoBrief.",
    description:
      "Use the webhook bridge for existing Webflow forms and turn submitted leads into draft PhotoBrief requests.",
    enables: ["Webflow form webhook", "Field mapping", "Request routing"],
    inboundEvents: ["Webflow form submitted"],
    outboundActions: ["Create customer", "Create draft request", "Generate request link"],
    actions: [{ label: "Use webhook", kind: "internal_route", to: "/settings/integrations" }],
    statusLabel: "Setup ready",
    setupSteps: [
      { title: "Create your Webflow form", detail: "In the Webflow Designer, add a Form block to your page with fields for name, email, phone, and message." },
      { title: "Create the Webhook Bridge connector", detail: "On this page, find \"Existing Form Webhook Bridge\" and click Connect to get your webhook URL." },
      { title: "Open Webflow Logic", detail: "Go to your Webflow project's Logic panel (or Integrations → Webhooks in Site Settings)." },
      { title: "Add a webhook trigger on form submission", detail: "Create a new flow triggered by \"Form submission\". Add a \"Send HTTP request\" action with method POST to your PhotoBrief webhook URL." },
      { title: "Map the form fields", detail: "In the HTTP request body, set JSON keys: name, email, phone, request_type, message. Map each to the corresponding form field." },
      { title: "Publish and test", detail: "Publish your Webflow site, submit a test form, and verify the draft request appears in PhotoBrief." },
    ],
  },
  {
    key: "wix",
    name: "Wix",
    category: "website",
    stage: "planned",
    icon: FormInput,
    plan: "intake_team",
    tagline: "One-click site builder install once beta demand confirms it.",
    description:
      "Wix should start with hosted links and webhooks, then become a native install experience after the workflow is proven.",
    enables: ["Site CTA", "Request type routing", "Future app install"],
    inboundEvents: ["Wix form submitted", "CTA clicked"],
    outboundActions: ["Open intake", "Create request", "Sync result to site"],
    actions: [{ label: "Use webhook first", kind: "internal_route", to: "/settings/integrations" }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Add a CTA button to your Wix site", detail: "In the Wix Editor, add a button and set its link to your PhotoBrief hosted intake URL (found on the Intake page)." },
      { title: "Or use Wix Automations (advanced)", detail: "Go to Wix Dashboard → Automations. Create a new automation triggered by a form submission." },
      { title: "Add a \"Send HTTP request\" action", detail: "In the automation action, choose \"Send an HTTP request\" (or use the Wix Velo API). POST to your PhotoBrief Webhook Bridge URL." },
      { title: "Map form data to JSON body", detail: "Set the request body to include name, email, phone, and message from the form fields." },
      { title: "Native Wix app coming soon", detail: "A one-click Wix App install is planned once beta demand confirms the workflow. For now, the webhook approach works reliably." },
    ],
  },
  {
    key: "shopify",
    name: "Shopify",
    category: "website",
    stage: "planned",
    icon: FormInput,
    plan: "intake_team",
    tagline: "Collect product, return, review, and custom-order photos.",
    description:
      "A future Shopify connector can request the right photos for returns, custom products, reviews, and support tickets.",
    enables: ["Return documentation", "Product photo requests", "Support handoff"],
    inboundEvents: ["Order selected", "Return requested", "Support ticket opened"],
    outboundActions: ["Create request", "Attach brief to order", "Update support thread"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Prioritize after real ecommerce beta demand." }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "The Shopify connector will install as a Shopify App from the Shopify App Store." },
      { title: "Connect your Shopify store", detail: "After install, you'll authenticate your store and choose which order events trigger PhotoBrief requests (returns, custom orders, etc.)." },
      { title: "Map Shopify data to photo guides", detail: "Product type, return reason, or order tags will route to the appropriate photo guide automatically." },
      { title: "Interested?", detail: "Contact us or leave feedback to prioritize this connector — it's demand-driven." },
    ],
  },
  {
    key: "gmail",
    name: "Gmail",
    category: "communication",
    stage: "setup_ready",
    icon: Mail,
    plan: "intake",
    tagline: "Send request links from the business Gmail account.",
    description:
      "OAuth-backed Gmail sending keeps PhotoBrief messages in the customer's familiar email thread while preserving the request activity log.",
    enables: ["OAuth connection", "Send from Gmail", "Message activity logging"],
    inboundEvents: ["Gmail connected", "Email delivery result"],
    outboundActions: ["Send initial request", "Send reminder", "Log external message"],
    actions: [{ label: "Connect Gmail", kind: "oauth_placeholder", helper: "Requires Google OAuth client, redirect URL, and server-side token storage." }],
    statusLabel: "OAuth scaffold",
    setupSteps: [
      { title: "Click \"Connect\" to begin OAuth", detail: "You'll be redirected to Google to authorize PhotoBrief to send emails on behalf of your business Gmail account." },
      { title: "Grant the required permissions", detail: "Google will ask you to allow PhotoBrief to send emails. PhotoBrief never reads your inbox — it only sends request links." },
      { title: "Return to PhotoBrief", detail: "After authorization, you'll be redirected back here. Your connected Gmail address will appear on the connector card." },
      { title: "Send requests via Gmail", detail: "When creating or sending a request, choose \"Send via Gmail\" as the delivery channel. The email will come from your business Gmail address." },
    ],
  },
  {
    key: "manual-sms",
    name: "Manual Phone Text",
    category: "communication",
    stage: "live",
    icon: Smartphone,
    plan: "intake",
    tagline: "Copy a polished text and send it from your own number.",
    description:
      "The safest low-friction SMS workflow: PhotoBrief generates the message, and the business sends it from its normal texting app.",
    enables: ["Customer sees real business number", "No carrier setup", "Manual sent logging"],
    inboundEvents: ["Message copied", "Marked as sent"],
    outboundActions: ["Generate text", "Open Messages", "Log manual send"],
    actions: [{ label: "Create request", kind: "internal_route", to: "/requests/new" }],
    statusLabel: "Available now",
    setupSteps: [
      { title: "Create a new request", detail: "Go to Requests → New Request. Fill in the recipient's name, phone number, and select a photo guide." },
      { title: "Copy the generated text message", detail: "After creating the request, click \"Copy text\" to copy the pre-written message with the unique request link." },
      { title: "Open your phone's messaging app", detail: "Paste the copied message into iMessage, Android Messages, WhatsApp, or whatever app you normally text from." },
      { title: "Send and mark as sent", detail: "After sending, click \"Mark as sent\" in PhotoBrief so the activity log reflects the delivery." },
    ],
  },
  {
    key: "twilio",
    name: "Twilio SMS",
    category: "communication",
    stage: "setup_ready",
    icon: MessageSquareText,
    plan: "intake_team",
    tagline: "Automated SMS with compliance-aware setup.",
    description:
      "A native SMS connector should handle workspace configuration, sender number, opt-out handling, delivery logs, and A2P readiness.",
    enables: ["Automated request texts", "Delivery logging", "Opt-out controls"],
    inboundEvents: ["SMS reply", "STOP/START keyword", "Delivery callback"],
    outboundActions: ["Send request link", "Send reminder", "Log delivery status"],
    actions: [{ label: "Open SMS settings", kind: "internal_route", to: "/settings/sms" }],
    statusLabel: "Setup ready",
    setupSteps: [
      { title: "Create a Twilio account", detail: "Sign up at twilio.com and purchase a phone number with SMS capability. An A2P 10DLC registered number is recommended for US business texting." },
      { title: "Get your Twilio credentials", detail: "From the Twilio Console, copy your Account SID and Auth Token." },
      { title: "Open SMS settings in PhotoBrief", detail: "Go to Settings → SMS from the sidebar." },
      { title: "Enter your Twilio credentials", detail: "Paste your Account SID, Auth Token, and sender phone number into the configuration form and save." },
      { title: "Send a test SMS", detail: "Create a request and choose \"Send via SMS\". PhotoBrief will use your Twilio number to deliver the request link automatically." },
      { title: "Opt-out handling", detail: "PhotoBrief automatically processes STOP/START keywords and maintains a suppression list per workspace to stay compliant." },
    ],
  },
  {
    key: "telegram",
    name: "Telegram",
    category: "communication",
    stage: "planned",
    icon: Send,
    plan: "intake_team",
    tagline: "Bot-based request notifications and team alerts.",
    description:
      "Telegram is useful for internal team alerts or bot-driven customer workflows where teams already operate there.",
    enables: ["Bot notifications", "Submission alerts", "Team routing"],
    inboundEvents: ["Bot command received", "Reply received"],
    outboundActions: ["Send alert", "Post brief summary", "Create task"],
    actions: [{ label: "Plan bot flow", kind: "docs", helper: "Requires Telegram bot token and workspace chat mapping." }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "A Telegram Bot will be created via BotFather, and you'll link it to your PhotoBrief workspace." },
      { title: "Create a bot via @BotFather", detail: "In Telegram, message @BotFather, run /newbot, and copy the bot token." },
      { title: "Enter the bot token in PhotoBrief", detail: "Paste the token into the Telegram connector settings (coming soon) along with the chat/group ID for notifications." },
      { title: "Receive alerts", detail: "When a submission is completed or needs review, the bot will post a summary to your configured Telegram chat." },
    ],
  },
  {
    key: "zapier",
    name: "Zapier",
    category: "automation",
    stage: "setup_ready",
    icon: PlugZap,
    plan: "intake_team",
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
    setupSteps: [
      { title: "Set up a webhook subscription in PhotoBrief", detail: "Go to Settings → Integrations, find Webhook Bridge, and create a connection. This gives you a webhook URL that Zapier can call." },
      { title: "Create a new Zap in Zapier", detail: "Log into zapier.com and create a new Zap." },
      { title: "Set the trigger to \"Webhooks by Zapier\"", detail: "Choose \"Catch Hook\" as the trigger. Zapier will give you a unique webhook URL." },
      { title: "Register the Zapier webhook URL", detail: "In PhotoBrief, add the Zapier webhook URL as a Webhook Subscription (Settings → Integrations). Select which events to send (e.g. submission.created, submission.reviewed)." },
      { title: "Add actions in Zapier", detail: "In your Zap, add actions to route PhotoBrief events to any of 5,000+ apps — CRMs, spreadsheets, project management, email, etc." },
      { title: "To send data INTO PhotoBrief from Zapier", detail: "Create a Zap with your trigger app, then add an action using \"Webhooks by Zapier\" → POST. Send a JSON payload to your Webhook Bridge URL with name, email, phone, and message fields." },
    ],
  },
  {
    key: "make",
    name: "Make",
    category: "automation",
    stage: "setup_ready",
    icon: Workflow,
    plan: "intake_team",
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
    setupSteps: [
      { title: "Create a new Scenario in Make", detail: "Log into make.com (formerly Integromat) and create a new Scenario." },
      { title: "Add a \"Webhooks\" module as trigger", detail: "Choose \"Custom webhook\" as the first module. Make will generate a unique webhook URL — copy it." },
      { title: "Register the Make webhook URL in PhotoBrief", detail: "In PhotoBrief, go to Settings → Integrations and add a Webhook Subscription pointing to the Make URL. Select the events you want to receive." },
      { title: "Define the data structure", detail: "Back in Make, run a test event from PhotoBrief to let Make auto-detect the JSON structure. The event envelope includes: event, workspace_id, request_id, customer, request, submission, occurred_at." },
      { title: "Add downstream modules", detail: "Add Make modules to route events to Google Sheets, Slack, HubSpot, Airtable, email, or any of Make's 1,500+ apps." },
      { title: "To send data INTO PhotoBrief from Make", detail: "Add an HTTP module (POST) pointing to your Webhook Bridge URL. Send a JSON body with name, email, phone, and message fields." },
    ],
  },
  {
    key: "slack",
    name: "Slack",
    category: "automation",
    stage: "planned",
    icon: MessageSquareText,
    plan: "intake_team",
    tagline: "Send brief-ready alerts into team channels.",
    description:
      "Slack can notify operations, quoting, dispatch, or support teams when a PhotoBrief is ready or needs attention.",
    enables: ["Channel alerts", "Brief summaries", "Review handoff"],
    inboundEvents: ["Submission completed", "Review status changed"],
    outboundActions: ["Post alert", "Post summary", "Create review thread"],
    actions: [{ label: "Plan Slack app", kind: "docs", helper: "Requires Slack app, OAuth scopes, and workspace/channel mapping." }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "A Slack App will connect your PhotoBrief workspace to one or more Slack channels." },
      { title: "Install the PhotoBrief Slack App", detail: "From this page, click Connect to install the app into your Slack workspace (coming soon)." },
      { title: "Choose a notification channel", detail: "Pick which Slack channel receives submission-ready alerts, review updates, and team routing messages." },
      { title: "Customize notification rules", detail: "Filter which events trigger Slack posts — new submissions, reviews needing action, or all activity." },
      { title: "Interim workaround", detail: "Use the Zapier or Make connector today to post PhotoBrief events to Slack via a Zap/Scenario while the native connector is being built." },
    ],
  },
  {
    key: "airtable",
    name: "Airtable",
    category: "automation",
    stage: "planned",
    icon: FileSpreadsheet,
    plan: "intake_team",
    tagline: "Sync customer requests into an operations base.",
    description:
      "Airtable is a strong bridge for teams that track quotes, approvals, and dispatch packets in custom bases.",
    enables: ["Base/table mapping", "Request rows", "Submission status sync"],
    inboundEvents: ["Record selected", "Automation called"],
    outboundActions: ["Create/update record", "Attach brief link", "Update status"],
    actions: [{ label: "Plan schema", kind: "docs", helper: "Map customer, request, submission, status, and next action fields." }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "The Airtable connector will sync PhotoBrief requests and submissions into an Airtable base." },
      { title: "Create or choose an Airtable base", detail: "You'll select an existing base or create a new one. PhotoBrief will create/map tables for Customers, Requests, and Submissions." },
      { title: "Authenticate via OAuth", detail: "Click Connect to authorize PhotoBrief to read/write to your Airtable base." },
      { title: "Map fields", detail: "Choose which Airtable fields map to customer name, request status, submission link, readiness score, etc." },
      { title: "Interim workaround", detail: "Use the Zapier or Make connector today to push PhotoBrief events into Airtable while the native connector is being built." },
    ],
  },
  {
    key: "hubspot",
    name: "HubSpot",
    category: "crm",
    stage: "setup_ready",
    icon: ClipboardList,
    plan: "intake_team",
    tagline: "Attach clean PhotoBrief packets to leads and deals.",
    description:
      "HubSpot should become the first full CRM-native connector once beta users confirm the object mapping they need.",
    enables: ["OAuth connection", "Contact lookup", "Brief summary sync"],
    inboundEvents: ["HubSpot contact/deal selected", "Workflow action called"],
    outboundActions: ["Create note", "Update deal", "Attach brief summary"],
    actions: [{ label: "Connect HubSpot", kind: "oauth_placeholder", helper: "Requires HubSpot OAuth client, redirect URL, and server-side token storage." }],
    statusLabel: "OAuth scaffold",
    setupSteps: [
      { title: "Click \"Connect\" to begin OAuth", detail: "You'll be redirected to HubSpot to authorize PhotoBrief access to your CRM contacts, deals, and notes." },
      { title: "Grant the required permissions", detail: "HubSpot will ask you to allow PhotoBrief to create/update contacts, create notes on deals, and read deal stages." },
      { title: "Return to PhotoBrief", detail: "After authorization, your HubSpot portal name will appear on the connector card." },
      { title: "Link requests to HubSpot contacts", detail: "When creating a request, PhotoBrief will search your HubSpot contacts by email. Matched contacts get a note with the brief summary and link." },
      { title: "Sync submission results", detail: "When a submission is reviewed, PhotoBrief updates the associated HubSpot deal or contact with the readiness score, AI summary, and brief link." },
    ],
  },
  {
    key: "salesforce",
    name: "Salesforce",
    category: "crm",
    stage: "planned",
    icon: ClipboardList,
    plan: "intake_team",
    tagline: "Attach PhotoBriefs to leads, accounts, and cases.",
    description:
      "Salesforce belongs after HubSpot unless beta customers specifically need enterprise CRM mapping first.",
    enables: ["Lead/account mapping", "Case updates", "Brief links"],
    inboundEvents: ["Lead selected", "Case opened"],
    outboundActions: ["Create note", "Update case", "Attach brief summary"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Prioritize if founding partners use Salesforce heavily." }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "The Salesforce connector will use OAuth to connect to your Salesforce org." },
      { title: "Authenticate via Salesforce OAuth", detail: "Click Connect to authorize PhotoBrief to read/write Leads, Accounts, Cases, and Notes in your Salesforce org." },
      { title: "Map Salesforce objects", detail: "Choose which Salesforce objects (Lead, Account, Case, Opportunity) receive PhotoBrief request links and submission summaries." },
      { title: "Automatic sync", detail: "New submissions will create notes/attachments on the matched Salesforce record with the brief summary, readiness score, and link." },
      { title: "Interested?", detail: "Contact us or leave feedback to prioritize this connector — it's demand-driven." },
    ],
  },
  {
    key: "google-sheets",
    name: "Google Sheets",
    category: "automation",
    stage: "planned",
    icon: FileSpreadsheet,
    plan: "intake",
    tagline: "Push request and submission rows to a shared sheet.",
    description:
      "A useful reporting connector for teams that are not ready for a CRM but want a live operations ledger.",
    enables: ["Request rows", "Submission rows", "Simple reporting"],
    inboundEvents: ["Sheet connected"],
    outboundActions: ["Append request row", "Append submission row", "Update review status"],
    actions: [{ label: "Plan sheet schema", kind: "docs", helper: "Columns should mirror customer, request, status, link, submitted_at, and next_action." }],
    statusLabel: "Planned native",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "The Google Sheets connector will authenticate via Google OAuth and sync data to a spreadsheet." },
      { title: "Authenticate with Google", detail: "Click Connect to authorize PhotoBrief to write to a Google Sheet in your Drive." },
      { title: "Choose or create a spreadsheet", detail: "Select an existing Sheet or let PhotoBrief create one with pre-configured columns: Customer, Email, Phone, Request Type, Status, Link, Submitted At, Readiness Score, Next Action." },
      { title: "Automatic row appends", detail: "Each new request and submission will automatically append a row to the sheet, keeping your operations ledger up to date." },
      { title: "Interim workaround", detail: "Use the Zapier or Make connector today to push PhotoBrief events into Google Sheets while the native connector is being built." },
    ],
  },
  {
    key: "jobber",
    name: "Jobber",
    category: "crm",
    stage: "planned",
    icon: BadgeCheck,
    plan: "intake_team",
    tagline: "Turn clean customer photos into job-ready packets.",
    description:
      "Jobber is a practical vertical connector candidate for service teams that need photo context before quoting or dispatch.",
    enables: ["Client/job mapping", "Quote prep", "Dispatch notes"],
    inboundEvents: ["Client selected", "Quote requested", "Job created"],
    outboundActions: ["Attach brief", "Create task", "Update notes"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Build after enough service beta users request it." }],
    statusLabel: "Demand driven",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "The Jobber connector will use Jobber's API to link PhotoBrief submissions to jobs and clients." },
      { title: "Authenticate with Jobber", detail: "Click Connect to authorize PhotoBrief to access your Jobber clients, jobs, and notes." },
      { title: "Map clients to PhotoBrief customers", detail: "When creating a request, PhotoBrief will match by email/phone to link to the right Jobber client." },
      { title: "Attach briefs to jobs", detail: "Submission summaries, photos, and readiness scores will appear as notes or attachments on the Jobber job record." },
      { title: "Interested?", detail: "Contact us or leave feedback to prioritize this connector — it's demand-driven." },
    ],
  },
  {
    key: "servicetitan",
    name: "ServiceTitan",
    category: "crm",
    stage: "planned",
    icon: BadgeCheck,
    plan: "intake_team",
    tagline: "Photo documentation for larger service operations.",
    description:
      "ServiceTitan is a later-stage connector for dispatch-heavy businesses that need request packets attached to jobs.",
    enables: ["Job mapping", "Dispatch packet sync", "Review status updates"],
    inboundEvents: ["Job created", "Estimate requested", "Customer selected"],
    outboundActions: ["Attach brief", "Create task", "Update job notes"],
    actions: [{ label: "Collect beta demand", kind: "docs", helper: "Track requested systems by beta partner before building." }],
    statusLabel: "Demand driven",
    setupSteps: [
      { title: "Not yet available — here's how it will work", detail: "The ServiceTitan connector will use ServiceTitan's Open API to attach PhotoBrief data to jobs and estimates." },
      { title: "Authenticate with ServiceTitan", detail: "Click Connect to authorize PhotoBrief to access your ServiceTitan tenant's jobs, customers, and notes." },
      { title: "Map jobs to requests", detail: "When a new job or estimate is created in ServiceTitan, PhotoBrief can automatically create a photo request for the customer." },
      { title: "Attach submissions to jobs", detail: "Completed PhotoBrief submissions will appear as attachments or notes on the ServiceTitan job, ready for dispatch." },
      { title: "Interested?", detail: "Contact us or leave feedback to prioritize this connector — it's demand-driven." },
    ],
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
