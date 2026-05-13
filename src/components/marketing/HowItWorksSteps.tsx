import { Camera, ClipboardList, Link2, Sparkles } from "lucide-react";
import { Section, Container } from "@/design-system/schema";

export const howItWorksSteps = [
  {
    icon: Link2,
    title: "Read your website",
    body: "Point PhotoBrief at your URL. We scan your services, your customer intents, and the gaps your current form leaves wide open.",
  },
  {
    icon: ClipboardList,
    title: "Build the routes",
    body: "Every service gets its own intake route — its own questions, its own photo policy. No more one form for every job.",
  },
  {
    icon: Camera,
    title: "Guide the customer",
    body: "Your customer answers a short, route-specific flow. Photos only show up when the route says they earn their keep.",
  },
  {
    icon: Sparkles,
    title: "Hand back a brief",
    body: "Who they are. What they need. Which route matched. What they answered. Photos in or still pending. What you should do next.",
  },
];

export function HowItWorksSteps() {
  return (
    <Section tone="dark" id="how-it-works">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <span className="pb-eyebrow">How it works</span>
          <h2 className="pb-section-title mt-4 text-white">
            From website CTA to a brief you can act on.
          </h2>
          <p className="pb-copy mx-auto mt-4 max-w-2xl text-base sm:text-lg">
            The old way is contact form → email → "what service did you mean?" PhotoBrief reads your site, builds the routes, and asks the right questions for you.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {howItWorksSteps.map((s, i) => (
            <article key={s.title} className="pb-card relative overflow-hidden rounded-[2rem] p-6 sm:p-7">
              <span aria-hidden className="animate-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-white/30 blur-xl" />
              <div className="flex items-center justify-between gap-3">
                <span className="pb-icon-badge-lg relative inline-flex items-center justify-center">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="pb-eyebrow tabular-nums">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="pb-body mt-2">{s.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
