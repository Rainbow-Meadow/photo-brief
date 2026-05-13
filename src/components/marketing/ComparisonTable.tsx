import { Check, Minus } from "lucide-react";
import { Section, Container } from "@/design-system/schema";

const COLUMNS = ["PhotoBrief", "Generic contact form", "Email back-and-forth", "File upload portal"] as const;

const ROWS: Array<{ feature: string; values: Array<boolean | string> }> = [
  { feature: "Reads your website to build intake", values: [true, false, false, false] },
  { feature: "Different questions per service", values: [true, false, false, false] },
  { feature: "Decides when photos are needed", values: [true, false, false, false] },
  { feature: "Mobile-first guided customer flow", values: [true, false, false, "partial"] },
  { feature: "Routes leads to the right template", values: [true, false, false, false] },
  { feature: "Returns a quote-ready brief, not a folder", values: [true, false, false, false] },
  { feature: "First-pass photo retakes are free", values: [true, false, false, false] },
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
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="pb-eyebrow">Comparison</span>
          <h2 id="comparison-heading" className="pb-section-title mt-4 text-white">
            PhotoBrief vs. the form on your site today
          </h2>
          <p className="pb-copy mt-4 text-base">
            Forms collect text. Portals collect files. PhotoBrief reads your site and builds intake that actually decides what to ask.
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
      </Container>
    </Section>
  );
}
