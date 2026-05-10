import { Wrench, Wind, Leaf, Truck, Calculator } from "lucide-react";
import { RiseIn } from "@/components/motion/RiseIn";
import { Card, Body } from "@/design-system/schema";

import landscaperIllo from "@/assets/trades/landscaper-illustration.png";
import hvacTechIllo from "@/assets/trades/hvac-tech-illustration.png";
import plumberIllo from "@/assets/trades/plumber-illustration.png";
import junkHaulerIllo from "@/assets/trades/junk-hauler-illustration.png";
import estimatorIllo from "@/assets/trades/estimator-illustration.png";

const useCases = [
  { icon: Wrench, label: "Plumbers", note: "Under-sink, shut-off, the exact leak — captured in order.", illo: plumberIllo },
  { icon: Wind, label: "HVAC", note: "Outdoor unit, indoor air-handler, breaker panel — one tap each.", illo: hvacTechIllo },
  { icon: Leaf, label: "Landscapers", note: "Front yard, back yard, slope, side-gate access — drone-free.", illo: landscaperIllo },
  { icon: Truck, label: "Junk haulers", note: "The pile, the path, the hazards — before the truck rolls.", illo: junkHaulerIllo },
  { icon: Calculator, label: "Estimators", note: "Photo coverage that actually prices the job.", illo: estimatorIllo },
];

export function UseCasesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {useCases.map((u, i) => (
        <RiseIn key={u.label} delay={i * 0.05}>
          <Card>
            <u.icon className="h-6 w-6 text-[hsl(var(--accent-kinetic))]" />
            <h3 className="ls-h3 mt-4">{u.label}</h3>
            <Body size="sm">{u.note}</Body>
          </Card>
        </RiseIn>
      ))}
    </div>
  );
}
