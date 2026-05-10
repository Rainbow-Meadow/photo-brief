import { RiseIn } from "@/components/motion/RiseIn";
import { Card, Grid, Body } from "@/design-system/schema";

import researchMagnifierIllo from "@/assets/rmbc/research-magnifier.png";
import mechanismGearsIllo from "@/assets/rmbc/mechanism-gears.png";
import briefPacketIllo from "@/assets/rmbc/brief-packet.png";
import methodOverviewIllo from "@/assets/rmbc/method-overview.png";

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
    <Grid cols={4} gap="md">
      {workflowSteps.map((step, i) => (
        <RiseIn key={step.n} delay={i * 0.06}>
          <Card>
            <div className="flex items-baseline justify-between">
              <span className="ls-numeral">{step.n}</span>
              <span className="ls-numeral text-foreground/40">04</span>
            </div>
            <div className="mt-6 aspect-square w-full overflow-hidden border border-border bg-muted">
              <img
                src={step.illo}
                alt=""
                className="h-full w-full object-contain p-6 opacity-90"
                loading="lazy"
              />
            </div>
            <h3 className="ls-h3 mt-6">{step.title}</h3>
            <Body size="sm">{step.body}</Body>
          </Card>
        </RiseIn>
      ))}
    </Grid>
  );
}
