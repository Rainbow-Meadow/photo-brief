import { RiseIn } from "@/components/motion/RiseIn";

import researchMagnifierIllo from "@/assets/rmbc/cedar/01-research-website-analysis.png";
import mechanismGearsIllo from "@/assets/rmbc/cedar/02-capture-phone-viewfinder.png";
import briefPacketIllo from "@/assets/rmbc/cedar/03-brief-packet.png";
import methodOverviewIllo from "@/assets/rmbc/cedar/04-close-gmail-quote.png";

export const workflowSteps = [
  {
    n: "01",
    title: "Research",
    body: "We scan your site, your trade, and the photos your estimators actually need. The ones that kill callbacks.",
    illo: researchMagnifierIllo,
  },
  {
    n: "02",
    title: "Mechanism",
    body: "The customer taps a link. The camera opens at the right angle. The right shot lands. No app, no login, no thinking.",
    illo: mechanismGearsIllo,
  },
  {
    n: "03",
    title: "Brief",
    body: "Photos, notes, and address arrive as one packet — formatted for your inbox, your CRM, and the person writing the quote.",
    illo: briefPacketIllo,
  },
  {
    n: "04",
    title: "Close",
    body: "Your team quotes on the first reply. The lead doesn't cool. The job moves.",
    illo: methodOverviewIllo,
  },
];

export function MechanismGrid() {
  return (
    <div className="space-y-16 lg:space-y-24">
      {workflowSteps.map((step, i) => {
        const flipped = i % 2 === 1;
        return (
          <RiseIn key={step.n} delay={i * 0.05}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              {/* Image */}
              <div
                className={`lg:col-span-7 ${flipped ? "lg:order-2" : "lg:order-1"}`}
              >
                <div className="aspect-[16/10] w-full">
                  <img
                    src={step.illo}
                    alt=""
                    className="h-full w-full object-contain"
                    loading="lazy"
                    width={1600}
                    height={1000}
                  />
                </div>
              </div>

              {/* Copy */}
              <div
                className={`lg:col-span-5 ${flipped ? "lg:order-1" : "lg:order-2"}`}
              >
                <div className="flex items-baseline justify-between border-b border-border pb-3">
                  <span className="ls-numeral">{step.n}</span>
                  <span className="ls-numeral text-foreground/40">04</span>
                </div>
                <h3 className="ls-h2 mt-6">{step.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </div>
          </RiseIn>
        );
      })}
    </div>
  );
}
