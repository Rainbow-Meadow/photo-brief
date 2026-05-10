import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Save, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import noGuidesIllustration from "@/assets/empty-states/no-guides.png";
import { GeneratedStepEditor } from "@/features/requests/components/GeneratedStepEditor";
import { GeneratedQuestionEditor } from "@/features/requests/components/GeneratedQuestionEditor";
import { Section, Container, Stack } from "@/design-system/schema";

import { useGuideAsync } from "@/hooks/useGuides";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { guidesService } from "@/services/guidesService";
import type { ContextQuestion, GuideStep, PhotoGuide } from "@/types/photobrief";
import { trackEvent } from "@/lib/analytics";

interface EditState {
  name: string;
  description: string;
  steps: GuideStep[];
  questions: ContextQuestion[];
}

function fromGuide(g: PhotoGuide): EditState {
  return {
    name: g.name,
    description: g.description ?? "",
    steps: g.steps.map((s) => ({ ...s })),
    questions: g.questions.map((q) => ({ ...q })),
  };
}

export default function GuideDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { workspace } = useCurrentWorkspace();
  const { data: guide, isLoading } = useGuideAsync(id);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isCustom = useMemo(
    () => !!guide && !!guide.workspaceId && guide.workspaceId === workspace?.id,
    [guide, workspace],
  );

  useEffect(() => {
    if (guide && editing) setDraft(fromGuide(guide));
  }, [guide, editing]);

  useEffect(() => {
    if (guide) {
      trackEvent("template_viewed", { guide_id: guide.id, guide_name: guide.name, source: "detail_page" });
    }
  }, [guide?.id]);

  const update = useMutation({
    mutationFn: async () => {
      if (!guide || !draft) throw new Error("No template loaded");
      if (!draft.name.trim()) throw new Error("Name your template");
      return guidesService.updateGuide({
        guideId: guide.id,
        name: draft.name.trim(),
        description: draft.description,
        steps: draft.steps,
        questions: draft.questions,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guide", id] });
      qc.invalidateQueries({ queryKey: ["workspace-guides"] });
      toast.success("Template updated");
      setEditing(false);
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Couldn't update template"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!guide) throw new Error("No template loaded");
      return guidesService.deleteGuide(guide.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspace-guides"] });
      toast.success("Template deleted");
      navigate("/guides");
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Couldn't delete template"),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading template…</p>;
  }
  if (!guide) {
    return (
      <EmptyState
        icon={BookOpen}
        illustration={noGuidesIllustration}
        title="Template not found"
        description="This template no longer exists."
      />
    );
  }

  const view = editing && draft ? draft : fromGuide(guide);

  return (
    <Section density="page">
      <Container>
        <Stack>
          <div className="pb-12 space-y-6">
            <PageHeader
        backTo={{ label: "Templates", href: "/guides" }}
        title={view.name}
        description={view.description || `${view.steps.length} photo prompts · ${view.questions.length} questions`}
        actions={
          <div className="flex items-center gap-2">
            {!editing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => navigate(`/requests/new?guide=${guide.id}`)}
                >
                  <Send className="h-4 w-4" /> Use template
                </Button>
                {isCustom ? (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1.5 text-destructive hover:text-destructive"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1.5"
                  onClick={() => setEditing(false)}
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  disabled={update.isPending}
                  onClick={() => update.mutate()}
                >
                  <Save className="h-4 w-4" />
                  {update.isPending ? "Saving…" : "Save changes"}
                </Button>
              </>
            )}
          </div>
        }
      />

      {editing && draft ? (
        <section className="space-y-4 rounded-[0.25rem] border bg-card p-5 shadow-elev-sm">
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="g-name">Template name</Label>
              <Input
                id="g-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="g-desc">Team note</Label>
              <Textarea
                id="g-desc"
                rows={2}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-[0.25rem] border bg-card p-5 shadow-elev-sm">
        <header>
          <h2 className="text-sm font-semibold text-foreground">
            Photos to request ({view.steps.length})
          </h2>
        </header>
        {editing && draft ? (
          <GeneratedStepEditor
            steps={draft.steps}
            onChange={(steps) => setDraft({ ...draft, steps })}
          />
        ) : (
          <ol className="space-y-3">
            {view.steps.map((step, i) => (
              <li key={step.id} className="flex gap-3 rounded-xl border bg-background p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  {step.instructions ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">{step.instructions}</p>
                  ) : null}
                </div>
              </li>
            ))}
            {view.steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photo prompts yet.</p>
            ) : null}
          </ol>
        )}
      </section>

      <section className="space-y-3 rounded-[0.25rem] border bg-card p-5 shadow-elev-sm">
        <header>
          <h2 className="text-sm font-semibold text-foreground">
            Questions, if any ({view.questions.length})
          </h2>
        </header>
        {editing && draft ? (
          <GeneratedQuestionEditor
            questions={draft.questions}
            onChange={(questions) => setDraft({ ...draft, questions })}
          />
        ) : view.questions.length > 0 ? (
          <ul className="space-y-2">
            {view.questions.map((q) => (
              <li key={q.id} className="rounded-xl border bg-background p-3 text-sm text-foreground">
                {q.prompt}
                {q.required ? <span className="ml-1 text-destructive">*</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No questions. Photos are enough for this template.</p>
        )}
      </section>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this template?</AlertDialogTitle>
            <AlertDialogDescription>
              "{view.name}" will be removed from your saved templates. Existing requests already sent with this template are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </div>
        </Stack>
      </Container>
    </Section>
  );
}
