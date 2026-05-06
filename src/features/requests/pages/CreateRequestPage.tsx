import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
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
import { ArrowRight, Plus, Sparkles } from "lucide-react";

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
  const [mode, setMode] = useState<BuilderMode>("ai");
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
    if (!draft && !guideParam && !aiUnlocked) {
      setDraft(createBlankDraft({ recipientName: prefillName, recipientContact: prefillContact }));
    }
  }, [draft, guideParam, prefillName, prefillContact, aiUnlocked]);

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
    toast.success(`Loaded ${guide.name}`);
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
                text: "That didn’t build. Try one more time with a little more detail.",
              }
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

  const draftPreviewRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to draft preview on mobile when draft is generated
  useEffect(() => {
    if (draft && draftPreviewRef.current && window.innerWidth < 1024) {
      setTimeout(() => {
        draftPreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }, [draft]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <div id="draft-preview-top" />
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-5 shadow-[0_30px_90px_-55px_hsl(222_47%_11%/0.55)] backdrop-blur sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-ambient-sky opacity-70" />
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Simple request builder
        </span>
        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">Create a photo request</h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            Start with what the customer needs to capture.
          </p>
        </div>
        <Button variant="outline" className="mt-4 h-12 w-full rounded-2xl bg-background/70 text-base sm:w-auto sm:h-11 sm:text-sm" onClick={handleBlankDraft}>
          <Plus className="mr-2 h-4 w-4" /> Start blank
        </Button>
      </section>

      {/* On mobile: sequential flow. On desktop: side-by-side grid. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.25fr)]">
        <div className="space-y-4">
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

        <div ref={draftPreviewRef} className="space-y-3">
          {draft ? (
            <RequestDraftPreview
              draft={draft}
              onChange={setDraft}
              onCreate={handleCreate}
              onSaveAsGuide={handleSaveAsGuide}
              isSaving={isCreating}
            />
          ) : (
            <section className="flex min-h-[320px] flex-col items-center justify-center rounded-[2rem] border border-dashed bg-card/60 p-6 text-center shadow-sm backdrop-blur lg:min-h-[420px] lg:p-8">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ArrowRight className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">Your request will appear here</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Build with AI, use a saved template, or start blank.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
