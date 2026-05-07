import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CreateRequestWizard } from "@/features/requests/components/CreateRequestWizard";
import { createBlankDraft, draftFromGuide } from "@/types/requestDraft";
import type { RequestDraft } from "@/types/requestDraft";
import type { AiBuilderMessage } from "@/features/requests/components/AIRequestBuilderChat";
import { aiService } from "@/services/aiService";
import { notificationService } from "@/services/notificationService";
import { requestsService } from "@/services/requestsService";
import { messagingService } from "@/services/messagingService";
import type { PhotoGuide } from "@/types/photobrief";
import { usePlan } from "@/hooks/usePlan";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { useUsage } from "@/hooks/useUsage";
import { useWorkspaceGuides, useGuideAsync } from "@/hooks/useGuides";
import { useQueryClient } from "@tanstack/react-query";
import { trackEvent } from "@/lib/analytics";

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
  const [draft, setDraft] = useState<RequestDraft | null>(null);
  const [chatMessages, setChatMessages] = useState<AiBuilderMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { data: savedTemplates = [] } = useWorkspaceGuides(workspace?.id);
  const guideParam = searchParams.get("guide") ?? undefined;
  const { data: guideFromParam } = useGuideAsync(guideParam);

  const prefillCustomerId = searchParams.get("customer_id");
  const prefillName = searchParams.get("name") ?? "";
  const prefillContact = searchParams.get("email") ?? searchParams.get("phone") ?? "";

  // Pre-fill from guide param
  useEffect(() => {
    if (guideFromParam && !draft) {
      const d = draftFromGuide(guideFromParam);
      if (prefillName) d.recipientName = prefillName;
      if (prefillContact) d.recipientContact = prefillContact;
      setDraft(d);
    }
  }, [guideFromParam, draft, prefillName, prefillContact]);

  const handleBlankDraft = () => {
    setDraft(createBlankDraft({ recipientName: prefillName, recipientContact: prefillContact }));
    trackEvent("blank_request_started");
  };

  const handleSelectTemplate = (guide: PhotoGuide) => {
    const d = draftFromGuide(guide);
    if (prefillName) d.recipientName = prefillName;
    if (prefillContact) d.recipientContact = prefillContact;
    setDraft(d);
    toast.success(`Loaded ${guide.name}`);
  };

  const handleAiPrompt = async (prompt: string) => {
    const userMsg: AiBuilderMessage = { id: newId(), from: "user", text: prompt };
    const pendingMsg: AiBuilderMessage = { id: newId(), from: "assistant", text: "", pending: true };
    setChatMessages((m) => [...m, userMsg, pendingMsg]);
    setIsGenerating(true);
    try {
      const { draft: generated, assistantReply } = await aiService.generateGuideFromPrompt({ prompt });
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
            ? { ...msg, pending: false, text: "That didn't build. Try one more time with a little more detail." }
            : msg,
        ),
      );
      toast.error("Could not build request");
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
      let guideId = draft.baseGuideId ?? null;

      if (!guideId) {
        const { guidesService } = await import("@/services/guidesService");
        const requestGuide = await guidesService.saveDraftAsRequestGuide({
          workspaceId: workspace.id,
          draft,
        });
        guideId = requestGuide.id;
      }

      const created = await requestsService.create({
        workspaceId: workspace.id,
        guideId,
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
          const result = await messagingService.send({ requestId: created.id, kind: "initial", channel: "email" });
          delivery = result.delivery;
        } catch (sendErr) {
          console.error("Failed to send recipient email", sendErr);
        }
      }
      notificationService.notify({
        event: "request_created",
        audience: "business",
        title: `Request "${draft.title}" created`,
        body: delivery === "sent" ? `Email sent to ${recipient}.` : `Link ready for ${recipient}.`,
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
        toast.message("Request created", { description: "Email is queued for delivery." });
      } else {
        toast.message("Request created", { description: "Copy the link and share it with your customer." });
      }
      trackEvent("request_created", {
        request_id: created.id,
        guide_id: guideId,
        delivery,
        contact_type: isEmail ? "email" : "link",
      });
      if (delivery === "sent") {
        trackEvent("request_sent", { request_id: created.id, channel: "email" });
      }
      queryClient.invalidateQueries({ queryKey: ["requests", workspace.id] });
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
          action: { label: "Buy top-up", onClick: () => navigate("/settings/billing#topup") },
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
      const saved = await guidesService.saveDraftAsGuide({ workspaceId: workspace.id, draft });
      toast.dismiss(t);
      toast.success(`Saved "${saved.name}"`);
      queryClient.invalidateQueries({ queryKey: ["workspace-guides"] });
    } catch (err: any) {
      toast.dismiss(t);
      const msg = err?.message?.includes("PLAN_FEATURE_LOCKED")
        ? "Custom templates are on the Pro plan."
        : err?.message ?? "Could not save template";
      toast.error(msg);
    }
  };

  // If guide param was provided, skip to recipient step (step 2)
  const initialStep = guideFromParam && draft ? 2 : 0;

  return (
    <CreateRequestWizard
      draft={draft}
      onDraftChange={setDraft}
      aiUnlocked={aiUnlocked}
      savedTemplates={savedTemplates}
      chatMessages={chatMessages}
      isGenerating={isGenerating}
      isCreating={isCreating}
      onSelectTemplate={handleSelectTemplate}
      onAiPrompt={handleAiPrompt}
      onBlankDraft={handleBlankDraft}
      onCreate={handleCreate}
      onSaveAsGuide={handleSaveAsGuide}
      initialStep={initialStep}
    />
  );
}
