import type { ReactNode } from "react";
import { RiseIn } from "@/components/motion/RiseIn";
import { Title, Subtitle } from "@/design-system/schema";

interface Props {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
}

export function SectionIntro({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="mb-14 max-w-3xl">
      <p className="ls-eyebrow">{eyebrow}</p>
      <RiseIn>
        <Title level={2}>
          <span className="mt-5 block">{title}</span>
        </Title>
      </RiseIn>
      {subtitle && (
        <RiseIn delay={0.08}>
          <Subtitle>{subtitle}</Subtitle>
        </RiseIn>
      )}
    </div>
  );
}
