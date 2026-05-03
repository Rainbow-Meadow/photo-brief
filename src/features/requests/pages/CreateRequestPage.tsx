import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  RequestBuilderModeTabs,
  type BuilderMode,
} from "@/features/requests/components/RequestBuilderModeTabs";
import { TemplatePicker } from "@/features/requests/components/TemplatePicker";
import {
  AIRequestBuilderChat,
  type AiBuilderMessage,
} from "@/features/requests/components/AIRequestBuilderChat";
import { RequestDraftPreview } from "@/features/requests/components/RequestDraftPreview";
import { createBlankDraft, draftFromGuide } from "@/types/requestDraft";
import type { RequestDraft } from "@/types/requestDraft";
import { aiService } from "@/services/aiService";
import { notificationService } from "@/services/notificationService";
import { requestsService } from "@/services/requestsService";
import { messagingService } from "@/services/messagingService";
import type { PhotoGuide } from "@/types/photobrief";
import { UpgradePromptCard } from "@/components/shared/UpgradePromptCard";
import { usePlan } from "@/hooks/usePlan";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useUsage } from "@/hooks/useUsage";
import { useWorkspaceGuides, useGuideAsync } from "@/hooks/useGuides";
import { useQueryClient } from "@tanstack/react-query";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

let mid = 0;
const newId = () => `chat_${Date.now()}_${++mid}`;

export default function CreateRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { can } = usePlan();
  const { workspace } = useCurrentWorkspace();
  const { usage } = useUsage();
  const queryClient = useQueryClient();
  const aiUnlocked = can("ai_request_builder");
  const [mode, setMode] = useState<BuilderMode>("template");
  const [draft, setDraft] = useState<RequestDraft | null>(null);
  const [chatMessages, setChatMessages] = useState<AiBuilderMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: savedTemplates = [] } = useWorkspaceGuides(workspace?.id);
  const guideParam = searchParams.get("guide") ?? undefined;
  const { data: guideFromParam } = useGuideAsync(guideParam);

  // Customer prefill from URL params (e.g. /requests/new?customer_id=...&name=...&email=...)
  const prefillCustomerId = searchParams.get("customer_id");
  const prefillName = searchParams.get("name") ?? "";
  const prefillContact = searchParams.get("email") ?? searchParams.get("phone") ?? "";

  useEffect(() => {
    if (guideFromParam && !draft) {
      const d = draftFromGuide(guideFromParam);
      if (prefillName) d.recipientName = prefillName;
      if (prefillContact) d.recipientContact = prefillContact;
      setDraft(d);
      setMode("template");
    }
  }, [guideFromParam, draft, prefillName, prefillContact]);

  useEffect(() => {
    if (!draft && !guideParam) {
      setDraft(createBlankDraft({ recipientName: prefillName, recipientContact: prefillContact }));
    }
  }, [draft, guideParam, prefillName, prefillContact]);

  const handleBlankDraft = () => {
    setDraft(createBlankDraft({ recipientName: prefillName, recipientContact: prefillContact }));
    setMode("template");
    trackEvent("blank_request_started");
  };

  const handleSelectTemplate = (guide: PhotoGuide) => {
    const d = draftFromGuide(guide);
    if (prefillName) d.recipientName = prefillName;
    if (prefillContact) d.recipientContact = prefillContact;
    setDraft(d);
    toast.success(`Loaded template: ${guide.name}`);
  };

  const handleAiPrompt = async (prompt: string) => {
    const userMsg: AiBuilderMessage = { id: newId(), from: "user", text: prompt };
    const pendingMsg: AiBuilderMessage = {
      id: newId(),
      from: "assistant",
      text: "",
      pending: true,
    };
    setChatMessages((m) => [...m, userMsg, pendingMsg]);
    setIsGenerating(true);

    try {
      const { draft: generated, assistantReply } = await aiService.generateGuideFromPrompt({
        prompt,
      });
      if (prefillName) generated.recipientName = prefillName;
      if (prefillContact) generated.recipientContact = prefillContact;
      setDraft(generated);
      setChatMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id ? { ...msg, pending: false, text: assistantReply } : msg,
        ),
      );
    } catch (err) {
      console.error(err);
      setChatMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? {
                ...msg,
                pending: false,
                text: "Sorry — something went wrong drafting that. Try again?",
              }
            : msg,
        ),
      );
      toast.error("Could not generate draft");
    } finally {
      setIsGenerating(false);
    }
  };

  const requestsUsedThisMonth = usage.requests;

  const handleCreate = async () => {
    if (!draft) return;
    if (!workspace?.id) {
      toast.error("Workspace not loaded yet — try again in a moment.");
      return;
    }
    if (!can("request_limit", requestsUsedThisMonth)) {
      toast.error("You've hit this month's request limit", {
        description: "Upgrade to send more briefs this month.",
        action: { label: "See plans", onClick: () => navigate("/settings/billing") },
      });
      return;
    }

    setIsCreating(true);
    try {
      const contact = draft.recipientContact?.trim() ?? "";
      const isEmail = contact.includes("@");
      const created = await requestsService.create({
        workspaceId: workspace?.id ?? "",
        guideId: draft.baseGuideId ?? null,
        recipientName: draft.recipientName || "Recipient",
        recipientEmail: isEmail ? contact : undefined,
        recipientPhone: !isEmail && contact ? contact : undefined,
        customMessage: draft.introMessage,
        status: "sent",
        customerId: prefillCustomerId ?? undefined,
      });

      const link = `${window.location.origin}/r/${created.token}`;
      const recipient = draft.recipientName || "your customer";

      let delivery: "sent" | "logged_only" | "skipped" = "logged_only";
      if (isEmail) {
        try {
          const result = await messagingService.send({
            requestId: created.id,
            kind: "initial",
            channel: "email",
          });
          delivery = result.delivery;
        } catch (sendErr) {
          console.error("Failed to send recipient email", sendErr);
        }
      }

      notificationService.notify({
        event: "request_created",
        audience: "business",
        title: `Request "${draft.title}" created`,
        body:
          delivery === "sent"
            ? `Email sent to ${recipient}.`
            : `Link ready for ${recipient}.`,
        href: `/requests/${created.id}`,
      });
      notificationService.notify({
        event: "request_sent",
        audience: "recipient",
        title: `Request sent to ${recipient}`,
        body: link,
        href: `/requests/${created.id}`,
        recipientEmail: isEmail ? contact : undefined,
      });

      if (delivery === "sent") {
        toast.success(`Email sent to ${recipient}`);
      } else if (isEmail) {
        toast.message("Request created", {
          description: "Email is queued for delivery.",
        });
      } else {
        toast.message("Request created", {
          description: "Copy the link and share it with your customer.",
        });
      }

      trackEvent("request_created", {
        request_id: created.id,
        guide_id: draft?.baseGuideId ?? null,
        delivery,
        contact_type: isEmail ? "email" : "link",
      });
      if (delivery === "sent") {
        trackEvent("request_sent", { request_id: created.id, channel: "email" });
      }

      queryClient.invalidateQueries({ queryKey: ["requests", workspace?.id] });
      navigate(`/requests/${created.id}`);
    } catch (err: any) {
      console.error(err);
      const isLimit = err?.message?.includes("PLAN_LIMIT_REACHED");
      const msg = isLimit
        ? "You've hit this month's request limit on your current plan."
        : err?.message ?? "Could not create request";
      if (isLimit) {
        toast.error(msg, {
          description: "Buy a top-up pack or upgrade your plan to keep sending requests.",
          action: {
            label: "Buy top-up",
            onClick: () => navigate("/settings/billing#topup"),
          },
        });
      } else {
        toast.error(msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveAsGuide = async () => {
    if (!draft) return;
    if (!workspace?.id) {
      toast.error("Workspace not loaded yet");
      return;
    }
    if (!can("custom_guides")) {
      toast.error("Custom templates are on Pro", {
        description: "Upgrade to save your own reusable photo templates.",
        action: { label: "See plans", onClick: () => navigate("/settings/billing") },
      });
      return;
    }
    const t = toast.loading(`Saving "${draft.title}"…`);
    try {
      const { guidesService } = await import("@/services/guidesService");
      const saved = await guidesService.saveDraftAsGuide({
        workspaceId: workspace.id,
        draft,
      });
      toast.dismiss(t);
      toast.success(`Saved "${saved.name}" to your templates`);
      queryClient.invalidateQueries({ queryKey: ["workspace-guides"] });
    } catch (err: any) {
      toast.dismiss(t);
      const msg = err?.message?.includes("PLAN_FEATURE_LOCKED")
        ? "Custom templates are on the Pro plan."
        : err?.message ?? "Could not save template";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div id="draft-preview-top" />
      <PageHeader
        title="New request"
        description="Start from scratch or reuse one of your own saved templates."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-4 shadow-elev-sm">
            <p className="text-sm font-semibold text-foreground">Start simple</p>
            <p className="mt-1 text-xs text-muted-foreground">
              One photo prompt is enough. Add more photos or questions only if they help.
            </p>
            <Button className="mt-4 w-full gap-1.5" onClick={handleBlankDraft}>
              <Plus className="h-4 w-4" /> Start from scratch
            </Button>
          </div>

          <RequestBuilderModeTabs mode={mode} onChange={setMode} />
          {mode === "template" ? (
            <TemplatePicker
              guides={savedTemplates}
              selectedGuideId={draft?.source === "template" ? draft.baseGuideId : undefined}
              onSelect={handleSelectTemplate}
            />
          ) : aiUnlocked ? (
            <AIRequestBuilderChat
              messages={chatMessages}
              isGenerating={isGenerating}
              onSubmit={handleAiPrompt}
            />
          ) : (
            <UpgradePromptCard feature="ai_request_builder" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Request setup</h2>
            {draft && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                {draft.source === "ai" ? "AI draft" : draft.source === "template" ? "Saved template" : "Custom"}
              </span>
            )}
          </div>
          {draft ? (
            <RequestDraftPreview
              draft={draft}
              onChange={setDraft}
              onCreate={handleCreate}
              onSaveAsGuide={handleSaveAsGuide}
              isSaving={isCreating}
            />
          ) : (
            <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center">
              <p className="text-sm font-medium text-foreground">Start with one photo prompt</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose “Start from scratch” to build exactly what you need.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
