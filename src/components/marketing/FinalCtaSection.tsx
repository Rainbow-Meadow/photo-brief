import { ReactNode } from "react";
import { Section, Container, CTA, CTAGroup, Body } from "@/design-system/schema";
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
 * Dark-tone Section + centered Container with eyebrow / headline / body / CTAs.
 */
export function FinalCtaSection({
  eyebrow,
  title,
  punctuation = ".",
  body,
  primary,
  secondary,
}: FinalCtaSectionProps) {
  return (
    <Section tone="dark">
      <Container>
        <div className="text-center">
          <p className="ls-eyebrow">[ {eyebrow} ]</p>
          <RiseIn>
            <h2 className="ls-h1 mt-6 text-balance">
              {(() => {
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
              })()}
            </h2>
          </RiseIn>
          {body ? (
            <RiseIn delay={0.1}>
              <Body size="lg">{body}</Body>
            </RiseIn>
          ) : null}
          <div className="mt-8 sm:mt-10">
            <CTAGroup align="center">
              <CTA href={primary.href} variant={primary.variant ?? "primary"} size="lg">
                {primary.label}
              </CTA>
              {secondary ? (
                <CTA href={secondary.href} variant={secondary.variant ?? "secondary"} size="lg">
                  {secondary.label}
                </CTA>
              ) : null}
            </CTAGroup>
          </div>
        </div>
      </Container>
    </Section>
  );
}
