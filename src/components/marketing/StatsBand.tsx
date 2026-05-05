const stats = [
  { value: "1", label: "Link starts the customer photo workflow" },
  { value: "5 min", label: "Target customer completion experience" },
  { value: "6", label: "Simple AI issue categories, not noisy diagnostics" },
  { value: "0", label: "Credits used for first-pass follow-up photos" },
];

export function StatsBand() {
  return (
    <section className="relative overflow-hidden text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-radial-glow" />
      <div aria-hidden className="future-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow text-white/60">Product model</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Built for the fastest path from request to usable photos.
          </h2>
          <p className="mt-4 text-white/75">
            No bloated workflow builder. No customer account. No mystery upload folder. Just one clear path from “I need photos” to “here is the brief.”
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-onDark magnetic-card rounded-[1.75rem] p-6 text-center">
              <div className="text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">{s.value}</div>
              <p className="mt-3 text-sm leading-6 text-white/75">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
