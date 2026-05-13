import { CfImg } from "@/components/shared/CfImg";
import { RiseIn } from "@/components/motion/RiseIn";

import researchMagnifierIllo from "@/assets/rmbc/cedar/01-research-website-analysis.png";
import mechanismGearsIllo from "@/assets/rmbc/cedar/02-capture-phone-viewfinder.png";
import briefPacketIllo from "@/assets/rmbc/cedar/03-brief-packet.png";
import methodOverviewIllo from "@/assets/rmbc/cedar/04-close-gmail-quote.png";

type Orientation = "landscape" | "portrait";

export const workflowSteps: Array<{
  n: string;
  title: string;
  body: string;
  illo: string;
  orientation: Orientation;
}> = [
  {
    n: "01",
    title: "Read your site",
    body: "We crawl every page. Pull every service. In your customers' words — not yours.",
    illo: researchMagnifierIllo,
    orientation: "landscape",
  },
  {
    n: "02",
    title: "Build the routes",
    body: "Each service gets its own path. Its own questions. Its own photo rules.",
    illo: mechanismGearsIllo,
    orientation: "portrait",
  },
  {
    n: "03",
    title: "Guide the lead",
    body: "They tap one button. We pick the route, ask what matters, open the camera only when it helps.",
    illo: briefPacketIllo,
    orientation: "portrait",
  },
  {
    n: "04",
    title: "Quote first",
    body: "One brief lands. Everything you need. Sent before the lead cools off.",
    illo: methodOverviewIllo,
    orientation: "landscape",
  },
];

export function MechanismGrid() {
  return (
    <div className="space-y-12 lg:space-y-16">
      {workflowSteps.map((step, i) => {
        const flipped = i % 2 === 1;
        const isPortrait = step.orientation === "portrait";
        const imageColSpan = isPortrait ? "lg:col-span-5" : "lg:col-span-7";
        const copyColSpan = isPortrait ? "lg:col-span-7" : "lg:col-span-5";
        return (
          <RiseIn key={step.n} delay={i * 0.05}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
              {/* Image — mobile order 2 (after copy), desktop alternates */}
              <div
                className={`${imageColSpan} order-2 ${flipped ? "lg:order-2" : "lg:order-1"} flex items-center justify-center`}
              >
                <CfImg
                  src={step.illo}
                  alt=""
                  className={
                    isPortrait
                      ? "mx-auto h-auto w-auto max-h-[560px] max-w-full object-contain"
                      : "h-auto w-full max-h-[520px] object-contain"
                  }
                  cfWidth={1080}
                  loading="lazy"
                />
              </div>

              {/* Copy — mobile order 1 (first), desktop alternates */}
              <div
                className={`${copyColSpan} order-1 ${flipped ? "lg:order-1" : "lg:order-2"}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--accent-kinetic))] font-mono text-[11px] font-medium tracking-wide text-[hsl(var(--accent-kinetic))]"
                  >
                    {step.n}
                  </span>
                  <h3 className="ls-h3">{step.title}</h3>
                </div>
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
