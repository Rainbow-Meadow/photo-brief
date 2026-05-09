/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock, CTAButton, MonoLink } from './brand-styles.ts'

interface Props {
  recipientName?: string
  businessName?: string
  link?: string
  estimatedMinutes?: number
}

const RecipientReminderEmail = ({
  recipientName, businessName, link, estimatedMinutes,
}: Props) => {
  const greeting = recipientName ? `Hi ${recipientName}.` : 'Hi there.'
  const sender = businessName || 'A business'
  const cta = link || '#'
  const eta = estimatedMinutes ?? 2
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Reminder: ${sender} still needs your photos`}</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  {sender} is still waiting on your photos. Until they arrive, the
                  job can&apos;t be scoped or scheduled.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="BRIEF">
                <Text style={s.text}>
                  About {eta} minute{eta === 1 ? '' : 's'} of guided capture. No
                  app, no login required.
                </Text>
                <CTAButton href={cta}>Send your photos</CTAButton>
                <Text style={s.textSmall}>Or open this link directly:</Text>
                <MonoLink href={cta} />
              </RmbcBlock>
            </Section>
            <BrandFooter extra={`On behalf of ${sender}`} />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: RecipientReminderEmail,
  subject: (data: Record<string, any>) => {
    const sender = data?.businessName || 'PhotoBrief'
    return `Reminder: ${sender} still needs your photos`
  },
  displayName: 'Customer reminder',
  previewData: {
    recipientName: 'Maria',
    businessName: 'Bright Spark Plumbing',
    link: 'https://photobrief.ai/r/preview-token',
    estimatedMinutes: 2,
  },
} satisfies TemplateEntry
