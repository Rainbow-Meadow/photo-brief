/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock, CTAButton } from './brand-styles.ts'

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
  const greeting = ownerName ? `Hi ${ownerName}.` : 'Hi there.'
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
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  A new PhotoBrief submission just landed in your dashboard.
                </Text>
                <Text style={s.meta}>FROM · {who}</Text>
                {title ? <Text style={s.meta}>REQUEST · {title}</Text> : null}
                {typeof photoCount === 'number' ? (
                  <Text style={s.meta}>PHOTOS · {photoCount}</Text>
                ) : null}
                {submittedAt ? <Text style={s.meta}>SUBMITTED · {submittedAt}</Text> : null}
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM">
                <Text style={s.text}>
                  Each photo has been auto-checked for completeness against the
                  guide. Anything flagged is marked for review.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="BRIEF">
                <Text style={s.text}>
                  Open the brief to inspect, download, or forward the photos.
                </Text>
                <CTAButton href={cta}>Review brief</CTAButton>
              </RmbcBlock>
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
