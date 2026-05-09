import { NavLink, useNavigate } from "react-router-dom";
import { Camera, MessageCircleQuestion, Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell, PageStack, Surface, ResponsiveGrid } from "@/components/layout/primitives";
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
    <PageShell>
      <PageStack>
        <PageHeader
          title="Your templates"
          description="Save the photo requests your business actually uses. Start with one photo, add more only when needed."
          actions={
            canCustomGuides ? (
              <Button asChild className="gap-1.5">
                <NavLink to="/guides/new">
                  <Plus className="h-4 w-4" /> New template
                </NavLink>
              </Button>
            ) : (
              <Button
                className="gap-1.5"
                onClick={() =>
                  toast.error("Custom templates are on Pro", {
                    description: "Upgrade to build and reuse your own photo guides.",
                  })
                }
              >
                <Plus className="h-4 w-4" /> New template
                <PlanTag plan="pro" className="ml-1 bg-white/15 text-primary-foreground" />
              </Button>
            )
          }
        />

        {!canCustomGuides ? <UpgradePromptCard feature="custom_guides" variant="inline" /> : null}

        <Surface variant="panel" radius="lg" padding="md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Simple by design
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            No giant template catalog. No guessing.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build the exact request you want customers to receive. Start with one required photo,
            add more if they help, then save it as your own reusable template.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">1. Name it</span>
            <span className="rounded-full bg-muted px-3 py-1">2. Add photo prompts</span>
            <span className="rounded-full bg-muted px-3 py-1">3. Save and reuse</span>
          </div>
          <ResponsiveGrid cols="1-2" className="mt-5 hidden sm:grid">
            <Surface variant="outline" padding="sm">
              <Camera className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Additive photo steps</p>
              <p className="mt-1 text-xs text-muted-foreground">
                One plain-language prompt at a time. Advanced options stay hidden until needed.
              </p>
            </Surface>
            <Surface variant="outline" padding="sm">
              <MessageCircleQuestion className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Optional questions</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask for context only when photos alone are not enough.
              </p>
            </Surface>
          </ResponsiveGrid>
        </Surface>

        {isLoading ? (
          <Surface padding="lg" className="text-center text-sm text-muted-foreground">
            Loading templates…
          </Surface>
        ) : workspaceGuides.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Saved templates</h2>
              <p className="text-xs text-muted-foreground">
                These are built by your team and ready to use for new requests.
              </p>
            </div>
            <ResponsiveGrid cols="1-3">
              {workspaceGuides.map((g) => (
                <GuideCard
                  key={g.id}
                  guide={g}
                  onUse={handleUse}
                  onPreview={handleEdit}
                  onCustomize={handleEdit}
                />
              ))}
            </ResponsiveGrid>
          </section>
        ) : (
          <Surface variant="outline" radius="lg" padding="lg" className="border-dashed text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-foreground">Create your first template</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Start with one photo prompt like “Take a wide photo of the issue.” Add only what you need from there.
            </p>
            <Button asChild className="mt-5 gap-1.5">
              <NavLink to="/guides/new">
                <Plus className="h-4 w-4" /> Build a template
              </NavLink>
            </Button>
          </Surface>
        )}
      </PageStack>
    </PageShell>
  );
}
