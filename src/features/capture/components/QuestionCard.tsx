import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { ContextQuestion } from "@/types/photobrief";

interface QuestionCardProps {
  question: ContextQuestion;
  onAnswer: (answer: string) => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [value, setValue] = useState<string>("");
  const [multi, setMulti] = useState<string[]>([]);

  const submit = (val?: string) => {
    const out = val ?? (question.inputType === "multi_select" ? multi.join(", ") : value);
    if (!out.trim()) return;
    onAnswer(out);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      <Label className="text-base font-semibold leading-relaxed text-foreground">
        {question.prompt}
      </Label>

      {question.inputType === "short_text" && (
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer"
          className="h-12 rounded-xl text-base"
        />
      )}

      {question.inputType === "long_text" && (
        <Textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer"
          rows={3}
          className="rounded-xl text-base"
        />
      )}

      {question.inputType === "number" && (
        <Input
          autoFocus
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className="h-12 rounded-xl text-base"
        />
      )}

      {question.inputType === "single_select" && (
        <div className="flex flex-col gap-2.5">
          {(question.options ?? []).map((opt) => (
            <Button
              key={opt}
              type="button"
              variant={value === opt ? "default" : "outline"}
              className="h-12 w-full justify-start rounded-xl text-base font-medium"
              onClick={() => {
                setValue(opt);
                submit(opt);
              }}
            >
              {opt}
            </Button>
          ))}
        </div>
      )}

      {question.inputType === "multi_select" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2.5">
            {(question.options ?? []).map((opt) => {
              const active = multi.includes(opt);
              return (
                <Button
                  key={opt}
                  type="button"
                  variant={active ? "default" : "outline"}
                  className="h-12 w-full justify-start rounded-xl text-base font-medium"
                  onClick={() =>
                    setMulti((prev) =>
                      active ? prev.filter((o) => o !== opt) : [...prev, opt],
                    )
                  }
                >
                  {opt}
                </Button>
              );
            })}
          </div>
          <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={multi.length === 0}>
            Continue
          </Button>
        </div>
      )}

      {(question.inputType === "short_text" ||
        question.inputType === "long_text" ||
        question.inputType === "number") && (
        <Button type="submit" className="h-12 w-full rounded-xl text-base" disabled={!value.trim()}>
          Continue
        </Button>
      )}
    </form>
  );
}
