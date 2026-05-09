import { Camera, MessageCircleQuestion, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PhotoGuide } from "@/types/photobrief";

interface TemplatePickerProps {
  guides: PhotoGuide[];
  selectedGuideId?: string;
  onSelect: (guide: PhotoGuide) => void;
}

/** Saved workspace template picker. No built-in catalog. */
export function TemplatePicker({ guides, selectedGuideId, onSelect }: TemplatePickerProps) {
  if (guides.length === 0) {
    return (
      <div className="rounded-[0.25rem] border border-dashed bg-card/60 p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Plus className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">No saved templates yet</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
          Create a request from scratch, then save it as a template when you like it — or build one now.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-4 gap-1.5">
          <NavLink to="/guides/new">
            <Plus className="h-4 w-4" /> Build a template
          </NavLink>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {guides.map((g) => {
        const active = selectedGuideId === g.id;
        return (
          <button
            key={g.id}
            type="button"
            onClick={() => onSelect(g)}
            className={cn(
              "flex flex-col gap-2 rounded-[0.25rem] border bg-card p-4 text-left transition hover:shadow-elev-sm",
              active ? "border-primary ring-2 ring-primary/30" : "border-border",
            )}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{g.name}</p>
              {g.description ? <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{g.description}</p> : null}
            </div>
            <div className="mt-auto flex items-center gap-3 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" /> {g.steps.length} photo{g.steps.length === 1 ? "" : "s"}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircleQuestion className="h-3.5 w-3.5" /> {g.questions.length} question
                {g.questions.length === 1 ? "" : "s"}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
