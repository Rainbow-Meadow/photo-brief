import { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface DiagnosticsField {
  label: string;
  value: string | number | boolean | null | undefined;
}

interface DiagnosticsPanelProps {
  /** Error code (e.g. "PB-425") shown prominently and copied with the payload. */
  code?: string;
  fields: DiagnosticsField[];
  /** Optional title (defaults to "Diagnostics"). */
  title?: string;
  className?: string;
  defaultOpen?: boolean;
}

function formatValue(v: DiagnosticsField["value"]): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "yes" : "no";
  return String(v);
}

/**
 * Compact, copy-to-clipboard diagnostics panel for support / debugging.
 * Renders a collapsible card with the error code (if any) and a table of
 * key/value pairs. Clicking "Copy" copies a plain-text payload.
 */
export function DiagnosticsPanel({
  code,
  fields,
  title = "Diagnostics",
  className,
  defaultOpen = false,
}: DiagnosticsPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const payload = [
    code ? `code: ${code}` : null,
    ...fields.map((f) => `${f.label}: ${formatValue(f.value)}`),
  ]
    .filter(Boolean)
    .join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore (e.g. insecure context)
    }
  }

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={`border border-border bg-muted/20 text-left ${className ?? ""}`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground">
          <ChevronDown
            className={`h-3 w-3 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
          />
          <span>{title}</span>
          {code ? (
            <span className="ml-auto rounded-sm bg-background px-1.5 py-0.5 font-mono text-[0.65rem] tracking-[0.12em] text-[hsl(var(--accent-kinetic))]">
              {code}
            </span>
          ) : null}
        </CollapsibleTrigger>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          aria-label="Copy diagnostics"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <CollapsibleContent>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 border-t border-border px-3 py-2 font-mono text-[0.7rem]">
          {fields.map((f) => (
            <div key={f.label} className="contents">
              <dt className="uppercase tracking-[0.14em] text-muted-foreground">{f.label}</dt>
              <dd className="break-all text-foreground">{formatValue(f.value)}</dd>
            </div>
          ))}
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}
