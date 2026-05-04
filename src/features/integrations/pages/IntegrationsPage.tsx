import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Plug,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";
import {
  buildIntegrationWebhookUrl,
  integrationService,
  type IntegrationConnection,
} from "@/features/integrations/integrationService";
import {
  integrationCategories,
  integrationContract,
  integrationDefinitions,
  type IntegrationActionDefinition,
  type IntegrationCategory,
  type IntegrationDefinition,
  type IntegrationStage,
} from "@/features/integrations/integrationDefinitions";

const categoryOrder: IntegrationCategory[] = ["website", "communication", "automation", "crm"];

const stageMeta: Record<IntegrationStage, { label: string; compactLabel: string; className: string }> = {
  live: {
    label: "Live",
    compactLabel: "Ready",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  setup_ready: {
    label: "Scaffolded",
    compactLabel: "Setup",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  planned: {
    label: "Planned",
    compactLabel: "Soon",
    className: "border-border bg-muted text-muted-foreground",
  },
};

function planRank(plan: string) {
  return ["free", "starter", "pro", "team", "business"].indexOf(plan);
}

function isAvailableForPlan(currentPlan: string, requiredPlan: string) {
  return planRank(currentPlan) >= planRank(requiredPlan);
}

function stageIcon(stage: IntegrationStage) {
  if (stage === "live") return CheckCircle2;
  if (stage === "setup_ready") return Wrench;
  return Plug;
}

function connectorTint(key: string) {
  const tints = [
    "bg-sky-500/12 text-sky-600 dark:text-sky-300",
    "bg-violet-500/12 text-violet-600 dark:text-violet-300",
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
    "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    "bg-rose-500/12 text-rose-600 dark:text-rose-300",
    "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300",
  ];
  const hash = [...key].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tints[hash % tints.length];
}

async function copyText(value: string, description?: string) {
  await navigator.clipboard.writeText(value);
  toast.success("Copied", description ? { description } : undefined);
}

async function copyValue(action: IntegrationActionDefinition) {
  if (!action.copyValue) return;
  await copyText(action.copyValue, action.helper);
}

function PrimaryIntegrationAction({ action }: { action: IntegrationActionDefinition }) {
  if (action.kind === "internal_route" && action.to) {
    return (
      <Button asChild size="sm" className="h-9 rounded-full px-4">
        <NavLink to={action.to}>
          {action.label} <ArrowRight className="ml-1 h-4 w-4" />
        </NavLink>
      </Button>
    );
  }

  if (action.kind === "copy") {
    return (
      <Button size="sm" variant="outline" className="h-9 rounded-full bg-background/70 px-4" onClick={() => copyValue(action)}>
        <Clipboard className="mr-2 h-4 w-4" /> {action.label}
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" className="h-9 rounded-full bg-background/70 px-4" disabled>
      {action.kind === "oauth_placeholder" ? <ExternalLink className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
      {action.label}
    </Button>
  );
}

function ConnectorRow({
  integration,
  plan,
  workspaceId,
  connection,
  onConnectionCreated,
}: {
  integration: IntegrationDefinition;
  plan: string;
  workspaceId?: string;
  connection?: IntegrationConnection;
  onConnectionCreated: (connection: IntegrationConnection) => void;
}) {
  const Icon = integration.icon;
  const StageIcon = stageIcon(integration.stage);
  const stage = stageMeta[integration.stage];
  const planAllowed = isAvailableForPlan(plan, integration.plan);
  const [busy, setBusy] = useState(false);
  const canProvisionWebhook = integration.key === "webhook-bridge" || integration.key === "zapier" || integration.key === "make";

  async function enableWebhookBridge() {
    if (!workspaceId) {
      toast.error("Workspace is still loading");
      return;
    }
    setBusy(true);
    try {
      const next = await integrationService.createOrEnableConnection({
        workspaceId,
        providerKey: integration.key,
        displayName: integration.name,
        config: { source: "integrations_page" },
      });
      onConnectionCreated(next);
      await copyText(buildIntegrationWebhookUrl(next), "Webhook URL copied. Add it to your website form or automation tool.");
    } catch (err) {
      console.error(err);
      toast.error("Could not create connector", {
        description: "Make sure the Connector OS migration has been applied in Supabase.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function copyWebhookUrl() {
    if (!connection) return;
    await copyText(buildIntegrationWebhookUrl(connection), "Paste this URL into your form tool, Zapier, Make, or custom website form.");
  }

  const primaryAction = integration.actions[0];
  const isPlanned = integration.stage === "planned";

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.45rem] border bg-card/82 p-3 shadow-sm transition duration-200",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-[0_18px_60px_-42px_hsl(var(--primary)/0.75)]",
        isPlanned && "opacity-78 hover:translate-y-0 hover:border-border hover:shadow-sm",
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ring-border/70 sm:h-16 sm:w-16",
            connectorTint(integration.key),
            isPlanned && "grayscale",
          )}
        >
          <Icon className="h-7 w-7" />
        </span>

        <div className="min-w-0 flex-1 py-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">{integration.name}</h3>
            {connection ? (
              <Badge variant="outline" className="hidden gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 sm:inline-flex">
                <CheckCircle2 className="h-3 w-3" /> Connected
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground sm:line-clamp-1">
            {integration.tagline}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] capitalize">
              {integrationCategories[integration.category].label}
            </Badge>
            <Badge variant={planAllowed ? "secondary" : "outline"} className="rounded-full px-2 py-0 text-[10px]">
              {integration.plan === "free" ? "All plans" : `${integration.plan}+`}
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {connection && canProvisionWebhook ? (
            <Button size="sm" variant="outline" className="hidden h-9 rounded-full bg-background/70 px-4 sm:inline-flex" onClick={copyWebhookUrl}>
              <Clipboard className="mr-2 h-4 w-4" /> Webhook
            </Button>
          ) : null}

          {!connection && canProvisionWebhook && !isPlanned ? (
            <Button
              size="sm"
              className="hidden h-9 rounded-full px-4 sm:inline-flex"
              onClick={enableWebhookBridge}
              disabled={busy || !planAllowed}
            >
              {busy ? "Creating…" : "Connect"}
            </Button>
          ) : null}

          {!canProvisionWebhook && primaryAction && !isPlanned ? (
            <div className="hidden sm:block">
              <PrimaryIntegrationAction action={primaryAction} />
            </div>
          ) : null}

          <Badge variant="outline" className={cn("h-8 shrink-0 rounded-full px-3 text-xs", connection ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : stage.className)}>
            {connection ? "Connected" : stage.compactLabel}
          </Badge>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3 sm:hidden">
        {connection && canProvisionWebhook ? (
          <Button size="sm" variant="outline" className="h-9 rounded-full bg-background/70 px-4" onClick={copyWebhookUrl}>
            <Clipboard className="mr-2 h-4 w-4" /> Copy webhook
          </Button>
        ) : null}
        {!connection && canProvisionWebhook && !isPlanned ? (
          <Button size="sm" className="h-9 rounded-full px-4" onClick={enableWebhookBridge} disabled={busy || !planAllowed}>
            {busy ? "Creating…" : "Connect"}
          </Button>
        ) : null}
        {!canProvisionWebhook && primaryAction && !isPlanned ? <PrimaryIntegrationAction action={primaryAction} /> : null}
        {isPlanned ? <span className="text-xs text-muted-foreground">Coming soon after beta demand confirms the connector.</span> : null}
      </div>
    </article>
  );
}

function ConnectorContractPanel() {
  return (
    <section className="rounded-[1.75rem] border bg-card/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Connector OS
          </span>
          <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground">One clean integration contract under the hood.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Each provider maps into the same PhotoBrief primitives: customers, requests, messages, submissions, briefs, and activity logs.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full bg-background/70">
          <NavLink to="/intake">Website Intake <ArrowRight className="ml-2 h-4 w-4" /></NavLink>
        </Button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Triggers</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {integrationContract.triggers.slice(0, 6).map((trigger) => (
              <Badge key={trigger} variant="outline" className="rounded-full bg-background/70 font-mono text-[10px]">
                {trigger}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {integrationContract.actions.slice(0, 6).map((action) => (
              <Badge key={action} variant="outline" className="rounded-full bg-background/70 font-mono text-[10px]">
                {action}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function IntegrationsPage() {
  const { workspace } = useCurrentWorkspace();
  const { plan, loading } = usePlan();
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [connections, setConnections] = useState<Record<string, IntegrationConnection>>({});
  const [connectionLoadError, setConnectionLoadError] = useState<string | null>(null);
  const currentPlan = loading ? "free" : plan;

  const loadConnections = useCallback(async () => {
    if (!workspace?.id) return;
    try {
      const rows = await integrationService.listConnections(workspace.id);
      setConnections(Object.fromEntries(rows.filter((row) => row.status !== "disabled").map((row) => [row.providerKey, row])));
      setConnectionLoadError(null);
    } catch (err) {
      console.error(err);
      setConnectionLoadError("Connector status will appear after the Connector OS database migration is applied.");
    }
  }, [workspace?.id]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const visibleIntegrations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return integrationDefinitions.filter((integration) => {
      const categoryMatches = selectedCategory === "all" || integration.category === selectedCategory;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        integration.name,
        integration.tagline,
        integration.description,
        integration.statusLabel,
        integration.category,
        integration.enables.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [selectedCategory, query]);

  function handleConnectionCreated(connection: IntegrationConnection) {
    setConnections((current) => ({ ...current, [connection.providerKey]: connection }));
  }

  const connectedCount = Object.keys(connections).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border bg-card/80 p-5 shadow-[0_30px_90px_-70px_hsl(var(--primary)/0.75)] sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-semibold text-primary">
              <Plug className="h-3.5 w-3.5" /> Connector repository
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">Connectors</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Plug PhotoBrief into websites, inboxes, SMS, automation tools, and business systems. Search, connect, or mark what is coming next.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-60">
            <div className="rounded-2xl border bg-background/70 p-3">
              <p className="text-2xl font-semibold text-foreground">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">Connected</p>
            </div>
            <div className="rounded-2xl border bg-background/70 p-3">
              <p className="text-2xl font-semibold text-foreground">{integrationDefinitions.length}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-20 z-20 rounded-[1.75rem] border bg-background/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/74">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search connectors"
              className="h-12 w-full rounded-2xl border bg-card px-11 text-base outline-none transition placeholder:text-muted-foreground/80 focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Clear connector search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                selectedCategory === "all" ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            {categoryOrder.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                  selectedCategory === category ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {integrationCategories[category].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {connectionLoadError ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          {connectionLoadError}
        </section>
      ) : null}

      <section className="space-y-4">
        {categoryOrder
          .filter((category) => selectedCategory === "all" || selectedCategory === category)
          .map((category) => {
            const integrations = visibleIntegrations.filter((integration) => integration.category === category);
            if (integrations.length === 0) return null;
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between gap-3 px-1">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">{integrationCategories[category].label}</h2>
                    <p className="text-sm text-muted-foreground">{integrationCategories[category].description}</p>
                  </div>
                  <Badge variant="secondary" className="rounded-full">{integrations.length}</Badge>
                </div>
                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <ConnectorRow
                      key={integration.key}
                      integration={integration}
                      plan={currentPlan}
                      workspaceId={workspace?.id}
                      connection={connections[integration.key]}
                      onConnectionCreated={handleConnectionCreated}
                    />
                  ))}
                </div>
              </div>
            );
          })}

        {visibleIntegrations.length === 0 ? (
          <div className="rounded-[1.5rem] border bg-card/80 p-8 text-center">
            <p className="text-lg font-semibold text-foreground">No connectors found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try searching for “SMS,” “website,” “email,” “CRM,” or “automation.”</p>
          </div>
        ) : null}
      </section>

      <ConnectorContractPanel />
    </div>
  );
}
