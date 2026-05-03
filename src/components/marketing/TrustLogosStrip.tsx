import { Globe2, Lock, Route, ShieldCheck } from "lucide-react";

const SIGNALS = [
  {
    icon: Globe2,
    label: "Hosted intake or webhook",
    detail: "Use PhotoBrief's form link, or connect the form your website already has.",
  },
  {
    icon: Route,
    label: "Mapped to your templates",
    detail: "Rules, conservative AI fallback, and a default template keep intake moving.",
  },
  {
    icon: ShieldCheck,
    label: "Follow-up photos are free",
    detail: "If a first-pass retake is needed, it does not consume photo credits.",
  },
  {
    icon: Lock,
    label: "Customer media stays yours",
    detail: "Workspace-scoped storage. Customer photos are never used to train external models.",
  },
] as const;

export function TrustLogosStrip() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-center text-eyebrow">The new intake layer for small business</p>
        <div className="mx-auto mt-6 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SIGNALS.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="glass magnetic-card flex items-start gap-3 rounded-2xl px-4 py-4 text-left">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
