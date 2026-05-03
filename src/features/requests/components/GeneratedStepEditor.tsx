import { ChevronDown, ChevronUp, Trash2, Plus, Camera } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GuideStep, ShotType } from "@/types/photobrief";
import { createDefaultStep } from "@/types/requestDraft";
import { cn } from "@/lib/utils";

const SHOT_TYPES: { value: ShotType; label: string; hint: string }[] = [
  { value: "photo", label: "Photo", hint: "Default for most requests" },
  { value: "wide", label: "Wide shot", hint: "Whole area or object" },
  { value: "close_up", label: "Close-up", hint: "Detail, damage, issue" },
  { value: "label", label: "Label", hint: "Model, serial, sticker" },
  { value: "document", label: "Document", hint: "Receipt, form, paperwork" },
];

interface GeneratedStepEditorProps {
  steps: GuideStep[];
  onChange: (steps: GuideStep[]) => void;
  compact?: boolean;
}

/**
 * Additive photo-step editor. Starts simple: one plain-language photo prompt.
 * Advanced details stay tucked away until the business needs them.
 */
export function GeneratedStepEditor({ steps, onChange, compact = false }: GeneratedStepEditorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const update = (idx: number, patch: Partial<GuideStep>) => {
    onChange(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };
  const remove = (idx: number) => {
    const next = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, orderIndex: i }));
    onChange(next.length > 0 ? next : [createDefaultStep(0)]);
  };
  const add = () => {
    const next = createDefaultStep(steps.length);
    onChange([...steps, next]);
    setExpanded((prev) => ({ ...prev, [next.id]: true }));
  };
  const move = (idx: number, direction: -1 | 1) => {
    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= steps.length) return;
    const next = [...steps];
    [next[idx], next[nextIdx]] = [next[nextIdx], next[idx]];
    onChange(next.map((s, i) => ({ ...s, orderIndex: i })));
  };

  return (
    <div className="space-y-3">
      {steps.map((s, idx) => {
        const isExpanded = expanded[s.id] ?? idx === steps.length - 1;
        const type = SHOT_TYPES.find((t) => t.value === s.shotType) ?? SHOT_TYPES[0];
        return (
          <div key={s.id} className="rounded-2xl border bg-background p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {idx + 1}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    What photo do you need?
                  </Label>
                  <Input
                    value={s.title}
                    onChange={(e) => update(idx, { title: e.target.value })}
                    placeholder="e.g. A wide photo of the damaged area"
                    className="h-10 text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Helpful instructions for the customer
                  </Label>
                  <Textarea
                    value={s.instructions}
                    onChange={(e) => update(idx, { instructions: e.target.value })}
                    rows={compact ? 2 : 3}
                    placeholder="e.g. Step back far enough to show the full area. Make sure the photo is well lit."
                    className="text-sm"
                  />
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  onClick={() => setExpanded((prev) => ({ ...prev, [s.id]: !isExpanded }))}
                >
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {isExpanded ? "Hide options" : `Options: ${type.label}${s.required ? " · required" : " · optional"}`}
                </button>

                {isExpanded ? (
                  <div className="grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Photo type</Label>
                      <Select
                        value={s.shotType}
                        onValueChange={(v) => update(idx, { shotType: v as ShotType })}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SHOT_TYPES.map((st) => (
                            <SelectItem key={st.value} value={st.value} className="text-xs">
                              <div>
                                <div>{st.label}</div>
                                <div className="text-[10px] text-muted-foreground">{st.hint}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 self-end pb-2">
                      <Switch
                        id={`req-${s.id}`}
                        checked={s.required}
                        onCheckedChange={(v) => update(idx, { required: v })}
                      />
                      <Label htmlFor={`req-${s.id}`} className="text-xs text-muted-foreground">
                        Required
                      </Label>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  aria-label="Move step up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => move(idx, 1)}
                  disabled={idx === steps.length - 1}
                  aria-label="Move step down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(idx)}
                  aria-label="Remove photo step"
                  className={cn(steps.length === 1 && "opacity-50")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      <Button type="button" variant="outline" className="w-full gap-1.5 rounded-xl border-dashed" onClick={add}>
        <Plus className="h-4 w-4" /> Add another photo
      </Button>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Camera className="h-3.5 w-3.5" /> Keep it simple. Each item becomes one customer photo prompt.
      </p>
    </div>
  );
}
