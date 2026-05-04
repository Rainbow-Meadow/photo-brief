import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clipboard, ExternalLink, Plug, ShieldCheck, Wrench } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
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

const stageMeta: Record<IntegrationStage, { label: string; className: string }> = {
  live: {
    label: "Live",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  setup_ready: {
    label: "Scaffolded",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  planned: {
    label: "Planned",
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

async function copyText(value: string, description?: string) {
  await navigator.clipboard.writeText(value);
  toast.success("Copied", description ? { description } : undefined);
}

async function copyValue(action: IntegrationActionDefinition) {
  if (!action.copyValue) return;
  await copyText(action.copyValue, action.helper);
}

function IntegrationAction({ action }: { action: IntegrationActionDefinition }) {
  if (action.kind === "internal_route" && action.to) {
    return (
      <Button asChild size="sm" className="rounded-full">
        <NavLink to={action.to}>
          {action.label} <ArrowRight className="ml-1 h-4 w-4" />
        </NavLink>
      </Button>
    );
  }

  if (action.kind === "copy") {
    return (
      <Button size="sm" variant="outline" className="rounded-full bg-background/70" onClick={() => copyValue(action)}>
        <Clipboard className="mr-2 h-4 w-4" /> {action.label}
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" className="rounded-full bg-background/70" disabled>
      {action.kind === "oauth_placeholder" ? <ExternalLink className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
      {action.label}
    </Button>
  );
}

function IntegrationCard({
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

  const canProvisionWebhook = integration.key === "webhook-bridge" || integration.key === "zapier" || integration.key === "make";

  return (
    <article className="surface-card-elevated flex h-full flex-col overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-primary/30 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight text-foreground">{integration.name}</h3>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">{connection ? "Connected" : integration.statusLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {connection ? (
            <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className={cn("gap-1", stage.className)}>
              <StageIcon className="h-3 w-3" /> {stage.label}
            </Badge>
          )}
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-foreground">{integration.tagline}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{integration.description}</p>

      {connection ? (
        <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
          <p className="font-semibold text-foreground">Connection key</p>
          <code className="mt-2 block truncate rounded-lg bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            {connection.connectionKey}
          </code>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 rounded-2xl border bg-muted/30 p-4 text-sm">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enables</p>
            <ul className="space-y-1.5 text-muted-foreground">
              {integration.enables.map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge variant="secondary" className="rounded-full capitalize">{integration.category}</Badge>
        <Badge variant={planAllowed ? "secondary" : "outline"} className="rounded-full">
          {integration.plan === "free" ? "All plans" : `${integration.plan}+`}
        </Badge>
      </div>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap gap-2">
          {connection && canProvisionWebhook ? (
            <Button size="sm" variant="outline" className="rounded-full bg-background/70" onClick={copyWebhookUrl}>
              <Clipboard className="mr-2 h-4 w-4" /> Copy webhook URL
            </Button>
          ) : null}
          {!connection && canProvisionWebhook ? (
            <Button size="sm" className="rounded-full" onClick={enableWebhookBridge} disabled={busy || !planAllowed || integration.stage === "planned"}>
              {busy ? "Creating…" : "Create connector"}
            </Button>
          ) : null}
          {integration.actions.map((action) => (
            <IntegrationAction key={`${integration.key}-${action.label}`} action={action} />
          ))}
        </div>
        {integration.actions.some((action) => !!action.helper && action.kind !== "copy") ? (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {integration.actions.find((action) => action.helper)?.helper}
          </p>
        ) : null}
        {!planAllowed ? (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            This connector is designed for {integration.plan}+ workspaces.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function ConnectorContractPanel() {
  return (
    <section className="surface-card-elevated overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Connector OS contract
          </span>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">One internal model, many providers.</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Every provider should map into the same PhotoBrief primitives: customers, requests, templates, messages, submissions, briefs, and activity. That keeps Gmail, Twilio, website forms, Zapier, and future CRMs from becoming one-off spaghetti.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full bg-background/70">
          <NavLink to="/intake">Open Website Intake <ArrowRight className="ml-2 h-4 w-4" /></NavLink>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Standard triggers</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {integrationContract.triggers.map((trigger) => (
              <Badge key={trigger} variant="outline" className="rounded-full bg-background/70 font-mono text-[11px]">
                {trigger}
              </Badge>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Standard actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {integrationContract.actions.map((action) => (
              <Badge key={action} variant="outline" className="rounded-full bg-background/70 font-mono text-[11px]">
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
    if (selectedCategory === "all") return integrationDefinitions;
    return integrationDefinitions.filter((integration) => integration.category === selectedCategory);
  }, [selectedCategory]);

  function handleConnectionCreated(connection: IntegrationConnection) {
    setConnections((current) => ({ ...current, [connection.providerKey]: connection }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Integrations"
        description="Connect PhotoBrief to websites, inboxes, SMS, automation tools, and business systems without breaking the core request workflow."
        actions={
          <Button asChild className="rounded-full">
            <NavLink to="/requests/new">Create request <ArrowRight className="ml-2 h-4 w-4" /></NavLink>
          </Button>
        }
      />

      <ConnectorContractPanel />

      {connectionLoadError ? (
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          {connectionLoadError}
        </section>
      ) : null}

      <section className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Connector catalog</h2>
            <p className="mt-1 text-sm text-muted-foreground">Live workflows are usable now. Scaffolded connectors have the product contract ready and need provider credentials/back-end OAuth to become native.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                selectedCategory === "all" ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground hover:text-foreground",
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
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                  selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-background/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {integrationCategories[category].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {categoryOrder
        .filter((category) => selectedCategory === "all" || selectedCategory === category)
        .map((category) => {
          const integrations = visibleIntegrations.filter((integration) => integration.category === category);
          if (integrations.length === 0) return null;
          return (
            <section key={category} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">{integrationCategories[category].label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{integrationCategories[category].description}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {integrations.map((integration) => (
                  <IntegrationCard
                    key={integration.key}
                    integration={integration}
                    plan={currentPlan}
                    workspaceId={workspace?.id}
                    connection={connections[integration.key]}
                    onConnectionCreated={handleConnectionCreated}
                  />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
