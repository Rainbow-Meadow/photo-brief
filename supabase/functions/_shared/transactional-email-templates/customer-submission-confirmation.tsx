/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock } from './brand-styles.ts'

interface Props {
  recipientName?: string
  businessName?: string
  requestTitle?: string
}

const CustomerSubmissionConfirmationEmail = ({
  recipientName, businessName, requestTitle,
}: Props) => {
  const greeting = recipientName ? `Photos received, ${recipientName}.` : 'Photos received.'
  const biz = businessName || 'The business'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Photos received — no further action needed.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="RESEARCH" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  Your photos{requestTitle ? ` for "${requestTitle}"` : ''} were
                  delivered to {biz}. Everything looked complete on submission.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="02" label="MECHANISM">
                <Text style={s.text}>
                  {biz} can now review the brief and use it to scope, quote, or
                  schedule your job — without another back-and-forth.
                </Text>
              </RmbcBlock>
              <RmbcBlock code="03" label="CLOSE">
                <Text style={s.text}>
                  No further action is needed on your end. {biz} will reach out
                  directly if anything else is required.
                </Text>
              </RmbcBlock>
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
