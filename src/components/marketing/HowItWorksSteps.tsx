import { Camera, Globe2, Route, Sparkles } from "lucide-react";

export const howItWorksSteps = [
  {
    icon: Globe2,
    title: "A customer asks for help",
    body: "Use PhotoBrief's hosted intake form or connect your existing website form with a webhook.",
  },
  {
    icon: Route,
    title: "PhotoBrief chooses the right template",
    body: "Your routing rules and fallback template turn each lead into the right photo request automatically.",
  },
  {
    icon: Camera,
    title: "The customer captures what matters",
    body: "They open a simple mobile workflow, take one photo at a time, and get clear feedback before sending.",
  },
  {
    icon: Sparkles,
    title: "You get a job-ready brief",
    body: "Photos, answers, AI checks, and a plain-English summary arrive organized and ready to quote, dispatch, or review.",
  },
];

export function HowItWorksSteps() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-70" />
      <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-eyebrow">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            From messy website lead to complete visual brief.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            The old way is contact form → email → "can you send a few photos?" PhotoBrief makes the first contact do the work.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {howItWorksSteps.map((s, i) => (
            <article key={s.title} className="glass-strong magnetic-card relative overflow-hidden rounded-[2rem] p-6 sm:p-7">
              <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30 blur-xl" />
              <div className="flex items-center justify-between gap-3">
                <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <s.icon className="h-5 w-5" />
                  <span aria-hidden className="lens-ring absolute -inset-1 rounded-full opacity-60" />
                </span>
                <span className="text-eyebrow tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
