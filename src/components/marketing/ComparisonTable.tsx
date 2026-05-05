import { Check, Minus } from "lucide-react";

const COLUMNS = ["PhotoBrief", "Email back-and-forth", "Generic form", "File upload portal"] as const;

const ROWS: Array<{ feature: string; values: Array<boolean | string> }> = [
  { feature: "Hosted website intake form", values: [true, false, false, false] },
  { feature: "Existing-form webhook", values: [true, false, "partial", "partial"] },
  { feature: "Routes leads to saved templates", values: [true, false, false, false] },
  { feature: "Mobile-first customer photo workflow", values: [true, false, "partial", "partial"] },
  { feature: "Simple AI photo feedback", values: [true, false, false, false] },
  { feature: "First-pass follow-up photos are free", values: [true, false, false, false] },
  { feature: "Business-ready summary", values: [true, false, false, false] },
  { feature: "Customer profiles and request history", values: [true, false, "partial", "partial"] },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--pb-mint)/0.12)] text-[hsl(var(--pb-mint))]">
        <Check className="h-4 w-4" />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-white/30">
        <Minus className="h-4 w-4" />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return <span className="text-xs font-medium uppercase text-[hsl(var(--pb-muted))]">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section aria-labelledby="comparison-heading" className="pb-section">
      <div className="pb-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="pb-eyebrow">Comparison</span>
          <h2 id="comparison-heading" className="pb-section-title mt-4 text-white">
            PhotoBrief vs. generic intake tools
          </h2>
          <p className="pb-copy mt-4 text-base">
            Forms collect text. PhotoBrief collects the visual proof a business actually needs.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-[1.75rem] pb-command-panel p-2">
          <table className="relative z-10 mx-auto w-full max-w-5xl border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className="border-b border-white/10 sticky left-0 bg-[hsl(var(--pb-panel))] px-4 py-3 text-left font-semibold text-white backdrop-blur">
                  Capability
                </th>
                {COLUMNS.map((c, i) => (
                  <th key={c} scope="col" className={`border-b border-white/10 px-4 py-3 text-center font-semibold ${i === 0 ? "text-[hsl(var(--pb-lavender))]" : "text-white"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature}>
                  <th scope="row" className="border-b border-white/10 sticky left-0 bg-[hsl(var(--pb-panel))] px-4 py-3 text-left font-medium text-white backdrop-blur">
                    {row.feature}
                  </th>
                  {row.values.map((v, i) => (
                    <td key={i} className="border-b border-white/10 px-4 py-3 text-center"><Cell value={v} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
