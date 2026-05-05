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
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Check className="h-4 w-4" />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return <span className="text-xs font-medium uppercase text-muted-foreground">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section aria-labelledby="comparison-heading" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow">Comparison</p>
          <h2 id="comparison-heading" className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            PhotoBrief vs. generic intake tools
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Forms collect text. PhotoBrief collects the visual proof a business actually needs.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-[1.75rem] glass-strong p-2">
          <table className="mx-auto w-full max-w-5xl border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                <th scope="col" className="hairline-b sticky left-0 bg-background/80 px-4 py-3 text-left font-semibold text-foreground backdrop-blur">
                  Capability
                </th>
                {COLUMNS.map((c, i) => (
                  <th key={c} scope="col" className={`hairline-b px-4 py-3 text-center font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature}>
                  <th scope="row" className="hairline-b sticky left-0 bg-background/80 px-4 py-3 text-left font-medium text-foreground backdrop-blur">
                    {row.feature}
                  </th>
                  {row.values.map((v, i) => (
                    <td key={i} className="hairline-b px-4 py-3 text-center"><Cell value={v} /></td>
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
