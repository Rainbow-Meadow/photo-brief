import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContextQuestion } from "@/types/photobrief";

interface QuestionCardProps {
  question: ContextQuestion;
  onAnswer: (answer: string) => void;
}

const fieldCls =
  "h-12 w-full rounded-none border border-border bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";

const primaryBtn =
  "inline-flex h-12 w-full items-center justify-center gap-2 bg-[hsl(var(--accent-kinetic))] px-5 font-[Geist,Inter,system-ui,sans-serif] text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--primary-foreground))] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--ring))]";

const optionBtn = (active: boolean) =>
  `inline-flex h-12 w-full items-center justify-start gap-2 border px-4 text-left text-[15px] transition ${
    active
      ? "border-[hsl(var(--accent-kinetic))] bg-[hsl(var(--accent-kinetic))]/10 text-foreground"
      : "border-border bg-background text-foreground hover:border-foreground/40"
  }`;

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
      className="space-y-5 border border-border bg-card p-5"
    >
      <div>
        <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
          <span className="text-[hsl(var(--accent-kinetic))]">[ Q ]</span>
          <span>Question</span>
        </p>
        <p className="mt-3 text-base font-semibold leading-relaxed text-foreground">
          {question.prompt}
        </p>
      </div>

      {question.inputType === "short_text" && (
        <Input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer"
          className={fieldCls}
        />
      )}

      {question.inputType === "long_text" && (
        <Textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer"
          rows={3}
          className="w-full rounded-none border border-border bg-background p-3 text-base text-foreground"
        />
      )}

      {question.inputType === "number" && (
        <Input
          autoFocus
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className={fieldCls}
        />
      )}

      {question.inputType === "single_select" && (
        <div className="flex flex-col gap-2">
          {(question.options ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              className={optionBtn(value === opt)}
              onClick={() => {
                setValue(opt);
                submit(opt);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {question.inputType === "multi_select" && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            {(question.options ?? []).map((opt) => {
              const active = multi.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  className={optionBtn(active)}
                  onClick={() =>
                    setMulti((prev) =>
                      active ? prev.filter((o) => o !== opt) : [...prev, opt],
                    )
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <button type="submit" className={primaryBtn} disabled={multi.length === 0}>
            Continue
          </button>
        </div>
      )}

      {(question.inputType === "short_text" ||
        question.inputType === "long_text" ||
        question.inputType === "number") && (
        <button type="submit" className={primaryBtn} disabled={!value.trim()}>
          Continue
        </button>
      )}
    </form>
  );
}
