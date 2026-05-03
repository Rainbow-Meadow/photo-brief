import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Copy, ExternalLink, Globe2, Loader2, Plus, Send, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

  useMemo(() => {
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

  const guideName = (id: string | null | undefined) => guides.find((g) => g.id === id)?.name ?? "Choose template";

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
          <Globe2 className="h-3.5 w-3.5 text-primary" /> Website Intake
        </span>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Turn website inquiries into photo-ready requests.
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              Use the hosted form or connect your existing website form. Either way, PhotoBrief can pick the right template, create the customer, and send the photo request automatically.
            </p>
            <div className="mt-5 hidden max-w-xl overflow-hidden rounded-[1.75rem] border bg-background/60 p-2 shadow-sm backdrop-blur md:block">
              <img src="/marketing/website-intake-flow.svg" alt="Website Intake automation flow" className="w-full rounded-[1.25rem]" loading="lazy" />
            </div>
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

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-5">
          <SurfaceCard title="1. Start with the easy link" icon={Globe2}>
            <p className="text-sm leading-6 text-muted-foreground">
              Put this hosted intake form behind a “Get a quote” or “Request service” button. It sends customers into the same automated PhotoBrief flow.
            </p>
            <div className="mt-4 rounded-2xl bg-muted/50 p-3">
              <code className="break-all text-xs text-foreground">{hostedLink}</code>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button
                className="h-11 rounded-2xl"
                variant="outline"
                onClick={async () => {
                  await navigator.clipboard.writeText(hostedLink);
                  toast.success("Hosted form link copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy link
              </Button>
              <Button className="h-11 rounded-2xl" variant="secondary" onClick={() => window.open(hostedLink, "_blank", "noopener,noreferrer")}>
                <ExternalLink className="mr-2 h-4 w-4" /> Open form
              </Button>
            </div>
          </SurfaceCard>

          <SurfaceCard title="2. Or connect an existing form" icon={Copy}>
            <p className="text-sm leading-6 text-muted-foreground">
              Paste this URL into Webflow, WordPress, Zapier, Make, or any form tool that can send a webhook.
            </p>
            <div className="mt-4 rounded-2xl bg-muted/50 p-3">
              <code className="break-all text-xs text-foreground">{webhook}</code>
            </div>
            <Button
              className="mt-3 h-11 rounded-2xl"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(webhook);
                toast.success("Webhook URL copied");
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy URL
            </Button>
          </SurfaceCard>

          <SurfaceCard title="3. Choose the fallback template" icon={Wand2}>
            <p className="text-sm leading-6 text-muted-foreground">
              If no rule or AI match is confident enough, this template will be used. Pick a simple general intake template.
            </p>
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
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-muted/40 p-3">
              <Switch
                checked={source.autoSend}
                onCheckedChange={async (autoSend) => {
                  await updateSource.mutateAsync({ id: source.id, autoSend });
                  toast.success(autoSend ? "Auto-send enabled" : "Auto-send disabled");
                }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">Send link automatically</p>
                <p className="text-xs text-muted-foreground">If an email is captured, PhotoBrief sends the request right away.</p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard title="4. Map your form fields" icon={ArrowRight}>
            <p className="text-sm leading-6 text-muted-foreground">
              Only needed for existing website forms. Tell PhotoBrief what your form calls each field.
            </p>
            <div className="mt-4 space-y-3">
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
              className="mt-4 h-11 rounded-2xl"
              onClick={async () => {
                await saveMappings.mutateAsync((Object.keys(FIELD_LABELS) as IntakeField[]).map((field) => ({ photobriefField: field, externalField: fieldMap[field] ?? "" })));
                toast.success("Field mapping saved");
              }}
            >
              Save field mapping
            </Button>
          </SurfaceCard>
        </div>

        <div className="space-y-5">
          <SurfaceCard title="5. Route request types" icon={Wand2}>
            <p className="text-sm leading-6 text-muted-foreground">
              Match words from the request type or message to a saved template. If rules don’t match, PhotoBrief will try a simple AI match before using the fallback.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-[120px_1fr]">
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
                placeholder="e.g. quote"
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

            <div className="mt-4 space-y-2">
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
          </SurfaceCard>

          <SurfaceCard title="6. Test it" icon={Send}>
            <p className="text-sm leading-6 text-muted-foreground">
              Send a sample lead through the same path your hosted form or website webhook will use.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.name} onChange={(e) => setTestPayload((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.email} onChange={(e) => setTestPayload((p) => ({ ...p, email: e.target.value }))} placeholder="Email" />
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.request_type} onChange={(e) => setTestPayload((p) => ({ ...p, request_type: e.target.value }))} placeholder="Request type" />
              <Input className="h-11 rounded-2xl bg-background/80" value={testPayload.phone} onChange={(e) => setTestPayload((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
              <Textarea className="rounded-2xl bg-background/80 sm:col-span-2" rows={3} value={testPayload.message} onChange={(e) => setTestPayload((p) => ({ ...p, message: e.target.value }))} placeholder="Message" />
            </div>
            <Button
              className="mt-3 h-12 w-full rounded-2xl text-base shadow-glow"
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
          </SurfaceCard>

          <SurfaceCard title="Recent intake" icon={CheckCircle2}>
            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="rounded-2xl bg-muted/40 p-3 text-sm text-muted-foreground">No website leads yet.</p>
              ) : events.map((event) => (
                <div key={event.id} className="rounded-2xl border bg-background/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{event.requestType || "Website lead"}</p>
                    <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{event.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{event.error || event.message || JSON.stringify(event.normalizedCustomer)}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}

function SurfaceCard({ title, icon: Icon, children }: { title: string; icon: typeof Copy; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
