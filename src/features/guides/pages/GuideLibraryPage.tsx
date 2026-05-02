import { useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Plus, Wrench, Home, PackageCheck, Megaphone, Heart,
  EyeOff, Eye, Sparkles, Search, SlidersHorizontal, Star, X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLaunchGuides, useInternalGuides, useWorkspaceGuides } from "@/hooks/useGuides";
import { useCurrentWorkspace } from "@/hooks/useCurrentWorkspace";
import { curatedCategories } from "@/config/curatedCategories";
import { getStarterForIndustry } from "@/config/industryGuideMap";
import type { CuratedCategory, PhotoGuide, Plan } from "@/types/photobrief";
import { GuideCard } from "@/features/guides/components/GuideCard";
import { GuidePreviewDialog } from "@/features/guides/components/GuidePreviewDialog";
import { AIGuideGeneratorDialog } from "@/features/ai/components/AIGuideGeneratorDialog";
import { UpgradePromptCard } from "@/components/shared/UpgradePromptCard";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { PlanTag } from "@/components/shared/PlanTag";
import { cn } from "@/lib/utils";

const iconMap = { Wrench, Home, PackageCheck, Megaphone, Heart };

const planFilters: { value: Plan | "all"; label: string }[] = [
  { value: "all", label: "All plans" },
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team+" },
];

const timeFilters: { value: string; label: string; max: number }[] = [
  { value: "quick", label: "≤ 3 min", max: 3 },
  { value: "medium", label: "4–6 min", max: 6 },
  { value: "long", label: "7+ min", max: 999 },
];

export default function GuideLibraryPage() {
  const launchGuides = useLaunchGuides();
  const internalGuides = useInternalGuides();
  const { workspace } = useCurrentWorkspace();
  const { data: workspaceGuides = [] } = useWorkspaceGuides(workspace?.id);
  const navigate = useNavigate();
  const { can } = usePlan();
  const canCustomGuides = can("custom_guides");
  const canAiGuides = can("ai_guide_generator");
  const [previewGuide, setPreviewGuide] = useState<PhotoGuide | null>(null);
  const [showInternal, setShowInternal] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CuratedCategory | "all">("all");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const starterMapping = useMemo(
    () => getStarterForIndustry(workspace?.industry),
    [workspace?.industry],
  );

  // Recommended guides: starter + 2 others from same category
  const recommended = useMemo(() => {
    const starterGuide = launchGuides.find((g) => g.id === starterMapping.guideId);
    const starterCategory = starterGuide?.curatedCategory;
    const others = launchGuides
      .filter((g) => g.id !== starterMapping.guideId && g.curatedCategory === starterCategory)
      .slice(0, 2);
    return starterGuide ? [starterGuide, ...others] : others;
  }, [launchGuides, starterMapping]);

  // Filtered guides
  const filtered = useMemo(() => {
    let list = launchGuides;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.bestFor ?? "").toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all") {
      list = list.filter((g) => g.curatedCategory === categoryFilter);
    }
    if (planFilter !== "all") {
      list = list.filter((g) => g.recommendedPlan === planFilter);
    }
    if (timeFilter !== "all") {
      const tf = timeFilters.find((t) => t.value === timeFilter);
      if (tf) {
        if (tf.value === "quick") list = list.filter((g) => (g.estimatedMinutes ?? 4) <= tf.max);
        else if (tf.value === "medium")
          list = list.filter((g) => {
            const m = g.estimatedMinutes ?? 4;
            return m >= 4 && m <= 6;
          });
        else list = list.filter((g) => (g.estimatedMinutes ?? 4) >= 7);
      }
    }
    return list;
  }, [launchGuides, search, categoryFilter, planFilter, timeFilter]);

  const grouped = useMemo(() => {
    const map = new Map<CuratedCategory, PhotoGuide[]>();
    for (const g of filtered) {
      if (!g.curatedCategory) continue;
      const arr = map.get(g.curatedCategory) ?? [];
      arr.push(g);
      map.set(g.curatedCategory, arr);
    }
    return map;
  }, [filtered]);

  const hasActiveFilters = search.trim() || categoryFilter !== "all" || planFilter !== "all" || timeFilter !== "all";

  function handleUse(guide: PhotoGuide) {
    setPreviewGuide(null);
    trackEvent("guide_used", { guide_id: guide.id, guide_name: guide.name, source: "library" });
    navigate(`/requests/new?guide=${guide.id}`);
    toast.success(`Starting a new request from "${guide.name}"`);
  }
  function handleCustomize(guide: PhotoGuide) {
    setPreviewGuide(null);
    trackEvent("guide_viewed", { guide_id: guide.id, guide_name: guide.name, source: "library" });
    navigate(`/guides/${guide.id}`);
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setPlanFilter("all");
    setTimeFilter("all");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guide library"
        description="Find the right guide for your next request."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowInternal((v) => !v)}
            >
              {showInternal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{showInternal ? "Hide internal" : "Internal"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                if (!canAiGuides) {
                  toast.error("AI Guide Generator is on Pro", {
                    description: "Upgrade to draft guides with AI.",
                  });
                  return;
                }
                setAiOpen(true);
              }}
            >
              <Sparkles className="h-3.5 w-3.5" /> Draft with AI
              {!canAiGuides ? <PlanTag plan="pro" className="ml-1" /> : null}
            </Button>
            {canCustomGuides ? (
              <Button asChild className="gap-1.5">
                <NavLink to="/guides/new">
                  <Plus className="h-4 w-4" /> New guide
                </NavLink>
              </Button>
            ) : (
              <Button
                className="gap-1.5"
                onClick={() =>
                  toast.error("Custom guides are on Pro", {
                    description: "Upgrade to build your own.",
                  })
                }
              >
                <Plus className="h-4 w-4" /> New guide
                <PlanTag plan="pro" className="ml-1 bg-white/15 text-primary-foreground" />
              </Button>
            )}
          </div>
        }
      />

      {/* Search + filter bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search guides by name, category, or use case…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3 text-xs">
            <span className="font-medium text-muted-foreground mr-1">Category:</span>
            <FilterChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>All</FilterChip>
            {curatedCategories.map((c) => (
              <FilterChip
                key={c.id}
                active={categoryFilter === c.id}
                onClick={() => setCategoryFilter(c.id)}
              >
                {c.label.split(" & ")[0]}
              </FilterChip>
            ))}

            <span className="ml-3 font-medium text-muted-foreground mr-1">Plan:</span>
            {planFilters.map((p) => (
              <FilterChip
                key={p.value}
                active={planFilter === p.value}
                onClick={() => setPlanFilter(p.value as Plan | "all")}
              >
                {p.label}
              </FilterChip>
            ))}

            <span className="ml-3 font-medium text-muted-foreground mr-1">Time:</span>
            <FilterChip active={timeFilter === "all"} onClick={() => setTimeFilter("all")}>Any</FilterChip>
            {timeFilters.map((t) => (
              <FilterChip key={t.value} active={timeFilter === t.value} onClick={() => setTimeFilter(t.value)}>
                {t.label}
              </FilterChip>
            ))}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="ml-auto gap-1 text-xs" onClick={clearFilters}>
                <X className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {!canCustomGuides ? <UpgradePromptCard feature="custom_guides" variant="inline" /> : null}

      {/* Recommended for you */}
      {!hasActiveFilters && recommended.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Star className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Recommended for you</h2>
              <p className="text-xs text-muted-foreground">
                Based on your industry — start here for the fastest results.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((g) => (
              <GuideCard
                key={g.id}
                guide={g}
                onUse={handleUse}
                onPreview={setPreviewGuide}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        </section>
      )}

      {/* Workspace custom guides */}
      {workspaceGuides.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Your guides</h2>
              <p className="text-xs text-muted-foreground">Custom guides built by your team.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaceGuides.map((g) => (
              <GuideCard
                key={g.id}
                guide={g}
                onUse={handleUse}
                onPreview={setPreviewGuide}
                onCustomize={handleCustomize}
              />
            ))}
          </div>
        </section>
      )}

      {/* All guides grouped by category */}
      {curatedCategories.map((cat) => {
        const guides = grouped.get(cat.id) ?? [];
        if (guides.length === 0) return null;
        const Icon = iconMap[cat.icon];
        return (
          <section key={cat.id} className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-accent p-2 text-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{cat.label}</h2>
                <p className="text-xs text-muted-foreground">{cat.blurb}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <GuideCard
                  key={g.id}
                  guide={g}
                  onUse={handleUse}
                  onPreview={setPreviewGuide}
                  onCustomize={handleCustomize}
                />
              ))}
            </div>
          </section>
        );
      })}

      {hasActiveFilters && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">No guides match your filters.</p>
          <Button variant="link" className="mt-2" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}

      {/* Internal templates */}
      {showInternal && (
        <section className="space-y-4 rounded-lg border border-dashed bg-muted/20 p-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Internal templates</h2>
            <p className="text-xs text-muted-foreground">
              Raw entries from the Template Directory workbook. Not shown to customers.
            </p>
          </div>
          <ul className="divide-y rounded-md border bg-card">
            {internalGuides.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{g.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {g.category} · {g.steps.length} steps
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="ghost" onClick={() => setPreviewGuide(g)}>
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleCustomize(g)}>
                    Curate
                  </Button>
                </div>
              </li>
            ))}
            {internalGuides.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                Nothing left in the backlog — every template has been curated.
              </li>
            )}
          </ul>
        </section>
      )}

      <GuidePreviewDialog
        guide={previewGuide}
        open={previewGuide !== null}
        onOpenChange={(o) => !o && setPreviewGuide(null)}
        onUse={handleUse}
        onCustomize={handleCustomize}
      />

      <AIGuideGeneratorDialog open={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-medium transition",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}
