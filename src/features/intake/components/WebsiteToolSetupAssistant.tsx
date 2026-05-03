import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Copy,
  ExternalLink,
  Globe2,
  Link2,
  MousePointerClick,
  PlugZap,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export type WebsiteToolSetupAssistantProps = {
  hostedLink: string;
  webhookUrl: string;
};

type SetupMode = "hosted-link" | "webhook";

type SetupAction = "copy-button-text" | "copy-hosted-link" | "open-tool" | "copy-webhook" | "copy-payload" | "open-test";

type SetupStep = {
  title: string;
  body: string;
  action?: SetupAction;
  actionLabel?: string;
};

type SetupTool = {
  id: string;
  name: string;
  bestFor: string;
  mode: SetupMode;
  dashboardUrl: string;
  dashboardLabel: string;
  buttonText: string;
  steps: SetupStep[];
};

const payloadExample = `{
  "name": "Jamie Carter",
  "email": "jamie@example.com",
  "phone": "555-0142",
  "request_type": "quote",
  "message": "I need help with a repair and can send photos.",
  "address": ""
}`;

const setupTools: SetupTool[] = [
  {
    id: "any-site",
    name: "Any website",
    bestFor: "When you just need the fastest working setup.",
    mode: "hosted-link",
    dashboardUrl: "https://www.google.com/search?q=open+my+website+editor",
    dashboardLabel: "Open website editor",
    buttonText: "Get a quote",
    steps: [
      {
        title: "Copy the button text",
        body: "Use clear wording customers already understand. “Get a quote” works for most service businesses.",
        action: "copy-button-text",
        actionLabel: "Copy button text",
      },
      {
        title: "Copy your PhotoBrief link",
        body: "This is the hosted intake form. It is the easiest setup path and works with almost every website builder.",
        action: "copy-hosted-link",
        actionLabel: "Copy intake link",
      },
      {
        title: "Open your website editor",
        body: "Find the main customer action button, paste the PhotoBrief link as the destination, then publish.",
        action: "open-tool",
        actionLabel: "Open editor",
      },
      {
        title: "Test it live",
        body: "Open the hosted form, submit one fake lead, and confirm PhotoBrief creates a request.",
        action: "open-test",
        actionLabel: "Open test form",
      },
    ],
  },
  {
    id: "wix",
    name: "Wix",
    bestFor: "Wix Editor and Wix Studio sites.",
    mode: "hosted-link",
    dashboardUrl: "https://manage.wix.com/dashboard",
    dashboardLabel: "Open Wix",
    buttonText: "Get a quote",
    steps: [
      { title: "Copy the button text", body: "Use this on your Wix button so customers know exactly what to do.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy your hosted intake link", body: "In Wix, click your button, choose the link setting, then paste this as the web address.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open Wix", body: "Go to the button customers already click, paste the PhotoBrief link, then publish the site.", action: "open-tool", actionLabel: "Open Wix" },
      { title: "Submit a test", body: "Test from the live Wix site or open the hosted form directly to confirm everything works.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "squarespace",
    name: "Squarespace",
    bestFor: "Brochure, portfolio, and local service websites.",
    mode: "hosted-link",
    dashboardUrl: "https://account.squarespace.com/",
    dashboardLabel: "Open Squarespace",
    buttonText: "Request service",
    steps: [
      { title: "Copy the button text", body: "Use this for a button block, header button, or navigation link.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy your hosted intake link", body: "Paste this into the Squarespace URL/external link field.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open Squarespace", body: "Edit the page where customers ask for help, update the button/link, then save and publish.", action: "open-tool", actionLabel: "Open Squarespace" },
      { title: "Test on the live site", body: "Run one test lead from the published page, not just the editor preview.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "wordpress",
    name: "WordPress",
    bestFor: "WordPress.com, block editor, Elementor, and most plugin-based sites.",
    mode: "hosted-link",
    dashboardUrl: "https://wordpress.com/sites",
    dashboardLabel: "Open WordPress",
    buttonText: "Request service",
    steps: [
      { title: "Copy the button text", body: "Use this on a Button block, Elementor button, or menu item.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy your hosted intake link", body: "Paste this into the button or menu link field.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open WordPress", body: "Edit the page customers use, update the call-to-action button, then publish or update.", action: "open-tool", actionLabel: "Open WordPress" },
      { title: "Test from your phone", body: "Open the live page on your phone and submit a test lead like a real customer would.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    bestFor: "Design-forward sites with editable buttons and forms.",
    mode: "hosted-link",
    dashboardUrl: "https://webflow.com/dashboard",
    dashboardLabel: "Open Webflow",
    buttonText: "Get a quote",
    steps: [
      { title: "Copy button text", body: "Use this on a button, text link, or link block.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy the hosted link", body: "Paste this into Webflow’s URL link setting for the selected element.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open Webflow", body: "Select the button/link block, paste the URL, publish, then test from the published domain.", action: "open-tool", actionLabel: "Open Webflow" },
      { title: "Test the published path", body: "Use the real published page or open the PhotoBrief form directly.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    bestFor: "Stores that need return, warranty, quote, or service photo intake.",
    mode: "hosted-link",
    dashboardUrl: "https://admin.shopify.com/",
    dashboardLabel: "Open Shopify",
    buttonText: "Start request",
    steps: [
      { title: "Copy button/menu text", body: "Use this for returns, warranty photos, custom quotes, or service requests.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy your hosted link", body: "Use this as the external URL for a menu item, page button, or theme button.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open Shopify", body: "Add a menu item or update a theme/page button, then save and preview the store.", action: "open-tool", actionLabel: "Open Shopify" },
      { title: "Submit a test request", body: "Make sure the request creates a PhotoBrief instead of landing in ordinary email back-and-forth.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "godaddy",
    name: "GoDaddy",
    bestFor: "Very simple local business sites.",
    mode: "hosted-link",
    dashboardUrl: "https://account.godaddy.com/products",
    dashboardLabel: "Open GoDaddy",
    buttonText: "Get a quote",
    steps: [
      { title: "Copy button text", body: "Keep it direct. This is usually all a GoDaddy site needs.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy your hosted link", body: "Paste this into the action button’s website/external URL field.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open GoDaddy", body: "Edit the site, find the action button, paste the PhotoBrief link, then publish.", action: "open-tool", actionLabel: "Open GoDaddy" },
      { title: "Test it", body: "Open the live site and submit one request to confirm the handoff is clean.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "carrd",
    name: "Carrd",
    bestFor: "One-page sites and simple landing pages.",
    mode: "hosted-link",
    dashboardUrl: "https://carrd.co/dashboard",
    dashboardLabel: "Open Carrd",
    buttonText: "Send photos",
    steps: [
      { title: "Copy button text", body: "Use this on the main Carrd button.", action: "copy-button-text", actionLabel: "Copy text" },
      { title: "Copy your hosted link", body: "Paste this into the Button element URL field.", action: "copy-hosted-link", actionLabel: "Copy link" },
      { title: "Open Carrd", body: "Edit the site, update the button URL, then publish changes.", action: "open-tool", actionLabel: "Open Carrd" },
      { title: "Test on mobile", body: "Open the live page from your phone and submit one test lead.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
  {
    id: "zapier-make",
    name: "Zapier / Make",
    bestFor: "Keeping an existing form while triggering PhotoBrief automatically.",
    mode: "webhook",
    dashboardUrl: "https://zapier.com/app/zaps",
    dashboardLabel: "Open Zapier",
    buttonText: "",
    steps: [
      { title: "Copy the webhook URL", body: "Use this as the destination for a webhook POST action after a form submission.", action: "copy-webhook", actionLabel: "Copy webhook" },
      { title: "Copy the JSON shape", body: "Use these field names when mapping your form data into PhotoBrief.", action: "copy-payload", actionLabel: "Copy JSON" },
      { title: "Open Zapier or Make", body: "Trigger: new form submission. Action: POST webhook. Body: JSON.", action: "open-tool", actionLabel: "Open Zapier" },
      { title: "Run a real test", body: "Submit from the live website form and confirm PhotoBrief creates a request.", action: "open-test", actionLabel: "Open test form" },
    ],
  },
];

export function WebsiteToolSetupAssistant({ hostedLink, webhookUrl }: WebsiteToolSetupAssistantProps) {
  const [toolId, setToolId] = useState(setupTools[0].id);
  const [stepIndex, setStepIndex] = useState(0);

  const selectedTool = useMemo(() => setupTools.find((tool) => tool.id === toolId) ?? setupTools[0], [toolId]);
  const activeStep = selectedTool.steps[stepIndex] ?? selectedTool.steps[0];
  const progress = Math.round(((stepIndex + 1) / selectedTool.steps.length) * 100);

  const copyValue = async (value: string, success: string) => {
    if (!value) {
      toast.error("Nothing to copy yet");
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(success);
  };

  const runAction = async (action?: SetupAction) => {
    switch (action) {
      case "copy-button-text":
        await copyValue(selectedTool.buttonText, "Button text copied");
        return;
      case "copy-hosted-link":
        await copyValue(hostedLink, "Hosted intake link copied");
        return;
      case "copy-webhook":
        await copyValue(webhookUrl, "Webhook URL copied");
        return;
      case "copy-payload":
        await copyValue(payloadExample, "Example JSON copied");
        return;
      case "open-tool":
        window.open(selectedTool.dashboardUrl, "_blank", "noopener,noreferrer");
        return;
      case "open-test":
        window.open(hostedLink, "_blank", "noopener,noreferrer");
        return;
      default:
        return;
    }
  };

  const nextStep = () => setStepIndex((current) => Math.min(current + 1, selectedTool.steps.length - 1));
  const prevStep = () => setStepIndex((current) => Math.max(current - 1, 0));

  return (
    <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-card/90 shadow-[0_30px_90px_-55px_hsl(217_91%_60%/0.45)] backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[0.86fr_1.14fr]">
        <div className="relative isolate overflow-hidden border-b border-border/70 bg-gradient-to-br from-primary/12 via-background to-cyan-400/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Guided setup
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Add PhotoBrief to your website, one click at a time.
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose your website tool. PhotoBrief gives you the exact thing to copy, the place to paste it, and a test link when you are done.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
            {setupTools.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setToolId(tool.id);
                  setStepIndex(0);
                }}
                className={`rounded-2xl border px-3 py-3 text-left text-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5 ${
                  tool.id === selectedTool.id ? "border-primary/50 bg-primary/10 text-foreground shadow-sm" : "bg-background/65 text-muted-foreground"
                }`}
              >
                <span className="block font-semibold">{tool.name}</span>
                <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{tool.mode === "webhook" ? "Webhook path" : "Hosted link path"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {selectedTool.mode === "webhook" ? <PlugZap className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                  {selectedTool.mode === "webhook" ? "Webhook setup" : "Hosted link setup"}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Step {stepIndex + 1} of {selectedTool.steps.length}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{activeStep.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{activeStep.body}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              {activeStep.action?.startsWith("copy") ? <ClipboardCheck className="h-5 w-5" /> : activeStep.action === "open-tool" ? <MousePointerClick className="h-5 w-5" /> : <Globe2 className="h-5 w-5" />}
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-5 rounded-[1.5rem] border bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {activeStep.action === "copy-payload" ? "Copy this JSON shape" : activeStep.action === "copy-webhook" ? "Webhook URL" : activeStep.action === "copy-button-text" ? "Button text" : "Destination"}
            </p>
            <code className="mt-2 block max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-foreground">
              {activeStep.action === "copy-payload"
                ? payloadExample
                : activeStep.action === "copy-webhook"
                  ? webhookUrl
                  : activeStep.action === "copy-button-text"
                    ? selectedTool.buttonText
                    : activeStep.action === "open-tool"
                      ? selectedTool.dashboardUrl
                      : hostedLink}
            </code>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <Button
              className="h-12 rounded-2xl"
              disabled={!activeStep.action}
              onClick={() => runAction(activeStep.action)}
            >
              {activeStep.action?.startsWith("copy") ? <Copy className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
              {activeStep.actionLabel ?? "Do this step"}
            </Button>
            <Button className="h-12 rounded-2xl" variant="outline" onClick={prevStep} disabled={stepIndex === 0}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button className="h-12 rounded-2xl" variant="secondary" onClick={nextStep} disabled={stepIndex === selectedTool.steps.length - 1}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {selectedTool.steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setStepIndex(index)}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left text-sm transition ${
                  index === stepIndex ? "border-primary/50 bg-primary/10" : "bg-background/60 hover:border-primary/30"
                }`}
              >
                <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {index < stepIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span>
                  <span className="block font-medium text-foreground">{step.title}</span>
                  <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">{step.body}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
