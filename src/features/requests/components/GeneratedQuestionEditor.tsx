import { ChevronDown, ChevronUp, Trash2, Plus, MessageCircleQuestion } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ContextQuestion, ContextQuestionInputType } from "@/types/photobrief";

const INPUT_TYPES: { value: ContextQuestionInputType; label: string }[] = [
  { value: "short_text", label: "Short answer" },
  { value: "long_text", label: "Long answer" },
  { value: "yes_no", label: "Yes / no" },
  { value: "single_select", label: "Pick one" },
  { value: "multi_select", label: "Pick multiple" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
];

interface GeneratedQuestionEditorProps {
  questions: ContextQuestion[];
  onChange: (questions: ContextQuestion[]) => void;
}

function defaultQuestion(index: number): ContextQuestion {
  return {
    id: `q_${Date.now()}_${index}`,
    orderIndex: index,
    prompt: "Question for the customer",
    inputType: "short_text",
    required: false,
  };
}

export function GeneratedQuestionEditor({ questions, onChange }: GeneratedQuestionEditorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const update = (idx: number, patch: Partial<ContextQuestion>) => {
    onChange(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };
  const remove = (idx: number) => {
    onChange(questions.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i })));
  };
  const add = () => {
    const next = defaultQuestion(questions.length);
    onChange([...questions, next]);
    setExpanded((prev) => ({ ...prev, [next.id]: true }));
  };

  return (
    <div className="space-y-3">
      {questions.length === 0 ? (
        <button
          type="button"
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed bg-background p-5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <MessageCircleQuestion className="h-4 w-4" /> Add a question only if photos are not enough
        </button>
      ) : null}

      {questions.map((q, idx) => {
        const isExpanded = expanded[q.id] ?? idx === questions.length - 1;
        const type = INPUT_TYPES.find((t) => t.value === q.inputType)?.label ?? "Short answer";
        return (
          <div key={q.id} className="rounded-[0.25rem] border bg-background p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                Q{idx + 1}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    What else should the customer answer?
                  </Label>
                  <Input
                    value={q.prompt}
                    onChange={(e) => update(idx, { prompt: e.target.value })}
                    placeholder="e.g. When did the issue start?"
                    className="h-10 text-sm"
                  />
                </div>

                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !isExpanded }))}
                >
                  {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {isExpanded ? "Hide options" : `Options: ${type}${q.required ? " · required" : " · optional"}`}
                </button>

                {isExpanded ? (
                  <div className="grid gap-3 rounded-xl bg-muted/40 p-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Answer type</Label>
                      <Select
                        value={q.inputType}
                        onValueChange={(v) => update(idx, { inputType: v as ContextQuestionInputType })}
                      >
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {INPUT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value} className="text-xs">
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 self-end pb-2">
                      <Switch
                        id={`qreq-${q.id}`}
                        checked={q.required}
                        onCheckedChange={(v) => update(idx, { required: v })}
                      />
                      <Label htmlFor={`qreq-${q.id}`} className="text-xs text-muted-foreground">
                        Required
                      </Label>
                    </div>
                    {(q.inputType === "single_select" || q.inputType === "multi_select") && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs text-muted-foreground">Choices</Label>
                        <Input
                          value={(q.options ?? []).join(", ")}
                          onChange={(e) =>
                            update(idx, {
                              options: e.target.value
                                .split(",")
                                .map((o) => o.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Comma-separated options"
                          className="h-9 text-xs"
                        />
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => remove(idx)}
                aria-label="Remove question"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}

      {questions.length > 0 ? (
        <Button type="button" variant="outline" className="w-full gap-1.5 rounded-xl border-dashed" onClick={add}>
          <Plus className="h-4 w-4" /> Add another question
        </Button>
      ) : null}
    </div>
  );
}
