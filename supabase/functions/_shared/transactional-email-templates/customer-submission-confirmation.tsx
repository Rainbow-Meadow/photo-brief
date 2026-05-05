/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  recipientName?: string
  businessName?: string
  requestTitle?: string
}

const CustomerSubmissionConfirmationEmail = ({
  recipientName, businessName, requestTitle,
}: Props) => {
  const greeting = recipientName ? `Thanks, ${recipientName}!` : 'Photos received — thank you!'
  const biz = businessName || 'The business'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Photos received — thank you</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                Your photos{requestTitle ? ` for "${requestTitle}"` : ''} have been received.
                {biz} can now review everything you submitted.
              </Text>
              <Text style={s.text}>
                No further action is needed on your end. If anything else is needed,
                they'll reach out directly.
              </Text>
            </Section>
            <BrandFooter extra={`On behalf of ${biz}`} />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: CustomerSubmissionConfirmationEmail,
  subject: 'Photos received — thank you',
  displayName: 'Customer: submission confirmation',
  previewData: {
    recipientName: 'Maria',
    businessName: 'Bright Spark Plumbing',
    requestTitle: 'Kitchen leak inspection',
  },
} satisfies TemplateEntry
