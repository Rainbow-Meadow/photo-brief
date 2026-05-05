/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  recipientName?: string
  businessName?: string
  link?: string
  estimatedMinutes?: number
}

const RecipientReminderEmail = ({
  recipientName, businessName, link, estimatedMinutes,
}: Props) => {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,'
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
              <Text style={s.eyebrow}>QUICK REMINDER</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                Just a quick nudge — {sender} is still waiting on a few photos from
                you. It only takes about {eta} minute{eta === 1 ? '' : 's'} and there's
                no app or login required.
              </Text>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>Send your photos</Button>
              </Section>
              <Text style={s.textSmall}>
                Or open this link directly:{' '}
                <Link href={cta} style={s.link}>{cta}</Link>
              </Text>
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
