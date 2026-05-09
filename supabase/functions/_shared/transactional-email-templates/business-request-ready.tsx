/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { s, BrandHeader, BrandFooter, RmbcBlock, CTAButton, MonoLink } from './brand-styles.ts'

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
  const greeting = ownerName ? `Hi ${ownerName}.` : 'Hi there.'
  const firstName = customerFirstName || (customerName ? customerName.split(' ')[0] : 'your customer')
  const biz = businessName || 'your business'
  const title = requestTitle || 'your request'
  const cta = viewUrl || 'https://photobrief.ai/dashboard'
  const link = requestLink || '#'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your PhotoBrief link is ready — share it with {firstName}</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <RmbcBlock code="01" label="MECHANISM" first>
                <Heading style={s.h1}>{greeting}</Heading>
                <Text style={s.text}>
                  Your PhotoBrief link for <strong>{title}</strong> is packaged and
                  ready to send to {firstName}. No app or account on their end.
                </Text>
                <Text style={s.meta}>RECIPIENT · {firstName.toUpperCase()}</Text>
                <Text style={s.meta}>LINK · </Text>
                <MonoLink href={link} />
              </RmbcBlock>
              <RmbcBlock code="02" label="BRIEF">
                <Text style={s.text}>
                  Suggested message to {firstName}:
                </Text>
                <Section style={s.card}>
                  <Text style={{ ...s.text, fontSize: '14px', margin: 0, fontStyle: 'italic' }}>
                    Hi {firstName} — this is {biz}. Please add the requested photos
                    for {title} here so we can move faster:{'\n'}{'\n'}
                    {link}{'\n'}{'\n'}
                    Takes about 2 minutes.
                  </Text>
                </Section>
                <CTAButton href={cta}>Open in dashboard</CTAButton>
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
  component: BusinessRequestReadyEmail,
  subject: 'Your PhotoBrief link is ready',
  displayName: 'Business: PhotoBrief link ready',
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
