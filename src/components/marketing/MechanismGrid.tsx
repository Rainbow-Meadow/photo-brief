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
    title: "Read the site",
    body: "PhotoBrief scans your website. It pulls out your services, the way customers describe them, and the questions your current form forgot to ask.",
    illo: researchMagnifierIllo,
    orientation: "landscape",
  },
  {
    n: "02",
    title: "Build the routes",
    body: "Every service gets its own intake route. Its own questions. Its own photo policy — not needed, optional, recommended, or required. Different jobs ask different things, the way it should have been all along.",
    illo: mechanismGearsIllo,
    orientation: "portrait",
  },
  {
    n: "03",
    title: "Guide the customer",
    body: "Your customer hits one CTA. PhotoBrief picks the right route, asks the right questions, and only opens the camera when the route says photos actually move the job. Otherwise they finish and leave.",
    illo: briefPacketIllo,
    orientation: "portrait",
  },
  {
    n: "04",
    title: "Hand you a brief",
    body: "One brief lands in your inbox: who, what, which route, what they answered, photos in or still pending, how ready it is, and what to do next. You quote on the first reply.",
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
                <img
                  src={step.illo}
                  alt=""
                  className={
                    isPortrait
                      ? "mx-auto h-auto w-auto max-h-[560px] max-w-full object-contain"
                      : "h-auto w-full max-h-[520px] object-contain"
                  }
                  loading="lazy"
                />
              </div>

              {/* Copy — mobile order 1 (first), desktop alternates */}
              <div
                className={`${copyColSpan} order-1 ${flipped ? "lg:order-1" : "lg:order-2"}`}
              >
                <div
                  aria-hidden="true"
                  className="font-display text-7xl leading-none tracking-tight text-foreground/15 lg:text-8xl"
                >
                  {step.n}
                </div>
                <h3 className="ls-h2 mt-4 border-t border-border pt-6">{step.title}</h3>
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
