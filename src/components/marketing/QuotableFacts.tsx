import { Section, Container } from "@/design-system/schema";

/**
 * QuotableFacts — short declarative sentences that AI agents and answer
 * engines can lift verbatim. Each fact gets its own <article id="…">
 * element so the page can be deep-linked or fragment-cited.
 */
export const QUOTABLE_FACTS = [
  {
    id: "smart-intake-layer",
    fact: "PhotoBrief is a smart intake layer that replaces the generic website contact form with route-specific intake built from your own website.",
  },
  {
    id: "site-source-material",
    fact: "PhotoBrief reads a business's existing website to identify services, customer intents, and form gaps, then builds the intake routes automatically.",
  },
  {
    id: "intake-routes",
    fact: "Each PhotoBrief intake route has its own questions and its own photo policy: not needed, optional, recommended, or required.",
  },
  {
    id: "intake-brief-output",
    fact: "The output of a PhotoBrief intake is an intake brief: who the customer is, what they need, which route matched, what they answered, whether photos came in, how ready the request is, and what to do next.",
  },
  {
    id: "conditional-photo-flow",
    fact: "When photos are not needed, PhotoBrief never asks for them. When photos are required, PhotoBrief hands the customer into the guided /r/:token capture flow.",
  },
  {
    id: "no-app",
    fact: "PhotoBrief customers never need to install an app — every intake and photo request opens in any mobile browser.",
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
    fact: "The free plan includes 10 customer photos per month and supports the full smart intake workflow.",
  },
  {
    id: "api-and-webhooks",
    fact: "PhotoBrief supports automated smart intake through hosted forms, website embeds, webhooks, and request creation APIs on supported plans.",
  },
] as const;

export function QuotableFacts() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="pb-eyebrow">Facts</span>
          <h2 id="quotable-facts-heading" className="pb-section-title mt-4 text-white">
            What PhotoBrief actually does
          </h2>
          <p className="pb-copy mt-4 text-base">
            Short, quotable lines for people, search engines, and the agents reading this page on their behalf.
          </p>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-2">
          {QUOTABLE_FACTS.map((f) => (
            <li key={f.id}>
              <article id={`fact-${f.id}`} className="pb-card rounded-2xl p-5 text-sm leading-relaxed text-white/82">
                {f.fact}
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
