import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GeneratedStepEditor } from "@/features/requests/components/GeneratedStepEditor";
import { GeneratedQuestionEditor } from "@/features/requests/components/GeneratedQuestionEditor";
import { UpgradePromptCard } from "@/components/shared/UpgradePromptCard";

import { guidesService } from "@/services/guidesService";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { usePlan } from "@/hooks/usePlan";
import { createBlankDraft } from "@/types/requestDraft";
import type { ContextQuestion, GuideStep } from "@/types/photobrief";
import { trackEvent } from "@/lib/analytics";

interface BuilderState {
  name: string;
  description: string;
  steps: GuideStep[];
  questions: ContextQuestion[];
}

export default function GuideBuilderPage() {
  const navigate = useNavigate();
  const { workspace } = useCurrentWorkspace();
  const { can } = usePlan();
  const canCustom = can("custom_guides");
  const qc = useQueryClient();

  const initial = useMemo<BuilderState>(() => {
    const blank = createBlankDraft();
    return {
      name: "",
      description: "",
      steps: blank.steps,
      questions: [],
    };
  }, []);

  const [state, setState] = useState<BuilderState>(initial);
  useEffect(() => {
    setState(initial);
  }, [initial]);

  const validSteps = state.steps.filter((s) => s.title.trim());
  const canSave = state.name.trim().length > 0 && validSteps.length > 0;

  const save = useMutation({
    mutationFn: async () => {
      if (!workspace?.id) throw new Error("Workspace not loaded");
      if (!state.name.trim()) throw new Error("Name your template");
      if (validSteps.length === 0) throw new Error("Add at least one photo prompt");
      return guidesService.saveDraftAsGuide({
        workspaceId: workspace.id,
        draft: {
          draftId: `builder_${Date.now()}`,
          source: "blank",
          title: state.name.trim(),
          introMessage: "",
          completionMessage: "",
          steps: state.steps,
          questions: state.questions,
          readinessRules: [],
          recipientName: "",
          recipientContact: "",
        },
      });
    },
    onSuccess: (guide) => {
      qc.invalidateQueries({ queryKey: ["workspace-guides"] });
      trackEvent("template_created", { guide_id: guide.id, steps: guide.steps?.length ?? 0, questions: guide.questions?.length ?? 0 });
      toast.success("Template saved", { description: `"${guide.name}" is ready to use.` });
      navigate(`/guides/${guide.id}`);
    },
    onError: (err: any) => {
      const message = err?.message ?? "Couldn't save template";
      if (message.includes("PLAN_FEATURE_LOCKED")) {
        toast.error("Custom templates require Pro", {
          description: "Upgrade to create your own reusable templates.",
        });
      } else {
        toast.error(message);
      }
    },
  });

  if (!canCustom) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="New template"
          description="Custom templates are available on Pro and higher plans."
          actions={
            <Button variant="ghost" size="sm" onClick={() => navigate("/guides")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          }
        />
        <UpgradePromptCard feature="custom_guides" variant="inline" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-12">
      <PageHeader
        title="New template"
        description="Start with one photo. Add more only if the request needs them."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/guides")} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={save.isPending || !canSave}
              onClick={() => save.mutate()}
            >
              <Save className="h-4 w-4" />
              {save.isPending ? "Saving…" : "Save template"}
            </Button>
          </div>
        }
      />

      <section className="rounded-3xl border bg-card p-5 shadow-elev-sm sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Additive setup
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
              Build only what this template needs.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              No giant library. No nested configuration. Name the template, write the first photo prompt,
              then add more photos or questions only if they make the request clearer.
            </p>
          </div>
          <ol className="grid gap-2 text-sm">
            {[
              "Name the template in your words.",
              "Add the exact photos customers should send.",
              "Save it and reuse it for future requests.",
            ].map((item, idx) => (
              <li key={item} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-foreground">{idx + 1}. {item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-5 shadow-elev-sm">
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="guide-name">Template name</Label>
            <Input
              id="guide-name"
              placeholder="e.g. Water heater quote photos"
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              className="h-11 text-base font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="guide-desc">Team note (optional)</Label>
            <Textarea
              id="guide-desc"
              placeholder="When should your team use this template? Customers won't see this."
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.target.value })}
              rows={2}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-elev-sm">
        <header>
          <h2 className="text-sm font-semibold text-foreground">
            Photos to request
          </h2>
          <p className="text-xs text-muted-foreground">
            Each item becomes one customer-facing photo prompt. Start with one and keep adding only what matters.
          </p>
        </header>
        <GeneratedStepEditor
          steps={state.steps}
          onChange={(steps) => setState({ ...state, steps })}
        />
      </section>

      <section className="space-y-3 rounded-2xl border bg-card p-5 shadow-elev-sm">
        <header>
          <h2 className="text-sm font-semibold text-foreground">
            Questions to ask, if any
          </h2>
          <p className="text-xs text-muted-foreground">
            Optional. Use questions for context photos cannot capture, like timing, measurements, or preferences.
          </p>
        </header>
        <GeneratedQuestionEditor
          questions={state.questions}
          onChange={(questions) => setState({ ...state, questions })}
        />
      </section>
    </div>
  );
}
