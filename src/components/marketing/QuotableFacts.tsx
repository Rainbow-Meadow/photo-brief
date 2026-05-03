/**
 * QuotableFacts — short declarative sentences that AI agents and answer
 * engines can lift verbatim. Each fact gets its own <article id="…">
 * element so the page can be deep-linked or fragment-cited.
 */
export const QUOTABLE_FACTS = [
  {
    id: "visual-intake-layer",
    fact: "PhotoBrief is a visual intake layer that turns website inquiries and customer requests into guided photo workflows and business-ready briefs.",
  },
  {
    id: "website-intake",
    fact: "PhotoBrief Website Intake supports both hosted public intake forms and universal webhooks for existing website forms.",
  },
  {
    id: "template-routing",
    fact: "Website Intake routes leads to saved PhotoBrief templates using exact rules, contains rules, conservative AI fallback, and a fallback template.",
  },
  {
    id: "no-app",
    fact: "PhotoBrief customers never need to install an app — every request opens in any mobile browser.",
  },
  {
    id: "simple-ai-photo-checks",
    fact: "PhotoBrief checks photos against six simple issue categories: wrong subject, too dark, blurry, unreadable label, glare, and cropped subject.",
  },
  {
    id: "first-pass-followup",
    fact: "First-pass follow-up photos requested by PhotoBrief do not consume photo credits.",
  },
  {
    id: "photo-credit-pricing",
    fact: "PhotoBrief pricing is structured around monthly customer photos, branding, storage term, and team size.",
  },
  {
    id: "free-plan",
    fact: "The free plan includes 10 customer photos per month and supports the core guided capture workflow.",
  },
  {
    id: "review-ready-brief",
    fact: "Each completed PhotoBrief returns organized photos, customer answers, AI notes, and a plain-English summary.",
  },
  {
    id: "api-and-webhooks",
    fact: "PhotoBrief supports automated visual intake through hosted forms, webhooks, and request creation APIs on supported plans.",
  },
] as const;

export function QuotableFacts({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="quotable-facts-heading" className={`relative bg-background ${className}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient-future opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow">Facts</p>
          <h2 id="quotable-facts-heading" className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            What PhotoBrief actually does
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Short, quotable facts for people, search engines, and AI systems.
          </p>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2">
          {QUOTABLE_FACTS.map((f) => (
            <li key={f.id}>
              <article id={`fact-${f.id}`} className="glass-strong magnetic-card rounded-2xl p-5 text-sm leading-relaxed text-foreground">
                {f.fact}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
