import { Wrench, Wind, Leaf, Truck, Calculator } from "lucide-react";
import { RiseIn } from "@/components/motion/RiseIn";
import { Card, Body } from "@/design-system/schema";

import landscaperIllo from "@/assets/trades/landscaper-illustration.png";
import hvacTechIllo from "@/assets/trades/hvac-tech-illustration.png";
import plumberIllo from "@/assets/trades/plumber-illustration.png";
import junkHaulerIllo from "@/assets/trades/junk-hauler-illustration.png";
import estimatorIllo from "@/assets/trades/estimator-illustration.png";

const useCases = [
  { icon: Wrench, label: "Plumbers", note: "Leak route asks for the shut-off and the source — and skips the photo when it's a callback.", illo: plumberIllo },
  { icon: Wind, label: "HVAC", note: "Tune-up books itself. New install routes through model, panel, and clearance photos automatically.", illo: hvacTechIllo },
  { icon: Leaf, label: "Landscapers", note: "Quote routes ask for the yard. Maintenance routes don't bother — they just get on the calendar.", illo: landscaperIllo },
  { icon: Truck, label: "Junk haulers", note: "Pile, path, hazards. The brief lands before the truck rolls. Everyone prices the same job.", illo: junkHaulerIllo },
  { icon: Calculator, label: "Estimators", note: "Every brief is structured. Every photo is labelled. You quote, you don't decode.", illo: estimatorIllo },
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
