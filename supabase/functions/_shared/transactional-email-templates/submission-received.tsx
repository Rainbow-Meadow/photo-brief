/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  ownerName?: string
  recipientName?: string
  guideName?: string
  reviewUrl?: string
  photoCount?: number
  requestTitle?: string
  submittedAt?: string
}

const SubmissionReceivedEmail = ({
  ownerName, recipientName, guideName, reviewUrl, photoCount, requestTitle, submittedAt,
}: Props) => {
  const greeting = ownerName ? `Hi ${ownerName},` : 'Hi there,'
  const who = recipientName || 'A customer'
  const title = requestTitle || guideName
  const cta = reviewUrl || 'https://photobrief.ai/dashboard'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`${who} just submitted photos`}</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>NEW SUBMISSION</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Section style={s.card}>
                <Text style={{ ...s.text, margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary }}>
                  {who}
                </Text>
                {title ? (
                  <Text style={{ ...s.textSmall, margin: '0 0 6px' }}>
                    Request: {title}
                  </Text>
                ) : null}
                {typeof photoCount === 'number' ? (
                  <Text style={{ ...s.textSmall, margin: '0 0 6px' }}>
                    Photos: {photoCount}
                  </Text>
                ) : null}
                {submittedAt ? (
                  <Text style={{ ...s.textSmall, margin: '0' }}>
                    Submitted: {submittedAt}
                  </Text>
                ) : null}
              </Section>
              <Text style={s.text}>
                Review the submission, check completeness, and download or forward
                the photos from your dashboard.
              </Text>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>Review brief</Button>
              </Section>
            </Section>
            <BrandFooter />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: SubmissionReceivedEmail,
  subject: (data: Record<string, any>) => {
    const who = data?.recipientName || 'A customer'
    const title = data?.requestTitle || data?.guideName
    return title
      ? `New PhotoBrief submitted: ${title}`
      : `${who} submitted photos`
  },
  displayName: 'Business: new submission',
  previewData: {
    ownerName: 'Alex',
    recipientName: 'Maria',
    guideName: 'Leak inspection',
    requestTitle: 'Kitchen leak — 42 Elm St',
    reviewUrl: 'https://photobrief.ai/submissions/preview',
    photoCount: 5,
    submittedAt: 'May 5, 2026 at 2:15 PM',
  },
} satisfies TemplateEntry
