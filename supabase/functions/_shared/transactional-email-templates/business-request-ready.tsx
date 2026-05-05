/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  ownerName?: string
  customerFirstName?: string
  customerName?: string
  businessName?: string
  requestTitle?: string
  requestLink?: string
  viewUrl?: string
}

const BusinessRequestReadyEmail = ({
  ownerName, customerFirstName, customerName, businessName,
  requestTitle, requestLink, viewUrl,
}: Props) => {
  const greeting = ownerName ? `Hi ${ownerName},` : 'Hi there,'
  const firstName = customerFirstName || (customerName ? customerName.split(' ')[0] : 'your customer')
  const biz = businessName || 'your business'
  const title = requestTitle || 'your request'
  const cta = viewUrl || 'https://photobrief.ai/dashboard'
  const link = requestLink || '#'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your PhotoBrief is ready to send</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                Your PhotoBrief for <strong>{title}</strong> is ready. Share the link
                below with {firstName} so they can submit their photos.
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, margin: '0 0 10px', fontWeight: 600, color: BRAND.colors.primary, fontSize: '13px' }}>
                  Recommended message
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0', fontStyle: 'italic' }}>
                  Hi {firstName} — this is {biz}. Please add the requested photos for {title} here
                  so we can review this faster:{'\n'}{'\n'}
                  {link}{'\n'}{'\n'}
                  It takes about 2 minutes.
                </Text>
              </Section>
              <Text style={s.textSmall}>
                Customer link:{' '}
                <Link href={link} style={s.link}>{link}</Link>
              </Text>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>View request</Button>
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
  component: BusinessRequestReadyEmail,
  subject: 'Your PhotoBrief is ready to send',
  displayName: 'Business: request ready to send',
  previewData: {
    ownerName: 'Alex',
    customerFirstName: 'Maria',
    customerName: 'Maria Santos',
    businessName: 'Bright Spark Plumbing',
    requestTitle: 'Kitchen leak inspection',
    requestLink: 'https://photobrief.ai/r/preview-token',
    viewUrl: 'https://photobrief.ai/requests/preview',
  },
} satisfies TemplateEntry
