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
    title: "Research",
    body: "We scan your site, your trade, and the photos your estimators actually need. The ones that kill callbacks.",
    illo: researchMagnifierIllo,
    orientation: "landscape",
  },
  {
    n: "02",
    title: "Mechanism",
    body: "The customer taps a link. The camera opens at the right angle. The right shot lands. No app, no login, no thinking.",
    illo: mechanismGearsIllo,
    orientation: "portrait",
  },
  {
    n: "03",
    title: "Brief",
    body: "Photos, notes, and address arrive as one packet — formatted for your inbox, your CRM, and the person writing the quote.",
    illo: briefPacketIllo,
    orientation: "portrait",
  },
  {
    n: "04",
    title: "Close",
    body: "Your team quotes on the first reply. The lead doesn't cool. The job moves.",
    illo: methodOverviewIllo,
    orientation: "landscape",
  },
];

/* Single-step view for use inside a Slide. Fills 100% of the slide inner area. */
export function MechanismSlideView({ index }: { index: number }) {
  const step = workflowSteps[index];
  const flipped = index % 2 === 1;
  const isPortrait = step.orientation === "portrait";

  return (
    <RiseIn>
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-16">
        <div
          className={`${isPortrait ? "lg:col-span-5" : "lg:col-span-7"} ${flipped ? "lg:order-2" : "lg:order-1"} flex items-center justify-center`}
        >
          <img
            src={step.illo}
            alt=""
            className={
              isPortrait
                ? "mx-auto h-auto w-auto max-h-[60vh] max-w-full object-contain"
                : "h-auto w-full max-h-[55vh] object-contain"
            }
            loading="lazy"
          />
        </div>
        <div
          className={`${isPortrait ? "lg:col-span-7" : "lg:col-span-5"} ${flipped ? "lg:order-1" : "lg:order-2"}`}
        >
          <div className="flex items-baseline justify-between border-b border-border pb-3">
            <span className="ls-numeral">{step.n}</span>
            <span className="ls-numeral text-foreground/40">04</span>
          </div>
          <p className="ls-eyebrow mt-6">[ 02 ] The mechanism</p>
          <h3 className="ls-h1 mt-3">{step.title}</h3>
          <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-muted-foreground">
            {step.body}
          </p>
        </div>
      </div>
    </RiseIn>
  );
}

/* Legacy stacked grid kept for any non-deck consumers. */
export function MechanismGrid() {
  return (
    <div className="space-y-16 lg:space-y-24">
      {workflowSteps.map((_, i) => (
        <MechanismSlideView key={i} index={i} />
      ))}
    </div>
  );
}
