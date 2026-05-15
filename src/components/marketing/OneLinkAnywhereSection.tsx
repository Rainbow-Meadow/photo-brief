import type { ComponentType } from "react";
import { Section, Container } from "@/design-system/schema";
import { SectionIntro } from "@/components/marketing/SectionIntro";
import { MarqueeRow } from "@/components/motion/MarqueeRow";
import {
  ROW_ONE,
  ROW_TWO,
  type MarkProps,
  type PlatformEntry,
} from "@/components/marketing/icons/platforms";

const STEPS = [
  { n: "01", text: "Copy your Smart Intake link." },
  { n: "02", text: "Paste it where customers already click." },
  { n: "03", text: "Briefs land in your inbox, ready to quote." },
];

function MarqueePlatformItem({ name, Mark }: PlatformEntry) {
  const Icon = Mark as ComponentType<MarkProps>;
  return (
    <span
      role="listitem"
      aria-label={name}
      className="ls-marquee-item inline-flex items-center gap-2"
    >
      <Icon className="h-5 w-5 text-foreground" />
      <span>{name}</span>
    </span>
  );
}

function MarqueeContent({ items }: { items: PlatformEntry[] }) {
  return (
    <>
      {items.map((p, i) => (
        <span key={`${p.name}-${i}`} className="contents">
          <MarqueePlatformItem {...p} />
          <span className="ls-marquee-item ls-marquee-item--ghost" aria-hidden>·</span>
        </span>
      ))}
    </>
  );
}

export function OneLinkAnywhereSection() {
  return (
    <Section id="one-link" aria-labelledby="one-link-heading">
      <Container>
        <SectionIntro
          eyebrow="[ 01 ] ✦ Works where you already work"
          title={
            <span id="one-link-heading">
              One link. Drop it anywhere customers already find you.
            </span>
          }
          subtitle={
            <>
              Your site already works. Your booking tool already works. We don't
              replace any of it — we replace the form that's losing you jobs.
            </>
          }
        />

        {/* 3-step paste-it strip */}
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="border border-border bg-card p-5"
            >
              <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[hsl(var(--accent-kinetic))]">
                [ {s.n} ]
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* Full-bleed marquee band */}
      <div
        className="relative mt-10 space-y-1 border-y border-border bg-[hsl(var(--accent-kinetic)/0.08)] py-3 sm:mt-14"
        role="list"
        aria-label="Platforms PhotoBrief drops into"
      >
        <MarqueeRow duration={50} direction="right">
          <MarqueeContent items={ROW_ONE} />
        </MarqueeRow>
        <MarqueeRow duration={65} direction="left">
          <MarqueeContent items={ROW_TWO} />
        </MarqueeRow>
      </div>
    </Section>
  );
}
