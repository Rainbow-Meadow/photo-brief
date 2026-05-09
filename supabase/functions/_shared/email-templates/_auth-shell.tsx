/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import {
  s, BrandHeader, BrandFooter, RmbcBlock, CTAButton, MonoLink,
} from '../transactional-email-templates/brand-styles.ts'

export interface AuthShellProps {
  preview: string
  eyebrow?: string
  heading: string
  research: React.ReactNode
  briefIntro?: React.ReactNode
  ctaHref?: string
  ctaLabel?: string
  fallbackUrl?: string
  closeNote?: React.ReactNode
  /** Render content in the BRIEF block instead of CTA (used by reauth code). */
  briefSlot?: React.ReactNode
}

export const AuthShell: React.FC<AuthShellProps> = ({
  preview,
  eyebrow,
  heading,
  research,
  briefIntro,
  ctaHref,
  ctaLabel,
  fallbackUrl,
  closeNote,
  briefSlot,
}) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={s.main}>
      <Section style={s.outerPad}>
        <Container style={s.container}>
          <BrandHeader />
          <Section style={s.body}>
            <RmbcBlock code="01" label={eyebrow || 'RESEARCH'} first>
              <Heading style={s.h1}>{heading}</Heading>
              {research}
            </RmbcBlock>
            <RmbcBlock code="02" label="BRIEF">
              {briefIntro}
              {briefSlot
                ? briefSlot
                : (
                    <>
                      {ctaHref && ctaLabel ? <CTAButton href={ctaHref}>{ctaLabel}</CTAButton> : null}
                      {fallbackUrl ? (
                        <>
                          <Text style={s.textSmall}>Or open this link directly:</Text>
                          <MonoLink href={fallbackUrl} />
                        </>
                      ) : null}
                    </>
                  )}
            </RmbcBlock>
            {closeNote ? (
              <RmbcBlock code="03" label="CLOSE">
                <Text style={s.textSmall}>{closeNote}</Text>
              </RmbcBlock>
            ) : null}
          </Section>
          <BrandFooter />
        </Container>
      </Section>
    </Body>
  </Html>
)
