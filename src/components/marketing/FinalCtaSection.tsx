import { ReactNode } from "react";
import { Section, Container, CTA, Body } from "@/design-system/schema";
import { RiseIn } from "@/components/motion/RiseIn";

export interface FinalCtaAction {
  href: string;
  label: ReactNode;
  variant?: "primary" | "secondary";
}

interface FinalCtaSectionProps {
  /** Bracketed eyebrow text (without surrounding brackets) */
  eyebrow: string;
  /** Headline text. Trailing punctuation is rendered as an accent dot. */
  title: string;
  /** Punctuation rendered as an accent dot at end of title. Default "." */
  punctuation?: string;
  /** Optional supporting paragraph */
  body?: ReactNode;
  /** Primary + optional secondary CTA */
  primary: FinalCtaAction;
  secondary?: FinalCtaAction;
}

/**
 * Standard closing CTA section used on marketing pages.
 * Asymmetric two-column layout on lg+ with an amber accent surface
 * so the closing moment reads as the loudest point on the page.
 */
export function FinalCtaSection({
  eyebrow,
  title,
  punctuation = ".",
  body,
  primary,
  secondary,
}: FinalCtaSectionProps) {
  const renderTitle = () => {
    const trimmed = title.trimEnd();
    const lastSpace = trimmed.lastIndexOf(" ");
    const head = lastSpace === -1 ? "" : trimmed.slice(0, lastSpace + 1);
    const tail = lastSpace === -1 ? trimmed : trimmed.slice(lastSpace + 1);
    return (
      <>
        {head}
        <span className="whitespace-nowrap">
          {tail}
          <span className="ls-accent-dot">{punctuation}</span>
        </span>
      </>
    );
  };

  return (
    <Section tone="dark">
      {/* Accent-tinted overlay on top of the dark base */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent-kinetic)/0.14)] via-transparent to-transparent" aria-hidden="true" />
      <Container>
        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Headline left */}
          <div className="lg:col-span-7">
            <p className="ls-eyebrow">[ {eyebrow} ]</p>
            <RiseIn>
              <h2 className="ls-h1 mt-6 text-balance">{renderTitle()}</h2>
            </RiseIn>
          </div>

          {/* Body + CTAs right */}
          <div className="lg:col-span-5 lg:pl-4">
            {body ? (
              <RiseIn delay={0.1}>
                <Body size="lg">{body}</Body>
              </RiseIn>
            ) : null}
            <div className="mt-8 flex flex-col items-start gap-4">
              <CTA href={primary.href} variant={primary.variant ?? "primary"} size="lg">
                {primary.label}
              </CTA>
              {secondary ? (
                <a
                  href={secondary.href}
                  className="ls-cta-quiet inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                >
                  {secondary.label}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
