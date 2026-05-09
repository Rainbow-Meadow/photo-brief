import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  Loader2,
  MousePointerClick,
  PlugZap,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Surface, WizardLayout } from "@/components/layout/primitives";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useWorkspaceGuides } from "@/hooks/useGuides";
import {
  useCreateWebsiteIntakeRule,
  useDeleteWebsiteIntakeRule,
  useSaveWebsiteIntakeMappings,
  useSendWebsiteIntakeTest,
  useUpdateWebsiteIntakeSource,
  useWebsiteIntakeEvents,
  useWebsiteIntakeMappings,
  useWebsiteIntakeRules,
  useWebsiteIntakeSource,
} from "@/hooks/useWebsiteIntake";
import { DEFAULT_MAPPINGS, intakeWebhookUrl, type IntakeField, type IntakeRuleMatchType } from "@/services/websiteIntakeService";

const FIELD_LABELS: Record<IntakeField, string> = {
  name: "Customer name",
  email: "Email",
  phone: "Phone",
  request_type: "Request type",
  message: "Message",
  address: "Address",
};

type SetupMode = "hosted-link" | "webhook";

type SetupTool = {
  id: string;
  name: string;
  bestFor: string;
  mode: SetupMode;
  dashboardUrl: string;
  dashboardLabel: string;
  buttonText: string;
};

type SetupStepId = "choose" | "defaults" | "routing" | "connect" | "map" | "test" | "review";

type SetupStep = {
  id: SetupStepId;
  title: string;
  shortTitle: string;
  body: string;
  icon: LucideIcon;
};

const setupTools: SetupTool[] = [
  {
    id: "any-site",
    name: "Any website",
    bestFor: "Fastest setup when you are not sure what builder the site uses.",
    mode: "hosted-link",
    dashboardUrl: "https://www.google.com/search?q=open+my+website+editor",
    dashboardLabel: "Open website editor",
    buttonText: "Get a quote",
  },
  {
    id: "wix",
    name: "Wix",
    bestFor: "Wix Editor and Wix Studio sites.",
    mode: "hosted-link",
    dashboardUrl: "https://manage.wix.com/dashboard",
    dashboardLabel: "Open Wix",
    buttonText: "Get a quote",
  },
  {
    id: "squarespace",
    name: "Squarespace",
    bestFor: "Brochure, portfolio, and local service websites.",
    mode: "hosted-link",
    dashboardUrl: "https://account.squarespace.com/",
    dashboardLabel: "Open Squarespace",
    buttonText: "Request service",
  },
  {
    id: "wordpress",
    name: "WordPress",
    bestFor: "WordPress.com, Elementor, block editor, and plugin-based sites.",
    mode: "hosted-link",
    dashboardUrl: "https://wordpress.com/sites",
    dashboardLabel: "Open WordPress",
    buttonText: "Request service",
  },
  {
    id: "webflow",
    name: "Webflow",
    bestFor: "Design-forward sites with editable buttons and forms.",
    mode: "hosted-link",
    dashboardUrl: "https://webflow.com/dashboard",
    dashboardLabel: "Open Webflow",
    buttonText: "Get a quote",
  },
  {
    id: "shopify",
    name: "Shopify",
    bestFor: "Stores that need return, warranty, quote, or service photo intake.",
    mode: "hosted-link",
    dashboardUrl: "https://admin.shopify.com/",
    dashboardLabel: "Open Shopify",
    buttonText: "Start request",
  },
  {
    id: "godaddy",
    name: "GoDaddy",
    bestFor: "Very simple local business sites.",
    mode: "hosted-link",
    dashboardUrl: "https://account.godaddy.com/products",
    dashboardLabel: "Open GoDaddy",
    buttonText: "Get a quote",
  },
  {
    id: "carrd",
    name: "Carrd",
    bestFor: "One-page sites and simple landing pages.",
    mode: "hosted-link",
    dashboardUrl: "https://carrd.co/dashboard",
    dashboardLabel: "Open Carrd",
    buttonText: "Send photos",
  },
  {
    id: "zapier-make",
    name: "Zapier / Make",
    bestFor: "Keeping an existing website form while triggering PhotoBrief automatically.",
    mode: "webhook",
    dashboardUrl: "https://zapier.com/app/zaps",
    dashboardLabel: "Open Zapier",
    buttonText: "",
  },
];

const payloadExample = `{
  "name": "Jamie Carter",
  "email": "jamie@example.com",
  "phone": "555-0142",
  "request_type": "quote",
  "message": "I need help with a repair and can send photos.",
  "address": ""
}`;

export default function WebsiteIntakePage() {
  const { workspace } = useCurrentWorkspace();
  const { data: source, isLoading } = useWebsiteIntakeSource();
  const { data: guides = [] } = useWorkspaceGuides(workspace?.id);
  const { data: mappings = [] } = useWebsiteIntakeMappings(source?.id);
  const { data: rules = [] } = useWebsiteIntakeRules(source?.id);
  const { data: events = [] } = useWebsiteIntakeEvents();
  const updateSource = useUpdateWebsiteIntakeSource();
  const saveMappings = useSaveWebsiteIntakeMappings(source?.id);
  const createRule = useCreateWebsiteIntakeRule(source?.id);
  const deleteRule = useDeleteWebsiteIntakeRule(source?.id);
  const sendTest = useSendWebsiteIntakeTest();

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [toolId, setToolId] = useState(setupTools[0].id);
  const [fieldMap, setFieldMap] = useState<Record<IntakeField, string>>(() =>
    Object.fromEntries(DEFAULT_MAPPINGS.map((m) => [m.photobriefField, m.externalField])) as Record<IntakeField, string>,
  );
  const [newRule, setNewRule] = useState({ matchType: "contains" as IntakeRuleMatchType, matchValue: "", guideId: "" });
  const [testPayload, setTestPayload] = useState({
    name: "Jamie Carter",
    email: "jamie@example.com",
    phone: "",
    request_type: "quote",
    message: "I need help with a broken appliance and can send photos.",
    address: "",
  });

  const webhook = source ? intakeWebhookUrl(source.publicToken) : "";
  const hostedLink = source ? `${window.location.origin}/i/${source.publicToken}` : "";
  const selectedTool = useMemo(() => setupTools.find((tool) => tool.id === toolId) ?? setupTools[0], [toolId]);
  const usesWebhook = selectedTool.mode === "webhook";

  const setupSteps: SetupStep[] = useMemo(
    () => [
      {
        id: "choose",
        title: "Choose how your website will start PhotoBrief",
        shortTitle: "Start",
        body: "Pick the website tool and turn intake on. For most businesses, the hosted link is the right path.",
        icon: Sparkles,
      },
      {
        id: "defaults",
        title: "Choose what PhotoBrief sends by default",
        shortTitle: "Default",
        body: "Pick a fallback template and decide whether customers should receive the request automatically.",
        icon: Wand2,
      },
      {
        id: "routing",
        title: "Route common request types",
        shortTitle: "Routing",
        body: "Add simple words like quote, repair, return, or warranty so leads land on the right saved template.",
        icon: ArrowRight,
      },
      {
        id: "connect",
        title: usesWebhook ? "Connect the existing website form" : "Put PhotoBrief on the website",
        shortTitle: "Connect",
        body: usesWebhook
          ? "Copy the webhook URL and JSON shape, then open your automation tool to connect the form."
          : "Copy the button text and hosted link, then open the website builder and paste the link behind the main button.",
        icon: usesWebhook ? PlugZap : Link2,
      },
      ...(usesWebhook
        ? [
            {
              id: "map" as const,
              title: "Map the form fields",
              shortTitle: "Fields",
              body: "Tell PhotoBrief what your existing form calls each customer field.",
              icon: ClipboardCheck,
            },
          ]
        : []),
      {
        id: "test",
        title: "Send one test lead",
        shortTitle: "Test",
        body: "Use sample customer details and confirm PhotoBrief creates a real request from the intake path.",
        icon: Send,
      },
      {
        id: "review",
        title: "Review the result",
        shortTitle: "Review",
        body: "Check the latest intake event, then your setup is ready for real website leads.",
        icon: CheckCircle2,
      },
    ],
    [usesWebhook],
  );

  useEffect(() => {
    if (activeStepIndex > setupSteps.length - 1) setActiveStepIndex(setupSteps.length - 1);
  }, [activeStepIndex, setupSteps.length]);

  useEffect(() => {
    if (mappings.length > 0) {
      setFieldMap((prev) => {
        const next = { ...prev };
        mappings.forEach((m) => {
          next[m.photobriefField] = m.externalField;
        });
        return next;
      });
    }
  }, [mappings]);

  const activeStep = setupSteps[activeStepIndex] ?? setupSteps[0];
  const guideName = (id: string | null | undefined) => guides.find((g) => g.id === id)?.name ?? "Choose template";
  const progress = Math.round(((activeStepIndex + 1) / setupSteps.length) * 100);

  const copyValue = async (value: string, success: string) => {
    if (!value) {
      toast.error("Nothing to copy yet");
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(success);
  };

  const goNext = () => setActiveStepIndex((current) => Math.min(current + 1, setupSteps.length - 1));
  const goBack = () => setActiveStepIndex((current) => Math.max(current - 1, 0));

  if (isLoading || !source) {
    return (
      <div className="mx-auto max-w-5xl rounded-[2rem] border bg-card/80 p-8 text-center shadow-sm">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-muted" />
        <p className="mt-4 text-sm text-muted-foreground">Setting up website intake…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-[0_30px_90px_-55px_hsl(222_47%_11%/0.55)] backdrop-blur sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-ambient-sky opacity-70" />
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Globe2 className="h-3.5 w-3.5 text-primary" /> Website Intake setup
        </span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Set up website intake in one guided flow.
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              Choose the website path, configure the template behavior, connect the site, and test the result without jumping between separate setup sections.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-background/70 px-3 py-2 shadow-sm">
            <Switch
              checked={source.enabled}
              onCheckedChange={async (enabled) => {
                await updateSource.mutateAsync({ id: source.id, enabled });
                toast.success(enabled ? "Website intake is on" : "Website intake is paused");
              }}
            />
            <span className="text-sm font-medium text-foreground">{source.enabled ? "On" : "Paused"}</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-primary/15 bg-card/90 shadow-[0_30px_90px_-55px_hsl(217_91%_60%/0.45)] backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="relative isolate border-b border-border/70 bg-gradient-to-br from-primary/12 via-background to-cyan-400/10 p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div aria-hidden className="absolute -right-24 -top-24 -z-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Guided setup
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">One path. No scavenger hunt.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Complete each step in order. Hosted link is fastest; webhook is only for keeping an existing form.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            <nav className="mt-5 space-y-2" aria-label="Website Intake setup steps">
              {setupSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStepIndex;
                const isDone = index < activeStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      isActive ? "border-primary/50 bg-primary/10 shadow-sm" : "bg-background/60 hover:border-primary/30"
                    }`}
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isDone ? "bg-primary text-primary-foreground" : isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{step.shortTitle}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">Step {index + 1}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  Step {activeStepIndex + 1} of {setupSteps.length}
                </span>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{activeStep.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{activeStep.body}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <activeStep.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6">{renderStepContent()}</div>

            <div className="mt-7 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button className="h-12 rounded-2xl" variant="outline" onClick={goBack} disabled={activeStepIndex === 0}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button className="h-12 rounded-2xl" onClick={goNext} disabled={activeStepIndex === setupSteps.length - 1}>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  function renderStepContent(): ReactNode {
    switch (activeStep.id) {
      case "choose":
        return (
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border bg-background/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Website Intake is {source.enabled ? "on" : "paused"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Keep this on when you are ready for website leads to create PhotoBrief requests.</p>
                </div>
                <Switch
                  checked={source.enabled}
                  onCheckedChange={async (enabled) => {
                    await updateSource.mutateAsync({ id: source.id, enabled });
                    toast.success(enabled ? "Website intake is on" : "Website intake is paused");
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {setupTools.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setToolId(tool.id)}
                  className={`rounded-[1.35rem] border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary/5 ${
                    tool.id === selectedTool.id ? "border-primary/50 bg-primary/10 shadow-sm" : "bg-background/65"
                  }`}
                >
                  <span className="block text-sm font-semibold text-foreground">{tool.name}</span>
                  <span className="mt-1 block text-xs font-medium text-primary">{tool.mode === "webhook" ? "Webhook path" : "Hosted link path"}</span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">{tool.bestFor}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case "defaults":
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border bg-background/70 p-4">
              <Label className="text-sm font-semibold text-foreground">Fallback template</Label>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Used when no routing rule or confident AI match applies.</p>
              <select
                className="mt-4 h-12 w-full rounded-2xl border bg-background px-3 text-sm"
                value={source.defaultGuideId ?? ""}
                onChange={async (e) => {
                  await updateSource.mutateAsync({ id: source.id, defaultGuideId: e.target.value || null });
                  toast.success("Fallback template saved");
                }}
              >
                <option value="">No fallback yet</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div className="rounded-[1.5rem] border bg-background/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Send link automatically</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">If the lead includes email, PhotoBrief sends the request right away.</p>
                </div>
                <Switch
                  checked={source.autoSend}
                  onCheckedChange={async (autoSend) => {
                    await updateSource.mutateAsync({ id: source.id, autoSend });
                    toast.success(autoSend ? "Auto-send enabled" : "Auto-send disabled");
                  }}
                />
              </div>
            </div>
          </div>
        );
      case "routing":
        return (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
              <select
                className="h-11 rounded-2xl border bg-background px-3 text-sm"
                value={newRule.matchType}
                onChange={(e) => setNewRule((r) => ({ ...r, matchType: e.target.value as IntakeRuleMatchType }))}
              >
                <option value="contains">Contains</option>
                <option value="exact">Exact</option>
              </select>
              <Input
                value={newRule.matchValue}
                onChange={(e) => setNewRule((r) => ({ ...r, matchValue: e.target.value }))}
                placeholder="e.g. quote, repair, warranty"
                className="h-11 rounded-2xl bg-background/80"
              />
              <select
                className="h-11 rounded-2xl border bg-background px-3 text-sm sm:col-span-2"
                value={newRule.guideId}
                onChange={(e) => setNewRule((r) => ({ ...r, guideId: e.target.value }))}
              >
                <option value="">Choose template</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <Button
                className="h-11 rounded-2xl sm:col-span-2"
                disabled={!newRule.matchValue.trim() || !newRule.guideId}
                onClick={async () => {
                  await createRule.mutateAsync({ ...newRule, priority: rules.length + 1 });
                  setNewRule({ matchType: "contains", matchValue: "", guideId: "" });
                  toast.success("Routing rule added");
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add rule
              </Button>
            </div>

            <div className="space-y-2">
              {rules.length === 0 ? (
                <p className="rounded-2xl bg-muted/40 p-3 text-sm text-muted-foreground">No rules yet. AI matching and the fallback template will be used.</p>
              ) : rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-background/70 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {rule.matchType === "exact" ? "Exactly" : "Contains"} “{rule.matchValue}”
                    </p>
                    <p className="text-xs text-muted-foreground">Send: {guideName(rule.guideId)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={async () => {
                    await deleteRule.mutateAsync(rule.id);
                    toast.success("Rule removed");
                  }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case "connect":
        return (
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {usesWebhook ? "Webhook URL" : "Hosted intake link"}
              </p>
              <code className="mt-2 block max-h-44 overflow-auto whitespace-pre-wrap break-all rounded-2xl bg-muted/60 p-3 text-xs leading-5 text-foreground">
                {usesWebhook ? webhook : hostedLink}
              </code>
            </div>
            {usesWebhook ? (
              <div className="grid gap-2 sm:grid-cols-3">
                <Button className="h-12 rounded-2xl" onClick={() => copyValue(webhook, "Webhook URL copied")}>
                  <Copy className="mr-2 h-4 w-4" /> Copy webhook
                </Button>
                <Button className="h-12 rounded-2xl" variant="outline" onClick={() => copyValue(payloadExample, "Example JSON copied")}>
                  <ClipboardCheck className="mr-2 h-4 w-4" /> Copy JSON
                </Button>
                <Button className="h-12 rounded-2xl" variant="secondary" onClick={() => window.open(selectedTool.dashboardUrl, "_blank", "noopener,noreferrer")}>
                  <ExternalLink className="mr-2 h-4 w-4" /> {selectedTool.dashboardLabel}
                </Button>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Button className="h-12 rounded-2xl" onClick={() => copyValue(selectedTool.buttonText, "Button text copied")}>
                  <Copy className="mr-2 h-4 w-4" /> Copy text
                </Button>
                <Button className="h-12 rounded-2xl" variant="outline" onClick={() => copyValue(hostedLink, "Hosted intake link copied")}>
                  <Link2 className="mr-2 h-4 w-4" /> Copy link
                </Button>
                <Button className="h-12 rounded-2xl" variant="secondary" onClick={() => window.open(selectedTool.dashboardUrl, "_blank", "noopener,noreferrer")}>
                  <MousePointerClick className="mr-2 h-4 w-4" /> {selectedTool.dashboardLabel}
                </Button>
                <Button className="h-12 rounded-2xl" variant="outline" onClick={() => window.open(hostedLink, "_blank", "noopener,noreferrer")}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Open form
                </Button>
              </div>
            )}
          </div>
        );
      case "map":
        return (
          <div className="space-y-4">
            <div className="grid gap-3">
              {(Object.keys(FIELD_LABELS) as IntakeField[]).map((field) => (
                <div key={field} className="grid gap-1.5 sm:grid-cols-[150px_1fr] sm:items-center">
                  <Label className="text-sm text-muted-foreground">{FIELD_LABELS[field]}</Label>
                  <Input
                    value={fieldMap[field] ?? ""}
                    onChange={(e) => setFieldMap((m) => ({ ...m, [field]: e.target.value }))}
                    className="h-11 rounded-2xl bg-background/80"
                    placeholder={field}
                  />
                </div>
              ))}
            </div>
            <Button
              className="h-11 rounded-2xl"
              onClick={async () => {
                await saveMappings.mutateAsync((Object.keys(FIELD_LABELS) as IntakeField[]).map((field) => ({ photobriefField: field, externalField: fieldMap[field] ?? "" })));
                toast.success("Field mapping saved");
              }}
            >
              Save field mapping
            </Button>
          </div>
        );
      case "test":
        return (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.name} onChange={(e) => setTestPayload((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.email} onChange={(e) => setTestPayload((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.request_type} onChange={(e) => setTestPayload((p) => ({ ...p, request_type: e.target.value }))} placeholder="Request type" />
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.phone} onChange={(e) => setTestPayload((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
              <Textarea className="rounded-2xl bg-background/80 sm:col-span-2" rows={3} value={testPayload.message} onChange={(e) => setTestPayload((p) => ({ ...p, message: e.target.value }))} placeholder="Message" />
            </div>
            <Button
              className="h-12 w-full rounded-2xl text-base shadow-glow"
              disabled={sendTest.isPending}
              onClick={async () => {
                try {
                  const result = await sendTest.mutateAsync({ publicToken: source.publicToken, payload: testPayload });
                  if (result?.ok) toast.success("Test created a PhotoBrief request");
                  else toast.message(result?.message ?? "Test received");
                } catch (e: any) {
                  toast.error(e?.message ?? "Test failed");
                }
              }}
            >
              {sendTest.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send test lead
            </Button>
          </div>
        );
      case "review":
        return (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <SummaryPill label="Path" value={usesWebhook ? "Webhook" : "Hosted link"} />
              <SummaryPill label="Fallback" value={guideName(source.defaultGuideId)} />
              <SummaryPill label="Rules" value={`${rules.length} active`} />
            </div>
            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="rounded-2xl bg-muted/40 p-3 text-sm text-muted-foreground">No website leads yet. Send one test lead before publishing this setup.</p>
              ) : events.slice(0, 5).map((event) => (
                <div key={event.id} className="rounded-2xl border bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{event.requestType || "Website lead"}</p>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{event.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{event.error || event.message || JSON.stringify(event.normalizedCustomer)}</p>
                </div>
              ))}
            </div>
            <Button className="h-12 rounded-2xl" variant="outline" onClick={() => window.open(hostedLink, "_blank", "noopener,noreferrer")}>
              <ExternalLink className="mr-2 h-4 w-4" /> Open hosted form
            </Button>
          </div>
        );
      default:
        return null;
    }
  }
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
