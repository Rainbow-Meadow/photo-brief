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
  introMessage?: string
  link?: string
  estimatedMinutes?: number
  requestTitle?: string
}

const RecipientRequestLinkEmail = ({
  recipientName, businessName, introMessage, link, estimatedMinutes, requestTitle,
}: Props) => {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi there,'
  const sender = businessName || 'A business'
  const message = introMessage?.trim() || `${sender} needs a few quick photos from you.`
  const cta = link || '#'
  const eta = estimatedMinutes ?? 2

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`${sender} requested photos${requestTitle ? ` for ${requestTitle}` : ''}`}</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>{message}</Text>
              <Text style={s.text}>
                Tap the button below — it walks you through the shots one at a time
                and only takes about {eta} minute{eta === 1 ? '' : 's'}. No app or
                account needed.
              </Text>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>Open PhotoBrief</Button>
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
  component: RecipientRequestLinkEmail,
  subject: (data: Record<string, any>) => {
    const sender = data?.businessName || 'PhotoBrief'
    const title = data?.requestTitle
    return title
      ? `${sender} requested photos for ${title}`
      : `${sender}: a quick photo request`
  },
  displayName: 'Customer photo request',
  previewData: {
    recipientName: 'Maria',
    businessName: 'Bright Spark Plumbing',
    introMessage: 'Hi! Help us help you — a few quick photos.',
    link: 'https://photobrief.ai/r/preview-token',
    estimatedMinutes: 2,
    requestTitle: 'Kitchen leak inspection',
  },
} satisfies TemplateEntry
