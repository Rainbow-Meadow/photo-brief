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

const FoundingPartnerWelcomeEmail = ({ name, dashboardUrl }: Props) => {
  const greeting = name ? `Welcome, ${name}.` : 'Welcome to the inner circle.'
  const cta = dashboardUrl || 'https://photobrief.ai/dashboard'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to the PhotoBrief.ai Founding Partner Beta</Preview>
      <Body style={s.main}>
        <Section style={s.outerPad}>
          <Container style={s.container}>
            <BrandHeader />
            <Section style={s.body}>
              <Text style={s.eyebrow}>FOUNDING PARTNER</Text>
              <Heading style={s.h1}>{greeting}</Heading>
              <Text style={s.text}>
                You're one of a small group of businesses getting early access to
                PhotoBrief. This isn't a mass rollout — it's a deliberate beta where
                every partner gets hands-on setup and direct support.
              </Text>
              <Text style={s.text}>
                Your feedback will directly shape the product. If something doesn't
                work the way you'd expect, tell us. If you need a feature for your
                workflow, we want to hear about it.
              </Text>
              <Section style={s.card}>
                <Text style={{ ...s.text, margin: '0 0 8px', fontWeight: 600, color: BRAND.colors.primary, fontSize: '13px' }}>
                  What you get as a Founding Partner
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Hands-on onboarding tailored to your business
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Direct line to the team for support and feedback
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0 0 6px' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Early access to every new feature
                </Text>
                <Text style={{ ...s.text, fontSize: '14px', margin: '0' }}>
                  <span style={{ color: BRAND.colors.cta, fontWeight: 700 }}>→</span> Tiered post-launch rewards — up to 75% off or free Pro for life
                </Text>
              </Section>
              <Section style={s.ctaWrap}>
                <Button href={cta} style={s.button}>Open PhotoBrief.ai</Button>
              </Section>
              <Hr style={s.hr} />
              <Text style={s.textSmall}>
                Reply to this email anytime — it goes straight to the team. We're
                here to make sure this works for your business.
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
  component: FoundingPartnerWelcomeEmail,
  subject: 'Welcome to the PhotoBrief.ai Founding Partner Beta',
  displayName: 'Founding Partner welcome',
  previewData: {
    name: 'Alex',
    dashboardUrl: 'https://photobrief.ai/dashboard',
  },
} satisfies TemplateEntry
