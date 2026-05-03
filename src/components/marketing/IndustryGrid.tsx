import { Building2, FileText, Home, PackageSearch, Truck, Wrench } from "lucide-react";

const industries = [
  { icon: Truck, title: "Junk removal", outcome: "Quote from volume, access, and item photos before calling back." },
  { icon: Wrench, title: "Repair services", outcome: "Collect model labels, symptoms, and issue photos before dispatch." },
  { icon: Home, title: "Home services", outcome: "Turn website leads into structured service-ready photo briefs." },
  { icon: Building2, title: "Property managers", outcome: "Capture condition, damage, access, and context without email threads." },
  { icon: FileText, title: "Claims & documentation", outcome: "Standardize visual evidence and customer answers in one place." },
  { icon: PackageSearch, title: "Returns & warranty", outcome: "Get label, defect, packaging, and proof photos in one clean workflow." },
];

export function IndustryGrid() {
  return (
    <section id="use-cases" className="relative overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-eyebrow">Use cases</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Any business that asks, “can you send a few photos?”
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            PhotoBrief replaces the back-and-forth with one clean intake flow tailored to the job.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((i) => (
            <article key={i.title} className="group glass-strong magnetic-card rounded-[1.75rem] p-5">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow transition group-hover:scale-105">
                <i.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{i.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{i.outcome}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
