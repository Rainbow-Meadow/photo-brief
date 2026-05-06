/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BRAND, s, BrandHeader, BrandFooter } from './brand-styles.ts'

interface Props {
  name?: string
  dashboardUrl?: string
}

const BetaFirstRequestNudgeEmail = ({ name, dashboardUrl }: Props) => {
  const greeting = name ? `Ready to send your first PhotoBrief, ${name}?` : 'Ready to send your first PhotoBrief?'
  const cta = dashboardUrl || 'https://photobrief.ai/dashboard/requests/new'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your account is set up — here's how to send your first photo request in 2 minutes.</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>GETTING STARTED</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                You set up your PhotoBrief account a few days ago — nice. But it looks
                like you haven't sent your first photo request yet.
              </Text>
              <Text style={s.text}>
                Here's the fastest way to get started:
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>1.</span> Go to Requests → New request
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>2.</span> Pick a template or use the AI builder to create one
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>3.</span> Enter your customer's name and email or phone
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>4.</span> Hit send
                </Text>
              </Section>
              <Text style={s.text}>
                Your customer gets a guided photo capture link. You get organized,
                AI-reviewed photos back — no more chasing blurry cell phone pics.
              </Text>
              <Text style={s.text}>
                Try it with a real job if you can — that's where the value clicks.
                The whole thing takes about 2 minutes.
              </Text>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>Create Your First Request</Button>
              </Section>
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                If you're stuck or want help picking the right template, just reply.
                We're here.
              </Text>
            </Section>
            <BrandFooter />
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export const template = {
  component: BetaFirstRequestNudgeEmail,
  subject: 'Ready to send your first PhotoBrief?',
  displayName: 'Beta first request nudge',
  previewData: {
    name: 'Alex',
    dashboardUrl: 'https://photobrief.ai/dashboard/requests/new',
  },
} satisfies TemplateEntry
