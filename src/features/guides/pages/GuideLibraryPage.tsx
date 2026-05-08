import { NavLink, useNavigate } from "react-router-dom";
import { Camera, MessageCircleQuestion, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useWorkspaceGuides } from "@/hooks/useGuides";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import type { PhotoGuide } from "@/types/photobrief";
import { GuideCard } from "@/features/guides/components/GuideCard";
import { UpgradePromptCard } from "@/components/shared/UpgradePromptCard";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { PlanTag } from "@/components/shared/PlanTag";

export default function GuideLibraryPage() {
  const { workspace } = useCurrentWorkspace();
  const { data: workspaceGuides = [], isLoading } = useWorkspaceGuides(workspace?.id);
  const navigate = useNavigate();
  const { can } = usePlan();
  const canCustomGuides = can("custom_guides");

  function handleUse(guide: PhotoGuide) {
    trackEvent("template_used", { guide_id: guide.id, guide_name: guide.name, source: "workspace" });
    navigate(`/requests/new?guide=${guide.id}`);
    toast.success(`Starting from "${guide.name}"`);
  }

  function handleEdit(guide: PhotoGuide) {
    trackEvent("template_edit_started", { guide_id: guide.id, guide_name: guide.name });
    navigate(`/guides/${guide.id}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Intake workflows"
        description="The 2–3 reusable customer paths your business actually needs. PhotoBrief uses them to turn website leads into actionable visual packets."
        actions={
          canCustomGuides ? (
            <Button asChild className="gap-1.5">
              <NavLink to="/guides/new">
                <Plus className="h-4 w-4" /> New workflow
              </NavLink>
            </Button>
          ) : (
            <Button
              className="gap-1.5"
              onClick={() =>
                toast.error("Custom workflows are on Pro", {
                  description: "Upgrade to build and reuse your own intake workflows.",
                })
              }
            >
              <Plus className="h-4 w-4" /> New workflow
              <PlanTag plan="pro" className="ml-1 bg-white/15 text-primary-foreground" />
            </Button>
          )
        }
      />

      {!canCustomGuides ? <UpgradePromptCard feature="custom_guides" variant="inline" /> : null}

      <section className="rounded-3xl border bg-card p-5 shadow-elev-sm sm:p-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Simple by design
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            No giant form catalog. No customer guesswork.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep each business to a few clear paths — quote, service, warranty, damage, return, or review. Each workflow asks for the photos and details needed to make the lead useful.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">1. Match the service</span>
            <span className="rounded-full bg-muted px-3 py-1">2. Ask the right photo steps</span>
            <span className="rounded-full bg-muted px-3 py-1">3. Deliver a lead packet</span>
          </div>
          {/* Detail cards hidden on mobile for brevity */}
          <div className="mt-5 hidden gap-3 sm:grid sm:grid-cols-2">
            <div className="rounded-2xl border bg-background p-4">
              <Camera className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Service-specific photo steps</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One plain-language prompt at a time, tuned to the service or issue the customer selected.
              </p>
            </div>
            <div className="rounded-2xl border bg-background p-4">
              <MessageCircleQuestion className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Context only when it helps</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask for notes, IDs, model numbers, or access details only when they make the packet more actionable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading workflows…
        </div>
      ) : workspaceGuides.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Saved intake workflows</h2>
            <p className="text-xs text-muted-foreground">
              These are the reusable paths PhotoBrief can dispatch from website intake or manual links.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaceGuides.map((g) => (
              <GuideCard
                key={g.id}
                guide={g}
                onUse={handleUse}
                onPreview={handleEdit}
                onCustomize={handleEdit}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed bg-card/60 p-8 text-center shadow-elev-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Plus className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Create your first intake workflow</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Start with a common business path like quote, service, warranty, or damage review. Add only the photo steps needed to make the lead actionable.
          </p>
          <Button asChild className="mt-5 gap-1.5">
            <NavLink to="/guides/new">
              <Plus className="h-4 w-4" /> Build a workflow
            </NavLink>
          </Button>
        </section>
      )}
    </div>
  );
}
